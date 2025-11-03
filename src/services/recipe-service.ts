import { executeRecipeWorkflow } from '@/temporal/client/temporal-client'
import { CreateRecipeInput, Recipe } from '@/types/recipe'

/**
 * Recipe service that integrates with Temporal workflows for reliable operations
 * Uses self-hosted Temporal server for free deployment
 */
export class RecipeService {
  /**
   * Create a new recipe with Temporal workflow for reliability
   */
  static async createRecipe(recipeData: CreateRecipeInput, userEmail?: string): Promise<Recipe> {
    console.log('🍳 Creating recipe via Temporal workflow:', recipeData.title)

    const result = await executeRecipeWorkflow({
      operation: 'create',
      recipeData,
      userEmail,
    })

    return result.result
  }

  /**
   * Update a recipe with Temporal workflow for reliability
   */
  static async updateRecipe(
    recipeId: string,
    updateData: any,
    userEmail?: string
  ): Promise<Recipe> {
    console.log('📝 Updating recipe via Temporal workflow:', recipeId)

    const result = await executeRecipeWorkflow({
      operation: 'update',
      recipeId,
      recipeData: updateData,
      userEmail,
    })

    return result.result
  }

  /**
   * Delete a recipe with Temporal workflow for reliability
   */
  static async deleteRecipe(recipeId: string, userEmail?: string): Promise<void> {
    console.log('🗑️ Deleting recipe via Temporal workflow:', recipeId)

    await executeRecipeWorkflow({
      operation: 'delete',
      recipeId,
      userEmail,
    })
  }
}