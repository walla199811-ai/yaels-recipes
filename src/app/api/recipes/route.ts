import { NextRequest, NextResponse } from 'next/server'
import { CreateRecipeInput, RecipeSearchFilters, RecipeCategory as TypeRecipeCategory } from '@/types/recipe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createRecipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['MAIN', 'SIDE', 'DESSERT']),
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
  // NO-TEMPORAL: Direct database access only - v2.0
  console.log('🔍 [RECIPES API] GET request started at:', new Date().toISOString())
  console.log('🔍 [RECIPES API] Request URL:', request.url)
  console.log('🔍 [RECIPES API] Environment:', process.env.NODE_ENV)
  console.log('🔍 [RECIPES API] Database URL exists:', !!process.env.DATABASE_URL)

  try {
    const { searchParams } = new URL(request.url)
    console.log('🔍 [RECIPES API] Search params:', Object.fromEntries(searchParams.entries()))

    // Check if requesting a specific recipe by ID
    const id = searchParams.get('id')
    if (id) {
      console.log('🔍 [RECIPES API] Fetching single recipe by ID:', id)
      console.log('🔍 [RECIPES API] About to call prisma.recipe.findUnique')

      const recipe = await prisma.recipe.findUnique({
        where: { id }
      })

      console.log('🔍 [RECIPES API] Recipe found:', !!recipe)
      if (recipe) {
        console.log('🔍 [RECIPES API] Recipe title:', recipe.title)
      }

      if (recipe) {
        const formattedRecipe = {
          ...recipe,
          description: recipe.description || undefined,
          photoUrl: recipe.photoUrl || undefined,
          category: recipe.category as TypeRecipeCategory,
          ingredients: Array.isArray(recipe.ingredients)
            ? (recipe.ingredients as any[]).sort((a: any, b: any) => a.order - b.order)
            : (recipe.ingredients as any) || [],
          instructions: Array.isArray(recipe.instructions)
            ? (recipe.instructions as any[]).sort((a: any, b: any) => a.step - b.step)
            : (recipe.instructions as any) || []
        }

        return NextResponse.json({
          recipes: [formattedRecipe],
          totalCount: 1
        })
      } else {
        return NextResponse.json(
          { error: 'Recipe not found' },
          { status: 404 }
        )
      }
    }

    // Build the where clause based on filters
    const where: any = {}

    // Apply query filter (search in title, description, and ingredients)
    const query = searchParams.get('query')
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
        // Note: Searching within JSON ingredients is complex with Prisma
        // For now, search is limited to title and description
      ]
    }

    // Apply category filter
    const category = searchParams.get('category')
    if (category) {
      where.category = category
    }

    // Apply tags filter
    const tags = searchParams.get('tags')
    if (tags) {
      where.tags = { hasSome: tags.split(',') }
    }

    // Apply prep time filter
    const maxPrepTime = searchParams.get('maxPrepTime')
    if (maxPrepTime) {
      where.prepTimeMinutes = { lte: parseInt(maxPrepTime) }
    }

    // Apply cook time filter
    const maxCookTime = searchParams.get('maxCookTime')
    if (maxCookTime) {
      where.cookTimeMinutes = { lte: parseInt(maxCookTime) }
    }

    // Fetch recipes from database
    console.log('🔍 [RECIPES API] About to fetch recipes with where clause:', where)
    console.log('🔍 [RECIPES API] About to call prisma.recipe.findMany')

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    console.log('🔍 [RECIPES API] Found recipes count:', recipes.length)
    if (recipes.length > 0) {
      console.log('🔍 [RECIPES API] First recipe title:', recipes[0].title)
    }

    // Format recipes to match expected interface
    const formattedRecipes = recipes.map(recipe => ({
      ...recipe,
      description: recipe.description || undefined,
      photoUrl: recipe.photoUrl || undefined,
      category: recipe.category as TypeRecipeCategory,
      ingredients: Array.isArray(recipe.ingredients)
        ? (recipe.ingredients as any[]).sort((a: any, b: any) => a.order - b.order)
        : (recipe.ingredients as any) || [],
      instructions: Array.isArray(recipe.instructions)
        ? (recipe.instructions as any[]).sort((a: any, b: any) => a.step - b.step)
        : (recipe.instructions as any) || []
    }))

    return NextResponse.json({
      recipes: formattedRecipes,
      totalCount: formattedRecipes.length
    })
  } catch (error) {
    console.error('❌ [RECIPES API] Error occurred:', error)
    console.error('❌ [RECIPES API] Error type:', typeof error)
    console.error('❌ [RECIPES API] Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('❌ [RECIPES API] Error message:', error instanceof Error ? error.message : String(error))
    console.error('❌ [RECIPES API] Error stack:', error instanceof Error ? error.stack : 'No stack')

    // Log additional context
    console.error('❌ [RECIPES API] Database URL configured:', !!process.env.DATABASE_URL)
    console.error('❌ [RECIPES API] Environment:', process.env.NODE_ENV)

    return NextResponse.json(
      {
        error: 'Failed to fetch recipes',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 [RECIPES API] POST request started at:', new Date().toISOString())
  console.log('🔍 [RECIPES API] Environment:', process.env.NODE_ENV)
  console.log('🔍 [RECIPES API] Database URL exists:', !!process.env.DATABASE_URL)

  try {
    console.log('🔍 [RECIPES API] About to parse request body')
    const body = await request.json()
    console.log('🔍 [RECIPES API] Request body parsed, title:', body?.title)

    // Validate the input
    const validatedData = createRecipeSchema.parse(body)

    // Extract user email from headers (if available) for notifications
    const userEmail = request.headers.get('x-user-email') || 'Unknown User'

    // Basic validation
    if (!validatedData.title || validatedData.title.trim().length === 0) {
      throw new Error('Recipe title is required')
    }

    if (!validatedData.ingredients || validatedData.ingredients.length === 0) {
      throw new Error('At least one ingredient is required')
    }

    if (!validatedData.instructions || validatedData.instructions.length === 0) {
      throw new Error('At least one instruction is required')
    }

    // Create recipe in database
    console.log('🔍 [RECIPES API] About to create recipe in database')
    console.log('🔍 [RECIPES API] Validated data keys:', Object.keys(validatedData))

    const newRecipe = await prisma.recipe.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        category: validatedData.category as any,
        prepTimeMinutes: validatedData.prepTimeMinutes,
        cookTimeMinutes: validatedData.cookTimeMinutes,
        servings: validatedData.servings,
        ingredients: validatedData.ingredients.map((ing, index) => ({
          order: index + 1,
          text: ing.text
        })),
        instructions: validatedData.instructions.map((inst, index) => ({
          step: index + 1,
          text: inst.text
        })),
        photoUrl: validatedData.photoUrl || null,
        tags: validatedData.tags,
        createdBy: validatedData.createdBy,
        lastModifiedBy: validatedData.createdBy,
      }
    })

    // Format the response
    const formattedRecipe = {
      ...newRecipe,
      description: newRecipe.description || undefined,
      photoUrl: newRecipe.photoUrl || undefined,
      category: newRecipe.category as TypeRecipeCategory,
      ingredients: newRecipe.ingredients as Array<{ order: number; text: string }>,
      instructions: newRecipe.instructions as Array<{ step: number; text: string }>
    }

    // Send notification (non-blocking)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.NOTIFICATION_EMAILS) {
        const nodemailer = await import('nodemailer')

        const transporter = nodemailer.default.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        const notificationEmails = process.env.NOTIFICATION_EMAILS.split(',')
        const subject = `Recipe added: ${formattedRecipe.title}`
        const emailBody = `
          <h2>Recipe Added</h2>
          <p><strong>${formattedRecipe.title}</strong> has been added by ${validatedData.createdBy}.</p>
          <p><strong>Category:</strong> ${formattedRecipe.category}</p>
          <p><strong>Prep Time:</strong> ${formattedRecipe.prepTimeMinutes} minutes</p>
          <p><strong>Cook Time:</strong> ${formattedRecipe.cookTimeMinutes} minutes</p>
          <p><strong>Servings:</strong> ${formattedRecipe.servings}</p>
          ${formattedRecipe.description ? `<p><strong>Description:</strong> ${formattedRecipe.description}</p>` : ''}
        `

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: notificationEmails.join(','),
          subject,
          html: emailBody,
        })
      }
    } catch (emailError) {
      console.warn('Failed to send notification email:', emailError)
    }

    return NextResponse.json(formattedRecipe, { status: 201 })
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

    // Process data for database
    const processedData: any = { ...updateData, lastModifiedBy: userEmail }

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
      where: { id },
      data: processedData,
    })

    // Format the response
    const formattedRecipe = {
      ...updatedRecipe,
      description: updatedRecipe.description || undefined,
      photoUrl: updatedRecipe.photoUrl || undefined,
      category: updatedRecipe.category as TypeRecipeCategory,
      ingredients: updatedRecipe.ingredients as any,
      instructions: updatedRecipe.instructions as any,
    }

    return NextResponse.json(formattedRecipe)
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

    // Get recipe for notification before deleting
    const recipe = await prisma.recipe.findUnique({
      where: { id }
    })

    if (recipe) {
      // Send notification before deletion (non-blocking)
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.NOTIFICATION_EMAILS) {
          const nodemailer = await import('nodemailer')

          const transporter = nodemailer.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          })

          const notificationEmails = process.env.NOTIFICATION_EMAILS.split(',')
          const subject = `Recipe deleted: ${recipe.title}`
          const emailBody = `
            <h2>Recipe Deleted</h2>
            <p><strong>${recipe.title}</strong> has been deleted by ${userEmail}.</p>
          `

          await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: notificationEmails.join(','),
            subject,
            html: emailBody,
          })
        }
      } catch (emailError) {
        console.warn('Failed to send notification email:', emailError)
      }
    }

    // Delete from database
    await prisma.recipe.delete({
      where: { id }
    })

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