import { Global, css } from '@emotion/react'
import { useTheme } from '@mui/material/styles'

/**
 * PrintStyles component provides CSS styles specifically for printing recipe pages.
 * It hides navigation elements, optimizes layout for print, and ensures proper RTL Hebrew text rendering.
 */
export const PrintStyles = () => {
  const theme = useTheme()

  return (
    <Global
      styles={css`
        @media print {
          /* Hide elements that shouldn't be printed */
          .no-print,
          .print-hide,
          button,
          .MuiButton-root,
          .MuiIconButton-root,
          nav,
          .navigation,
          .header-actions,
          .back-button,
          .edit-button,
          .delete-button {
            display: none !important;
          }

          /* Reset page margins and background */
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            color: black !important;
            font-size: 12pt;
            line-height: 1.4;
          }

          /* Container adjustments for print */
          .MuiContainer-root {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Recipe content layout */
          .recipe-print-container {
            padding: 20pt;
            width: 100%;
            box-sizing: border-box;
          }

          /* Title styling */
          .recipe-title {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 16pt;
            text-align: center;
            color: black !important;
            page-break-after: avoid;
          }

          /* Recipe image */
          .recipe-image {
            max-width: 100%;
            height: auto;
            max-height: 300pt;
            object-fit: contain;
            display: block;
            margin: 0 auto 16pt auto;
            page-break-after: avoid;
          }

          /* Description and details */
          .recipe-description,
          .recipe-details {
            margin-bottom: 16pt;
            page-break-inside: avoid;
          }

          .recipe-details h6 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 8pt;
            color: black !important;
          }

          .recipe-details p,
          .recipe-details div {
            font-size: 11pt;
            margin-bottom: 4pt;
            color: black !important;
          }

          /* Tags */
          .recipe-tags {
            margin-bottom: 16pt;
            page-break-inside: avoid;
          }

          .recipe-tags .MuiChip-root {
            background: #f0f0f0 !important;
            color: black !important;
            border: 1px solid #ccc !important;
            margin: 2pt;
            font-size: 9pt !important;
          }

          /* Ingredients and Instructions sections */
          .ingredients-section,
          .instructions-section {
            page-break-inside: avoid;
            margin-bottom: 20pt;
          }

          .ingredients-section h5,
          .instructions-section h5 {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 12pt;
            color: black !important;
            border-bottom: 1pt solid #ccc;
            padding-bottom: 4pt;
          }

          /* Lists */
          .recipe-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .recipe-list-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8pt;
            page-break-inside: avoid;
          }

          /* Avatar/number styling for print */
          .recipe-list-item .MuiAvatar-root {
            width: 20pt !important;
            height: 20pt !important;
            font-size: 9pt !important;
            background: #666 !important;
            color: white !important;
            margin-left: 8pt;
            margin-top: 2pt;
            flex-shrink: 0;
          }

          .recipe-list-item .MuiListItemText-root {
            margin: 0;
            padding-right: 0 !important;
          }

          .recipe-list-item .MuiListItemText-primary {
            font-size: 11pt !important;
            line-height: 1.4 !important;
            color: black !important;
            text-align: right;
            direction: rtl;
          }

          /* Paper/Card backgrounds */
          .MuiPaper-root,
          .MuiCard-root {
            background: white !important;
            box-shadow: none !important;
            border: 1pt solid #ddd !important;
            margin-bottom: 12pt;
          }

          /* Grid adjustments */
          .MuiGrid-container {
            margin: 0 !important;
            width: 100% !important;
          }

          .MuiGrid-item {
            padding: 0 !important;
            margin-bottom: 16pt;
          }

          /* Responsive grid for print */
          @media print and (max-width: 8.5in) {
            .ingredients-section,
            .instructions-section {
              width: 100% !important;
              max-width: none !important;
            }
          }

          /* Two-column layout for larger prints */
          @media print and (min-width: 8.5in) {
            .ingredients-instructions-container {
              display: flex;
              gap: 20pt;
            }

            .ingredients-section,
            .instructions-section {
              flex: 1;
            }
          }

          /* RTL text alignment fixes */
          * {
            direction: rtl;
            text-align: right;
          }

          /* Page breaks */
          .page-break-before {
            page-break-before: always;
          }

          .page-break-after {
            page-break-after: always;
          }

          .page-break-inside-avoid {
            page-break-inside: avoid;
          }

          /* Print header */
          .print-header {
            display: block !important;
            text-align: center;
            font-size: 10pt;
            color: #666 !important;
            margin-bottom: 16pt;
            border-bottom: 1pt solid #ccc;
            padding-bottom: 8pt;
          }

          /* Ensure proper spacing */
          .MuiBox-root {
            margin: 0 !important;
            padding: 8pt !important;
          }

          /* Remove any Material-UI spacing that interferes with print */
          .MuiContainer-root .MuiBox-root:first-of-type {
            padding-top: 0 !important;
          }
        }
      `}
    />
  )
}