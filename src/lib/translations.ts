import { RecipeCategory } from '@/types/recipe'

export const categoryTranslations: Record<RecipeCategory, string> = {
  [RecipeCategory.MAIN]: 'מנה עיקרית',
  [RecipeCategory.SIDE]: 'תוספת',
  [RecipeCategory.DESSERT]: 'קינוח',
}

export function translateCategory(category: RecipeCategory): string {
  return categoryTranslations[category] || category
}