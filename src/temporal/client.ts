import { Client } from '@temporalio/client'
import { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeSearchFilters } from '@/types/recipe'

export class TemporalRecipeClient {
  private client: Client | null = null

  private async getClient(): Promise<Client> {
    if (!this.client) {
      try {
        console.log('🔗 Connecting to Temporal server...')
        const { Connection } = await import('@temporalio/client')

        // Check if we're in production vs development
        const isProduction = process.env.NODE_ENV === 'production'
        const temporalAddressEnv = process.env.TEMPORAL_ADDRESS

        console.log('🔧 Environment:', process.env.NODE_ENV)
        console.log('🔧 TEMPORAL_ADDRESS env var:', temporalAddressEnv)

        // Parse the Temporal address and determine connection settings
        let temporalAddress = temporalAddressEnv || 'localhost:7234'

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

        // In production, if external server is not accessible, fall back to direct database access
        if (isProduction && !isLocalhost) {
          try {
            const connection = await Connection.connect({
              address: temporalAddress,
              tls: {},
              connectTimeout: '10s', // Shorter timeout for faster fallback
            })
            this.client = new Client({
              connection,
            })
            console.log('✅ Connected to Temporal Server')
          } catch (temporalError) {
            console.warn('⚠️ Temporal server unavailable, falling back to direct mode:', temporalError instanceof Error ? temporalError.message : String(temporalError))
            // Set a flag to indicate direct mode
            this.client = null
            throw new Error('TEMPORAL_UNAVAILABLE')
          }
        } else {
          // Development mode - standard connection
          const connection = await Connection.connect({
            address: temporalAddress,
            tls: isLocalhost ? false : {},
            connectTimeout: '30s',
          })
          this.client = new Client({
            connection,
          })
          console.log('✅ Connected to Temporal Server')
        }
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

      // If Temporal is unavailable in production, fall back to direct database access
      if (error instanceof Error && error.message === 'TEMPORAL_UNAVAILABLE' && process.env.NODE_ENV === 'production') {
        console.log('🔄 Using direct database fallback for getRecipes')
        return await this.getRecipesDirectly(filters)
      }

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

      // If Temporal is unavailable in production, fall back to direct database access
      if (error instanceof Error && error.message === 'TEMPORAL_UNAVAILABLE' && process.env.NODE_ENV === 'production') {
        console.log('🔄 Using direct database fallback for createRecipe')
        return await this.createRecipeDirectly(input)
      }

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

      // If Temporal is unavailable in production, fall back to direct database access
      if (error instanceof Error && error.message === 'TEMPORAL_UNAVAILABLE' && process.env.NODE_ENV === 'production') {
        console.log('🔄 Using direct database fallback for updateRecipe')
        return await this.updateRecipeDirectly(input)
      }

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

      // If Temporal is unavailable in production, fall back to direct database access
      if (error instanceof Error && error.message === 'TEMPORAL_UNAVAILABLE' && process.env.NODE_ENV === 'production') {
        console.log('🔄 Using direct database fallback for deleteRecipe')
        return await this.deleteRecipeDirectly(recipeId, deletedBy)
      }

      throw error
    }
  }

  // Direct database fallback methods for when Temporal is unavailable in production
  private async getRecipesDirectly(filters?: RecipeSearchFilters): Promise<Recipe[]> {
    const { fetchRecipesFromDB } = await import('./activities')
    return await fetchRecipesFromDB(filters)
  }

  private async createRecipeDirectly(input: CreateRecipeInput): Promise<Recipe> {
    const { validateRecipeData, saveRecipeToDB, sendNotificationEmail } = await import('./activities')

    // Validate the recipe data
    await validateRecipeData(input)

    // Save to database
    const recipe = await saveRecipeToDB(input)

    // Send notification (non-blocking)
    try {
      await sendNotificationEmail('created', recipe, input.createdBy)
    } catch (emailError) {
      console.warn('Failed to send notification email:', emailError)
    }

    return recipe
  }

  private async updateRecipeDirectly(input: UpdateRecipeInput): Promise<Recipe> {
    const { validateRecipeData, updateRecipeInDB, sendNotificationEmail } = await import('./activities')

    // Validate the recipe data
    await validateRecipeData(input)

    // Update in database
    const recipe = await updateRecipeInDB(input)

    // Send notification (non-blocking)
    try {
      await sendNotificationEmail('updated', recipe, input.lastModifiedBy || input.createdBy || 'system')
    } catch (emailError) {
      console.warn('Failed to send notification email:', emailError)
    }

    return recipe
  }

  private async deleteRecipeDirectly(recipeId: string, deletedBy: string): Promise<void> {
    const { fetchRecipesFromDB, deleteRecipeFromDB, sendNotificationEmail } = await import('./activities')

    // Get recipe for notification before deleting
    const recipes = await fetchRecipesFromDB({ id: recipeId })
    const recipe = recipes[0]

    if (recipe) {
      // Send notification before deletion (non-blocking)
      try {
        await sendNotificationEmail('deleted', recipe, deletedBy)
      } catch (emailError) {
        console.warn('Failed to send notification email:', emailError)
      }
    }

    // Delete from database
    await deleteRecipeFromDB(recipeId)
  }
}

// Singleton instance
export const temporalRecipeClient = new TemporalRecipeClient()