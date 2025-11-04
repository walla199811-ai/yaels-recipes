#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Generate SQL INSERT statements from AI migration results
 */
class SQLGenerator {
  constructor() {
    this.outputFile = './recipe-inserts.sql';
  }

  /**
   * Generate a CUID-like UUID for recipe IDs
   */
  generateCUID() {
    // Generate a CUID-like string similar to Prisma's default
    const timestamp = Date.now().toString(36);
    const randomPart = crypto.randomBytes(8).toString('base64url');
    return `c${timestamp}${randomPart}`.substring(0, 25);
  }

  /**
   * Generate SQL INSERT statements from AI results
   */
  generateSQL() {
    try {
      console.log('🔧 Generating SQL INSERT statements from AI migration results...');

      // Read the AI migration results
      const resultsPath = './ai-migration-results.json';
      if (!fs.existsSync(resultsPath)) {
        throw new Error('AI migration results file not found. Please run the AI migration first.');
      }

      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      const recipes = results.results.successful;

      console.log(`📊 Found ${recipes.length} recipes to convert to SQL`);

      let sqlContent = `-- AI-Powered Recipe Migration - SQL INSERT Statements
-- Generated: ${new Date().toISOString()}
-- Total recipes: ${recipes.length}

-- Note: Run these INSERT statements in your Neon database console

`;

      recipes.forEach((result, index) => {
        const recipe = result.recipe;
        console.log(`🔄 Converting recipe ${index + 1}: ${recipe.title}`);

        sqlContent += this.generateRecipeInsert(recipe, index + 1);
        sqlContent += '\n\n';
      });

      // Write to file
      fs.writeFileSync(this.outputFile, sqlContent);
      console.log(`✅ SQL INSERT statements generated successfully!`);
      console.log(`📄 File saved to: ${this.outputFile}`);
      console.log(`\n🚀 Next steps:`);
      console.log(`1. Open the file: ${this.outputFile}`);
      console.log(`2. Copy the SQL statements`);
      console.log(`3. Paste and run them in your Neon database console`);

    } catch (error) {
      console.error('❌ Error generating SQL:', error.message);
      throw error;
    }
  }

  /**
   * Generate a single recipe INSERT statement
   */
  generateRecipeInsert(recipe, recipeNumber) {
    // Escape single quotes in text fields
    const escapeString = (str) => {
      if (!str) return null;
      return str.replace(/'/g, "''");
    };

    // Convert JSON arrays to properly escaped JSON strings
    const escapeJSON = (jsonData) => {
      return JSON.stringify(jsonData).replace(/'/g, "''");
    };

    // Convert array to PostgreSQL array format
    const formatArrayLiteral = (arr) => {
      const escapedItems = arr.map(item => `'${escapeString(item)}'`);
      return `ARRAY[${escapedItems.join(', ')}]`;
    };

    const id = this.generateCUID();
    const title = escapeString(recipe.title);
    const description = recipe.description ? escapeString(recipe.description) : null;
    const ingredients = escapeJSON(recipe.ingredients);
    const instructions = escapeJSON(recipe.instructions);
    const tags = formatArrayLiteral(recipe.tags);
    const createdBy = escapeString(recipe.createdBy);
    const lastModifiedBy = escapeString(recipe.lastModifiedBy);

    return `-- Recipe ${recipeNumber}: ${recipe.title}
INSERT INTO "recipes" (
  id, title, description, category, "prepTimeMinutes", "cookTimeMinutes", servings,
  ingredients, instructions, tags, "createdBy", "lastModifiedBy"
) VALUES (
  '${id}',
  '${title}',
  ${description ? `'${description}'` : 'NULL'},
  '${recipe.category}',
  ${recipe.prepTimeMinutes},
  ${recipe.cookTimeMinutes},
  ${recipe.servings},
  '${ingredients}'::json,
  '${instructions}'::json,
  ${tags},
  '${createdBy}',
  '${lastModifiedBy}'
);`;
  }
}

// CLI functionality
async function main() {
  try {
    const generator = new SQLGenerator();
    generator.generateSQL();
    console.log('\n🎉 SQL generation completed successfully!');
  } catch (error) {
    console.error('❌ SQL generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = SQLGenerator;