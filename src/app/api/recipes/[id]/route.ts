import { NextRequest, NextResponse } from 'next/server'
import { temporalRecipeClient } from '@/temporal/client'
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
    const recipes = await temporalRecipeClient.getRecipes({ id: params.id })
    const recipe = recipes.length > 0 ? recipes[0] : null

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

    const updateInput: UpdateRecipeInput = {
      id: params.id,
      ...validatedData,
      category: validatedData.category as RecipeCategory | undefined,
    }

    const recipe = await temporalRecipeClient.updateRecipe(updateInput)

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
    const deletedBy = searchParams.get('deletedBy') || 'Unknown'

    await temporalRecipeClient.deleteRecipe(params.id, deletedBy)

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error('Failed to delete recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}