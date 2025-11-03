const { Connection, Client } = require('@temporalio/client');

async function testTemporalConnection() {
  console.log('🔍 Testing Temporal connection...');

  // Test with your production settings
  const temporalAddress = 'yaels-recipes-temporal.onrender.com:7233';

  console.log(`🔗 Connecting to: ${temporalAddress}`);
  console.log(`🔗 Using TLS: true`);

  try {
    const connection = await Connection.connect({
      address: temporalAddress,
      tls: {},
      connectTimeout: '30s',
    });

    console.log('✅ Connection established!');

    const client = new Client({
      connection,
    });

    console.log('✅ Client created!');

    // Test if we can list workflows
    const workflowService = client.workflowService;
    console.log('🔍 Testing workflow service access...');

    // This should work if connection is good
    await workflowService.listNamespaces({});
    console.log('✅ Can access workflow service!');

    console.log('🎉 All tests passed! Connection is working.');

  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);

    // Try with port 7234 as fallback
    console.log('\n🔄 Trying fallback port 7234...');
    try {
      const fallbackAddress = 'yaels-recipes-temporal.onrender.com:7234';
      console.log(`🔗 Connecting to: ${fallbackAddress}`);

      const fallbackConnection = await Connection.connect({
        address: fallbackAddress,
        tls: {},
        connectTimeout: '30s',
      });

      console.log('✅ Fallback connection established!');

    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
    }
  }
}

testTemporalConnection().catch(console.error);