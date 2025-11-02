import { NextRequest, NextResponse } from 'next/server'
import { mockRecipes } from '@/lib/mock-data'
import { CreateRecipeInput, Recipe, RecipeCategory } from '@/types/recipe'

// In-memory storage for new recipes (in production, this would be the database)
let recipes = [...mockRecipes]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Check if requesting a specific recipe by ID
    const id = searchParams.get('id')
    if (id) {
      const recipe = recipes.find(r => r.id === id)
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

    let filteredRecipes = [...recipes]

    // Apply query filter (search in title, description, ingredients, and tags)
    const query = searchParams.get('query')
    if (query) {
      const lowerQuery = query.toLowerCase()
      filteredRecipes = filteredRecipes.filter(recipe => {
        // Search in title
        if (recipe.title.toLowerCase().includes(lowerQuery)) return true

        // Search in description
        if (recipe.description?.toLowerCase().includes(lowerQuery)) return true

        // Search in ingredients
        if (recipe.ingredients.some(ingredient =>
          ingredient.text.toLowerCase().includes(lowerQuery)
        )) return true

        // Search in tags
        if (recipe.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true

        return false
      })
    }

    // Apply category filter
    const category = searchParams.get('category')
    if (category) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.category === category)
    }

    // Apply tags filter
    const tags = searchParams.get('tags')
    if (tags) {
      const selectedTags = tags.split(',')
      filteredRecipes = filteredRecipes.filter(recipe =>
        selectedTags.some(tag => recipe.tags.includes(tag))
      )
    }

    // Apply prep time filter
    const maxPrepTime = searchParams.get('maxPrepTime')
    if (maxPrepTime) {
      const maxTime = parseInt(maxPrepTime)
      filteredRecipes = filteredRecipes.filter(recipe => recipe.prepTimeMinutes <= maxTime)
    }

    // Apply cook time filter
    const maxCookTime = searchParams.get('maxCookTime')
    if (maxCookTime) {
      const maxTime = parseInt(maxCookTime)
      filteredRecipes = filteredRecipes.filter(recipe => recipe.cookTimeMinutes <= maxTime)
    }

    return NextResponse.json({
      recipes: filteredRecipes,
      totalCount: filteredRecipes.length
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

    // Validate the input (basic validation for demo)
    if (!body.title || !body.category || !body.createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, createdBy' },
        { status: 400 }
      )
    }

    // Create new recipe
    const newRecipe: Recipe = {
      id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      description: body.description || null,
      category: body.category as RecipeCategory,
      prepTimeMinutes: body.prepTimeMinutes || 0,
      cookTimeMinutes: body.cookTimeMinutes || 0,
      servings: body.servings || 1,
      ingredients: body.ingredients.map((ing: any, index: number) => ({
        order: index + 1,
        text: ing.text
      })),
      instructions: body.instructions.map((inst: any, index: number) => ({
        step: index + 1,
        text: inst.text
      })),
      photoUrl: body.photoUrl || null,
      tags: body.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: body.createdBy,
      lastModifiedBy: body.createdBy,
    }

    // Add to our in-memory storage
    recipes.unshift(newRecipe) // Add to beginning of array

    return NextResponse.json(newRecipe, { status: 201 })
  } catch (error) {
    console.error('Failed to create recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}