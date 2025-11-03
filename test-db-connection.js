const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

// Test database connection with the production string from .env
const DATABASE_URL = process.env.DATABASE_URL

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function testConnection() {
  console.log('🔍 Testing database connection...')
  console.log('🔍 Database URL:', DATABASE_URL.replace(/\/\/.*@/, '//***@'))

  try {
    // Test basic connection
    console.log('🔍 Testing basic connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as timestamp`
    console.log('✅ Basic connection successful:', result)

    // Test recipe table access
    console.log('🔍 Testing recipe table access...')
    const recipeCount = await prisma.recipe.count()
    console.log('✅ Recipe count:', recipeCount)

    // Test getting first recipe if any exist
    if (recipeCount > 0) {
      console.log('🔍 Testing recipe retrieval...')
      const firstRecipe = await prisma.recipe.findFirst({
        select: {
          id: true,
          title: true,
          createdAt: true
        }
      })
      console.log('✅ First recipe:', firstRecipe)
    }

    console.log('✅ All database tests passed!')

  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('❌ Error type:', typeof error)
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error))
    console.error('❌ Error code:', error.code)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()