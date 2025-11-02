import { RecipeCategory } from '@/types/recipe'

export const categoryTranslations: Record<RecipeCategory, string> = {
  [RecipeCategory.APPETIZER]: 'מתאבן',
  [RecipeCategory.SOUP]: 'מרק',
  [RecipeCategory.MAIN]: 'מנה עיקרית',
  [RecipeCategory.SIDE]: 'תוספת',
  [RecipeCategory.DESSERT]: 'קינוח',
  [RecipeCategory.BEVERAGE]: 'משקה',
  [RecipeCategory.SNACK]: 'חטיף',
}

export function translateCategory(category: RecipeCategory): string {
  return categoryTranslations[category] || category
}