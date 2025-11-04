# Recipe Migration Pipeline

A comprehensive pipeline for migrating Hebrew recipes from Word documents to your production database.

## Overview

This pipeline consists of three main components:

1. **WordDocumentParser** (`word-document-parser.js`) - Extracts recipe data from Word documents
2. **RecipeMigrationPipeline** (`recipe-migration-pipeline.js`) - Handles validation and database migration
3. **CLI Script** (`migrate-recipes.js`) - Command-line interface for running migrations

## Features

- ✅ **Hebrew Support** - Fully supports Hebrew recipe content and RTL text
- ✅ **Smart Parsing** - Intelligently extracts titles, ingredients, instructions, and metadata
- ✅ **Validation** - Comprehensive validation with warnings and error reporting
- ✅ **Dry Run Mode** - Preview results before migrating to production
- ✅ **Flexible Formats** - Handles various Word document structures
- ✅ **Production Ready** - Connects directly to your production database
- ✅ **Detailed Reporting** - Saves detailed results to JSON files

## Supported Document Formats

- `.docx` (Microsoft Word 2007+)
- `.doc` (Microsoft Word 97-2003)

## Installation

The pipeline uses the `mammoth` package which is already installed:

```bash
npm install mammoth
```

## Usage

### Basic Usage

```bash
# Dry run (preview only - recommended first step)
node scripts/migrate-recipes.js --dry-run ./path/to/word-documents

# Migrate to production database
node scripts/migrate-recipes.js ./path/to/word-documents
```

### Advanced Options

```bash
# Custom output file
node scripts/migrate-recipes.js --output ./my-results.json --dry-run ./documents

# Skip validation (use with caution)
node scripts/migrate-recipes.js --skip-validation ./documents

# Check database connection
node scripts/migrate-recipes.js --check-connection

# Clean up test data
node scripts/migrate-recipes.js --cleanup
```

## Environment Setup

Make sure your `DATABASE_URL` environment variable is set:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

## Recipe Format Detection

The parser automatically detects and extracts:

### **Title**
- Usually the first line or largest text in the document
- Falls back to filename if not detected

### **Ingredients** (רכיבים)
Looks for Hebrew keywords:
- רכיבים, חומרים, מצרכים, מרכיבים
- Extracts bulleted or numbered lists
- Maintains original order

### **Instructions** (הוראות)
Looks for Hebrew keywords:
- הוראות, הכנה, אופן הכנה, שלבי הכנה
- Extracts numbered or bulleted steps

### **Category** (קטגוריה)
Auto-detects based on content:
- **MAIN** (מנה עיקרית) - Keywords: עיקרית, בשר, עוף, דג
- **SIDE** (תוספת) - Keywords: תוספת, סלט, ירקות
- **DESSERT** (קינוח) - Keywords: קינוח, עוגה, עוגית, ממתק

### **Times** (זמנים)
Extracts prep and cook times:
- **Prep Time**: זמן הכנה, זמן הכנת
- **Cook Time**: זמן בישול, זמן אפייה
- Supports both minutes (דקות) and hours (שעות)

### **Tags** (תגיות)
Auto-detects common Hebrew tags:
- פרווה, בשרי, חלבי, צמחוני, טבעוני
- ללא גלוטן, בריא, מהיר, פשוט

## Validation Rules

The pipeline validates:

- ✅ Recipe has a title
- ✅ At least one ingredient exists
- ✅ At least one instruction exists
- ✅ Valid category (MAIN, SIDE, DESSERT)
- ⚠️ Reasonable prep/cook times
- ⚠️ Description length
- ⚠️ Empty ingredients/instructions

## Output Format

Results are saved to a JSON file with this structure:

```json
{
  "timestamp": "2024-11-04T...",
  "summary": {
    "total": 5,
    "successful": 4,
    "failed": 1,
    "warnings": 2
  },
  "results": {
    "successful": [...],
    "failed": [...],
    "warnings": [...]
  }
}
```

## Troubleshooting

### Common Issues

1. **"Document appears to be empty"**
   - Check if the Word document is corrupted
   - Try opening and re-saving the document

2. **"No ingredients found"**
   - Ensure ingredients section uses Hebrew keywords
   - Check if ingredients are in a bulleted/numbered list

3. **"Database connection failed"**
   - Verify `DATABASE_URL` environment variable
   - Check network connectivity to database

4. **Hebrew text appears garbled**
   - Ensure document is saved with proper encoding
   - Check if fonts support Hebrew characters

### Best Practices

1. **Always run dry-run first**:
   ```bash
   node scripts/migrate-recipes.js --dry-run ./documents
   ```

2. **Review the results file** before production migration

3. **Backup your database** before running production migration

4. **Use consistent document formatting** for better parsing results

## Example Document Structure

For optimal parsing, structure your Word documents like this:

```
עוגת שוקולד של סבתא

מתכון משפחתי לעוגת שוקולד עשירה וטעימה

זמן הכנה: 30 דקות
זמן אפייה: 60 דקות

רכיבים:
• 3 כוסות קמח לבן
• 2 כוסות סוכר
• 4 ביצים גדולות
• 1 כוס שמן

הוראות הכנה:
1. לחמם תנור ל-180 מעלות
2. לערבב במיקסר את הביצים והסוכר
3. להוסיף שמן וערבב היטב
4. לאפות כ-60 דקות
```

## Migration Flow

1. **Parse Documents** - Extract text from Word files
2. **Extract Recipe Data** - Identify sections and content
3. **Validate Data** - Check for required fields and format
4. **Convert Format** - Transform to database schema
5. **Migrate to Database** - Insert into production (if not dry-run)

## Files Created

- `word-document-parser.js` - Core parsing logic
- `recipe-migration-pipeline.js` - Migration orchestration
- `migrate-recipes.js` - CLI interface
- `migration-results.json` - Results output (customizable)

## Support

If you encounter issues:

1. Check the detailed error messages in the output
2. Review the generated results JSON file
3. Try with a single document first to isolate issues
4. Ensure your Word documents follow the recommended structure

The pipeline is designed to be robust and handle various document formats, but consistent formatting will yield the best results.