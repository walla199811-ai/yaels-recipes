import nodemailer from 'nodemailer'
import { Recipe } from '@/types/recipe'

export interface EmailNotification {
  to: string
  subject: string
  html: string
  text: string
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      // Create transporter using environment variables
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })

      console.log('📧 Email transporter initialized')
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error)
      this.transporter = null
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️ Email transporter not available, skipping email')
      return false
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured, skipping email')
      return false
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: notification.to,
        subject: notification.subject,
        text: notification.text,
        html: notification.html,
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('✅ Email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  /**
   * Generate recipe notification email content
   */
  generateRecipeNotificationEmail(
    operation: 'created' | 'updated' | 'deleted',
    recipe: Recipe,
    performedBy: string
  ): { subject: string; html: string; text: string } {
    const operationText = {
      created: 'נוצר',
      updated: 'עודכן',
      deleted: 'נמחק'
    }[operation]

    const subject = `מתכון ${operationText} - ${recipe.title}`

    const text = `
שלום,

המתכון "${recipe.title}" ${operationText} במערכת המתכונים של יעל.

פרטי המתכון:
- שם: ${recipe.title}
- קטגוריה: ${recipe.category}
- ${operation === 'deleted' ? 'נמחק' : 'עודכן'} על ידי: ${performedBy}
- זמן הכנה: ${recipe.prepTimeMinutes} דקות
- זמן בישול: ${recipe.cookTimeMinutes} דקות
- מספר מנות: ${recipe.servings}

${operation !== 'deleted' ? `לצפייה במתכון: ${process.env.NEXT_PUBLIC_APP_URL}/recipe/${recipe.id}` : ''}

בברכה,
מערכת המתכונים של יעל
    `.trim()

    const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #A0826D; margin: 0; font-size: 28px;">🍳 מערכת המתכונים של יעל</h1>
        </div>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h2 style="color: #333; margin-top: 0; font-size: 22px;">המתכון "${recipe.title}" ${operationText}</h2>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #A0826D; margin-bottom: 15px;">פרטי המתכון:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">שם המתכון:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${recipe.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">קטגוריה:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${recipe.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">${operation === 'deleted' ? 'נמחק' : 'עודכן'} על ידי:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${performedBy}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">זמן הכנה:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${recipe.prepTimeMinutes} דקות</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">זמן בישול:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${recipe.cookTimeMinutes} דקות</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: #555;">מספר מנות:</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${recipe.servings}</td>
            </tr>
          </table>
        </div>

        ${operation !== 'deleted' ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/recipe/${recipe.id}"
             style="background-color: #A0826D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            🔗 צפייה במתכון
          </a>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 14px;">
          <p>בברכה,<br>מערכת המתכונים של יעל</p>
        </div>
      </div>
    </div>
    `

    return { subject, html, text }
  }

  /**
   * Send recipe notification to configured recipients
   */
  async sendRecipeNotification(
    operation: 'created' | 'updated' | 'deleted',
    recipe: Recipe,
    performedBy: string
  ): Promise<boolean> {
    const recipients = process.env.NOTIFICATION_EMAILS?.split(',').filter(email => email.trim()) || []

    if (recipients.length === 0) {
      console.warn('⚠️ No notification email recipients configured')
      return false
    }

    const emailContent = this.generateRecipeNotificationEmail(operation, recipe, performedBy)
    let successCount = 0

    for (const recipient of recipients) {
      const success = await this.sendEmail({
        to: recipient.trim(),
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      })

      if (success) {
        successCount++
      }
    }

    console.log(`📧 Recipe notification sent to ${successCount}/${recipients.length} recipients`)
    return successCount > 0
  }
}

// Create singleton instance
export const emailService = new EmailService()