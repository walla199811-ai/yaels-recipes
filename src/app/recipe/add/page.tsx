'use client'

import { Container, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { RecipeForm } from '@/components/RecipeForm'
import { useCreateRecipe } from '@/hooks/useRecipes'
import { CreateRecipeInput } from '@/types/recipe'

export default function AddRecipePage() {
  const router = useRouter()
  const createRecipeMutation = useCreateRecipe()

  const handleSubmit = async (data: CreateRecipeInput) => {
    try {
      await createRecipeMutation.mutateAsync(data)
      router.push('/') // Navigate back to home page after successful creation
    } catch (error) {
      console.error('Failed to create recipe:', error)
      // Error handling is done in the form component
    }
  }

  const handleCancel = () => {
    router.push('/') // Navigate back to home page
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <RecipeForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={createRecipeMutation.isPending}
        />
      </Box>
    </Container>
  )
}