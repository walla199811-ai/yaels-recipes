'use client'

import React from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Slider,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { ExpandMore, FilterList } from '@mui/icons-material'
import { RecipeCategory, RecipeSearchFilters } from '@/types/recipe'
import { translateCategory } from '@/lib/translations'

interface RecipeFiltersProps {
  filters: RecipeSearchFilters
  onChange: (filters: RecipeSearchFilters) => void
  availableTags: string[]
}

export function RecipeFilters({ filters, onChange, availableTags }: RecipeFiltersProps) {
  const handleCategoryChange = (category: RecipeCategory | '') => {
    onChange({
      ...filters,
      category: category || undefined,
    })
  }

  const handleTagsChange = (tags: string[]) => {
    onChange({
      ...filters,
      tags: tags.length > 0 ? tags : undefined,
    })
  }

  const handlePrepTimeChange = (maxTime: number | null) => {
    onChange({
      ...filters,
      maxPrepTime: maxTime || undefined,
    })
  }

  const handleCookTimeChange = (maxTime: number | null) => {
    onChange({
      ...filters,
      maxCookTime: maxTime || undefined,
    })
  }

  const hasActiveFilters = filters.category || (filters.tags && filters.tags.length > 0) ||
                          filters.maxPrepTime || filters.maxCookTime

  return (
    <Paper elevation={1} sx={{ mb: 3 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="filters-content"
          id="filters-header"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography variant="h6">
              סינון מתכונים
            </Typography>
            {hasActiveFilters && (
              <Chip
                label="פעיל"
                size="small"
                color="primary"
                variant="filled"
              />
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Category Filter */}
            <FormControl fullWidth>
              <InputLabel id="category-select-label">קטגוריה</InputLabel>
              <Select
                labelId="category-select-label"
                value={filters.category || ''}
                label="קטגוריה"
                onChange={(e) => handleCategoryChange(e.target.value as RecipeCategory | '')}
              >
                <MenuItem value="">
                  <em>כל הקטגוריות</em>
                </MenuItem>
                {Object.values(RecipeCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    {translateCategory(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tags Filter */}
            <FormControl fullWidth>
              <InputLabel id="tags-select-label">תגיות</InputLabel>
              <Select
                labelId="tags-select-label"
                multiple
                value={filters.tags || []}
                onChange={(e) => handleTagsChange(e.target.value as string[])}
                input={<OutlinedInput id="select-multiple-chip" label="תגיות" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Prep Time Filter */}
            <Box sx={{ px: 1 }}>
              <Typography gutterBottom>
                זמן הכנה מקסימלי: {filters.maxPrepTime ? `${filters.maxPrepTime} דקות` : 'ללא הגבלה'}
              </Typography>
              <Box sx={{ px: 2, py: 2 }}>
                <Slider
                  value={filters.maxPrepTime || 120}
                  onChange={(_, value) => handlePrepTimeChange(value as number)}
                  onChangeCommitted={(_, value) => handlePrepTimeChange(value === 120 ? null : value as number)}
                  aria-labelledby="prep-time-slider"
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value} דק׳`}
                  step={5}
                  marks={[
                    { value: 10, label: '10 דק׳' },
                    { value: 30, label: '30 דק׳' },
                    { value: 60, label: '60 דק׳' },
                    { value: 120, label: 'ללא הגבלה' },
                  ]}
                  min={5}
                  max={120}
                />
              </Box>
            </Box>

            {/* Cook Time Filter */}
            <Box sx={{ px: 1 }}>
              <Typography gutterBottom>
                זמן בישול מקסימלי: {filters.maxCookTime ? `${filters.maxCookTime} דקות` : 'ללא הגבלה'}
              </Typography>
              <Box sx={{ px: 2, py: 2 }}>
                <Slider
                  value={filters.maxCookTime || 180}
                  onChange={(_, value) => handleCookTimeChange(value as number)}
                  onChangeCommitted={(_, value) => handleCookTimeChange(value === 180 ? null : value as number)}
                  aria-labelledby="cook-time-slider"
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value} דק׳`}
                  step={10}
                  marks={[
                    { value: 15, label: '15 דק׳' },
                    { value: 60, label: '60 דק׳' },
                    { value: 120, label: '120 דק׳' },
                    { value: 180, label: 'ללא הגבלה' },
                  ]}
                  min={10}
                  max={180}
                />
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  )
}