export enum RecipeCategory {
  APPETIZER = 'APPETIZER',
  SOUP = 'SOUP',
  MAIN = 'MAIN',
  SIDE = 'SIDE',
  DESSERT = 'DESSERT',
  BEVERAGE = 'BEVERAGE',
  SNACK = 'SNACK',
}

export interface Ingredient {
  order: number;
  text: string;
}

export interface Instruction {
  step: number;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  category: RecipeCategory;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  photoUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface CreateRecipeInput {
  title: string;
  description?: string;
  category: RecipeCategory;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: Omit<Ingredient, 'order'>[];
  instructions: Omit<Instruction, 'step'>[];
  photoUrl?: string;
  tags: string[];
  createdBy: string;
}

export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {
  id: string;
  lastModifiedBy: string;
}

export interface RecipeSearchFilters {
  id?: string;
  query?: string;
  category?: RecipeCategory;
  tags?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
}

export interface RecipeSearchResult {
  recipes: Recipe[];
  totalCount: number;
}