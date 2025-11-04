const WordDocumentParser = require('./word-document-parser');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

/**
 * Recipe Migration Pipeline
 * Complete pipeline for migrating Word documents to production database
 */
class RecipeMigrationPipeline {
  constructor() {
    this.parser = new WordDocumentParser();
    this.prisma = new PrismaClient();
  }

  /**
   * Run the complete migration pipeline
   * @param {string} documentsPath - Path to directory containing Word documents
   * @param {Object} options - Migration options
   */
  async run(documentsPath, options = {}) {
    const {
      dryRun = false,
      outputPath = './migration-results.json',
      skipValidation = false
    } = options;

    console.log('🚀 Starting Recipe Migration Pipeline');
    console.log(`📁 Documents path: ${documentsPath}`);
    console.log(`🔄 Dry run: ${dryRun ? 'Yes' : 'No'}`);

    try {
      // Step 1: Parse all documents
      console.log('\n📖 Step 1: Parsing Word documents...');
      const parseResults = await this.parseDocuments(documentsPath);

      // Step 2: Validate parsed recipes
      console.log('\n✅ Step 2: Validating recipes...');
      const validationResults = this.validateRecipes(parseResults, skipValidation);

      // Step 3: Preview results
      console.log('\n📋 Step 3: Preview results...');
      this.previewResults(validationResults);

      // Step 4: Save results to file
      console.log('\n💾 Step 4: Saving results...');
      await this.saveResults(validationResults, outputPath);

      // Step 5: Migrate to database (if not dry run)
      if (!dryRun) {
        console.log('\n🗄️ Step 5: Migrating to production database...');
        const migrationResults = await this.migrateToDatabase(validationResults);
        console.log('✅ Migration completed!');
        return migrationResults;
      } else {
        console.log('\n🚫 Skipping database migration (dry run mode)');
        console.log(`📄 Results saved to: ${outputPath}`);
        return validationResults;
      }

    } catch (error) {
      console.error('❌ Pipeline failed:', error.message);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Parse all Word documents in the directory
   */
  async parseDocuments(documentsPath) {
    if (!fs.existsSync(documentsPath)) {
      throw new Error(`Documents directory not found: ${documentsPath}`);
    }

    const results = await this.parser.parseDirectory(documentsPath);

    console.log(`📊 Parsing results:`);
    console.log(`   ✅ Successful: ${results.filter(r => r.success).length}`);
    console.log(`   ❌ Failed: ${results.filter(r => !r.success).length}`);

    return results;
  }

  /**
   * Validate all parsed recipes
   */
  validateRecipes(parseResults, skipValidation) {
    const validationResults = {
      successful: [],
      failed: [],
      warnings: []
    };

    for (const result of parseResults) {
      if (!result.success) {
        validationResults.failed.push({
          file: result.file,
          error: result.error,
          stage: 'parsing'
        });
        continue;
      }

      try {
        const recipe = result.recipe;
        const validation = this.validateRecipe(recipe, skipValidation);

        if (validation.isValid) {
          validationResults.successful.push({
            file: result.file,
            recipe: recipe,
            warnings: validation.warnings
          });

          if (validation.warnings.length > 0) {
            validationResults.warnings.push({
              file: result.file,
              warnings: validation.warnings
            });
          }
        } else {
          validationResults.failed.push({
            file: result.file,
            recipe: recipe,
            errors: validation.errors,
            stage: 'validation'
          });
        }
      } catch (error) {
        validationResults.failed.push({
          file: result.file,
          error: error.message,
          stage: 'validation'
        });
      }
    }

    return validationResults;
  }

  /**
   * Validate individual recipe
   */
  validateRecipe(recipe, skipValidation) {
    const errors = [];
    const warnings = [];

    if (skipValidation) {
      return { isValid: true, errors, warnings };
    }

    // Required fields validation
    if (!recipe.title || recipe.title.trim().length === 0) {
      errors.push('Recipe title is required');
    } else if (recipe.title.length > 200) {
      warnings.push('Recipe title is very long (over 200 characters)');
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push('Recipe must have at least one ingredient');
    } else {
      // Validate ingredients structure
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ingredient = recipe.ingredients[i];
        if (!ingredient.text || ingredient.text.trim().length === 0) {
          warnings.push(`Ingredient ${i + 1} is empty`);
        }
      }
    }

    if (!recipe.instructions || recipe.instructions.length === 0) {
      errors.push('Recipe must have at least one instruction');
    } else {
      // Validate instructions structure
      for (let i = 0; i < recipe.instructions.length; i++) {
        const instruction = recipe.instructions[i];
        if (!instruction.text || instruction.text.trim().length === 0) {
          warnings.push(`Instruction ${i + 1} is empty`);
        }
      }
    }

    // Category validation
    if (!['MAIN', 'SIDE', 'DESSERT'].includes(recipe.category)) {
      errors.push(`Invalid category: ${recipe.category}. Must be MAIN, SIDE, or DESSERT`);
    }

    // Time validation
    if (recipe.prepTimeMinutes < 0 || recipe.prepTimeMinutes > 1440) {
      warnings.push('Prep time seems unusual (less than 0 or more than 24 hours)');
    }

    if (recipe.cookTimeMinutes < 0 || recipe.cookTimeMinutes > 1440) {
      warnings.push('Cook time seems unusual (less than 0 or more than 24 hours)');
    }

    // Description validation
    if (recipe.description && recipe.description.length > 500) {
      warnings.push('Description is very long (over 500 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Preview results summary
   */
  previewResults(validationResults) {
    console.log(`📊 Migration Preview:`);
    console.log(`   ✅ Valid recipes ready for migration: ${validationResults.successful.length}`);
    console.log(`   ❌ Failed recipes: ${validationResults.failed.length}`);
    console.log(`   ⚠️  Recipes with warnings: ${validationResults.warnings.length}`);

    if (validationResults.failed.length > 0) {
      console.log('\n❌ Failed recipes:');
      validationResults.failed.forEach(failure => {
        console.log(`   - ${failure.file}: ${failure.error || failure.errors?.join(', ')}`);
      });
    }

    if (validationResults.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      validationResults.warnings.forEach(warning => {
        console.log(`   - ${warning.file}: ${warning.warnings.join(', ')}`);
      });
    }

    if (validationResults.successful.length > 0) {
      console.log('\n✅ Sample of successful recipes:');
      validationResults.successful.slice(0, 3).forEach(success => {
        const recipe = success.recipe;
        console.log(`   - ${success.file}:`);
        console.log(`     Title: ${recipe.title}`);
        console.log(`     Category: ${recipe.category}`);
        console.log(`     Ingredients: ${recipe.ingredients.length}`);
        console.log(`     Instructions: ${recipe.instructions.length}`);
      });
    }
  }

  /**
   * Save results to JSON file
   */
  async saveResults(results, outputPath) {
    const output = {
      timestamp: new Date().toISOString(),
      summary: {
        total: results.successful.length + results.failed.length,
        successful: results.successful.length,
        failed: results.failed.length,
        warnings: results.warnings.length
      },
      results: results
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`📄 Results saved to: ${outputPath}`);
  }

  /**
   * Migrate valid recipes to production database
   */
  async migrateToDatabase(validationResults) {
    const migrationResults = {
      successful: [],
      failed: []
    };

    console.log(`🗄️ Migrating ${validationResults.successful.length} recipes to database...`);

    for (const result of validationResults.successful) {
      try {
        const recipe = result.recipe;

        // Check if recipe already exists by title
        const existingRecipe = await this.prisma.recipe.findFirst({
          where: { title: recipe.title }
        });

        if (existingRecipe) {
          console.log(`⚠️  Recipe "${recipe.title}" already exists, skipping...`);
          migrationResults.failed.push({
            file: result.file,
            recipe: recipe,
            error: 'Recipe with same title already exists'
          });
          continue;
        }

        // Create the recipe in database
        const createdRecipe = await this.prisma.recipe.create({
          data: {
            title: recipe.title,
            description: recipe.description,
            category: recipe.category,
            prepTimeMinutes: recipe.prepTimeMinutes,
            cookTimeMinutes: recipe.cookTimeMinutes,
            servings: recipe.servings,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            tags: recipe.tags,
            createdBy: recipe.createdBy,
            lastModifiedBy: recipe.lastModifiedBy
          }
        });

        migrationResults.successful.push({
          file: result.file,
          recipe: createdRecipe,
          originalData: recipe
        });

        console.log(`✅ Migrated: ${recipe.title}`);

      } catch (error) {
        console.error(`❌ Failed to migrate ${result.file}:`, error.message);
        migrationResults.failed.push({
          file: result.file,
          recipe: result.recipe,
          error: error.message
        });
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successfully migrated: ${migrationResults.successful.length}`);
    console.log(`   ❌ Failed to migrate: ${migrationResults.failed.length}`);

    return migrationResults;
  }

  /**
   * Utility method to check database connection
   */
  async checkDatabaseConnection() {
    try {
      await this.prisma.$connect();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  /**
   * Clean up database (for testing)
   */
  async cleanupTestData() {
    try {
      const deleteResult = await this.prisma.recipe.deleteMany({
        where: {
          createdBy: 'מתכון מדוגמה'
        }
      });

      console.log(`🧹 Cleaned up ${deleteResult.count} test recipes`);
      return deleteResult.count;
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      throw error;
    }
  }
}

module.exports = RecipeMigrationPipeline;