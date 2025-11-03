import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  // This endpoint is for setting up the database schema
  console.log('🔍 [SETUP-DB] Database setup endpoint called at:', new Date().toISOString())
  console.log('🔍 [SETUP-DB] Environment:', process.env.NODE_ENV)
  console.log('🔍 [SETUP-DB] Database URL exists:', !!process.env.DATABASE_URL)

  try {
    console.log('🔍 [SETUP-DB] Testing database connection...')

    // Test connection first
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ [SETUP-DB] Database connection successful:', result)

    // Create the Recipe table using raw SQL
    console.log('🔍 [SETUP-DB] Creating Recipe table...')

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

    console.log('✅ [SETUP-DB] Recipe table created successfully!')

    // Check if table exists and get its structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Recipe'
      ORDER BY ordinal_position
    `

    console.log('📋 [SETUP-DB] Table structure:', tableInfo)

    // Create a test recipe to validate everything works
    console.log('🔍 [SETUP-DB] Creating test recipe...')

    const testRecipe = await prisma.recipe.create({
      data: {
        id: 'setup-test-' + Date.now(),
        title: 'Database Setup Test Recipe',
        description: 'This test recipe was created during database setup',
        category: 'MAIN',
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        servings: 2,
        ingredients: [
          { order: 1, text: '1 cup test ingredient' },
          { order: 2, text: '2 tbsp setup spice' }
        ],
        instructions: [
          { step: 1, text: 'Mix test ingredients' },
          { step: 2, text: 'Verify database setup works' }
        ],
        tags: ['test', 'setup', 'database'],
        createdBy: 'Database Setup',
        lastModifiedBy: 'Database Setup'
      }
    })

    console.log('✅ [SETUP-DB] Test recipe created:', {
      id: testRecipe.id,
      title: testRecipe.title
    })

    // Count total recipes
    const recipeCount = await prisma.recipe.count()
    console.log('📊 [SETUP-DB] Total recipes in database:', recipeCount)

    return NextResponse.json({
      status: 'success',
      message: 'Database schema setup completed successfully',
      data: {
        tableCreated: true,
        testRecipeId: testRecipe.id,
        totalRecipes: recipeCount,
        tableStructure: tableInfo,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    })

  } catch (error) {
    console.error('❌ [SETUP-DB] Database setup failed:', error)
    console.error('❌ [SETUP-DB] Error type:', typeof error)
    console.error('❌ [SETUP-DB] Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ [SETUP-DB] Error message:', error instanceof Error ? error.message : String(error))
    console.error('❌ [SETUP-DB] Error stack:', error instanceof Error ? error.stack : 'No stack')

    return NextResponse.json({
      status: 'error',
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
}