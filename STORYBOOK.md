# Storybook Documentation Guide for Yael's Recipes

This document provides comprehensive information about the Storybook setup for component documentation and development in the Yael's Recipes application.

## Overview

Storybook is configured to showcase and document React components with full Hebrew RTL support, Material-UI theming, and interactive controls. It serves as a component library and design system documentation tool.

## Setup and Configuration

### Dependencies

- `@storybook/nextjs`: Next.js framework integration
- `@storybook/addon-essentials`: Core addons (Controls, Actions, Viewport, etc.)
- `@storybook/addon-interactions`: Interactive testing support
- `@storybook/addon-links`: Navigation between stories
- `@storybook/test`: Testing utilities

### Configuration Files

#### `.storybook/main.ts`
Main configuration file that defines:
- Story file patterns (`../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`)
- Addons and features
- Next.js framework integration
- TypeScript support with React docgen
- Automatic documentation generation

#### `.storybook/preview.tsx`
Global configuration for all stories:
- Hebrew RTL theme provider setup
- Material-UI integration with custom theme
- Emotion cache for RTL styling
- Global decorators and parameters
- Theme switcher toolbar (Hebrew RTL / English LTR)

## Theme Configuration

### RTL Support
```typescript
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})
```

### Theme Definition
- **Primary Color**: #A0826D (Nude brown palette)
- **Secondary Color**: #F5E6D3 (Light cream)
- **Background**: #FDFBF7 (Warm white)
- **Direction**: RTL for Hebrew content
- **Typography**: Roboto font family

### Button RTL Fix
```typescript
MuiButton: {
  styleOverrides: {
    startIcon: {
      paddingLeft: '4px',
      marginRight: '0px !important',
    },
  },
}
```

## Story Structure

### File Naming Convention
- Stories are named with `.stories.tsx` extension
- Located alongside their components in `src/components/`
- Example: `RecipeCard.stories.tsx` for `RecipeCard.tsx`

### Story Template Structure
```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './ComponentName'

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Hebrew description of the component',
      },
    },
  },
  argTypes: {
    // Property descriptions in Hebrew
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>
```

## Available Stories

### RecipeCard Component (`src/components/RecipeCard.stories.tsx`)

#### Story Variants

1. **Default** - Standard recipe card with image
2. **WithoutImage** - Card without photo (shows placeholder)
3. **MainDish** - Main course recipe example
4. **VegetarianSalad** - Vegetarian recipe with appropriate tags
5. **LongContent** - Tests text truncation with long titles/descriptions
6. **QuickRecipe** - Fast preparation recipe (5 minutes)
7. **LargeServings** - Recipe for large events (25 servings)
8. **Interactive** - Demonstrates click interactions

#### Hebrew Content Examples
- Titles: "עוגת שוקולד של סבתא", "שניצל עוף בתנור"
- Descriptions: Full Hebrew descriptions with proper RTL formatting
- Categories: "קינוחים", "עיקריות", "סלטים", "משקאות"
- Tags: "פרווה", "בשרי", "צמחוני", "בריא", "מהיר"
- Authors: "סבתא רחל", "שף יוסי", "נועה הבריאותנית"

## Running Storybook

### Development Server
```bash
# Start Storybook development server
npm run storybook

# Access at http://localhost:6006
```

### Build Static Version
```bash
# Build static Storybook for deployment
npm run build-storybook

# Outputs to storybook-static/ directory
```

## Features

### Interactive Controls
- Real-time prop editing in the Controls panel
- Action logging for event handlers
- Viewport simulation for responsive testing

### Documentation
- Automatic prop documentation from TypeScript types
- Hebrew descriptions and examples
- Code snippets and usage examples
- Interactive component playground

### Accessibility
- Built-in accessibility testing with axe-core
- Keyboard navigation testing
- Screen reader compatibility checks

### Responsive Design
- Viewport addon for testing different screen sizes
- Mobile-first responsive breakpoints
- RTL layout verification across devices

## Writing Stories

### Best Practices

1. **Hebrew First**: All descriptions and examples in Hebrew
2. **RTL Testing**: Verify right-to-left layout in all stories
3. **Real Data**: Use realistic Hebrew recipe data
4. **Edge Cases**: Include stories for empty states, long content, errors
5. **Interactions**: Add click handlers and form interactions

### Story Categories
```typescript
title: 'Components/RecipeCard'     // UI Components
title: 'Forms/RecipeForm'         // Form Components
title: 'Layout/Header'            // Layout Components
title: 'Pages/Homepage'           // Page Components
```

### Parameter Examples
```typescript
parameters: {
  layout: 'centered',    // Center component in canvas
  layout: 'padded',      // Add padding around component
  layout: 'fullscreen',  // Full viewport
  docs: {
    description: {
      story: 'Hebrew description of this specific story variant',
    },
  },
}
```

## Advanced Features

### Component Testing
```typescript
import { userEvent, within } from '@storybook/test'

export const Interactive: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
  },
}
```

### Mock Data
Stories use realistic Hebrew recipe data from fixtures:
- Complete ingredient lists in Hebrew
- Step-by-step Hebrew instructions
- Authentic Israeli/Jewish recipe names
- Proper Hebrew typography and punctuation

### Theme Switching
Global toolbar allows switching between:
- 🇮🇱 Hebrew RTL theme
- 🇺🇸 English LTR theme (for comparison)

## Integration with Development

### Component Development Workflow
1. Create component with proper TypeScript types
2. Add data-testid attributes for testing
3. Write comprehensive stories covering all variants
4. Document props and usage in Hebrew
5. Test RTL layout and Hebrew text rendering

### Design System Documentation
Storybook serves as the single source of truth for:
- Component API documentation
- Visual design patterns
- Interaction behaviors
- Accessibility guidelines
- Hebrew content standards

## Deployment

### Static Build
```bash
npm run build-storybook
```

### Hosting Options
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Internal documentation servers

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Build Storybook
  run: npm run build-storybook

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./storybook-static
```

## Troubleshooting

### Common Issues

1. **RTL Styling Problems**
   - Verify emotion cache is properly configured
   - Check stylis RTL plugin setup
   - Ensure theme direction is set to 'rtl'

2. **Hebrew Font Rendering**
   - Confirm Roboto font includes Hebrew glyphs
   - Check font-family inheritance
   - Verify text direction CSS properties

3. **Component Import Errors**
   - Use correct import paths (relative to src/)
   - Ensure TypeScript types are properly exported
   - Check for missing dependencies

4. **Story Not Loading**
   - Verify story file naming convention
   - Check for syntax errors in story definition
   - Ensure component is properly imported

### Debug Mode
```bash
# Run with debug logging
DEBUG=storybook:* npm run storybook
```

## Future Enhancements

1. **Visual Regression Testing**: Add Chromatic integration
2. **Component Testing**: Expand interactive story testing
3. **Design Tokens**: Document color, spacing, typography tokens
4. **Animation Stories**: Showcase loading and transition states
5. **Form Validation**: Interactive form error state demonstrations
6. **Mobile Stories**: Device-specific component variants
7. **Dark Mode**: Hebrew dark theme support
8. **Localization**: Multiple Hebrew dialect support

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Next.js Integration](https://storybook.js.org/docs/react/get-started/nextjs)
- [Material-UI with Storybook](https://mui.com/material-ui/guides/interoperability/#storybook)
- [RTL Support Guide](https://mui.com/material-ui/guides/right-to-left/)
- [Hebrew Typography Best Practices](https://www.w3.org/International/articles/inline-bidi-markup/)