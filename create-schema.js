const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

// Use the production database URL
const DATABASE_URL = process.env.DATABASE_URL

console.log('🔍 Creating database schema...')
console.log('🔍 Database URL:', DATABASE_URL?.replace(/\/\/.*@/, '//***@'))

const prisma = new PrismaClient({
  datasources: {
    db: { url: DATABASE_URL }
  }
})

async function createSchema() {
  try {
    console.log('🔍 Connecting to database...')

    // First, try a simple connection test
    const testResult = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful:', testResult)

    // Create the Recipe table manually using raw SQL
    console.log('🔍 Creating Recipe table...')

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Recipe" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "prepTimeMinutes" INTEGER NOT NULL,
        "cookTimeMinutes" INTEGER NOT NULL,
        "servings" INTEGER NOT NULL,
        "ingredients" JSONB NOT NULL,
        "instructions" JSONB NOT NULL,
        "photoUrl" TEXT,
        "tags" TEXT[],
        "createdBy" TEXT NOT NULL,
        "lastModifiedBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('✅ Recipe table created successfully!')

    // Check if table exists and get its structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Recipe'
      ORDER BY ordinal_position
    `

    console.log('📋 Table structure:', tableInfo)

    // Test inserting a sample record
    console.log('🔍 Testing table with sample data...')

    const sampleRecipe = await prisma.recipe.create({
      data: {
        id: 'test-recipe-' + Date.now(),
        title: 'Test Recipe',
        description: 'This is a test recipe created during database setup',
        category: 'MAIN',
        prepTimeMinutes: 15,
        cookTimeMinutes: 30,
        servings: 4,
        ingredients: [
          { order: 1, text: '2 cups flour' },
          { order: 2, text: '1 cup water' }
        ],
        instructions: [
          { step: 1, text: 'Mix ingredients' },
          { step: 2, text: 'Cook for 30 minutes' }
        ],
        tags: ['test', 'setup'],
        createdBy: 'Database Setup Script',
        lastModifiedBy: 'Database Setup Script'
      }
    })

    console.log('✅ Sample recipe created:', {
      id: sampleRecipe.id,
      title: sampleRecipe.title
    })

    // Count total recipes
    const recipeCount = await prisma.recipe.count()
    console.log('📊 Total recipes in database:', recipeCount)

    console.log('🎉 Database schema setup completed successfully!')

  } catch (error) {
    console.error('❌ Database schema creation failed:', error)
    console.error('❌ Error type:', typeof error)
    console.error('❌ Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error))
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
  } finally {
    await prisma.$disconnect()
  }
}

createSchema()