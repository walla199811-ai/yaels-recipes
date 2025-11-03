import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { IngredientAutocomplete } from '@/components/IngredientAutocomplete'

const meta: Meta<typeof IngredientAutocomplete> = {
  title: 'Components/IngredientAutocomplete',
  component: IngredientAutocomplete,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Autocomplete component for Hebrew ingredients with RTL support and categorized suggestions.',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'Current value of the autocomplete',
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when value changes',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the component is disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'boolean',
      description: 'Whether the component has an error state',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the input',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Interactive wrapper component
const InteractiveWrapper = ({ initialValue = '', ...props }: any) => {
  const [value, setValue] = useState(initialValue)

  return (
    <Box sx={{ maxWidth: 400, direction: 'rtl' }}>
      <IngredientAutocomplete
        {...props}
        value={value}
        onChange={(newValue) => {
          setValue(newValue)
          props.onChange?.(newValue)
        }}
      />
      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        Current value: {value || 'empty'}
      </Typography>
    </Box>
  )
}

export const Default: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    placeholder: 'הוסף מרכיב...',
  },
}

export const WithInitialValue: Story = {
  render: (args) => <InteractiveWrapper initialValue="קמח לבן" {...args} />,
  args: {
    placeholder: 'הוסף מרכיב...',
  },
}

export const WithError: Story = {
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    placeholder: 'הוסף מרכיב...',
    error: true,
    helperText: 'יש להוסיף לפחות מרכיב אחד',
  },
}

export const Disabled: Story = {
  render: (args) => <InteractiveWrapper initialValue="עגבניות" {...args} />,
  args: {
    placeholder: 'הוסף מרכיב...',
    disabled: true,
  },
}

export const SearchExamples: Story = {
  render: () => (
    <Box sx={{ direction: 'rtl' }}>
      <Typography variant="h6" gutterBottom>
        דוגמאות חיפוש מרכיבים
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
        נסה לחפש את המרכיבים הבאים כדי לראות את הצעות האוטומט:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {[
          { search: 'קמח', description: 'חיפוש "קמח" - יראה סוגי קמח שונים' },
          { search: 'עגב', description: 'חיפוש "עגב" - יראה עגבניות ומוצרי עגבניות' },
          { search: 'שמן', description: 'חיפוש "שמן" - יראה סוגי שמנים שונים' },
          { search: 'בצל', description: 'חיפוש "בצל" - יראה סוגי בצל שונים' },
        ].map((example, index) => (
          <Paper key={index} sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {example.description}
            </Typography>
            <InteractiveWrapper
              initialValue={example.search}
              placeholder="הוסף מרכיב..."
            />
          </Paper>
        ))}
      </Box>
    </Box>
  ),
}

// Component for form integration demo
const FormIntegrationDemo = () => {
  const [ingredients, setIngredients] = useState(['קמח לבן', 'סוכר', ''])

  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
  }

  const addIngredient = () => {
    setIngredients([...ingredients, ''])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index))
    }
  }

  return (
    <Box sx={{ maxWidth: 600, direction: 'rtl' }}>
      <Typography variant="h6" gutterBottom>
        דוגמה לשילוב בטופס מתכון
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          מרכיבים
        </Typography>

        {ingredients.map((ingredient, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ minWidth: 30 }}>
              {index + 1}.
            </Typography>
            <IngredientAutocomplete
              value={ingredient}
              onChange={(value) => handleIngredientChange(index, value)}
              placeholder="הוסף מרכיב..."
              fullWidth
            />
            {ingredients.length > 1 && (
              <button
                onClick={() => removeIngredient(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f44336',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px',
                }}
              >
                ×
              </button>
            )}
          </Box>
        ))}

        <button
          onClick={addIngredient}
          style={{
            background: 'none',
            border: '1px solid #1976d2',
            color: '#1976d2',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          הוסף מרכיב
        </button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          מרכיבים נוכחיים:
        </Typography>
        <ul style={{ margin: 0, paddingRight: '20px' }}>
          {ingredients.filter(ing => ing.trim()).map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </Paper>
    </Box>
  )
}

export const FormIntegration: Story = {
  render: () => <FormIntegrationDemo />,
}

export const AllCategories: Story = {
  render: () => (
    <Box sx={{ direction: 'rtl' }}>
      <Typography variant="h6" gutterBottom>
        כל הקטגוריות הזמינות
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
        רשימה של כל הקטגוריות הזמינות במאגר המרכיבים:
      </Typography>

      <InteractiveWrapper placeholder="התחל להקליד כדי לראות את כל הקטגוריות..." />

      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
        💡 טיפ: השאר את השדה ריק וקליק עליו כדי לראות דוגמאות מכל קטגוריה
      </Typography>
    </Box>
  ),
}