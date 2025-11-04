#!/usr/bin/env node

const RecipeMigrationPipeline = require('./recipe-migration-pipeline');
const path = require('path');

/**
 * CLI script for running recipe migration
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options = {
    documentsPath: null,
    dryRun: false,
    outputPath: './migration-results.json',
    skipValidation: false,
    cleanup: false,
    checkConnection: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--documents':
      case '--docs':
      case '-d':
        options.documentsPath = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--output':
      case '-o':
        options.outputPath = args[++i];
        break;
      case '--skip-validation':
        options.skipValidation = true;
        break;
      case '--cleanup':
        options.cleanup = true;
        break;
      case '--check-connection':
        options.checkConnection = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        return;
      default:
        if (!options.documentsPath && !args[i].startsWith('--')) {
          options.documentsPath = args[i];
        }
    }
  }

  const pipeline = new RecipeMigrationPipeline();

  try {
    // Check database connection if requested
    if (options.checkConnection) {
      console.log('🔍 Checking database connection...');
      const connected = await pipeline.checkDatabaseConnection();
      if (connected) {
        console.log('✅ Database connection successful');
      } else {
        console.error('❌ Database connection failed');
        process.exit(1);
      }
      return;
    }

    // Cleanup test data if requested
    if (options.cleanup) {
      console.log('🧹 Cleaning up test data...');
      const cleaned = await pipeline.cleanupTestData();
      console.log(`✅ Cleaned up ${cleaned} test recipes`);
      return;
    }

    // Validate required arguments
    if (!options.documentsPath) {
      console.error('❌ Error: Documents path is required');
      console.error('Use --help for usage information');
      process.exit(1);
    }

    // Convert to absolute path
    options.documentsPath = path.resolve(options.documentsPath);

    // Run the migration pipeline
    const results = await pipeline.run(options.documentsPath, {
      dryRun: options.dryRun,
      outputPath: options.outputPath,
      skipValidation: options.skipValidation
    });

    console.log('🎉 Migration pipeline completed successfully!');

    // Show final summary
    if (results.successful && results.failed) {
      // Migration results
      console.log('\n📊 Final Results:');
      console.log(`   ✅ Successfully migrated: ${results.successful.length}`);
      console.log(`   ❌ Failed: ${results.failed.length}`);
    } else {
      // Validation results (dry run)
      console.log('\n📊 Final Results:');
      console.log(`   ✅ Valid recipes: ${results.successful.length}`);
      console.log(`   ❌ Invalid recipes: ${results.failed.length}`);
      console.log(`   ⚠️  Recipes with warnings: ${results.warnings.length}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
📚 Recipe Migration Pipeline - Help

USAGE:
  node migrate-recipes.js [OPTIONS] <documents-path>

ARGUMENTS:
  documents-path        Path to directory containing Word documents (.docx, .doc)

OPTIONS:
  --dry-run            Run without migrating to database (preview only)
  --output, -o         Output file for results (default: ./migration-results.json)
  --skip-validation    Skip recipe validation (use with caution)
  --cleanup            Clean up test recipes from database
  --check-connection   Check database connection and exit
  --help, -h           Show this help message

EXAMPLES:
  # Dry run to preview results
  node migrate-recipes.js --dry-run ./recipe-documents

  # Migrate recipes to production database
  node migrate-recipes.js ./recipe-documents

  # Save results to custom file
  node migrate-recipes.js --output ./my-results.json ./recipe-documents

  # Clean up test data
  node migrate-recipes.js --cleanup

  # Check database connection
  node migrate-recipes.js --check-connection

ENVIRONMENT VARIABLES:
  DATABASE_URL         PostgreSQL connection string (required)

SUPPORTED FORMATS:
  - .docx (Microsoft Word 2007+)
  - .doc (Microsoft Word 97-2003)

The pipeline will:
1. Parse all Word documents in the specified directory
2. Extract recipe information (title, ingredients, instructions, etc.)
3. Validate the extracted data
4. Convert to the required database format
5. Migrate to production database (unless --dry-run)

Hebrew recipes are fully supported and expected.
`);
}

// Run the CLI
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main };