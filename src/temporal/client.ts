import { Client } from '@temporalio/client'
import { Recipe, CreateRecipeInput, UpdateRecipeInput, RecipeSearchFilters } from '@/types/recipe'

export class TemporalRecipeClient {
  private client: Client | null = null

  private async getClient(): Promise<Client> {
    if (!this.client) {
      try {
        console.log('🔗 Connecting to Temporal server...')
        const { Connection } = await import('@temporalio/client')

        // Check if we're in production vs development
        const isProduction = process.env.NODE_ENV === 'production'
        const temporalAddressEnv = process.env.TEMPORAL_ADDRESS

        console.log('🔧 Environment:', process.env.NODE_ENV)
        console.log('🔧 TEMPORAL_ADDRESS env var:', temporalAddressEnv)

        // Parse the Temporal address and determine connection settings
        let temporalAddress = temporalAddressEnv || 'localhost:7234'

        // Remove protocol if present (Render URLs include https://)
        if (temporalAddress.startsWith('https://')) {
          temporalAddress = temporalAddress.replace('https://', '')
        }
        if (temporalAddress.startsWith('http://')) {
          temporalAddress = temporalAddress.replace('http://', '')
        }

        // Add default port if not specified
        if (!temporalAddress.includes(':')) {
          temporalAddress = `${temporalAddress}:7233`
        }

        // Determine if we need TLS (external servers use TLS, localhost does not)
        const isLocalhost = temporalAddress.startsWith('localhost:') || temporalAddress.startsWith('127.0.0.1:')

        console.log(`🔗 Connecting to Temporal at: ${temporalAddress} (TLS: ${!isLocalhost})`)

        // In production, if external server is not accessible, fall back to direct database access
        if (isProduction && !isLocalhost) {
          try {
            const connection = await Connection.connect({
              address: temporalAddress,
              tls: {},
              connectTimeout: '10s', // Shorter timeout for faster fallback
            })
            this.client = new Client({
              connection,
            })
            console.log('✅ Connected to Temporal Server')
          } catch (temporalError) {
            console.warn('⚠️ Temporal server unavailable, falling back to direct mode:', temporalError instanceof Error ? temporalError.message : String(temporalError))
            // Set a flag to indicate direct mode
            this.client = null
            throw new Error('TEMPORAL_UNAVAILABLE')
          }
        } else {
          // Development mode - standard connection
          const connection = await Connection.connect({
            address: temporalAddress,
            tls: isLocalhost ? false : {},
            connectTimeout: '30s',
          })
          this.client = new Client({
            connection,
          })
          console.log('✅ Connected to Temporal Server')
        }
      } catch (error) {
        console.error('❌ Failed to connect to Temporal Server:', error)
        throw error
      }
    }
    return this.client
  }

  private resetClient(): void {
    this.client = null
  }

