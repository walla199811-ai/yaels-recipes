describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the homepage with Hebrew RTL layout', () => {
    // Check RTL layout
    cy.checkRTLLayout()

    // Check that the page loads correctly
    cy.get('h1').should('be.visible')
    cy.get('h1').should('contain', 'מתכונים של יעל')

    // Check that the search functionality is visible
    cy.get('[data-testid="search-input"]').should('be.visible')

    // Check that recipe cards are displayed
    cy.get('[data-testid="recipe-card"]').should('have.length.greaterThan', 0)
  })

  it('should be able to search for recipes in Hebrew', () => {
    const searchTerm = 'עוגה'

    cy.get('[data-testid="search-input"]')
      .type(searchTerm)
      .should('have.value', searchTerm)

    // Wait for search results
    cy.wait(500)

    // Verify search results contain the search term
    cy.get('[data-testid="recipe-card"]').each(($card) => {
      cy.wrap($card).should('contain', searchTerm)
    })
  })

  it('should be able to filter recipes by category', () => {
    // Open category filter
    cy.get('[data-testid="category-filter"]').click()

    // Select a category
    cy.get('[data-value="עיקריות"]').click()

    // Wait for filter to apply
    cy.wait(500)

    // Verify that only main dishes are shown
    cy.get('[data-testid="recipe-card"]').each(($card) => {
      cy.wrap($card).find('[data-testid="recipe-category"]').should('contain', 'עיקריות')
    })
  })

  it('should navigate to recipe details when clicking on a recipe card', () => {
    // Click on the first recipe card
    cy.get('[data-testid="recipe-card"]').first().click()

    // Verify navigation to recipe details page
    cy.url().should('include', '/recipe/')

    // Wait for recipe to load
    cy.waitForRecipeLoad()

    // Verify recipe details are displayed
    cy.get('[data-testid="recipe-title"]').should('be.visible')
    cy.get('[data-testid="recipe-ingredients"]').should('be.visible')
    cy.get('[data-testid="recipe-instructions"]').should('be.visible')
  })

  it('should handle empty search results gracefully', () => {
    const nonExistentSearchTerm = 'בלהבלהבלה'

    cy.get('[data-testid="search-input"]').type(nonExistentSearchTerm)

    // Wait for search to complete
    cy.wait(500)

    // Verify empty state is shown
    cy.get('[data-testid="no-recipes-found"]').should('be.visible')
    cy.get('[data-testid="no-recipes-found"]').should('contain', 'לא נמצאו מתכונים')
  })
})