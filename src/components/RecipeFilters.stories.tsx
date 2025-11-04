import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { RecipeFilters } from './RecipeFilters'
import { RecipeCategory, RecipeSearchFilters } from '@/types/recipe'

const meta = {
  title: 'Components/RecipeFilters',
  component: RecipeFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'מרכיב סינון מתכונים מינימלי עם כפתורי קטגוריות. מציג את הקטגוריות הפשוטות: הכל, מנה עיקרית, תוספת וקינוח.',
      },
    },
  },
  argTypes: {
    filters: {
      description: 'אובייקט הסינונים הנוכחיים',
    },
    onChange: {
      description: 'פונקציה שנקראת כאשר משתנים הסינונים',
      action: 'filters-changed',
    },
    availableTags: {
      description: 'רשימת התגיות הזמינות (לא בשימוש בגירסה הפשוטה)',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecipeFilters>

export default meta
type Story = StoryObj<typeof meta>

// Default - no filters selected
export const Default: Story = {
  args: {
    filters: {},
    onChange: action('filters-changed'),
    availableTags: [],
  },
}

// Main dish selected
export const MainSelected: Story = {
  args: {
    filters: {
      category: RecipeCategory.MAIN,
    },
    onChange: action('filters-changed'),
    availableTags: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'מצב עם מנה עיקרית נבחרת',
      },
    },
  },
}

// Side dish selected
export const SideSelected: Story = {
  args: {
    filters: {
      category: RecipeCategory.SIDE,
    },
    onChange: action('filters-changed'),
    availableTags: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'מצב עם תוספת נבחרת',
      },
    },
  },
}

// Dessert selected
export const DessertSelected: Story = {
  args: {
    filters: {
      category: RecipeCategory.DESSERT,
    },
    onChange: action('filters-changed'),
    availableTags: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'מצב עם קינוח נבחר',
      },
    },
  },
}

// Interactive example
export const Interactive: Story = {
  args: {
    filters: {},
    onChange: action('filters-changed'),
    availableTags: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'דוגמה אינטראקטיבית - בחר קטגוריות שונות כדי לראות את השינויים',
      },
    },
  },
}