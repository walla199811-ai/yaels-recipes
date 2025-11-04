'use client'

import React from 'react'
import { Box, Button, Paper } from '@mui/material'
import { RecipeCategory, RecipeSearchFilters } from '@/types/recipe'
import { translateCategory } from '@/lib/translations'

interface RecipeFiltersProps {
  filters: RecipeSearchFilters
  onChange: (filters: RecipeSearchFilters) => void
  availableTags: string[]
}

export function RecipeFilters({ filters, onChange }: RecipeFiltersProps) {
  const handleCategoryChange = (category: RecipeCategory | undefined) => {
    onChange({
      ...filters,
      category: category,
    })
  }

  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={1}
        sx={{
          p: 1,
          borderRadius: 3,
          backgroundColor: 'background.paper',
          display: 'flex',
          gap: 0.5
        }}
      >
        <Button
          onClick={() => handleCategoryChange(undefined)}
          variant={!filters.category ? 'contained' : 'text'}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: 2,
            minWidth: 'auto',
            ...(filters.category === undefined && {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            })
          }}
        >
          הכל
        </Button>
        {Object.values(RecipeCategory).map((category) => (
          <Button
            key={category}
            onClick={() => handleCategoryChange(category)}
            variant={filters.category === category ? 'contained' : 'text'}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              minWidth: 'auto',
              ...(filters.category === category && {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              })
            }}
          >
            {translateCategory(category)}
          </Button>
        ))}
      </Paper>
    </Box>
  )
}