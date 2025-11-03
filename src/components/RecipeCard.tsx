'use client'

import React from 'react'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  CardActionArea,
} from '@mui/material'
import { Recipe } from '@/types/recipe'
import { AccessTime, Restaurant, RestaurantMenu } from '@mui/icons-material'
import { translateCategory } from '@/lib/translations'

interface RecipeCardProps {
  recipe: Recipe
  onClick?: () => void
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} data-testid="recipe-card">
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <Box sx={{ height: 200, overflow: 'hidden', position: 'relative' }}>
          {recipe.photoUrl ? (
            <Image
              src={recipe.photoUrl}
              alt={recipe.title}
              data-testid="recipe-image"
              fill
              style={{
                objectFit: 'cover',
              }}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : null}

          {/* Always show placeholder if no image or image failed to load */}
          {!recipe.photoUrl && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #A0826D 0%, #C4A484 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                }
              }}
            >
              <RestaurantMenu
                sx={{
                  fontSize: 48,
                  color: 'rgba(255,255,255,0.9)',
                  mb: 1,
                  zIndex: 1
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 500,
                  textAlign: 'center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  zIndex: 1
                }}
              >
                {translateCategory(recipe.category)}
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h3" gutterBottom data-testid="recipe-title">
            {recipe.title}
          </Typography>

          {recipe.description && (
            <Typography variant="body2" color="text.secondary" paragraph data-testid="recipe-description">
              {recipe.description.length > 100
                ? `${recipe.description.substring(0, 100)}...`
                : recipe.description}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" data-testid="prep-time">
                {totalTime} דק׳
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }} data-testid="recipe-tags">
            <Chip
              label={translateCategory(recipe.category)}
              size="small"
              color="primary"
              variant="outlined"
              data-testid="recipe-category"
            />
            {recipe.tags.slice(0, 2).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>

        </CardContent>
      </CardActionArea>
    </Card>
  )
}