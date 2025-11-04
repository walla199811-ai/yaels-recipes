const WordDocumentParser = require('./word-document-parser');
const fs = require('fs');

/**
 * Test script for the Word Document Parser
 * Tests parsing functionality without database connection
 */
async function testParser() {
  console.log('🧪 Testing Word Document Parser\n');

  const parser = new WordDocumentParser();

  // Test 1: Test the parsing with mock text data
  console.log('Test 1: Parsing mock Hebrew recipe text');

  const mockText = `עוגת שוקולד של סבתא

מתכון משפחתי לעוגת שוקולד עשירה וטעימה

זמן הכנה: 30 דקות
זמן אפייה: 60 דקות

רכיבים:
• 3 כוסות קמח לבן
• 2 כוסות סוכר
• 4 ביצים גדולות
• 1 כוס שמן
• 1 כוס מים רותחים
• 3 כפות קקאו
• 1 כפית אבקת אפייה

הוראות הכנה:
1. לחמם תנור ל-180 מעלות
2. לערבב במיקסר את הביצים והסוכר עד לקבלת קצף לבן
3. להוסיף שמן וערבב היטב
4. להוסיף חומרים יבשים לסירוגין עם מים רותחים
5. לערבב עד לקבלת בלילה חלקה
6. לשפוך לתבנית משומנת ומקומחת
7. לאפות כ-60 דקות או עד שקיסם יוצא נקי`;

  try {
    const recipe = parser.parseRecipeText(mockText, 'test-cake.docx');

    console.log('✅ Successfully parsed recipe:');
    console.log(`   Title: ${recipe.title}`);
    console.log(`   Description: ${recipe.description}`);
    console.log(`   Category: ${recipe.category}`);
    console.log(`   Prep Time: ${recipe.prepTimeMinutes} minutes`);
    console.log(`   Cook Time: ${recipe.cookTimeMinutes} minutes`);
    console.log(`   Ingredients: ${recipe.ingredients.length} items`);
    console.log(`   Instructions: ${recipe.instructions.length} steps`);
    console.log(`   Tags: ${recipe.tags.join(', ')}`);

    // Show first few ingredients and instructions
    console.log('\n   First 3 ingredients:');
    recipe.ingredients.slice(0, 3).forEach((ing, idx) => {
      console.log(`     ${idx + 1}. ${ing.text}`);
    });

    console.log('\n   First 3 instructions:');
    recipe.instructions.slice(0, 3).forEach((inst, idx) => {
      console.log(`     ${idx + 1}. ${inst.text}`);
    });

    // Test validation
    const isValid = parser.validateRecipe(recipe);
    console.log(`\n   Validation: ${isValid ? '✅ Valid' : '❌ Invalid'}`);

  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }

  // Test 2: Test different recipe types
  console.log('\n\nTest 2: Testing different recipe categories');

  const testCases = [
    {
      text: 'שניצל עוף בתנור\n\nרכיבים:\n• 4 חזות עוף\n• פירורי לחם\n\nהוראות:\n1. לאפות בתנור',
      expectedCategory: 'MAIN'
    },
    {
      text: 'סלט ירקות\n\nרכיבים:\n• מלפפונים\n• עגבניות\n\nהוראות:\n1. לערבב הכל',
      expectedCategory: 'SIDE'
    },
    {
      text: 'עוגיות שוקולד\n\nרכיבים:\n• קמח\n• שוקולד\n\nהוראות:\n1. לאפות',
      expectedCategory: 'DESSERT'
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      const recipe = parser.parseRecipeText(testCase.text, `test-${i}.docx`);
      const categoryMatch = recipe.category === testCase.expectedCategory;
      console.log(`   Test 2.${i + 1}: ${categoryMatch ? '✅' : '❌'} Category detection - Expected: ${testCase.expectedCategory}, Got: ${recipe.category}`);
    } catch (error) {
      console.error(`   Test 2.${i + 1}: ❌ Failed - ${error.message}`);
    }
  }

  // Test 3: Test edge cases
  console.log('\n\nTest 3: Testing edge cases');

  const edgeCases = [
    {
      name: 'Empty text',
      text: '',
      shouldFail: true
    },
    {
      name: 'No ingredients',
      text: 'מתכון ללא רכיבים\n\nהוראות:\n1. לעשות משהו',
      shouldFail: false // Should still parse but with warnings
    },
    {
      name: 'Hebrew with mixed formatting',
      text: 'עוגה\n\n• מרכיב 1\n• מרכיב 2\n\n1. שלב 1\n2. שלב 2',
      shouldFail: false
    }
  ];

  for (const testCase of edgeCases) {
    try {
      const recipe = parser.parseRecipeText(testCase.text, `edge-case.docx`);
      if (testCase.shouldFail) {
        console.log(`   ${testCase.name}: ❌ Should have failed but didn't`);
      } else {
        console.log(`   ${testCase.name}: ✅ Parsed successfully`);
      }
    } catch (error) {
      if (testCase.shouldFail) {
        console.log(`   ${testCase.name}: ✅ Failed as expected`);
      } else {
        console.log(`   ${testCase.name}: ❌ Unexpected failure - ${error.message}`);
      }
    }
  }

  console.log('\n🎉 Parser testing completed!');
}

// Test the help functionality
function testHelp() {
  console.log('\n📚 Testing help output:');
  require('./migrate-recipes.js');
  // This would show help if we called it with --help
}

// Run tests
if (require.main === module) {
  testParser().then(() => {
    console.log('\n✅ All tests completed');
  }).catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { testParser };