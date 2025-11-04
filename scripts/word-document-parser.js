const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

/**
 * Word Document Recipe Parser
 * Parses Hebrew recipes from Word documents and converts them to the required format
 */
class WordDocumentParser {
  constructor() {
    // Hebrew keywords for identifying different sections
    this.sectionKeywords = {
      ingredients: [
        'רכיבים', 'חומרים', 'מצרכים', 'מרכיבים',
        'חומרי גלם', 'רשימת מצרכים', 'רשימת חומרים'
      ],
      instructions: [
        'הוראות', 'הכנה', 'אופן הכנה', 'שלבי הכנה',
        'דרך הכנה', 'הוראות הכנה', 'אופן הפעלה'
      ],
      prepTime: [
        'זמן הכנה', 'זמן הכנת', 'זמן הת', 'זמן טרום', 'הכנה:'
      ],
      cookTime: [
        'זמן בישול', 'זמן אפייה', 'זמן על האש', 'בישול:', 'אפייה:'
      ],
      servings: [
        'מנות', 'מספר מנות', 'כמות מנות', 'משרת', 'יוצא'
      ]
    };

    // Categories mapping
    this.categoryKeywords = {
      MAIN: ['עיקרית', 'מנה עיקרית', 'ארוחה עיקרית', 'בשר', 'עוף', 'דג'],
      SIDE: ['תוספת', 'מנת תוספת', 'צד', 'סלט', 'ירקות'],
      DESSERT: ['קינוח', 'עוגה', 'עוגית', 'ממתק', 'מתוק', 'פאי', 'טארט']
    };
  }

