'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box,
  Container,
  Typography,
  Paper,
  Chip,
  Avatar,
  Divider,
  Button,
  Card,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material'
import {
  ArrowBack,
  Edit,
  Delete,
  Schedule,
  Restaurant,
  Print,
} from '@mui/icons-material'
import { Recipe } from '@/types/recipe'
import { translateCategory } from '@/lib/translations'
import { useDeleteRecipe } from '@/hooks/useRecipes'
import { PrintStyles } from '@/components/PrintStyles'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const deleteRecipeMutation = useDeleteRecipe()

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/recipes?id=${params.id}`)

        if (!response.ok) {
          throw new Error('מתכון לא נמצא')
        }

        const data = await response.json()
        if (data.recipes && data.recipes.length > 0) {
          setRecipe(data.recipes[0])
        } else {
          throw new Error('מתכון לא נמצא')
        }
      } catch (error) {
        console.error('Failed to fetch recipe:', error)
        setError('לא הצלחנו לטעון את המתכון. אנא נסו שוב.')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchRecipe()
    }
  }, [params.id])

  const handleBack = () => {
    router.push('/')
  }

  const handleEdit = () => {
    router.push(`/recipe/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (window.confirm('האם אתם בטוחים שברצונכם למחוק את המתכון?')) {
      try {
        await deleteRecipeMutation.mutateAsync({
          id: params.id as string,
          deletedBy: 'יעל' // You might want to get this from user context
        })
        alert('המתכון נמחק בהצלחה!')
        router.push('/') // Redirect to home page
      } catch (error) {
        console.error('Failed to delete recipe:', error)
        alert('שגיאה במחיקת המתכון. אנא נסו שוב.')
      }
    }
  }

  const handlePrint = () => {
    window.print()
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
          <Button startIcon={<ArrowBack />} onClick={handleBack}>
            חזרה לעמוד הבית
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" className="recipe-print-container">
      <PrintStyles />
      <Box sx={{ py: 4 }} className="print-header" style={{ display: 'none' }}>
        מתכונים של יעל - {recipe.title}
      </Box>
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <IconButton onClick={handleBack} size="large" className="no-print">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }} className="recipe-title">
            {recipe.title}
          </Typography>
          <Button
            startIcon={<Print />}
            variant="outlined"
            onClick={handlePrint}
            className="no-print"
          >
            הדפסה
          </Button>
          <Button
            startIcon={<Edit />}
            variant="outlined"
            onClick={handleEdit}
            className="no-print"
          >
            עריכה
          </Button>
          <Button
            startIcon={<Delete />}
            variant="outlined"
            color="error"
            onClick={handleDelete}
            className="no-print"
          >
            מחיקה
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Recipe Image */}
          <Grid item xs={12} md={6}>
            {recipe.photoUrl ? (
              <Card>
                <CardMedia
                  component="img"
                  height="400"
                  image={recipe.photoUrl}
                  alt={recipe.title}
                  sx={{ objectFit: 'cover' }}
                  className="recipe-image"
                />
              </Card>
            ) : (
              <Paper
                sx={{
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  אין תמונה למתכון
                </Typography>
              </Paper>
            )}
          </Grid>

          {/* Recipe Info */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Description */}
              {recipe.description && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    תיאור
                  </Typography>
                  <Typography variant="body1">
                    {recipe.description}
                  </Typography>
                </Paper>
              )}

              {/* Recipe Details */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  פרטי המתכון
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Restaurant color="primary" />
                    <Typography>
                      קטגוריה: {translateCategory(recipe.category)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Schedule color="primary" />
                    <Typography>
                      זמן הכנה: {recipe.prepTimeMinutes} דקות
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Schedule color="primary" />
                    <Typography>
                      זמן בישול: {recipe.cookTimeMinutes} דקות
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Tags */}
              {recipe.tags.length > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    תגיות
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {recipe.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Ingredients and Instructions */}
        <Grid container spacing={4} sx={{ mt: 2 }} className="ingredients-instructions-container">
          {/* Ingredients */}
          <Grid item xs={12} md={6} className="ingredients-section">
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                מרכיבים
              </Typography>
              <List className="recipe-list">
                {recipe.ingredients.map((ingredient) => (
                  <ListItem key={ingredient.order} sx={{ py: 0.5 }} className="recipe-list-item">
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: '0.875rem',
                        bgcolor: 'primary.main',
                        mr: 2,
                      }}
                    >
                      {ingredient.order}
                    </Avatar>
                    <ListItemText
                      primary={ingredient.text}
                      sx={{ '& .MuiListItemText-primary': { fontSize: '1rem', textAlign: 'right', marginRight: '12px' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Instructions */}
          <Grid item xs={12} md={6} className="instructions-section">
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                הוראות הכנה
              </Typography>
              <List className="recipe-list">
                {recipe.instructions.map((instruction) => (
                  <ListItem key={instruction.step} sx={{ py: 1, alignItems: 'flex-start' }} className="recipe-list-item">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '1rem',
                        bgcolor: 'secondary.main',
                        mr: 2,
                        mt: 0.5,
                      }}
                    >
                      {instruction.step}
                    </Avatar>
                    <ListItemText
                      primary={instruction.text}
                      sx={{ '& .MuiListItemText-primary': { fontSize: '1rem', lineHeight: 1.6, textAlign: 'right', marginRight: '12px'  } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}