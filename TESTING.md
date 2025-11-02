# Testing Guide for Yael's Recipes

This document provides comprehensive information about the testing setup and practices for the Yael's Recipes application.

## Testing Stack

- **E2E Testing**: Cypress 15.5.0 with Next.js integration
- **Component Testing**: Cypress with React 18 support
- **Test Data**: JSON fixtures with Hebrew recipe samples
- **Browser Testing**: Headless Chrome and Electron support

## Directory Structure

```
cypress/
├── e2e/                    # End-to-end tests
│   ├── homepage.cy.ts      # Homepage functionality tests
│   └── recipe-crud.cy.ts   # Recipe CRUD operations tests
├── component/              # Component tests
│   └── RecipeCard.cy.tsx  # RecipeCard component tests
├── fixtures/              # Test data
│   └── recipes.json       # Sample Hebrew recipes for testing
└── support/               # Support files
    ├── commands.ts        # Custom Cypress commands
    ├── component.ts       # Component testing setup
    ├── e2e.ts            # E2E testing setup
    └── component-index.html # HTML template for component tests
```

## Configuration

### Cypress Configuration (`cypress.config.ts`)

- **E2E Tests**: Run against localhost:3000
- **Component Tests**: Use Next.js webpack dev server
- **RTL Support**: Hebrew right-to-left layout testing
- **Screenshots**: Enabled on test failure
- **Timeouts**: Configured for reliable testing

### Key Features

1. **Hebrew RTL Testing**: Custom commands for Hebrew text input and RTL layout verification
2. **Material-UI Integration**: Complete theme provider setup with RTL cache
3. **React Query**: Proper query client configuration for component tests
4. **Custom Commands**: Hebrew-specific testing utilities

## Running Tests

### E2E Tests
```bash
# Open Cypress UI for E2E tests
npm run test

# Run E2E tests headlessly
npm run test:headless

# Run specific E2E test
npx cypress run --spec "cypress/e2e/homepage.cy.ts"
```

### Component Tests
```bash
# Open Cypress UI for component tests
npx cypress open --component

# Run component tests headlessly
npx cypress run --component

# Run specific component test
npx cypress run --component --spec "cypress/component/RecipeCard.cy.tsx"
```

## Test Coverage

### E2E Tests (`cypress/e2e/`)

#### Homepage Tests (`homepage.cy.ts`)
- ✅ Hebrew RTL layout verification
- ✅ Recipe search functionality
- ✅ Category filtering
- ✅ Recipe card navigation
- ✅ Empty search results handling

#### Recipe CRUD Tests (`recipe-crud.cy.ts`)
- ✅ Recipe creation with Hebrew text
- ✅ Recipe editing and updates
- ✅ Recipe deletion
- ✅ Form validation errors
- ✅ Hebrew text preservation

### Component Tests (`cypress/component/`)

#### RecipeCard Component (`RecipeCard.cy.tsx`)
- ✅ Recipe information display
- ✅ Hebrew tag rendering
- ✅ Click navigation events
- ✅ Missing photo handling
- ✅ RTL text formatting
- ✅ Long text truncation
- ✅ Image placeholder logic

## Custom Commands

### Hebrew-Specific Commands
```typescript
// Type Hebrew text with proper delay
cy.typeHebrew('מתכון טסט')

// Verify Hebrew content
cy.shouldContainHebrew('מתכון טסט')

// Check RTL layout
cy.shouldBeRTL()

// Verify RTL page layout
cy.checkRTLLayout()
```

### Test Data Commands
```typescript
// Reset database to known state
cy.resetDatabase()

// Create test recipe
cy.createTestRecipe(recipeData)

// Wait for recipe loading
cy.waitForRecipeLoad()
```

## Test Data

### Sample Recipes (`cypress/fixtures/recipes.json`)

The fixture file contains three comprehensive Hebrew recipe examples:

1. **עוגת שוקולד של סבתא** - Dessert category
2. **שניצל עוף בתנור** - Main dish category
3. **סלט קינואה עם ירקות** - Salad category

Each recipe includes:
- Hebrew title and description
- Cooking times and servings
- Detailed Hebrew ingredients list
- Step-by-step Hebrew instructions
- Appropriate Hebrew tags
- Created by attribution

## Component Testing Setup

### Provider Wrapper
Components are automatically wrapped with:
- Material-UI Theme Provider (RTL configured)
- Emotion Cache Provider (RTL styling)
- React Query Client
- CSS Baseline
- RTL direction container

### RTL Configuration
```typescript
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})
```

## Best Practices

### Writing Tests
1. **Use data-testid attributes** for reliable element selection
2. **Test Hebrew text handling** explicitly
3. **Verify RTL layout** in all UI tests
4. **Mock external dependencies** appropriately
5. **Use fixtures** for consistent test data

### Hebrew Testing
1. **Include diacritics and special characters** in test strings
2. **Test text truncation** with long Hebrew content
3. **Verify text direction** (RTL) in assertions
4. **Test search and filtering** with Hebrew terms

### Error Handling
1. **Test form validation** with Hebrew error messages
2. **Test empty states** with Hebrew messaging
3. **Test loading states** and error boundaries
4. **Test network failures** gracefully

## Troubleshooting

### Common Issues

1. **Component mounting errors**: Ensure all providers are configured
2. **Hebrew text rendering**: Check RTL cache and theme setup
3. **Navigation tests**: Mock Next.js router appropriately
4. **Database tests**: Reset state between tests

### Debug Commands
```bash
# Run with debug output
DEBUG=cypress:* npm run test

# Open DevTools in test browser
cy.debug()

# Pause test execution
cy.pause()
```

## Future Enhancements

1. **Visual Regression Testing**: Add screenshot comparison tests
2. **Performance Testing**: Add Lighthouse CI integration
3. **Accessibility Testing**: Add axe-core integration
4. **Mobile Testing**: Add viewport testing for mobile layouts
5. **Email Testing**: Add email notification verification
6. **Temporal Testing**: Add workflow testing integration

## Integration with CI/CD

The test setup is ready for CI/CD integration with:
- Headless browser execution
- Screenshot capture on failures
- Configurable timeouts
- Environment variable support
- Parallel test execution capabilities

Configure your CI pipeline to run:
```bash
npm run test:headless  # E2E tests
npx cypress run --component  # Component tests
```