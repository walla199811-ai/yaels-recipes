// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your component test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import { mount } from '@cypress/react18'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import React from 'react'

// Create RTL cache for component testing
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})

// Create theme for component testing
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#A0826D',
      light: '#C9A876',
      dark: '#8B6F47',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F5E6D3',
      light: '#F8EDE1',
      dark: '#E4C9A6',
      contrastText: '#333333',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      mountWithProviders(component: React.ReactElement, options?: any): Chainable<any>
    }
  }
}

Cypress.Commands.add('mount', mount)

// Custom mount command that includes all necessary providers
Cypress.Commands.add('mountWithProviders', (component, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  const wrappedComponent = (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <div dir="rtl" style={{ fontFamily: theme.typography.fontFamily }}>
            {component}
          </div>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  )

  return cy.mount(wrappedComponent, options)
})

// Example use:
// cy.mountWithProviders(<MyComponent />)