  /**
   * Parse a Word document and extract recipe information
   * @param {string} filePath - Path to the Word document
   * @returns {Promise<Object>} Parsed recipe object
   */
  async parseDocument(filePath) {
    try {
      console.log(`Parsing document: ${filePath}`);

      // Read the Word document
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;

      if (!text || text.trim().length === 0) {
        throw new Error('Document appears to be empty or unreadable');
      }

      console.log('Document text extracted successfully');

      // Parse the recipe from the text
      const recipe = this.parseRecipeText(text, filePath);

      // Validate the parsed recipe
      this.validateRecipe(recipe);

      return recipe;
    } catch (error) {
      console.error(`Error parsing document ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Parse recipe text and extract structured information
   * @param {string} text - Raw text from document
   * @param {string} filePath - Original file path for title fallback
   * @returns {Object} Structured recipe object
   */
  parseRecipeText(text, filePath) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const recipe = {
      title: this.extractTitle(lines, filePath),
      description: this.extractDescription(lines),
      category: this.extractCategory(text),
      prepTimeMinutes: this.extractTime(text, 'prep'),
      cookTimeMinutes: this.extractTime(text, 'cook'),
      servings: 999, // Hidden field - using indicative value
      ingredients: this.extractIngredients(lines),
      instructions: this.extractInstructions(lines),
      tags: this.extractTags(text),
      createdBy: 'מתכון מדוגמה', // Hidden field - using indicative value
      lastModifiedBy: 'מתכון מדוגמה'
    };

    return recipe;
  }

  /**
   * Extract recipe title from the document
   */
  extractTitle(lines, filePath) {
    // Try to find title in first few lines (usually the largest/bold text becomes the title)
    const potentialTitles = lines.slice(0, 5);

    for (const line of potentialTitles) {
      // Skip lines that look like section headers
      if (this.isKeywordLine(line, [...this.sectionKeywords.ingredients, ...this.sectionKeywords.instructions])) {
        continue;
      }

      // Skip lines that look like times or numbers
      if (/^\d+|זמן|דקות|שעות/.test(line)) {
        continue;
      }

      // If line is reasonable length for a title, use it
      if (line.length >= 3 && line.length <= 100) {
        return line;
      }
    }

    // Fallback to filename
    const filename = path.basename(filePath, path.extname(filePath));
    return filename.replace(/[_-]/g, ' ');
  }

  /**
   * Extract description from the document
   */
  extractDescription(lines) {
    // Look for descriptive text after title but before ingredients/instructions
    let titleFound = false;
    let descriptionLines = [];
    let inDescriptionMode = false;

    for (let i = 0; i < Math.min(lines.length, 30); i++) { // Increased from 10 to 30 lines
      const line = lines[i];

      if (!titleFound && i === 0) {
        titleFound = true;
        continue;
      }

      // If we hit a section keyword, stop looking
      if (this.isKeywordLine(line, [...this.sectionKeywords.ingredients, ...this.sectionKeywords.instructions])) {
        break;
      }

      // Skip time and quantity lines
      if (/^\d+|זמן|דקות|שעות|מנות/.test(line)) {
        continue;
      }

      // If line looks like a description (reasonable length, not just numbers/times)
      if (line.length > 15) { // Reduced minimum length
        // Start description mode if we find a substantial line
        if (!inDescriptionMode && line.length > 50) {
          inDescriptionMode = true;
        }

        if (inDescriptionMode) {
          descriptionLines.push(line);
        }
      }
      // If we found short lines after starting description mode, we might be done
      else if (inDescriptionMode && line.length < 15) {
        break;
      }
    }

    // Join description lines and clean up
    if (descriptionLines.length > 0) {
      let description = descriptionLines.join(' ').trim();

      // Remove common prefixes and clean up
      description = description.replace(/^(תיאור|מתכון|הכנה)[:׃]?\s*/i, '');

      // Return if we have substantial content
      if (description.length > 30) {
        return description;
      }
    }

    return null;
  }

  /**
   * Extract recipe category
   */
  extractCategory(text) {
    const textLower = text.toLowerCase();

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          return category;
        }
      }
    }

    // Default to MAIN if can't determine
    return 'MAIN';
  }

  /**
   * Extract time information (prep or cook time)
   */
  extractTime(text, type) {
    const keywords = type === 'prep' ? this.sectionKeywords.prepTime : this.sectionKeywords.cookTime;
    const lines = text.split('\n');

    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.includes(keyword)) {
          // Extract number from the line
          const timeMatch = line.match(/(\d+)\s*(דקות|דק|שעות|שעה|ש)/);
          if (timeMatch) {
            let minutes = parseInt(timeMatch[1]);
            const unit = timeMatch[2];

            // Convert hours to minutes
            if (unit.includes('שעה') || unit === 'ש') {
              minutes *= 60;
            }

            return minutes;
          }
        }
      }
    }

    // Default times if not found
    return type === 'prep' ? 30 : 45;
  }

  /**
   * Extract ingredients list
   */
  extractIngredients(lines) {
    const ingredients = [];
    let inIngredientsSection = false;
    let ingredientOrder = 1;

    for (const line of lines) {
      // Check if we're entering ingredients section
      if (this.isKeywordLine(line, this.sectionKeywords.ingredients)) {
        inIngredientsSection = true;
        continue;
      }

      // Check if we're leaving ingredients section (entering instructions)
      if (inIngredientsSection && this.isKeywordLine(line, this.sectionKeywords.instructions)) {
        break;
      }

      // If we're in ingredients section, process the line
      if (inIngredientsSection) {
        const ingredient = this.cleanIngredientLine(line);
        if (ingredient) {
          ingredients.push({
            order: ingredientOrder++,
            text: ingredient
          });
        }
      }
    }

    // If no ingredients found with section headers, try to extract from bullet points or numbered lists
    if (ingredients.length === 0) {
      ingredients.push(...this.extractIngredientsFallback(lines));
    }

    return ingredients;
  }

  /**
   * Extract instructions list
   */
  extractInstructions(lines) {
    const instructions = [];
    let inInstructionsSection = false;
    let stepNumber = 1;

    for (const line of lines) {
      // Check if we're entering instructions section
      if (this.isKeywordLine(line, this.sectionKeywords.instructions)) {
        inInstructionsSection = true;
        continue;
      }

      // If we're in instructions section, process the line
      if (inInstructionsSection) {
        const instruction = this.cleanInstructionLine(line);
        if (instruction) {
          instructions.push({
            step: stepNumber++,
            text: instruction
          });
        }
      }
    }

    // If no instructions found with section headers, try to extract from numbered content
    if (instructions.length === 0) {
      instructions.push(...this.extractInstructionsFallback(lines));
    }

    return instructions;
  }

  /**
   * Extract tags from the document
   */
  extractTags(text) {
    const tags = [];
    const textLower = text.toLowerCase();

    // Common Hebrew recipe tags
    const commonTags = [
      'פרווה', 'בשרי', 'חלבי', 'צמחוני', 'טבעוני',
      'ללא גלוטן', 'בריא', 'מהיר', 'פשוט', 'מתכון משפחתי',
      'אפייה', 'קל', 'מתאים לילדים', 'מסורתי'
    ];

    for (const tag of commonTags) {
      if (textLower.includes(tag)) {
        tags.push(tag);
      }
    }

    return tags;
  }

  /**
   * Helper methods
   */
  isKeywordLine(line, keywords) {
    const lineLower = line.toLowerCase();
    return keywords.some(keyword => lineLower.includes(keyword));
  }

  cleanIngredientLine(line) {
    // Remove bullet points, numbers, dashes
    let cleaned = line.replace(/^[-•·*\d+.)]\s*/, '').trim();

    // Skip if line is too short or looks like a section header
    if (cleaned.length < 3 || this.isKeywordLine(cleaned, this.sectionKeywords.instructions)) {
      return null;
    }

    return cleaned;
  }

  cleanInstructionLine(line) {
    // Remove step numbers, bullet points
    let cleaned = line.replace(/^[-•·*\d+.)]\s*/, '').trim();

    // Skip if line is too short
    if (cleaned.length < 5) {
      return null;
    }

    return cleaned;
  }

  extractIngredientsFallback(lines) {
    const ingredients = [];
    let order = 1;

    for (const line of lines) {
      // Look for lines that start with bullets or numbers and could be ingredients
      if (/^[-•·*\d+.)]/.test(line) && !this.isKeywordLine(line, this.sectionKeywords.instructions)) {
        const ingredient = this.cleanIngredientLine(line);
        if (ingredient && ingredient.length < 100) { // Ingredients are usually shorter
          ingredients.push({
            order: order++,
            text: ingredient
          });
        }
      }
    }

    return ingredients;
  }

  extractInstructionsFallback(lines) {
    const instructions = [];
    let step = 1;

    // Look for numbered or bulleted lines that are longer (likely instructions)
    for (const line of lines) {
      if (/^[-•·*\d+.)]/.test(line)) {
        const instruction = this.cleanInstructionLine(line);
        if (instruction && instruction.length > 10) { // Instructions are usually longer
          instructions.push({
            step: step++,
            text: instruction
          });
        }
      }
    }

    return instructions;
  }

  /**
   * Validate the parsed recipe
   */
  validateRecipe(recipe) {
    const errors = [];

    if (!recipe.title || recipe.title.trim().length === 0) {
      errors.push('Recipe title is missing');
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push('No ingredients found');
    }

    if (!recipe.instructions || recipe.instructions.length === 0) {
      errors.push('No instructions found');
    }

    if (!['MAIN', 'SIDE', 'DESSERT'].includes(recipe.category)) {
      errors.push('Invalid category');
    }

    if (errors.length > 0) {
      console.warn('Recipe validation warnings:', errors);
    }

    return errors.length === 0;
  }

  /**
   * Parse multiple documents from a directory
   */
  async parseDirectory(directoryPath) {
    const results = [];
    const files = fs.readdirSync(directoryPath);

    const wordFiles = files.filter(file =>
      ['.docx', '.doc'].includes(path.extname(file).toLowerCase())
    );

    console.log(`Found ${wordFiles.length} Word documents to process`);

    for (const file of wordFiles) {
      const filePath = path.join(directoryPath, file);
      try {
        const recipe = await this.parseDocument(filePath);
        results.push({
          file: file,
          recipe: recipe,
          success: true
        });
        console.log(`✓ Successfully parsed: ${file}`);
      } catch (error) {
        results.push({
          file: file,
          error: error.message,
          success: false
        });
        console.error(`✗ Failed to parse: ${file} - ${error.message}`);
      }
    }

    return results;
  }
}

module.exports = WordDocumentParser;