import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities/recipe-activities'

// Configure activity timeouts
const { createRecipe, updateRecipe, deleteRecipe, getRecipes, sendNotificationEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3,
  },
})

export interface RecipeWorkflowInput {
  operation: 'create' | 'update' | 'delete'
  recipeData?: any
  recipeId?: string
  userId?: string
  userEmail?: string
}

export async function recipeWorkflow(input: RecipeWorkflowInput): Promise<any> {
  let result: any

  try {
    switch (input.operation) {
      case 'create':
        if (!input.recipeData) {
          throw new Error('Recipe data is required for create operation')
        }
        result = await createRecipe(input.recipeData)

        // Send notification email - pass full recipe data
        await sendNotificationEmail({
          recipeId: result.id,
          operation: 'create',
          userEmail: input.userEmail,
          recipe: result
        })
        break

      case 'update':
        if (!input.recipeId || !input.recipeData) {
          throw new Error('Recipe ID and data are required for update operation')
        }
        result = await updateRecipe(input.recipeId, input.recipeData)

        // Send notification email - pass full updated recipe data
        await sendNotificationEmail({
          recipeId: input.recipeId,
          operation: 'update',
          userEmail: input.userEmail,
          recipe: result
        })
        break

      case 'delete':
        if (!input.recipeId) {
          throw new Error('Recipe ID is required for delete operation')
        }

        // For delete operation, we need the recipe data for notifications BEFORE deletion
        // Let the email activity fetch it before we delete
        await sendNotificationEmail({
          recipeId: input.recipeId,
          operation: 'delete',
          userEmail: input.userEmail
        })

        // Now delete the recipe
        result = await deleteRecipe(input.recipeId)
        break

      default:
        throw new Error(`Unknown operation: ${input.operation}`)
    }

    return {
      success: true,
      operation: input.operation,
      result,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    // Log error and re-throw for Temporal to handle retries
    console.error(`Recipe workflow failed for operation ${input.operation}:`, error)
    throw error
  }
}

// Individual workflow functions that the client expects
export async function getRecipesWorkflow(filters?: any): Promise<any[]> {
  return await getRecipes(filters)
}

export async function createRecipeWorkflow(recipeData: any): Promise<any> {
  return await recipeWorkflow({
    operation: 'create',
    recipeData,
    userEmail: recipeData.createdBy
  })
}

export async function updateRecipeWorkflow(recipeData: any): Promise<any> {
  return await recipeWorkflow({
    operation: 'update',
    recipeId: recipeData.id,
    recipeData,
    userEmail: recipeData.lastModifiedBy
  })
}

export async function deleteRecipeWorkflow(recipeId: string, deletedBy: string): Promise<void> {
  await recipeWorkflow({
    operation: 'delete',
    recipeId,
    userEmail: deletedBy
  })
}