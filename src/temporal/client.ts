import { Client } from '@temporalio/client'
import { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeSearchFilters } from '@/types/recipe'

export class TemporalRecipeClient {
  private client: Client | null = null

  private async getClient(): Promise<Client> {
    if (!this.client) {
      try {
        console.log('🔗 Connecting to Temporal server...')
        const { Connection } = await import('@temporalio/client')
        // Parse the Temporal address and determine connection settings
        let temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7234'

        // Remove protocol if present (Render URLs include https://)
        if (temporalAddress.startsWith('https://')) {
          temporalAddress = temporalAddress.replace('https://', '')
        }
        if (temporalAddress.startsWith('http://')) {
          temporalAddress = temporalAddress.replace('http://', '')
        }

        // Add default port if not specified
        if (!temporalAddress.includes(':')) {
          temporalAddress = `${temporalAddress}:7233`
        }

        // Determine if we need TLS (external servers use TLS, localhost does not)
        const isLocalhost = temporalAddress.startsWith('localhost:') || temporalAddress.startsWith('127.0.0.1:')

        console.log(`🔗 Connecting to Temporal at: ${temporalAddress} (TLS: ${!isLocalhost})`)

        const connection = await Connection.connect({
          address: temporalAddress,
          tls: isLocalhost ? false : {},
        })
        this.client = new Client({
          connection,
        })
        console.log('✅ Connected to Temporal Server')
      } catch (error) {
        console.error('❌ Failed to connect to Temporal Server:', error)
        throw error
      }
    }
    return this.client
  }

  private resetClient(): void {
    this.client = null
  }

  async getRecipes(filters?: RecipeSearchFilters): Promise<Recipe[]> {
    try {
      const client = await this.getClient()
      const handle = await client.workflow.start('getRecipesWorkflow', {
        args: [filters],
        taskQueue: 'yaels-recipes-task-queue',
        workflowId: `get-recipes-${Date.now()}`,
      })

      return await handle.result()
    } catch (error) {
      console.error('Failed to fetch recipes:', error)
      this.resetClient() // Reset client on error to force reconnection
      throw error
    }
  }

  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    try {
      console.log('🍳 Creating recipe via Temporal workflow:', input.title)
      const client = await this.getClient()
      const workflowId = `create-recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.log('🚀 Starting recipe workflow:', workflowId)
      console.log('📝 Operation: create')

      const handle = await client.workflow.start('createRecipeWorkflow', {
        args: [input],
        taskQueue: 'yaels-recipes-task-queue',
        workflowId,
      })

      console.log('⏳ Recipe workflow started with ID:', workflowId)
      const result = await handle.result()
      console.log('✅ Recipe workflow completed:', workflowId)
      return result
    } catch (error) {
      console.error('Failed to create recipe:', error)
      this.resetClient()
      throw error
    }
  }

  async updateRecipe(input: UpdateRecipeInput): Promise<Recipe> {
    try {
      console.log('📝 Updating recipe via Temporal workflow:', input.id)
      const client = await this.getClient()
      const workflowId = `update-recipe-${input.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.log('🚀 Starting recipe workflow:', workflowId)
      console.log('📝 Operation: update')

      const handle = await client.workflow.start('updateRecipeWorkflow', {
        args: [input],
        taskQueue: 'yaels-recipes-task-queue',
        workflowId,
      })

      console.log('⏳ Recipe workflow started with ID:', workflowId)
      const result = await handle.result()
      console.log('✅ Recipe workflow completed:', workflowId)
      return result
    } catch (error) {
      console.error('Failed to update recipe:', error)
      this.resetClient()
      throw error
    }
  }

  async deleteRecipe(recipeId: string, deletedBy: string): Promise<void> {
    try {
      console.log('🗑️ Deleting recipe via Temporal workflow:', recipeId)
      const client = await this.getClient()
      const workflowId = `delete-recipe-${recipeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.log('🚀 Starting recipe workflow:', workflowId)
      console.log('📝 Operation: delete')

      const handle = await client.workflow.start('deleteRecipeWorkflow', {
        args: [recipeId, deletedBy],
        taskQueue: 'yaels-recipes-task-queue',
        workflowId,
      })

      console.log('⏳ Recipe workflow started with ID:', workflowId)
      const result = await handle.result()
      console.log('✅ Recipe workflow completed:', workflowId)
      return result
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      this.resetClient()
      throw error
    }
  }
}

// Singleton instance
export const temporalRecipeClient = new TemporalRecipeClient()