  async getRecipes(filters?: RecipeSearchFilters): Promise<Recipe[]> {
    try {
      const client = await this.getClient()
      const handle = await client.workflow.start('getRecipesWorkflow', {
        args: [filters],
        taskQueue: 'yaels-recipes-task-queue',
        workflowId: `get-recipes-${Date.now()}`,
      })

      return await handle.result()
    } catch (error) {
      console.error('Failed to fetch recipes:', error)
      this.resetClient() // Reset client on error to force reconnection

      // If Temporal is unavailable in production, fall back to direct database access
      if (error instanceof Error && error.message === 'TEMPORAL_UNAVAILABLE' && process.env.NODE_ENV === 'production') {
        console.log('🔄 Using direct database fallback for getRecipes')
        return await this.getRecipesDirectly(filters)
      }

      throw error
    }
  }

  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    try {
      console.log('🍳 Creating recipe via Temporal workflow:', input.title)
      const client = await this.getClient()
      const workflowId = `create-recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.log('🚀 Starting recipe workflow:', workflowId)
      console.log('📝 Operation: create')

      const handle = await client.workflow.start('createRecipeWorkflow', {
        args: [input],
        taskQueue: 'yaels-recipes-task-queue',
        workflowId,
      })

      console.log('⏳ Recipe workflow started with ID:', workflowId)
      const result = await handle.result()
      console.log('✅ Recipe workflow completed:', workflowId)
      return result
    } catch (error) {
      console.error('Failed to create recipe:', error)
      this.resetClient()

      // If Temporal is unavailable in production, fall back to direct database access
      if (error instanceof Error && error.message === 'TEMPORAL_UNAVAILABLE' && process.env.NODE_ENV === 'production') {
        console.log('🔄 Using direct database fallback for createRecipe')
        return await this.createRecipeDirectly(input)
      }

      throw error
    }
  }

  async updateRecipe(input: UpdateRecipeInput): Promise<Recipe> {
    try {
      console.log('📝 Updating recipe via Temporal workflow:', input.id)
      const client = await this.getClient()
      const workflowId = `update-recipe-${input.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.log('🚀 Starting recipe workflow:', workflowId)
      console.log('📝 Operation: update')

      const handle = await client.workflow.start('updateRecipeWorkflow', {
        args: [input],
        taskQueue: 'yaels-recipes-task-queue',
        workflowId,
      })

      console.log('⏳ Recipe workflow started with ID:', workflowId)
      const result = await handle.result()
      console.log('✅ Recipe workflow completed:', workflowId)
      return result
    } catch (error) {
      console.error('Failed to update recipe:', error)
      this.resetClient()

      // If Temporal is unavailable in production, fall back to direct database access
      if (error instanceof Error && error.message === 'TEMPORAL_UNAVAILABLE' && process.env.NODE_ENV === 'production') {
        console.log('🔄 Using direct database fallback for updateRecipe')
        return await this.updateRecipeDirectly(input)
      }

      throw error
    }
  }

