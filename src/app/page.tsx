'use client'

import { Container, Typography, Box, Grid, CircularProgress, Alert, Fab, Fade } from '@mui/material'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Add } from '@mui/icons-material'
import { useRecipes } from '@/hooks/useRecipes'
import { useFirstVisit } from '@/hooks/useFirstVisit'
import { RecipeCard } from '@/components/RecipeCard'
import { SearchBar } from '@/components/SearchBar'
import { RecipeFilters } from '@/components/RecipeFilters'
import { StartupPage } from '@/components/StartupPage'
import { RecipeSearchFilters } from '@/types/recipe'

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<RecipeSearchFilters>({})
  const [showHomepage, setShowHomepage] = useState(false)
  const { isFirstVisit, isLoading: isVisitLoading, markAsVisited } = useFirstVisit()

  // Combine search query with filters
  const activeFilters = useMemo(() => ({
    ...filters,
    query: searchQuery || undefined,
  }), [searchQuery, filters])

  const { data: recipesData, isLoading, error } = useRecipes(activeFilters)

  // Extract available tags from all recipes for filter options
  const availableTags = useMemo(() => {
    if (!recipesData?.recipes) return []
    const allTags = recipesData.recipes.flatMap(recipe => recipe.tags)
    return Array.from(new Set(allTags)).sort()
  }, [recipesData?.recipes])

  // Handle the transition from startup to homepage
  const handleEnterSite = () => {
    markAsVisited()
    setShowHomepage(true)
  }

  // Show loading spinner while checking first visit status
  if (isVisitLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  // Show startup page for first-time visitors
  if (isFirstVisit && !showHomepage) {
    return <StartupPage onEnter={handleEnterSite} />
  }

  return (
    <Fade in={!isFirstVisit || showHomepage} timeout={800}>
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h1" component="h1" align="center" gutterBottom>
          המתכונים של יעל
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          אוסף מתכונים יקרים של המשפחה, שעוברים מדור לדור
        </Typography>

        <Box sx={{ mt: 4 }}>
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="חפש מתכונים לפי שם, תיאור או מרכיבים..."
            />
          </Box>

          {/* Filters */}
          <RecipeFilters
            filters={filters}
            onChange={setFilters}
            availableTags={availableTags}
          />

          {isLoading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              שגיאה בטעינת המתכונים. אנא נסו שוב מאוחר יותר.
            </Alert>
          )}

          {recipesData && recipesData.recipes.length > 0 && (
            <>
              <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
                {searchQuery || Object.keys(filters).some(key => filters[key as keyof RecipeSearchFilters])
                  ? `נמצאו ${recipesData.totalCount} מתכונים`
                  : `אוסף המתכונים שלנו (${recipesData.totalCount})`}
              </Typography>

              <Grid container spacing={3}>
                {recipesData.recipes.map((recipe) => (
                  <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                    <RecipeCard
                      recipe={recipe}
                      onClick={() => router.push(`/recipe/${recipe.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {recipesData && recipesData.recipes.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {searchQuery || Object.keys(filters).some(key => filters[key as keyof RecipeSearchFilters])
                  ? 'לא נמצאו מתכונים התואמים לחיפוש. נסו לשנות את תנאי החיפוש.'
                  : 'לא נמצאו מתכונים. התחילו בהוספת המתכון המשפחתי הראשון!'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="הוסף מתכון"
        onClick={() => router.push('/recipe/add')}
        data-testid="add-recipe-button"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <Add />
      </Fab>
    </Container>
    </Fade>
  )
}