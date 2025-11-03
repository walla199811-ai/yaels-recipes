import { emailService } from './email-service'

/**
 * Direct email service for Vercel deployment
 * This bypasses Temporal workflows and sends emails directly from API routes
 */

export interface DirectEmailOptions {
  operation: 'created' | 'updated' | 'deleted'
  recipe: any
  performedBy: string
}

/**
 * Send recipe notification email directly without Temporal
 */
export async function sendDirectRecipeNotification(options: DirectEmailOptions): Promise<boolean> {
  try {
    console.log('📧 [DIRECT EMAIL] Sending notification directly:', {
      operation: options.operation,
      recipeTitle: options.recipe.title,
      performedBy: options.performedBy
    })

    const success = await emailService.sendRecipeNotification(
      options.operation,
      options.recipe,
      options.performedBy
    )

    if (success) {
      console.log('✅ [DIRECT EMAIL] Notification sent successfully')
    } else {
      console.error('❌ [DIRECT EMAIL] Notification failed')
    }

    return success
  } catch (error) {
    console.error('❌ [DIRECT EMAIL] Error sending notification:', error)

    // Don't throw - email failure shouldn't break the API
    return false
  }
}

/**
 * Send notification with fallback handling
 * This ensures the API continues working even if email fails
 */
export async function sendNotificationWithFallback(options: DirectEmailOptions): Promise<void> {
  try {
    // Attempt to send email asynchronously
    // We don't await this to avoid blocking the API response
    sendDirectRecipeNotification(options).catch(error => {
      console.error('❌ [EMAIL FALLBACK] Background email sending failed:', error)
    })
  } catch (error) {
    console.error('❌ [EMAIL FALLBACK] Failed to initiate email sending:', error)
  }
}