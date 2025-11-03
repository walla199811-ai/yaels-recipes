describe('Recipe CRUD Operations E2E Tests', () => {
  const testRecipe = {
    title: 'מתכון בדיקה',
    description: 'זהו מתכון לבדיקה של המערכת',
    category: 'DESSERT',
    prepTimeMinutes: 30,
    cookTimeMinutes: 45,
    servings: 6,
    ingredients: [
      { text: '2 כוסות קמח' },
      { text: '1 כוס סוכר' },
      { text: '3 ביצים' }
    ],
    instructions: [
      { text: 'לערבב את כל החומרים' },
      { text: 'לאפות ב-180 מעלות' },
      { text: 'להגיש קר' }
    ],
    tags: ['פרווה', 'קל להכנה'],
    createdBy: 'טסטר'
  }

  beforeEach(() => {
    // Reset database to known state
    // cy.resetDatabase() // TODO: Implement database reset command
    cy.visit('/')
  })

  it('should create a new recipe successfully', () => {
    // Navigate to create recipe page
    cy.get('[data-testid="add-recipe-button"]').click()
    cy.url().should('include', '/recipe/new')

    // Fill out the recipe form
    cy.get('[data-testid="recipe-title"]').type(testRecipe.title)
    cy.get('[data-testid="recipe-description"]').type(testRecipe.description)

    // Select category
    cy.get('[data-testid="recipe-category"]').click()
    cy.get(`[data-value="${testRecipe.category}"]`).click()

    // Fill time and servings
    cy.get('[data-testid="prep-time"]').clear().type(testRecipe.prepTimeMinutes.toString())
    cy.get('[data-testid="cook-time"]').clear().type(testRecipe.cookTimeMinutes.toString())
    cy.get('[data-testid="servings"]').clear().type(testRecipe.servings.toString())

    // Add ingredients
    testRecipe.ingredients.forEach((ingredient, index) => {
      if (index > 0) {
        cy.get('[data-testid="add-ingredient"]').click()
      }
      cy.get(`[data-testid="ingredient-${index}"]`).type(ingredient.text)
    })

    // Add instructions
    testRecipe.instructions.forEach((instruction, index) => {
      if (index > 0) {
        cy.get('[data-testid="add-instruction"]').click()
      }
      cy.get(`[data-testid="instruction-${index}"]`).type(instruction.text)
    })

    // Add tags
    cy.get('[data-testid="recipe-tags"]').type(testRecipe.tags.join(', '))

    // Add created by
    cy.get('[data-testid="created-by"]').type(testRecipe.createdBy)

    // Submit the form
    cy.get('[data-testid="submit-recipe"]').click()

    // Verify success
    cy.url().should('include', '/recipe/')
    cy.get('[data-testid="recipe-title"]').should('contain',testRecipe.title)

    // Verify all fields are displayed correctly
    cy.get('[data-testid="recipe-description"]').should('contain',testRecipe.description)
    cy.get('[data-testid="recipe-prep-time"]').should('contain', testRecipe.prepTimeMinutes)
    cy.get('[data-testid="recipe-cook-time"]').should('contain', testRecipe.cookTimeMinutes)
    cy.get('[data-testid="recipe-servings"]').should('contain', testRecipe.servings)
  })

  it('should edit an existing recipe', () => {
    // Create a test recipe first
    cy.createTestRecipe(testRecipe).then((response) => {
      const recipeId = response.body.id

      // Navigate to edit page
      cy.visit(`/recipe/${recipeId}/edit`)

      // Modify the recipe
      const updatedTitle = 'מתכון מעודכן'
      cy.get('[data-testid="recipe-title"]').clear().type(updatedTitle)

      // Submit the changes
      cy.get('[data-testid="submit-recipe"]').click()

      // Verify the update
      cy.url().should('include', `/recipe/${recipeId}`)
      cy.get('[data-testid="recipe-title"]').should('contain',updatedTitle)
    })
  })

  it('should delete a recipe', () => {
    // Create a test recipe first
    cy.createTestRecipe(testRecipe).then((response) => {
      const recipeId = response.body.id

      // Navigate to recipe details
      cy.visit(`/recipe/${recipeId}`)

      // Delete the recipe
      cy.get('[data-testid="delete-recipe-button"]').click()
      cy.get('[data-testid="confirm-delete"]').click()

      // Verify redirection to homepage
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      // Verify recipe is no longer in the list
      cy.get('[data-testid="recipe-card"]').should('not.contain', testRecipe.title)
    })
  })

  it('should handle form validation errors', () => {
    // Navigate to create recipe page
    cy.get('[data-testid="add-recipe-button"]').click()

    // Try to submit empty form
    cy.get('[data-testid="submit-recipe"]').click()

    // Verify validation errors are shown
    cy.get('[data-testid="title-error"]').should('be.visible')
    cy.get('[data-testid="category-error"]').should('be.visible')
    cy.get('[data-testid="ingredients-error"]').should('be.visible')
    cy.get('[data-testid="instructions-error"]').should('be.visible')
  })

  it('should preserve Hebrew text correctly during save and load', () => {
    const hebrewText = 'מתכון עם טקסט עברי מורכב: ״וְגַם־אֶת־הַדְּבָרִים הָאֵלֶּה״'

    // Create recipe with complex Hebrew text
    const complexHebrewRecipe = {
      ...testRecipe,
      title: hebrewText,
      description: 'תיאור עם ניקוד וסימנים מיוחדים',
      ingredients: [{ text: 'רכיב עם ״גרשיים״ ו׳גרש׳' }],
      instructions: [{ text: 'הוראה עם נקודות... ועוד!' }]
    }

    cy.createTestRecipe(complexHebrewRecipe).then((response) => {
      const recipeId = response.body.id

      // Visit the recipe page
      cy.visit(`/recipe/${recipeId}`)

      // Verify Hebrew text is preserved correctly
      cy.get('[data-testid="recipe-title"]').should('contain',hebrewText)
      cy.get('[data-testid="recipe-description"]').should('contain',complexHebrewRecipe.description)
    })
  })
})