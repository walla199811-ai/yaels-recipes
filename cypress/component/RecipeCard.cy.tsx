import { RecipeCard } from '../../src/components/RecipeCard'
import { Recipe } from '../../src/types/recipe'

describe('RecipeCard Component Tests', () => {
  const mockRecipe: Recipe = {
    id: '1',
    title: 'עוגת שוקולד',
    description: 'עוגת שוקולד טעימה ופשוטה להכנה',
    category: 'קינוחים',
    prepTimeMinutes: 20,
    cookTimeMinutes: 40,
    servings: 8,
    ingredients: [
      { order: 1, text: '2 כוסות קמח' },
      { order: 2, text: '1 כוס סוכר' },
      { order: 3, text: '3 ביצים' }
    ],
    instructions: [
      { step: 1, text: 'לערבב את החומרים הרטובים' },
      { step: 2, text: 'להוסיף את החומרים היבשים' },
      { step: 3, text: 'לאפות ב-180 מעלות' }
    ],
    tags: ['פרווה', 'קל להכנה'],
    photoUrl: null,
    createdBy: 'יעל',
    lastModifiedBy: 'יעל',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }

  beforeEach(() => {
    // Mount component with all necessary providers
    cy.mountWithProviders(<RecipeCard recipe={mockRecipe} />)
  })

  it('should render recipe information correctly', () => {
    // Check recipe title
    cy.get('[data-testid="recipe-title"]')
      .should('be.visible')
      .and('contain', mockRecipe.title)

    // Check recipe description
    cy.get('[data-testid="recipe-description"]')
      .should('be.visible')
      .and('contain', mockRecipe.description)

    // Check category
    cy.get('[data-testid="recipe-category"]')
      .should('be.visible')
      .and('contain', mockRecipe.category)

    // Check cooking times
    cy.get('[data-testid="prep-time"]')
      .should('be.visible')
      .and('contain', mockRecipe.prepTimeMinutes)

    cy.get('[data-testid="cook-time"]')
      .should('be.visible')
      .and('contain', mockRecipe.cookTimeMinutes)

    // Check servings
    cy.get('[data-testid="servings"]')
      .should('be.visible')
      .and('contain', mockRecipe.servings)
  })

  it('should display tags correctly', () => {
    mockRecipe.tags.forEach((tag) => {
      cy.get('[data-testid="recipe-tags"]')
        .should('contain', tag)
    })
  })

  it('should be clickable and emit navigation events', () => {
    // Add click handler to test navigation
    cy.window().then((win) => {
      win.navigation = { navigate: cy.stub().as('navigate') }
    })

    cy.get('[data-testid="recipe-card"]').click()

    // Verify navigation was called with correct recipe ID
    cy.get('@navigate').should('have.been.calledWith', `/recipe/${mockRecipe.id}`)
  })

  it('should handle missing photo gracefully', () => {
    // Recipe already has null photoUrl
    cy.get('[data-testid="recipe-image"]')
      .should('have.attr', 'src')
      .and('include', 'placeholder') // Should show placeholder image
  })

  it('should display Hebrew text with correct RTL formatting', () => {
    // Check RTL direction
    cy.get('[data-testid="recipe-card"]').shouldBeRTL()

    // Check Hebrew text alignment
    cy.get('[data-testid="recipe-title"]')
      .should('have.css', 'text-align', 'right')

    cy.get('[data-testid="recipe-description"]')
      .should('have.css', 'direction', 'rtl')
  })

  it('should show created by information', () => {
    cy.get('[data-testid="created-by"]')
      .should('be.visible')
      .and('contain', `נוצר על ידי ${mockRecipe.createdBy}`)
  })

  it('should handle long titles and descriptions gracefully', () => {
    const longTextRecipe: Recipe = {
      ...mockRecipe,
      title: 'עוגת שוקולד מיוחדת עם קרם וניל ופירות יער וקצפת והרבה הרבה טקסט נוסף כדי לבדוק איך המערכת מתמודדת עם כותרות ארוכות מאוד',
      description: 'זהו תיאור מאוד מאוד ארוך של המתכון הזה, שמכיל המון מילים ופרטים על איך להכין את העוגה הטעימה הזו עם שוקולד מעולה וקרם וניל מתוק ופירות יער טריים וקצפת אמיתית וכל מיני טעמים נפלאים שיגרמו לכם להרגיש בגן עדן'
    }

    cy.mountWithProviders(<RecipeCard recipe={longTextRecipe} />)

    // Check that long text is handled properly (truncated or wrapped)
    cy.get('[data-testid="recipe-title"]')
      .should('be.visible')
      .and('have.css', 'text-overflow', 'ellipsis')

    cy.get('[data-testid="recipe-description"]')
      .should('be.visible')
      .invoke('height')
      .should('be.lessThan', 200) // Should not be too tall
  })

  it('should show placeholder when recipe has no image', () => {
    const noImageRecipe: Recipe = {
      ...mockRecipe,
      photoUrl: null
    }

    cy.mountWithProviders(<RecipeCard recipe={noImageRecipe} />)

    cy.get('[data-testid="recipe-image"]')
      .should('have.attr', 'alt', 'מתכון ללא תמונה')
  })

  it('should show actual image when recipe has photoUrl', () => {
    const imageRecipe: Recipe = {
      ...mockRecipe,
      photoUrl: 'https://example.com/chocolate-cake.jpg'
    }

    cy.mountWithProviders(<RecipeCard recipe={imageRecipe} />)

    cy.get('[data-testid="recipe-image"]')
      .should('have.attr', 'src', imageRecipe.photoUrl)
      .should('have.attr', 'alt', imageRecipe.title)
  })
})