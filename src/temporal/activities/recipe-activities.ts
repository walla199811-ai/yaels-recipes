import { PrismaClient, RecipeCategory } from '@prisma/client'
import { CreateRecipeInput, UpdateRecipeInput } from '@/types/recipe'

const prisma = new PrismaClient()

export interface NotificationEmailInput {
  recipeId: string
  operation: 'create' | 'update' | 'delete'
  userEmail?: string
  recipe?: any // The full recipe object for notifications
}

/**
 * Create a new recipe in the database
 */
export async function createRecipe(recipeData: CreateRecipeInput): Promise<any> {
  try {
    console.log('Creating recipe via Temporal activity:', recipeData.title)

    const newRecipe = await prisma.recipe.create({
      data: {
        title: recipeData.title,
        description: recipeData.description || null,
        category: recipeData.category as RecipeCategory,
        prepTimeMinutes: recipeData.prepTimeMinutes,
        cookTimeMinutes: recipeData.cookTimeMinutes,
        servings: recipeData.servings,
        ingredients: recipeData.ingredients.map((ing: any, index: number) => ({
          order: index + 1,
          text: ing.text
        })),
        instructions: recipeData.instructions.map((inst: any, index: number) => ({
          step: index + 1,
          text: inst.text
        })),
        photoUrl: recipeData.photoUrl || null,
        tags: recipeData.tags,
        createdBy: recipeData.createdBy,
        lastModifiedBy: recipeData.createdBy,
      }
    })

    console.log('Recipe created successfully via Temporal:', newRecipe.id)
    return {
      ...newRecipe,
      ingredients: newRecipe.ingredients as Array<{ order: number; text: string }>,
      instructions: newRecipe.instructions as Array<{ step: number; text: string }>
    }
  } catch (error) {
    console.error('Failed to create recipe via Temporal:', error)
    throw new Error(`Failed to create recipe: ${error}`)
  }
}

/**
 * Update an existing recipe in the database
 */
export async function updateRecipe(recipeId: string, updateData: any): Promise<any> {
  try {
    console.log('Updating recipe via Temporal activity:', recipeId)

    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        title: updateData.title,
        description: updateData.description,
        category: updateData.category as RecipeCategory,
        prepTimeMinutes: updateData.prepTimeMinutes,
        cookTimeMinutes: updateData.cookTimeMinutes,
        servings: updateData.servings,
        ingredients: updateData.ingredients?.map((ing: any, index: number) => ({
          order: index + 1,
          text: ing.text
        })),
        instructions: updateData.instructions?.map((inst: any, index: number) => ({
          step: index + 1,
          text: inst.text
        })),
        photoUrl: updateData.photoUrl,
        tags: updateData.tags,
        createdBy: updateData.createdBy,
        lastModifiedBy: updateData.lastModifiedBy || updateData.createdBy,
        updatedAt: new Date(),
      }
    })

    console.log('Recipe updated successfully via Temporal:', updatedRecipe.id)
    return {
      ...updatedRecipe,
      ingredients: updatedRecipe.ingredients as Array<{ order: number; text: string }>,
      instructions: updatedRecipe.instructions as Array<{ step: number; text: string }>
    }
  } catch (error) {
    console.error('Failed to update recipe via Temporal:', error)
    throw new Error(`Failed to update recipe: ${error}`)
  }
}

/**
 * Delete a recipe from the database
 */
export async function deleteRecipe(recipeId: string): Promise<{ success: boolean; id: string }> {
  try {
    console.log('Deleting recipe via Temporal activity:', recipeId)

    await prisma.recipe.delete({
      where: { id: recipeId }
    })

    console.log('Recipe deleted successfully via Temporal:', recipeId)
    return { success: true, id: recipeId }
  } catch (error) {
    console.error('Failed to delete recipe via Temporal:', error)

    // Handle specific Prisma error for record not found
    if ((error as any).code === 'P2025') {
      throw new Error('Recipe not found')
    }

    throw new Error(`Failed to delete recipe: ${error}`)
  }
}

/**
 * Send notification email using the email service
 */
export async function sendNotificationEmail(emailData: NotificationEmailInput): Promise<{ success: boolean }> {
  try {
    console.log('🔧 [EMAIL DEBUG] Starting email notification process:', {
      operation: emailData.operation,
      recipeId: emailData.recipeId,
      userEmail: emailData.userEmail,
      hasRecipeData: !!emailData.recipe
    })

    // Check environment variables first
    const emailConfig = {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS ? '***REDACTED***' : undefined,
      EMAIL_FROM: process.env.EMAIL_FROM,
      NOTIFICATION_EMAILS: process.env.NOTIFICATION_EMAILS
    }

    console.log('🔧 [EMAIL DEBUG] Environment variables check:', emailConfig)

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const error = 'EMAIL_USER or EMAIL_PASS not configured in environment'
      console.error('❌ [EMAIL DEBUG] Missing email credentials:', error)
      throw new Error(error)
    }

    if (!process.env.NOTIFICATION_EMAILS) {
      const error = 'NOTIFICATION_EMAILS not configured in environment'
      console.error('❌ [EMAIL DEBUG] Missing notification emails:', error)
      throw new Error(error)
    }

    // Import email service dynamically to avoid issues with Temporal bundling
    const { emailService } = await import('@/services/email-service')

    // If we have the full recipe object, use it; otherwise fetch it from database
    let recipe = emailData.recipe
    if (!recipe) {
      console.log('🔧 [EMAIL DEBUG] Recipe not provided, fetching from database:', emailData.recipeId)
      recipe = await prisma.recipe.findUnique({
        where: { id: emailData.recipeId }
      })

      if (!recipe) {
        const error = `Recipe not found in database: ${emailData.recipeId}`
        console.error('❌ [EMAIL DEBUG] Recipe lookup failed:', error)
        throw new Error(error)
      }
      console.log('✅ [EMAIL DEBUG] Recipe fetched successfully:', recipe.title)
    }

    // Determine the performer - always use the recipe's creator/modifier, NOT the email recipient
    const performedBy = recipe.lastModifiedBy || recipe.createdBy || 'מערכת'
    console.log('🔧 [EMAIL DEBUG] Email will be attributed to:', performedBy)
    console.log('🔧 [EMAIL DEBUG] Email recipient:', emailData.userEmail)

    // Map operation types to match EmailService expectations
    const operationMap = {
      'create': 'created' as const,
      'update': 'updated' as const,
      'delete': 'deleted' as const
    }

    const mappedOperation = operationMap[emailData.operation]
    console.log('🔧 [EMAIL DEBUG] Calling emailService.sendRecipeNotification with:', {
      operation: mappedOperation,
      recipeTitle: recipe.title,
      performedBy
    })

    const success = await emailService.sendRecipeNotification(
      mappedOperation,
      recipe,
      performedBy
    )

    if (success) {
      console.log('✅ [EMAIL DEBUG] Email notification sent successfully')
    } else {
      console.error('❌ [EMAIL DEBUG] Email notification failed - emailService returned false')
    }

    return { success }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('❌ [EMAIL DEBUG] Email notification failed with error:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      operation: emailData.operation,
      recipeId: emailData.recipeId
    })

    // Log this as a failure but don't throw - email failure shouldn't fail the entire workflow
    return { success: false, error: errorMessage }
  }
}