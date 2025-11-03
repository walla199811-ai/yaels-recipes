import { NextRequest, NextResponse } from 'next/server'
import { CreateRecipeInput, RecipeSearchFilters, RecipeCategory as TypeRecipeCategory } from '@/types/recipe'
import { temporalRecipeClient } from '@/temporal/client'
import { z } from 'zod'

const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['APPETIZER', 'SOUP', 'MAIN', 'SIDE', 'DESSERT', 'BEVERAGE', 'SNACK']),
  prepTimeMinutes: z.number().min(0),
  cookTimeMinutes: z.number().min(0),
  servings: z.number().min(1),
  ingredients: z.array(z.object({
    text: z.string().min(1),
  })),
  instructions: z.array(z.object({
    text: z.string().min(1),
  })),
  photoUrl: z.string().optional(),
  tags: z.array(z.string()),
  createdBy: z.string().min(1, 'Creator name is required'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Check if requesting a specific recipe by ID
    const id = searchParams.get('id')
    if (id) {
      const recipes = await temporalRecipeClient.getRecipes({ id })
      const recipe = recipes.length > 0 ? recipes[0] : null

      if (recipe) {
        return NextResponse.json({
          recipes: [recipe],
          totalCount: 1
        })
      } else {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }
    }

    // Build filters object from search parameters
    const filters: RecipeSearchFilters = {}

    // Apply query filter (search in title, description, and tags)
    const query = searchParams.get('query')
    if (query) {
      filters.query = query
    }

    // Apply category filter
    const category = searchParams.get('category')
    if (category) {
      filters.category = category as TypeRecipeCategory
    }

    // Apply tags filter
    const tags = searchParams.get('tags')
    if (tags) {
      filters.tags = tags.split(',')
    }

    // Apply prep time filter
    const maxPrepTime = searchParams.get('maxPrepTime')
    if (maxPrepTime) {
      filters.maxPrepTime = parseInt(maxPrepTime)
    }

    // Apply cook time filter
    const maxCookTime = searchParams.get('maxCookTime')
    if (maxCookTime) {
      filters.maxCookTime = parseInt(maxCookTime)
    }

    // Fetch recipes using Temporal client
    const recipes = await temporalRecipeClient.getRecipes(filters)

    return NextResponse.json({
      recipes,
      totalCount: recipes.length
    })
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the input
    const validatedData = createRecipeSchema.parse(body)

    // Extract user email from headers (if available) for notifications
    const userEmail = request.headers.get('x-user-email') || 'Unknown User'

    // Create new recipe using Temporal client
    const newRecipe = await temporalRecipeClient.createRecipe({
      ...validatedData,
      category: validatedData.category as TypeRecipeCategory
    })

    return NextResponse.json(newRecipe, { status: 201 })
  } catch (error) {
    console.error('Failed to create recipe:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}

// PUT method for updating recipes
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Extract user email from headers (if available) for notifications
    const userEmail = request.headers.get('x-user-email') || 'Unknown User'

    // Update recipe using Temporal client
    const updatedRecipe = await temporalRecipeClient.updateRecipe({
      id,
      ...updateData,
      lastModifiedBy: userEmail
    })

    return NextResponse.json(updatedRecipe)
  } catch (error) {
    console.error('Failed to update recipe:', error)
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    )
  }
}

// DELETE method for deleting recipes
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      )
    }

    // Extract user email from headers (if available) for notifications
    const userEmail = request.headers.get('x-user-email') || 'Unknown User'

    // Delete recipe using Temporal client
    await temporalRecipeClient.deleteRecipe(id, userEmail)

    return NextResponse.json({ message: 'Recipe deleted successfully' })
  } catch (error: any) {
    console.error('Failed to delete recipe:', error)

    // Handle specific Prisma error for record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    )
  }
}