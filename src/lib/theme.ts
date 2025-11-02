'use client'

import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#A0826D', // Warm nude brown
      light: '#C4A484',
      dark: '#8B6F47',
    },
    secondary: {
      main: '#D4B5A0', // Soft nude pink
      light: '#E8C7B3',
      dark: '#B8956F',
    },
    background: {
      default: '#FAF7F4', // Warm off-white
      paper: '#FFFFFF',
    },
    text: {
      primary: '#5D4E37', // Dark nude brown for text
      secondary: '#8B7355',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      marginBottom: '1rem',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      marginBottom: '0.5rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px 0 rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 12px',
          '& .MuiButton-startIcon': {
            marginLeft: 0,
            marginRight: '8px',
          },
          '& .MuiButton-endIcon': {
            marginLeft: '8px',
            marginRight: 0,
          },
        },
        sizeSmall: {
          padding: '6px 8px',
          '& .MuiButton-startIcon': {
            marginLeft: 0,
            marginRight: '6px',
          },
          '& .MuiButton-endIcon': {
            marginLeft: '6px',
            marginRight: 0,
          },
        },
        sizeLarge: {
          padding: '12px 16px',
          '& .MuiButton-startIcon': {
            marginLeft: 0,
            marginRight: '12px',
          },
          '& .MuiButton-endIcon': {
            marginLeft: '12px',
            marginRight: 0,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
          '& .MuiInputLabel-root': {
            left: '8px !important',
            right: 'auto !important',
            transformOrigin: 'top left !important',
            '&.MuiInputLabel-outlined': {
              left: '8px !important',
              right: 'auto !important',
            },
            '&.MuiInputLabel-shrink': {
              left: '8px !important',
              transform: 'translate(8px, -9px) scale(0.75) !important',
            },
          },
          '& input': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            paddingRight: '14px !important',
            paddingLeft: '14px !important',
          },
          '& textarea': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            paddingRight: '14px !important',
            paddingLeft: '14px !important',
          },
          '& .MuiOutlinedInput-input': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            paddingRight: '14px !important',
            paddingLeft: '14px !important',
          },
          '& input::placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            opacity: 0.6,
          },
          '& input::-webkit-input-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            opacity: 0.6,
          },
          '& input::-moz-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            opacity: 0.6,
          },
          '& input:-ms-input-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            opacity: 0.6,
          },
          '& textarea::placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            opacity: 0.6,
          },
          '& textarea::-webkit-input-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            opacity: 0.6,
          },
          '& textarea::-moz-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            opacity: 0.6,
          },
          '& textarea:-ms-input-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            opacity: 0.6,
          },
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          '&.MuiInputAdornment-positionStart': {
            marginLeft: '6px',
            marginRight: 0,
          },
          '&.MuiInputAdornment-positionEnd': {
            marginLeft: 0,
            marginRight: '6px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '& .MuiSelect-select': {
            textAlign: 'right !important',
            direction: 'rtl !important',
            paddingRight: '14px !important',
            paddingLeft: '32px !important',
          },
          '& .MuiSelect-icon': {
            left: '8px !important',
            right: 'auto !important',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            left: '8px !important',
            right: 'auto !important',
            transformOrigin: 'top left !important',
            '&.MuiInputLabel-outlined': {
              left: '8px !important',
              right: 'auto !important',
            },
            '&.MuiInputLabel-shrink': {
              left: '8px !important',
              transform: 'translate(8px, -9px) scale(0.75) !important',
            },
          },
          '& .MuiOutlinedInput-input': {
            textAlign: 'right !important',
            direction: 'rtl !important',
          },
          '& .MuiSelect-select': {
            textAlign: 'right !important',
            direction: 'rtl !important',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          marginLeft: '16px',
          marginRight: '16px',
          width: 'calc(100% - 32px)',
          padding: '13px 0',
        },
        markLabel: {
          fontSize: '0.75rem',
          whiteSpace: 'nowrap',
        },
        rail: {
          opacity: 0.38,
        },
        track: {
          border: 'none',
        },
        thumb: {
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0px 0px 0px 8px rgba(160, 130, 109, 0.16)',
          },
          '&.Mui-active': {
            boxShadow: '0px 0px 0px 14px rgba(160, 130, 109, 0.16)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '& .MuiChip-icon': {
            marginRight: '8px',
            marginLeft: '-4px',
          },
          '& .MuiChip-deleteIcon': {
            marginLeft: '8px',
            marginRight: '-4px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '8px',
          margin: '0 4px',
          '& + *': {
            marginRight: '8px',
          },
        },
        sizeSmall: {
          padding: '4px',
          margin: '0 2px',
        },
        sizeLarge: {
          padding: '12px',
          margin: '0 6px',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          '& .MuiSvgIcon-root': {
            fontSize: '1.5rem',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          '&::placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
          },
          '&::-webkit-input-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
          },
          '&::-moz-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
          },
          '&:-ms-input-placeholder': {
            textAlign: 'right !important',
            direction: 'rtl !important',
          },
        },
      },
    },
  },
})