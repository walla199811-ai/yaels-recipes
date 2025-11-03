import { NextRequest, NextResponse } from 'next/server'
import { DirectRecipeService } from '@/services/recipe-service-direct'
import { UpdateRecipeInput, RecipeCategory } from '@/types/recipe'
import { z } from 'zod'

const updateRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  category: z.enum(['APPETIZER', 'SOUP', 'MAIN', 'SIDE', 'DESSERT', 'BEVERAGE', 'SNACK']).optional(),
  prepTimeMinutes: z.number().min(0).optional(),
  cookTimeMinutes: z.number().min(0).optional(),
  servings: z.number().min(1).optional(),
  ingredients: z.array(z.object({
    text: z.string().min(1),
  })).optional(),
  instructions: z.array(z.object({
    text: z.string().min(1),
  })).optional(),
  photoUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
  lastModifiedBy: z.string().min(1, 'Modifier name is required'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get all recipes and filter by ID since DirectRecipeService doesn't have a getById method
    const recipes = await DirectRecipeService.getRecipes({})
    const recipe = recipes.find(r => r.id === params.id)

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Failed to fetch recipe:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate the input
    const validatedData = updateRecipeSchema.parse(body)

    // Extract user email from headers for audit trail
    const userEmail = request.headers.get('x-user-email') || validatedData.lastModifiedBy || 'Unknown User'

    const updateInput: UpdateRecipeInput = {
      id: params.id,
      ...validatedData,
      category: validatedData.category as RecipeCategory | undefined,
    }

    const recipe = await DirectRecipeService.updateRecipe(params.id, updateInput, userEmail)

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Failed to update recipe:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const deletedBy = searchParams.get('deletedBy') || request.headers.get('x-user-email') || 'Unknown'

    await DirectRecipeService.deleteRecipe(params.id, deletedBy)

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('Failed to delete recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}