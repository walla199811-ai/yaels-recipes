'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import { Recipe, CreateRecipeInput } from '@/types/recipe'
import { RecipeForm } from '@/components/RecipeForm'
import { useUpdateRecipe, useRecipe } from '@/hooks/useRecipes'

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const updateRecipeMutation = useUpdateRecipe()

  // Use React Query to fetch the recipe
  const { data: recipe, isLoading: loading, error: queryError } = useRecipe(params.id as string)
  const error = queryError ? 'לא הצלחנו לטעון את המתכון. אנא נסו שוב.' : null

  const handleSubmit = async (data: CreateRecipeInput) => {
    try {
      setSubmitting(true)

      // Update the recipe using React Query hook
      await updateRecipeMutation.mutateAsync({
        id: params.id as string,
        ...data,
        lastModifiedBy: data.createdBy || 'יעל' // Use the creator as modifier or default
      })

      alert('המתכון עודכן בהצלחה!')
      router.push(`/recipe/${params.id}`)
    } catch (error) {
      console.error('Failed to update recipe:', error)
      alert('עדכון המתכון נכשל. אנא נסו שוב.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/recipe/${params.id}`)
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error || !recipe) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'מתכון לא נמצא'}
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={() => router.push('/')}>
            חזרה לעמוד הבית
          </Button>
        </Box>
      </Container>
    )
  }

  // Transform recipe data to match CreateRecipeInput format
  const initialData: CreateRecipeInput = {
    title: recipe.title,
    description: recipe.description || '',
    category: recipe.category,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map(ing => ({ text: ing.text })),
    instructions: recipe.instructions.map(inst => ({ text: inst.text })),
    photoUrl: recipe.photoUrl || '',
    tags: recipe.tags,
    createdBy: recipe.createdBy,
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          עריכת מתכון
        </Typography>

        <RecipeForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={submitting}
        />
      </Box>
    </Container>
  )
}