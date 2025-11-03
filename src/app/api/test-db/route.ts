import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // Force rebuild - debug version v2
  console.log('🔍 [TEST-DB] Test endpoint called at:', new Date().toISOString())
  console.log('🔍 [TEST-DB] Environment:', process.env.NODE_ENV)
  console.log('🔍 [TEST-DB] Database URL exists:', !!process.env.DATABASE_URL)
  console.log('🔍 [TEST-DB] Database URL (masked):', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***@'))

  try {
    console.log('🔍 [TEST-DB] Testing database connection...')

    // Try to connect and run a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('🔍 [TEST-DB] Raw query result:', result)

    // Try to get recipe count
    const recipeCount = await prisma.recipe.count()
    console.log('🔍 [TEST-DB] Recipe count:', recipeCount)

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        rawQuery: result,
        recipeCount,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      }
    })

  } catch (error) {
    console.error('❌ [TEST-DB] Database test failed:', error)
    console.error('❌ [TEST-DB] Error type:', typeof error)
    console.error('❌ [TEST-DB] Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ [TEST-DB] Error message:', error instanceof Error ? error.message : String(error))
    console.error('❌ [TEST-DB] Error stack:', error instanceof Error ? error.stack : 'No stack')

    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
}