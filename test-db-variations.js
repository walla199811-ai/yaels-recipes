const { PrismaClient } = require('@prisma/client')

// Test different variations of the connection string with correct credentials
const connectionStrings = [
  // Original - from Neon dashboard
  'postgresql://neondb_owner:npg_FW7GjCVR8NyI@ep-purple-sky-agznjyjm-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',

  // Without channel_binding
  'postgresql://neondb_owner:npg_FW7GjCVR8NyI@ep-purple-sky-agznjyjm-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require',

  // With sslmode=prefer instead of require
  'postgresql://neondb_owner:npg_FW7GjCVR8NyI@ep-purple-sky-agznjyjm-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=prefer',

  // Without any SSL parameters
  'postgresql://neondb_owner:npg_FW7GjCVR8NyI@ep-purple-sky-agznjyjm-pooler.c-2.eu-central-1.aws.neon.tech/neondb'
]

async function testConnection(url, index) {
  console.log(`\n🔍 Testing connection ${index + 1}:`)
  console.log('🔍 URL:', url.replace(/\/\/.*@/, '//***@'))

  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  })

  try {
    console.log('🔍 Attempting connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Connection successful:', result)
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function testAllConnections() {
  console.log('🔍 Testing different connection string variations...\n')

  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnection(connectionStrings[i], i)
    if (success) {
      console.log(`\n✅ SUCCESS! Connection ${i + 1} worked!`)
      break
    }

    // Wait a bit between attempts
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n🔍 Test complete.')
}

testAllConnections()