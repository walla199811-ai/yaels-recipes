import React from 'react'
import type { Preview } from '@storybook/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'

// Create RTL cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})

// Create theme with RTL support
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
    background: {
      default: '#FDFBF7',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        startIcon: {
          paddingLeft: '4px',
          marginRight: '0px !important',
        },
      },
    },
  },
})

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      story: {
        inline: true,
      },
    },
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div dir="rtl" style={{ fontFamily: theme.typography.fontFamily }}>
            <Story />
          </div>
        </ThemeProvider>
      </CacheProvider>
    ),
  ],
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'rtl',
      toolbar: {
        title: 'Theme',
        icon: 'globe',
        items: [
          { value: 'rtl', right: '🇮🇱', title: 'Hebrew RTL' },
          { value: 'ltr', right: '🇺🇸', title: 'English LTR' },
        ],
      },
    },
  },
}

export default preview