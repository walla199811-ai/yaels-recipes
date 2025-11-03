'use client'

import React, { useState } from 'react'
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { Search, Clear } from '@mui/icons-material'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'חפש מתכונים...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onChange(localValue)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChange(localValue)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        variant="outlined"
        data-testid="search-input"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleSubmit}
                edge="end"
                aria-label="חפש"
              >
                <Search />
              </IconButton>
            </InputAdornment>
          ),
          startAdornment: localValue && (
            <InputAdornment position="start">
              <IconButton
                onClick={handleClear}
                edge="start"
                aria-label="נקה חיפוש"
              >
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'background.paper',
            },
            '&.Mui-focused': {
              backgroundColor: 'background.paper',
            },
          },
        }}
      />
    </Box>
  )
}