  async deleteRecipe(recipeId: string, deletedBy: string): Promise<void> {
    try {
      console.log('🗑️ Deleting recipe via Temporal workflow:', recipeId)
      const client = await this.getClient()
      const workflowId = `delete-recipe-${recipeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.log('🚀 Starting recipe workflow:', workflowId)
      console.log('📝 Operation: delete')

      const handle = await client.workflow.start('deleteRecipeWorkflow', {
        args: [recipeId, deletedBy],
        taskQueue: 'yaels-recipes-task-queue',
        workflowId,
      })

      console.log('⏳ Recipe workflow started with ID:', workflowId)
      const result = await handle.result()
      console.log('✅ Recipe workflow completed:', workflowId)
      return result
    } catch (error) {
      console.error('Failed to delete recipe:', error)
      this.resetClient()

      // If Temporal is unavailable in production, fall back to direct database access
      if (error instanceof Error && error.message === 'TEMPORAL_UNAVAILABLE' && process.env.NODE_ENV === 'production') {
        console.log('🔄 Using direct database fallback for deleteRecipe')
        return await this.deleteRecipeDirectly(recipeId, deletedBy)
      }

      throw error
    }
  }

  // Direct database fallback methods for when Temporal is unavailable in production
  private async getRecipesDirectly(filters?: RecipeSearchFilters): Promise<Recipe[]> {
    console.log('🔄 Using direct database access for getRecipes')
    const { prisma } = await import('@/lib/prisma')

    // Build the where clause based on filters
    const where: any = {}

    if (filters?.id) {
      where.id = filters.id
    }

    if (filters?.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { ingredients: { some: { text: { contains: filters.query, mode: 'insensitive' } } } }
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
      orderBy: { createdAt: 'desc' }
    })

    return recipes.map(recipe => ({
      ...recipe,
      description: recipe.description || undefined,
      photoUrl: recipe.photoUrl || undefined,
      category: recipe.category as any,
      ingredients: Array.isArray(recipe.ingredients)
        ? (recipe.ingredients as any[]).sort((a: any, b: any) => a.order - b.order)
        : (recipe.ingredients as any) || [],
      instructions: Array.isArray(recipe.instructions)
        ? (recipe.instructions as any[]).sort((a: any, b: any) => a.step - b.step)
        : (recipe.instructions as any) || []
    })) as Recipe[]
  }

  private async createRecipeDirectly(input: CreateRecipeInput): Promise<Recipe> {
    console.log('🔄 Using direct database access for createRecipe')
    const { prisma } = await import('@/lib/prisma')

    // Basic validation
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Recipe title is required')
    }

    if (!input.ingredients || input.ingredients.length === 0) {
      throw new Error('At least one ingredient is required')
    }

    if (!input.instructions || input.instructions.length === 0) {
      throw new Error('At least one instruction is required')
    }

    // Create recipe in database
    const newRecipe = await prisma.recipe.create({
      data: {
        title: input.title,
        description: input.description || null,
        category: input.category as any,
        prepTimeMinutes: input.prepTimeMinutes,
        cookTimeMinutes: input.cookTimeMinutes,
        servings: input.servings,
        ingredients: input.ingredients.map((ing, index) => ({
          order: index + 1,
          text: ing.text
        })),
        instructions: input.instructions.map((inst, index) => ({
          step: index + 1,
          text: inst.text
        })),
        photoUrl: input.photoUrl || null,
        tags: input.tags,
        createdBy: input.createdBy,
        lastModifiedBy: input.createdBy,
      }
    })

    const recipe = {
      ...newRecipe,
      description: newRecipe.description || undefined,
      photoUrl: newRecipe.photoUrl || undefined,
      category: newRecipe.category as any,
      ingredients: newRecipe.ingredients as Array<{ order: number; text: string }>,
      instructions: newRecipe.instructions as Array<{ step: number; text: string }>
    }

    // Send notification (non-blocking)
    try {
      // Import email service dynamically
      const nodemailer = await import('nodemailer')

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.NOTIFICATION_EMAILS) {
        const transporter = nodemailer.default.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        const notificationEmails = process.env.NOTIFICATION_EMAILS.split(',')
        const subject = `Recipe added: ${recipe.title}`
        const emailBody = `
          <h2>Recipe Added</h2>
          <p><strong>${recipe.title}</strong> has been added by ${input.createdBy}.</p>
          <p><strong>Category:</strong> ${recipe.category}</p>
          <p><strong>Prep Time:</strong> ${recipe.prepTimeMinutes} minutes</p>
          <p><strong>Cook Time:</strong> ${recipe.cookTimeMinutes} minutes</p>
          <p><strong>Servings:</strong> ${recipe.servings}</p>
          ${recipe.description ? `<p><strong>Description:</strong> ${recipe.description}</p>` : ''}
        `

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: notificationEmails.join(','),
          subject,
          html: emailBody,
        })
      }
    } catch (emailError) {
      console.warn('Failed to send notification email:', emailError)
    }

    return recipe
  }

  private async updateRecipeDirectly(input: UpdateRecipeInput): Promise<Recipe> {
    console.log('🔄 Using direct database access for updateRecipe')
    const { prisma } = await import('@/lib/prisma')

    const { id, ...updateData } = input

    // Process data for database
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

    // Update recipe in database
    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: processedData,
    })

    return {
      ...updatedRecipe,
      description: updatedRecipe.description || undefined,
      photoUrl: updatedRecipe.photoUrl || undefined,
      category: updatedRecipe.category as any,
      ingredients: updatedRecipe.ingredients as any,
      instructions: updatedRecipe.instructions as any,
    }
  }

  private async deleteRecipeDirectly(recipeId: string, deletedBy: string): Promise<void> {
    console.log('🔄 Using direct database access for deleteRecipe')
    const { prisma } = await import('@/lib/prisma')

    // Get recipe for notification before deleting
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    })

    if (recipe) {
      // Send notification before deletion (non-blocking)
      try {
        // Import email service dynamically
        const nodemailer = await import('nodemailer')

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.NOTIFICATION_EMAILS) {
          const transporter = nodemailer.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          })

          const notificationEmails = process.env.NOTIFICATION_EMAILS.split(',')
          const subject = `Recipe deleted: ${recipe.title}`
          const emailBody = `
            <h2>Recipe Deleted</h2>
            <p><strong>${recipe.title}</strong> has been deleted by ${deletedBy}.</p>
          `

          await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: notificationEmails.join(','),
            subject,
            html: emailBody,
          })
        }
      } catch (emailError) {
        console.warn('Failed to send notification email:', emailError)
      }
    }

    // Delete from database
    await prisma.recipe.delete({
      where: { id: recipeId }
    })
  }
}

// Singleton instance
export const temporalRecipeClient = new TemporalRecipeClient()