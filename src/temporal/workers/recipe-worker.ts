// Load environment variables from .env.local BEFORE importing anything else
import { config } from 'dotenv'
config({ path: '.env.local' })

import { Worker, NativeConnection } from '@temporalio/worker'
import * as activities from '../activities/recipe-activities'

async function run() {
  // Debug environment variables
  console.log('🔧 [WORKER DEBUG] Environment variables loaded:')
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ MISSING')
  console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET' : '❌ MISSING')
  console.log('- EMAIL_HOST:', process.env.EMAIL_HOST || '❌ MISSING')
  console.log('- EMAIL_PORT:', process.env.EMAIL_PORT || '❌ MISSING')
  console.log('- NOTIFICATION_EMAILS:', process.env.NOTIFICATION_EMAILS ? '✅ SET' : '❌ MISSING')
  console.log('- TEMPORAL_ADDRESS:', process.env.TEMPORAL_ADDRESS || 'localhost:7234 (default)')

  // Connect to Temporal Server (Cloud or Local)
  let connection: NativeConnection

  // Always connect to self-hosted Temporal server (no Cloud needed)
  console.log('🔗 [WORKER] Connecting to self-hosted Temporal server...')

  // In production, TEMPORAL_ADDRESS should be the full URL with port
  // In development, default to localhost
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7234'

  // If we have a host without port, add the default port
  const finalAddress = temporalAddress.includes(':') ? temporalAddress : `${temporalAddress}:7233`

  console.log('🔗 [WORKER] Attempting connection to:', finalAddress)

  // Check if we're connecting to a secure port (443) - this indicates TLS should be used
  // Port 80 is HTTP (no TLS), port 443 is HTTPS (with TLS)
  const isSecure = finalAddress.includes(':443')
  console.log('🔒 [WORKER] TLS connection:', isSecure ? 'enabled' : 'disabled')

  // Add connection timeout and retry logic
  try {
    connection = await Promise.race([
      NativeConnection.connect({
        address: finalAddress,
        tls: isSecure ? {} : false, // Use TLS for secure connections (port 443), disable for local
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000)
      )
    ]) as NativeConnection

    console.log('✅ [WORKER] Successfully connected to Temporal server')
  } catch (error) {
    console.error('❌ [WORKER] Connection failed:', error)
    console.log('🔄 [WORKER] Retrying connection in 10 seconds...')
    await new Promise(resolve => setTimeout(resolve, 10000))

    // Retry once more
    connection = await NativeConnection.connect({
      address: finalAddress,
      tls: isSecure ? {} : false, // Use TLS for secure connections (port 443), disable for local
    })
  }

  // Create a Worker with the Task Queue name from the client
  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve('../workflows'),
    activities,
    taskQueue: 'yaels-recipes-task-queue',
  })

  // Start accepting tasks on the Task Queue
  console.log('🚀 Temporal Worker started for Yael\'s Recipes')
  console.log('📋 Task Queue: yaels-recipes-task-queue')
  console.log('⏳ Listening for workflow tasks...')

  await worker.run()
}

run().catch((err) => {
  console.error('❌ Temporal Worker failed:', err)
  process.exit(1)
})