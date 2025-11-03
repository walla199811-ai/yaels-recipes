import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, RecipeCategory } from '@prisma/client'
import { CreateRecipeInput, RecipeSearchFilters, RecipeCategory as TypeRecipeCategory } from '@/types/recipe'
import { RecipeService } from '@/services/recipe-service'
import { z } from 'zod'

const prisma = new PrismaClient()

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
      const recipe = await prisma.recipe.findUnique({
        where: { id }
      })

      if (recipe) {
        // Transform Prisma result to match our frontend types
        const transformedRecipe = {
          ...recipe,
          ingredients: recipe.ingredients as Array<{ order: number; text: string }>,
          instructions: recipe.instructions as Array<{ step: number; text: string }>
        }

        return NextResponse.json({
          recipes: [transformedRecipe],
          totalCount: 1
        })
      } else {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }
    }

    // Build the where clause for filtering
    const where: any = {}

    // Apply query filter (search in title, description, and tags)
    const query = searchParams.get('query')
    if (query) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          tags: {
            hasSome: [query]
          }
        }
      ]
    }

    // Apply category filter
    const category = searchParams.get('category')
    if (category) {
      where.category = category as RecipeCategory
    }

    // Apply tags filter
    const tags = searchParams.get('tags')
    if (tags) {
      const selectedTags = tags.split(',')
      where.tags = {
        hasSome: selectedTags
      }
    }

    // Apply prep time filter
    const maxPrepTime = searchParams.get('maxPrepTime')
    if (maxPrepTime) {
      const maxTime = parseInt(maxPrepTime)
      where.prepTimeMinutes = {
        lte: maxTime
      }
    }

    // Apply cook time filter
    const maxCookTime = searchParams.get('maxCookTime')
    if (maxCookTime) {
      const maxTime = parseInt(maxCookTime)
      where.cookTimeMinutes = {
        lte: maxTime
      }
    }

    // Fetch recipes from database
    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform Prisma results to match our frontend types
    const transformedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients as Array<{ order: number; text: string }>,
      instructions: recipe.instructions as Array<{ step: number; text: string }>
    }))

    return NextResponse.json({
      recipes: transformedRecipes,
      totalCount: transformedRecipes.length
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
    const userEmail = request.headers.get('x-user-email') || process.env.NOTIFICATION_EMAILS?.split(',')[0]

    // Create new recipe using RecipeService (with Temporal workflow)
    const newRecipe = await RecipeService.createRecipe({
      ...validatedData,
      category: validatedData.category as TypeRecipeCategory
    }, userEmail)

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
    const userEmail = request.headers.get('x-user-email') || process.env.NOTIFICATION_EMAILS?.split(',')[0]

    // Update recipe using RecipeService (with Temporal workflow)
    const updatedRecipe = await RecipeService.updateRecipe(id, updateData, userEmail)

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
    const userEmail = request.headers.get('x-user-email') || process.env.NOTIFICATION_EMAILS?.split(',')[0]

    // Delete recipe using RecipeService (with Temporal workflow)
    await RecipeService.deleteRecipe(id, userEmail)

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