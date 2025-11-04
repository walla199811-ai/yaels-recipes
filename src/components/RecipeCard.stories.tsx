import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { RecipeCard } from './RecipeCard'
import { Recipe, RecipeCategory } from '@/types/recipe'

const meta = {
  title: 'Components/RecipeCard',
  component: RecipeCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'כרטיס מתכון המציג פרטי המתכון כולל תמונה, כותרת, תיאור, זמנים ותגיות. תומך בעברית RTL.',
      },
    },
  },
  argTypes: {
    recipe: {
      description: 'אובייקט המתכון המכיל את כל הפרטים',
    },
    onClick: {
      description: 'פונקציה שנקראת כאשר לוחצים על הכרטיס',
      action: 'clicked',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RecipeCard>

export default meta
type Story = StoryObj<typeof meta>

// Base recipe data for stories
const baseRecipe: Recipe = {
  id: '1',
  title: 'עוגת שוקולד של סבתא',
  description: 'מתכון משפחתי לעוגת שוקולד עשירה וטעימה, עם קרם שוקולד מעולה וקישוט פירות יער',
  category: RecipeCategory.DESSERT,
  prepTimeMinutes: 30,
  cookTimeMinutes: 60,
  servings: 999, // Hidden field with indicative value
  ingredients: [
    { order: 1, text: '3 כוסות קמח לבן' },
    { order: 2, text: '2 כוסות סוכר' },
    { order: 3, text: '4 ביצים גדולות' },
  ],
  instructions: [
    { step: 1, text: 'לחמם תנור ל-180 מעלות' },
    { step: 2, text: 'לערבב במיקסר את הביצים והסוכר' },
  ],
  tags: ['פרווה', 'מתכון משפחתי', 'אפייה'],
  photoUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
  createdBy: 'מתכון מדוגמה', // Hidden field with indicative value
  lastModifiedBy: 'מתכון מדוגמה',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
}

// Default story
export const Default: Story = {
  args: {
    recipe: baseRecipe,
    onClick: action('recipe-clicked'),
  },
}

// Without image
export const WithoutImage: Story = {
  args: {
    recipe: {
      ...baseRecipe,
      photoUrl: undefined,
    },
    onClick: action('recipe-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'מתכון ללא תמונה - מציג placeholder עם אייקון ושם הקטגוריה',
      },
    },
  },
}

// Main dish category
export const MainDish: Story = {
  args: {
    recipe: {
      ...baseRecipe,
      id: '2',
      title: 'שניצל עוף בתנור',
      description: 'שניצל עוף פריך ובריא שנאפה בתנור במקום לטגן',
      category: RecipeCategory.MAIN,
      prepTimeMinutes: 20,
      cookTimeMinutes: 25,
      servings: 999,
      tags: ['בשרי', 'בריא', 'פשוט'],
      photoUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
      createdBy: 'מתכון מדוגמה',
    },
    onClick: action('recipe-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'מתכון עיקרי עם זמני הכנה קצרים יותר',
      },
    },
  },
}

// Vegetarian salad
export const VegetarianSalad: Story = {
  args: {
    recipe: {
      ...baseRecipe,
      id: '3',
      title: 'סלט קינואה עם ירקות',
      description: 'סלט בריא ומזין עם קינואה וירקות צבעוניים',
      category: RecipeCategory.SIDE,
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      servings: 999,
      tags: ['צמחוני', 'בריא', 'ללא גלוטן'],
      photoUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      createdBy: 'מתכון מדוגמה',
    },
    onClick: action('recipe-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'מתכון צמחוני עם תגיות מתאימות',
      },
    },
  },
}

// Long title and description
export const LongContent: Story = {
  args: {
    recipe: {
      ...baseRecipe,
      id: '4',
      title: 'עוגת שוקולד מיוחדת עם קרם וניל ופירות יער וקצפת והרבה הרבה טקסט נוסף כדי לבדוק איך המערכת מתמודדת עם כותרות ארוכות מאוד',
      description: 'זהו תיאור מאוד מאוד ארוך של המתכון הזה, שמכיל המון מילים ופרטים על איך להכין את העוגה הטעימה הזו עם שוקולד מעולה וקרם וניל מתוק ופירות יער טריים וקצפת אמיתית וכל מיני טעמים נפלאים שיגרמו לכם להרגיש בגן עדן בכל ביס שתיקחו מהעוגה המדהימה הזו',
      tags: ['פרווה', 'מתכון ארוך', 'מיוחד', 'עשיר', 'מתוק'],
    },
    onClick: action('recipe-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'בדיקת התמודדות עם תוכן ארוך - כותרת ותיאור שצריכים לעבור קיצוץ',
      },
    },
  },
}

// Quick recipe
export const QuickRecipe: Story = {
  args: {
    recipe: {
      ...baseRecipe,
      id: '5',
      title: 'טוסט עם אבוקדו',
      description: 'ארוחת בוקר בריאה ומהירה להכנה',
      category: RecipeCategory.SIDE,
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      servings: 999,
      tags: ['מהיר', 'בריא', 'קל'],
      photoUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      createdBy: 'מתכון מדוגמה',
    },
    onClick: action('recipe-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'מתכון מהיר עם זמן בישול אפס',
      },
    },
  },
}

// Many servings
export const LargeServings: Story = {
  args: {
    recipe: {
      ...baseRecipe,
      id: '6',
      title: 'אורז למסיבה',
      description: 'מתכון אורז לאירועים גדולים',
      category: RecipeCategory.SIDE,
      prepTimeMinutes: 10,
      cookTimeMinutes: 45,
      servings: 999,
      tags: ['למסיבה', 'פרווה', 'כשר'],
      photoUrl: undefined,
      createdBy: 'מתכון מדוגמה',
    },
    onClick: action('recipe-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'מתכון עם מספר מנות גדול',
      },
    },
  },
}

// Interactive example
export const Interactive: Story = {
  args: {
    recipe: baseRecipe,
    onClick: action('recipe-clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'דוגמה אינטראקטיבית - לחץ על הכרטיס כדי לראות את האירוע',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // You can add interactions here using @storybook/test
    console.log('Recipe card is interactive!')
  },
}