import { CreateRecipeInput, Recipe, UpdateRecipeInput, RecipeSearchFilters } from '@/types/recipe'
import { prisma } from '@/lib/prisma'
import { RecipeCategory } from '@prisma/client'

/**
 * Direct Recipe service that bypasses Temporal entirely for the no-temporal branch
 * Uses direct database calls for immediate operations without workflow orchestration
 */
export class DirectRecipeService {
  /**
   * Create a new recipe directly in the database
   */
  static async createRecipe(recipeData: CreateRecipeInput, userEmail?: string): Promise<Recipe> {
    console.log('🍳 Creating recipe directly in database:', recipeData.title)

    try {
      // Basic validation
      if (!recipeData.title || recipeData.title.trim().length === 0) {
        throw new Error('Recipe title is required')
      }

      if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
        throw new Error('At least one ingredient is required')
      }

      if (!recipeData.instructions || recipeData.instructions.length === 0) {
        throw new Error('At least one instruction is required')
      }

      // Create recipe in database
      const newRecipe = await prisma.recipe.create({
        data: {
          title: recipeData.title,
          description: recipeData.description || null,
          category: recipeData.category as RecipeCategory,
          prepTimeMinutes: recipeData.prepTimeMinutes,
          cookTimeMinutes: recipeData.cookTimeMinutes,
          servings: recipeData.servings,
          ingredients: recipeData.ingredients.map((ing, index) => ({
            order: index + 1,
            text: ing.text
          })),
          instructions: recipeData.instructions.map((inst, index) => ({
            step: index + 1,
            text: inst.text
          })),
          photoUrl: recipeData.photoUrl || null,
          tags: recipeData.tags || [],
          createdBy: userEmail || recipeData.createdBy || 'Unknown User',
          lastModifiedBy: userEmail || recipeData.createdBy || 'Unknown User',
        }
      })

      console.log('✅ Recipe created successfully:', newRecipe.id)

      // Format the response
      const formattedRecipe = {
        ...newRecipe,
        description: newRecipe.description || undefined,
        photoUrl: newRecipe.photoUrl || undefined,
        category: newRecipe.category as any,
        ingredients: newRecipe.ingredients as Array<{ order: number; text: string }>,
        instructions: newRecipe.instructions as Array<{ step: number; text: string }>
      }

      return formattedRecipe as Recipe
    } catch (error) {
      console.error('❌ Failed to create recipe:', error)
      throw error
    }
  }

  /**
   * Update a recipe directly in the database
   */
  static async updateRecipe(
    recipeId: string,
    updateData: UpdateRecipeInput,
    userEmail?: string
  ): Promise<Recipe> {
    console.log('📝 Updating recipe directly in database:', recipeId)

    try {
      // Process data for database
      const processedData: any = {
        ...updateData,
        lastModifiedBy: userEmail || 'Unknown User'
      }

      if (updateData.ingredients) {
        processedData.ingredients = updateData.ingredients.map((ingredient: any, index: number) => ({
          ...ingredient,
          order: index + 1,
        }))
      }

      if (updateData.instructions) {
        processedData.instructions = updateData.instructions.map((instruction: any, index: number) => ({
          ...instruction,
          step: index + 1,
        }))
      }

      // Update recipe in database
      const updatedRecipe = await prisma.recipe.update({
        where: { id: recipeId },
        data: processedData,
      })

      console.log('✅ Recipe updated successfully:', recipeId)

      // Format the response
      const formattedRecipe = {
        ...updatedRecipe,
        description: updatedRecipe.description || undefined,
        photoUrl: updatedRecipe.photoUrl || undefined,
        category: updatedRecipe.category as any,
        ingredients: updatedRecipe.ingredients as any,
        instructions: updatedRecipe.instructions as any,
      }

      return formattedRecipe as Recipe
    } catch (error) {
      console.error('❌ Failed to update recipe:', error)
      throw error
    }
  }

  /**
   * Delete a recipe directly from the database
   */
  static async deleteRecipe(recipeId: string, userEmail?: string): Promise<void> {
    console.log('🗑️ Deleting recipe directly from database:', recipeId)

    try {
      // Delete from database
      await prisma.recipe.delete({
        where: { id: recipeId }
      })

      console.log('✅ Recipe deleted successfully:', recipeId)
    } catch (error) {
      console.error('❌ Failed to delete recipe:', error)
      throw error
    }
  }

  /**
   * Get recipes directly from the database
   */
  static async getRecipes(filters?: RecipeSearchFilters): Promise<Recipe[]> {
    console.log('🔍 Fetching recipes directly from database')

    try {
      // Build the where clause based on filters
      const where: any = {}

      if (filters?.query) {
        where.OR = [
          { title: { contains: filters.query, mode: 'insensitive' } },
          { description: { contains: filters.query, mode: 'insensitive' } },
          { ingredients: { some: { text: { contains: filters.query, mode: 'insensitive' } } } }
        ]
      }

      if (filters?.category) {
        where.category = filters.category
      }

      if (filters?.tags && filters.tags.length > 0) {
        where.tags = { hasSome: filters.tags }
      }

      if (filters?.maxPrepTime) {
        where.prepTimeMinutes = { lte: filters.maxPrepTime }
      }

      if (filters?.maxCookTime) {
        where.cookTimeMinutes = { lte: filters.maxCookTime }
      }

      // Fetch recipes from database
      const recipes = await prisma.recipe.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      console.log('✅ Found recipes:', recipes.length)

      // Format recipes to match expected interface
      const formattedRecipes = recipes.map(recipe => ({
        ...recipe,
        description: recipe.description || undefined,
        photoUrl: recipe.photoUrl || undefined,
        category: recipe.category as any,
        ingredients: Array.isArray(recipe.ingredients)
          ? (recipe.ingredients as any[]).sort((a: any, b: any) => a.order - b.order)
          : (recipe.ingredients as any) || [],
        instructions: Array.isArray(recipe.instructions)
          ? (recipe.instructions as any[]).sort((a: any, b: any) => a.step - b.step)
          : (recipe.instructions as any) || []
      }))

      return formattedRecipes as Recipe[]
    } catch (error) {
      console.error('❌ Failed to fetch recipes:', error)
      throw error
    }
  }
}