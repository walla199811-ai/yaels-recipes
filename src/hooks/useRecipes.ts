'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeSearchFilters, RecipeSearchResult } from '@/types/recipe'

// Use the real database API
const API_BASE = '/api/recipes'

async function fetchRecipes(filters?: RecipeSearchFilters): Promise<RecipeSearchResult> {
  const params = new URLSearchParams()

  if (filters?.query) params.set('query', filters.query)
  if (filters?.category) params.set('category', filters.category)
  if (filters?.tags) params.set('tags', filters.tags.join(','))
  if (filters?.maxPrepTime) params.set('maxPrepTime', filters.maxPrepTime.toString())
  if (filters?.maxCookTime) params.set('maxCookTime', filters.maxCookTime.toString())

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch recipes')
  }

  return response.json()
}

async function fetchRecipe(id: string): Promise<Recipe> {
  const response = await fetch(`${API_BASE}?id=${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch recipe')
  }
  const result = await response.json()
  return result.recipes[0] // Our API returns { recipes: [...], totalCount: ... }
}

async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create recipe')
  }

  return response.json()
}

async function updateRecipe(input: UpdateRecipeInput): Promise<Recipe> {
  const response = await fetch(API_BASE, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input), // Include the id in the request body
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update recipe')
  }

  return response.json()
}

async function deleteRecipe(id: string, deletedBy: string): Promise<void> {
  const response = await fetch(`${API_BASE}?id=${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete recipe')
  }
}

export function useRecipes(filters?: RecipeSearchFilters) {
  return useQuery({
    queryKey: ['recipes', filters],
    queryFn: () => fetchRecipes(filters),
  })
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => fetchRecipe(id),
    enabled: !!id,
  })
}

export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRecipe,
    onSuccess: (updatedRecipe) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.setQueryData(['recipe', updatedRecipe.id], updatedRecipe)
    },
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, deletedBy }: { id: string; deletedBy: string }) =>
      deleteRecipe(id, deletedBy),
    onSuccess: (_, variables) => {
      // Invalidate all recipes queries (home page, search results, etc.)
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      // Remove the specific recipe from the cache
      queryClient.removeQueries({ queryKey: ['recipe', variables.id] })
    },
  })
}