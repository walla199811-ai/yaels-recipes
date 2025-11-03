'use client'

import React, { useState, useEffect, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  Paper,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  hebrewIngredientsDatabase,
  getIngredientSuggestions,
  IngredientCategory
} from '@/data/hebrew-ingredients';

interface IngredientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

// Styled components for RTL support
const RTLAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiAutocomplete-listbox': {
    direction: 'rtl',
  },
  '& .MuiAutocomplete-option': {
    direction: 'rtl',
    textAlign: 'right',
  },
  '& .MuiAutocomplete-groupLabel': {
    direction: 'rtl',
    textAlign: 'right',
    fontWeight: 600,
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[50],
  },
  '& .MuiAutocomplete-noOptions': {
    direction: 'rtl',
    textAlign: 'right',
  },
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.grey[100],
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  zIndex: 1,
}));

export function IngredientAutocomplete({
  value,
  onChange,
  disabled = false,
  placeholder = 'הוסף מרכיב...',
  error = false,
  helperText,
  fullWidth = true,
}: IngredientAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);

  // Update internal state when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Generate grouped options based on input
  const groupedOptions = useMemo(() => {
    if (!inputValue.trim()) {
      // When no input, show popular ingredients from each category
      return hebrewIngredientsDatabase.map(category => ({
        category: category.name,
        items: category.items.slice(0, 3), // Show first 3 items from each category
      })).filter(group => group.items.length > 0);
    }

    // When there's input, filter and group results
    const query = inputValue.trim().toLowerCase();
    const filteredGroups = hebrewIngredientsDatabase
      .map(category => ({
        category: category.name,
        items: category.items.filter(item =>
          item.toLowerCase().includes(query)
        ).slice(0, 5), // Limit to 5 items per category
      }))
      .filter(group => group.items.length > 0);

    return filteredGroups;
  }, [inputValue]);

  // Flatten options for Autocomplete
  const flatOptions = useMemo(() => {
    const options: Array<{ type: 'category' | 'item'; value: string; category?: string }> = [];

    groupedOptions.forEach(group => {
      // Add category header
      options.push({ type: 'category', value: group.category });

      // Add items
      group.items.forEach(item => {
        options.push({ type: 'item', value: item, category: group.category });
      });
    });

    return options;
  }, [groupedOptions]);

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: unknown) => {
    const selectedValue = (newValue as string) || '';
    setInputValue(selectedValue);
    onChange(selectedValue);
  };

  const renderOption = (props: any, option: { type: string; value: string; category?: string }) => {
    if (option.type === 'category') {
      return (
        <CategoryHeader key={`category-${option.value}`}>
          <Typography variant="subtitle2" color="primary">
            {option.value}
          </Typography>
        </CategoryHeader>
      );
    }

    return (
      <ListItem
        {...props}
        key={`item-${option.value}`}
        sx={{
          direction: 'rtl',
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
          }
        }}
      >
        <ListItemText
          primary={option.value}
          sx={{ textAlign: 'right' }}
        />
      </ListItem>
    );
  };

  const getOptionLabel = (option: unknown) => {
    if (typeof option === 'string') {
      return option;
    }
    return (option as { type: string; value: string }).value || '';
  };

  const isOptionEqualToValue = (
    option: { type: string; value: string },
    value: { type: string; value: string }
  ) => {
    return option.value === value.value;
  };

  return (
    <RTLAutocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={inputValue}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={flatOptions.filter(opt => opt.type === 'item').map(opt => opt.value)}
      getOptionLabel={getOptionLabel}
      filterOptions={(options) => options} // We handle filtering ourselves
      disabled={disabled}
      fullWidth={fullWidth}
      PaperComponent={(props) => (
        <Paper
          {...props}
          sx={{
            direction: 'rtl',
            maxHeight: 300,
            overflow: 'auto',
          }}
        />
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            sx: {
              direction: 'rtl',
              textAlign: 'right',
            }
          }}
          sx={{
            '& .MuiInputBase-input': {
              direction: 'rtl',
              textAlign: 'right',
            }
          }}
        />
      )}
      renderOption={(props, option) => {
        // Find the full option object for rendering
        const fullOption = flatOptions.find(opt => opt.value === option);
        if (!fullOption) return null;

        return renderOption(props, fullOption);
      }}
      noOptionsText={
        <Box sx={{ p: 1, textAlign: 'center', direction: 'rtl' }}>
          <Typography variant="body2" color="text.secondary">
            {inputValue.trim() ? 'לא נמצאו תוצאות' : 'התחל להקליד כדי לחפש מרכיבים'}
          </Typography>
        </Box>
      }
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          direction: 'rtl',
        }
      }}
    />
  );
}

// Export helper function for Storybook and tests
export { getIngredientSuggestions, hebrewIngredientsDatabase };