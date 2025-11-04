const mammoth = require('mammoth');
const path = require('path');

/**
 * Test AI parsing with a real document
 */
async function testAIParsing() {
  console.log('🤖 Testing AI-powered recipe parsing\n');

  try {
    // Extract text from Document4
    const docPath = path.join(__dirname, '../test-documents/Document4.docx');
    const result = await mammoth.extractRawText({ path: docPath });
    const text = result.value;

    console.log('📄 Extracted text from Document4:');
    console.log('='.repeat(50));
    console.log(text);
    console.log('=' .repeat(50));
    console.log('\n🔍 Now this text will be sent to Claude agent for intelligent parsing...\n');

    // This is where we would send to Claude agent
    console.log('💭 The Claude agent would receive this prompt and parse it intelligently.');

    return text;
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testAIParsing().then((text) => {
    if (text) {
      console.log('✅ Text extraction successful. Ready for AI parsing.');
    }
  });
}

module.exports = { testAIParsing };