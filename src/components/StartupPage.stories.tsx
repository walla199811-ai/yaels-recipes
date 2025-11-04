import type { Meta, StoryObj } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { StartupPage } from './StartupPage'

const meta: Meta<typeof StartupPage> = {
  title: 'Components/StartupPage',
  component: StartupPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
אניחות כניסה מקסימה עם אנימציות חלקות ומוקדש ללכבוד יעל.

הקומפוננטה כוללת:
- **אנימציות צפות**: תמונות מתכונים צפות עם אנימציה חלקה
- **טקסט מנצנץ**: כותרת עם אפקט שקוף מתחלף
- **מעבר חלק**: כשלוחצים, המעבר הוא חלק לדף הבית
- **הקדשה**: הקדשה מיוחדת לכבוד יעל

אידיאלי לכניסה ראשונה לאתר עם הרגשה חמה ומזמינה.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onEnter: {
      description: 'פונקציה שנקראת כשלוחצים על הדף כדי להיכנס לאתר',
    },
  },
}

export default meta
type Story = StoryObj<typeof StartupPage>

export const Default: Story = {
  args: {
    onEnter: action('onEnter'),
  },
  parameters: {
    docs: {
      description: {
        story: 'אנימת הכניסה הבסיסית עם כל האלמנטים המותאמים לעברית RTL',
      },
    },
  },
}

export const Interactive: Story = {
  args: {
    onEnter: action('user-clicked-to-enter-site'),
  },
  parameters: {
    docs: {
      description: {
        story: 'גרסה אינטראקטיבית - לחץ בכל מקום כדי לראות את האקשן',
      },
    },
  },
}

export const WithDelay: Story = {
  args: {
    onEnter: () => {
      setTimeout(() => {
        action('delayed-entry')()
      }, 500)
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'דוגמה עם עיכוב קטן לפני המעבר - מידמה מעבר חלק יותר',
      },
    },
  },
}