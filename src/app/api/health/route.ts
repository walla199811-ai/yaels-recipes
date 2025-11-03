import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasTemporalAddress: !!process.env.TEMPORAL_ADDRESS,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      temporalAddress: process.env.TEMPORAL_ADDRESS || 'not configured',
      databaseType: process.env.DATABASE_URL?.startsWith('postgres') ? 'postgresql' : 'unknown',
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Health check passed',
      diagnostics
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error: String(error)
    }, { status: 500 })
  }
}