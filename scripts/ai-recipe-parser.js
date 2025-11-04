const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

/**
 * AI-Powered Recipe Parser using Claude
 * Uses Claude's natural language understanding for accurate Hebrew recipe parsing
 */
class AIRecipeParser {
  constructor() {
    // We'll use Claude via the Task tool for intelligent parsing
  }

  /**
   * Parse a Word document using AI
   * @param {string} filePath - Path to the Word document
   * @returns {Promise<Object>} Parsed recipe object
   */
  async parseDocument(filePath) {
    try {
      console.log(`AI parsing document: ${filePath}`);

      // Extract raw text from Word document
      const result = await mammoth.extractRawText({ path: filePath });
      const text = result.value;

      if (!text || text.trim().length === 0) {
        throw new Error('Document appears to be empty or unreadable');
      }

      console.log('Document text extracted, sending to AI parser...');

      // Use AI to parse the recipe
      const recipe = await this.aiParseRecipe(text, filePath);

      return recipe;
    } catch (error) {
      console.error(`Error AI parsing document ${filePath}:`, error.message);
      throw error;
    }
  }

  /**
   * Use AI (Claude) to intelligently parse Hebrew recipe text
   * @param {string} text - Raw text from document
   * @param {string} filePath - Original file path for context
   * @returns {Promise<Object>} Structured recipe object
   */
  async aiParseRecipe(text, filePath) {
    // Prepare the prompt for Claude
    const prompt = this.createParsingPrompt(text, filePath);

    try {
      // Use Task tool to launch Claude agent for parsing
      const response = await this.callClaudeAgent(prompt);

      // Parse the JSON response from Claude
      const recipe = JSON.parse(response);

      // Add system fields
      recipe.servings = 999; // Hidden field
      recipe.createdBy = 'מתכון מדוגמה'; // Hidden field
      recipe.lastModifiedBy = 'מתכון מדוגמה';

      return recipe;
    } catch (error) {
      console.error('AI parsing failed:', error.message);
      throw new Error(`AI parsing failed: ${error.message}`);
    }
  }

  /**
   * Create a detailed prompt for Claude to parse the Hebrew recipe
   */
  createParsingPrompt(text, filePath) {
    const filename = path.basename(filePath, path.extname(filePath));

    return `You are an expert Hebrew recipe parser. Please analyze this Hebrew recipe text and extract structured information.

RECIPE TEXT:
${text}

FILENAME: ${filename}

Please extract and return a JSON object with the following structure:
{
  "title": "Recipe title in Hebrew",
  "description": "Full description/story if present (can be multiple paragraphs)",
  "category": "MAIN|SIDE|DESSERT",
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "ingredients": [
    {"order": 1, "text": "ingredient text in Hebrew"},
    {"order": 2, "text": "ingredient text in Hebrew"}
  ],
  "instructions": [
    {"step": 1, "text": "instruction text in Hebrew"},
    {"step": 2, "text": "instruction text in Hebrew"}
  ],
  "tags": ["tag1", "tag2"]
}

PARSING GUIDELINES:
1. TITLE: Usually the first prominent line, often the recipe name
2. DESCRIPTION: Look for personal stories, background, or descriptive paragraphs about the recipe - capture the FULL text, don't summarize
3. CATEGORY:
   - MAIN for main dishes (עיקרית, בשר, עוף, דג, ארוחה עיקרית)
   - SIDE for sides/salads (תוספת, סלט, ירקות)
   - DESSERT for desserts (קינוח, עוגה, עוגית, מתוק)
4. TIMES: Extract prep time and cook time from text (convert hours to minutes)
5. INGREDIENTS: Find the ingredients section (רכיבים, חומרים, מצרכים) and list all items with order
6. INSTRUCTIONS: Find the instructions section (הוראות, הכנה, אופן הכנה) and list all steps
7. TAGS: Auto-detect relevant tags like פרווה, בשרי, חלבי, צמחוני, בריא, מהיר, etc.

IMPORTANT:
- Preserve ALL Hebrew text exactly as written
- If description spans multiple paragraphs, capture it all
- Use reasonable defaults for missing times (prep: 30, cook: 45)
- If title is unclear, use filename as fallback
- Return ONLY the JSON object, no additional text

Parse this Hebrew recipe now:`;
  }

  /**
   * Call Claude agent for parsing (this would use the Task tool in the actual implementation)
   * For now, this is a placeholder that would integrate with the Task tool
   */
  async callClaudeAgent(prompt) {
    // This is where we would use the Task tool to call Claude
    // For now, return a placeholder - in real implementation this would call:
    // await Task.invoke({ subagent_type: 'general-purpose', prompt: prompt })

    throw new Error('AI agent integration not yet connected - please integrate with Task tool');
  }

  /**
   * Parse multiple documents using AI
   */
  async parseDirectory(directoryPath) {
    const results = [];
    const files = fs.readdirSync(directoryPath);

    const wordFiles = files.filter(file =>
      ['.docx', '.doc'].includes(path.extname(file).toLowerCase())
    );

    console.log(`Found ${wordFiles.length} Word documents for AI parsing`);

    for (const file of wordFiles) {
      const filePath = path.join(directoryPath, file);
      try {
        const recipe = await this.parseDocument(filePath);
        results.push({
          file: file,
          recipe: recipe,
          success: true,
          method: 'AI'
        });
        console.log(`✓ AI parsed successfully: ${file}`);
      } catch (error) {
        results.push({
          file: file,
          error: error.message,
          success: false,
          method: 'AI'
        });
        console.error(`✗ AI parsing failed: ${file} - ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Validate AI-parsed recipe
   */
  validateRecipe(recipe) {
    const errors = [];
    const warnings = [];

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
      errors.push(`Invalid category: ${recipe.category}`);
    }

    // AI parsing should be more accurate, so fewer warnings needed
    if (recipe.description && recipe.description.length > 1000) {
      warnings.push('Description is very long - consider if this is intended');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = AIRecipeParser;