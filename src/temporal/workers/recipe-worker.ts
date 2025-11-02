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

  // Connect to Temporal Server
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7234',
  })

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