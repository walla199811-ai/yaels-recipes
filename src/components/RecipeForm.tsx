'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Grid,
  Paper,
  Divider,
  IconButton,
  Alert,
} from '@mui/material'
import { Add, Remove, Save, Cancel } from '@mui/icons-material'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { RecipeCategory, CreateRecipeInput } from '@/types/recipe'
import { translateCategory } from '@/lib/translations'
import { PhotoUpload } from './PhotoUpload'
import { IngredientAutocomplete } from './IngredientAutocomplete'

interface RecipeFormProps {
  initialData?: CreateRecipeInput
  onSubmit: (data: CreateRecipeInput) => void
  onCancel: () => void
  loading?: boolean
}

interface FormData extends Omit<CreateRecipeInput, 'ingredients' | 'instructions'> {
  ingredients: { text: string }[]
  instructions: { text: string }[]
}

const commonTags = [
  'מסורתי', 'בריא', 'מהיר', 'קל', 'צמחוני', 'ים תיכוני', 'נוחות', 'חורף',
  'קיץ', 'חג', 'אירוע מיוחד', 'לילדים', 'ללא גלוטן', 'מתוק', 'מלוח'
]

export function RecipeForm({ initialData, onSubmit, onCancel, loading = false }: RecipeFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || [])
  const [customTag, setCustomTag] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || RecipeCategory.MAIN,
      prepTimeMinutes: initialData?.prepTimeMinutes || 15,
      cookTimeMinutes: initialData?.cookTimeMinutes || 30,
      servings: initialData?.servings || 999, // Hidden field with indicative value
      ingredients: initialData?.ingredients || [{ text: '' }],
      instructions: initialData?.instructions || [{ text: '' }],
      photoUrl: initialData?.photoUrl || '',
      createdBy: initialData?.createdBy || 'מתכון מדוגמה', // Hidden field with indicative value
    }
  })

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients'
  })

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: 'instructions'
  })

  const handleFormSubmit = async (data: FormData) => {
    setSubmitError(null)

    try {
      // Filter out empty ingredients and instructions
      const ingredients = data.ingredients.filter(ing => ing.text.trim())
      const instructions = data.instructions.filter(inst => inst.text.trim())

      if (ingredients.length === 0) {
        setSubmitError('יש להוסיף לפחות מרכיב אחד')
        return
      }

      if (instructions.length === 0) {
        setSubmitError('יש להוסיף לפחות הוראה אחת')
        return
      }

      const submitData: CreateRecipeInput = {
        ...data,
        ingredients,
        instructions,
        tags: selectedTags,
      }

      onSubmit(submitData)
    } catch (error) {
      setSubmitError('שגיאה בשמירת המתכון. אנא נסו שוב.')
    }
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()])
      setCustomTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {initialData ? 'עריכת מתכון' : 'הוספת מתכון חדש'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 3 }}>
        {/* Basic Information */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'שם המתכון חובה' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="שם המתכון"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="תיאור המתכון"
                  multiline
                  rows={2}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>קטגוריה</InputLabel>
                  <Select {...field} label="קטגוריה" disabled={loading}>
                    {Object.values(RecipeCategory).map((category) => (
                      <MenuItem key={category} value={category}>
                        {translateCategory(category)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name="prepTimeMinutes"
              control={control}
              rules={{ required: 'זמן הכנה חובה', min: { value: 1, message: 'זמן הכנה חייב להיות חיובי' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="זמן הכנה (דקות)"
                  type="number"
                  error={!!errors.prepTimeMinutes}
                  helperText={errors.prepTimeMinutes?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name="cookTimeMinutes"
              control={control}
              rules={{ required: 'זמן בישול חובה', min: { value: 1, message: 'זמן בישול חייב להיות חיובי' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="זמן בישול (דקות)"
                  type="number"
                  error={!!errors.cookTimeMinutes}
                  helperText={errors.cookTimeMinutes?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Photo Upload */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            תמונת המתכון
          </Typography>
          <Controller
            name="photoUrl"
            control={control}
            render={({ field }) => (
              <PhotoUpload
                value={field.value}
                onChange={field.onChange}
                disabled={loading}
              />
            )}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Tags */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            תגיות
          </Typography>

          {/* Common Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {commonTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagSelect(tag)}
                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                size="small"
                disabled={loading}
              />
            ))}
          </Box>

          {/* Custom Tag Input */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="הוסף תגית מותאמת אישית"
              size="small"
              disabled={loading}
              sx={{ flexGrow: 1 }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCustomTag()
                }
              }}
            />
            <Button
              onClick={handleAddCustomTag}
              variant="outlined"
              size="small"
              disabled={loading || !customTag.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              הוסף
            </Button>
          </Box>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  color="primary"
                  size="small"
                  disabled={loading}
                />
              ))}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Ingredients */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            מרכיבים
          </Typography>
          {ingredientFields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ minWidth: 30 }}>
                {index + 1}.
              </Typography>
              <Controller
                name={`ingredients.${index}.text`}
                control={control}
                rules={{ required: index === 0 ? 'יש להוסיף לפחות מרכיב אחד' : false }}
                render={({ field }) => (
                  <IngredientAutocomplete
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="הוסף מרכיב..."
                    error={!!errors.ingredients?.[index]?.text}
                    helperText={errors.ingredients?.[index]?.text?.message}
                    disabled={loading}
                    fullWidth
                  />
                )}
              />
              {ingredientFields.length > 1 && (
                <IconButton
                  onClick={() => removeIngredient(index)}
                  color="error"
                  disabled={loading}
                >
                  <Remove />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            onClick={() => appendIngredient({ text: '' })}
            startIcon={<Add />}
            variant="outlined"
            size="small"
            disabled={loading}
          >
            הוסף מרכיב
          </Button>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Instructions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            הוראות הכנה
          </Typography>
          {instructionFields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ minWidth: 30, mt: 2 }}>
                {index + 1}.
              </Typography>
              <Controller
                name={`instructions.${index}.text`}
                control={control}
                rules={{ required: index === 0 ? 'יש להוסיף לפחות הוראה אחת' : false }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="הוסף הוראת הכנה..."
                    error={!!errors.instructions?.[index]?.text}
                    helperText={errors.instructions?.[index]?.text?.message}
                    disabled={loading}
                  />
                )}
              />
              {instructionFields.length > 1 && (
                <IconButton
                  onClick={() => removeInstruction(index)}
                  color="error"
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  <Remove />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            onClick={() => appendInstruction({ text: '' })}
            startIcon={<Add />}
            variant="outlined"
            size="small"
            disabled={loading}
          >
            הוסף הוראה
          </Button>
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        {/* Form Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<Save />}
            disabled={loading}
          >
            {loading ? 'שומר...' : 'שמור מתכון'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outlined"
            size="large"
            startIcon={<Cancel />}
            disabled={loading}
          >
            בטל
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}