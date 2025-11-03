import { Client, Connection } from '@temporalio/client'
import { recipeWorkflow } from '../workflows/recipe-workflow'

export interface RecipeWorkflowInput {
  operation: 'create' | 'update' | 'delete'
  recipeData?: any
  recipeId?: string
  userId?: string
  userEmail?: string
}

let client: Client | null = null

/**
 * Get or create a Temporal client instance
 */
export async function getTemporalClient(): Promise<Client> {
  if (!client) {
    try {
      let connection: Connection

      // Always connect to self-hosted Temporal server (no Cloud needed)
      console.log('🔗 Connecting to self-hosted Temporal server...')
      connection = await Connection.connect({
        address: process.env.TEMPORAL_ADDRESS || 'localhost:7234',
        connectTimeout: '10s',
        callTimeout: '30s',
      })

      client = new Client({
        connection,
        namespace: process.env.TEMPORAL_NAMESPACE || 'default',
      })

      console.log('✅ Connected to Temporal Server')
    } catch (error) {
      console.error('❌ Failed to connect to Temporal Server:', error)
      throw error
    }
  }

  return client
}

/**
 * Execute a recipe workflow with the given input
 */
export async function executeRecipeWorkflow(input: RecipeWorkflowInput): Promise<any> {
  try {
    const temporalClient = await getTemporalClient()

    // Generate a unique workflow ID
    const workflowId = `recipe-${input.operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log(`🚀 Starting recipe workflow: ${workflowId}`)
    console.log(`📝 Operation: ${input.operation}`)

    const handle = await temporalClient.workflow.start(recipeWorkflow, {
      args: [input],
      taskQueue: 'yaels-recipes-task-queue',
      workflowId,
    })

    console.log(`⏳ Recipe workflow started with ID: ${handle.workflowId}`)

    // Wait for the workflow to complete and return the result
    const result = await handle.result()

    console.log(`✅ Recipe workflow completed: ${handle.workflowId}`)
    return result
  } catch (error) {
    console.error('❌ Recipe workflow failed:', error)
    throw error
  }
}

/**
 * Check if Temporal Server is available (health check)
 */
export async function isTemporalServerAvailable(): Promise<boolean> {
  try {
    await getTemporalClient()
    return true
  } catch (error) {
    console.warn('⚠️ Temporal Server not available:', error)
    return false
  }
}