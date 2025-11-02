import { prisma } from '@/lib/prisma'
import { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeSearchFilters } from '@/types/recipe'
import nodemailer from 'nodemailer'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export async function validateRecipeData(input: CreateRecipeInput | UpdateRecipeInput): Promise<boolean> {
  // Basic validation
  if (!input.title || input.title.trim().length === 0) {
    throw new Error('Recipe title is required')
  }

  if (input.prepTimeMinutes < 0 || input.cookTimeMinutes < 0) {
    throw new Error('Preparation and cooking times must be positive numbers')
  }

  if (input.servings <= 0) {
    throw new Error('Number of servings must be greater than 0')
  }

  if (!input.ingredients || input.ingredients.length === 0) {
    throw new Error('At least one ingredient is required')
  }

  if (!input.instructions || input.instructions.length === 0) {
    throw new Error('At least one instruction is required')
  }

  return true
}

export async function fetchRecipesFromDB(filters?: RecipeSearchFilters): Promise<Recipe[]> {
  const where: any = {}

  if (filters?.query) {
    where.OR = [
      { title: { contains: filters.query, mode: 'insensitive' } },
      { description: { contains: filters.query, mode: 'insensitive' } },
    ]
  }

  if (filters?.category) {
    where.category = filters.category
  }

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = { hasSome: filters.tags }
  }

  if (filters?.maxPrepTime) {
    where.prepTimeMinutes = { lte: filters.maxPrepTime }
  }

  if (filters?.maxCookTime) {
    where.cookTimeMinutes = { lte: filters.maxCookTime }
  }

  const recipes = await prisma.recipe.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })

  return recipes.map(recipe => ({
    ...recipe,
    ingredients: recipe.ingredients as any,
    instructions: recipe.instructions as any,
  }))
}

export async function saveRecipeToDB(input: CreateRecipeInput): Promise<Recipe> {
  // Add order to ingredients and step numbers to instructions
  const processedIngredients = input.ingredients.map((ingredient, index) => ({
    ...ingredient,
    order: index + 1,
  }))

  const processedInstructions = input.instructions.map((instruction, index) => ({
    ...instruction,
    step: index + 1,
  }))

  const recipe = await prisma.recipe.create({
    data: {
      ...input,
      ingredients: processedIngredients,
      instructions: processedInstructions,
    },
  })

  return {
    ...recipe,
    ingredients: recipe.ingredients as any,
    instructions: recipe.instructions as any,
  }
}

export async function updateRecipeInDB(input: UpdateRecipeInput): Promise<Recipe> {
  const { id, ...updateData } = input

  // Process ingredients and instructions if provided
  const processedData: any = { ...updateData }

  if (updateData.ingredients) {
    processedData.ingredients = updateData.ingredients.map((ingredient, index) => ({
      ...ingredient,
      order: index + 1,
    }))
  }

  if (updateData.instructions) {
    processedData.instructions = updateData.instructions.map((instruction, index) => ({
      ...instruction,
      step: index + 1,
    }))
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data: processedData,
  })

  return {
    ...recipe,
    ingredients: recipe.ingredients as any,
    instructions: recipe.instructions as any,
  }
}

export async function deleteRecipeFromDB(id: string): Promise<void> {
  await prisma.recipe.delete({
    where: { id },
  })
}

export async function uploadPhotoToStorage(photoData: string, filename: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(photoData, {
      folder: 'yaels-recipes',
      public_id: filename,
      resource_type: 'image',
    })

    return result.secure_url
  } catch (error) {
    console.error('Failed to upload photo:', error)
    throw new Error('Failed to upload photo to cloud storage')
  }
}

export async function sendNotificationEmail(
  type: 'created' | 'updated' | 'deleted',
  recipe: Recipe,
  modifiedBy: string
): Promise<void> {
  const notificationEmails = process.env.NOTIFICATION_EMAILS?.split(',') || []

  if (notificationEmails.length === 0) {
    console.log('No notification emails configured, skipping email notification')
    return
  }

  const transporter = createEmailTransporter()

  const actionText = type === 'created' ? 'added' : type === 'updated' ? 'updated' : 'deleted'
  const subject = `Recipe ${actionText}: ${recipe.title}`

  let emailBody = `
    <h2>Recipe ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</h2>
    <p><strong>${recipe.title}</strong> has been ${actionText} by ${modifiedBy}.</p>
  `

  if (type !== 'deleted') {
    emailBody += `
      <h3>Recipe Details:</h3>
      <ul>
        <li><strong>Category:</strong> ${recipe.category}</li>
        <li><strong>Prep Time:</strong> ${recipe.prepTimeMinutes} minutes</li>
        <li><strong>Cook Time:</strong> ${recipe.cookTimeMinutes} minutes</li>
        <li><strong>Servings:</strong> ${recipe.servings}</li>
      </ul>

      ${recipe.description ? `<p><strong>Description:</strong> ${recipe.description}</p>` : ''}

      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/recipe/${recipe.id}">View Recipe</a></p>
    `
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: notificationEmails.join(','),
    subject,
    html: emailBody,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Notification email sent for recipe ${actionText}:`, recipe.title)
  } catch (error) {
    console.error('Failed to send notification email:', error)
    // Don't throw error - email failure shouldn't break the workflow
  }
}

export async function logRecipeActivity(
  action: string,
  recipeId: string,
  userId: string,
  details?: any
): Promise<void> {
  console.log(`Recipe Activity: ${action}`, {
    recipeId,
    userId,
    details,
    timestamp: new Date().toISOString(),
  })

  // In a production system, you might want to store this in a separate audit log table
  // For now, we're just logging to console
}