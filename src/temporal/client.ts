import { Client } from '@temporalio/client'
import { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeSearchFilters } from '@/types/recipe'

export class TemporalRecipeClient {
  private client: Client | null = null

  private async getClient(): Promise<Client> {
    if (!this.client) {
      this.client = new Client({
        connection: {
          address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
        },
      })
    }
    return this.client
  }

  async getRecipes(filters?: RecipeSearchFilters): Promise<Recipe[]> {
    const client = await this.getClient()
    const handle = await client.workflow.start('getRecipesWorkflow', {
      args: [filters],
      taskQueue: 'recipe-task-queue',
      workflowId: `get-recipes-${Date.now()}`,
    })

    return await handle.result()
  }

  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    const client = await this.getClient()
    const handle = await client.workflow.start('createRecipeWorkflow', {
      args: [input],
      taskQueue: 'recipe-task-queue',
      workflowId: `create-recipe-${Date.now()}`,
    })

    return await handle.result()
  }

  async updateRecipe(input: UpdateRecipeInput): Promise<Recipe> {
    const client = await this.getClient()
    const handle = await client.workflow.start('updateRecipeWorkflow', {
      args: [input],
      taskQueue: 'recipe-task-queue',
      workflowId: `update-recipe-${input.id}-${Date.now()}`,
    })

    return await handle.result()
  }

  async deleteRecipe(recipeId: string, deletedBy: string): Promise<void> {
    const client = await this.getClient()
    const handle = await client.workflow.start('deleteRecipeWorkflow', {
      args: [recipeId, deletedBy],
      taskQueue: 'recipe-task-queue',
      workflowId: `delete-recipe-${recipeId}-${Date.now()}`,
    })

    return await handle.result()
  }
}

// Singleton instance
export const temporalRecipeClient = new TemporalRecipeClient()