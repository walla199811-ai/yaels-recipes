'use client'

import React, { useState, useEffect } from 'react'
import { Box, Typography, Fade, Zoom, Slide, useTheme, useMediaQuery } from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'

// Animation keyframes
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(1deg); }
  50% { transform: translateY(-5px) rotate(0deg); }
  75% { transform: translateY(-15px) rotate(-1deg); }
`

const shimmerAnimation = keyframes`
  0% { background-position: -1200px 0; }
  100% { background-position: 1200px 0; }
`

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(160, 130, 109, 0.3); }
  50% { box-shadow: 0 0 40px rgba(160, 130, 109, 0.6), 0 0 60px rgba(160, 130, 109, 0.4); }
`

// Styled components
const StartupContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #F5E6D3 0%, #E8D5C4 50%, #A0826D 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  padding: theme.spacing(4),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  }
}))

const FloatingImage = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'delay',
})<{ delay: number }>(({ delay, theme }) => ({
  width: '110px', // Larger mobile size for better visibility
  height: '110px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  animation: `${floatAnimation} 4s ease-in-out infinite`,
  animationDelay: `${delay}s`,
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 3px rgba(255, 255, 255, 0.7)',
  transition: 'transform 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
  },
  // Responsive sizes
  [theme.breakpoints.up('sm')]: {
    width: '120px',
    height: '120px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 0 0 4px rgba(255, 255, 255, 0.7)',
    '&:hover': {
      transform: 'scale(1.06)',
    },
  },
  [theme.breakpoints.up('md')]: {
    width: '140px',
    height: '140px',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.18), 0 0 0 4px rgba(255, 255, 255, 0.8)',
    '&:hover': {
      transform: 'scale(1.08)',
    },
  },
  [theme.breakpoints.up('lg')]: {
    width: '150px',
    height: '150px',
  },
}))

const ShimmerText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(90deg,
    ${theme.palette.primary.main} 0%,
    ${theme.palette.secondary.main} 25%,
    #ffffff 50%,
    ${theme.palette.secondary.main} 75%,
    ${theme.palette.primary.main} 100%)`,
  backgroundSize: '1200px 100%',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  animation: `${shimmerAnimation} 3s ease-in-out infinite`,
  fontWeight: 700,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}))

const StaticContainer = styled(Box)(() => ({
  borderRadius: '20px',
  padding: '2rem',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 0 20px rgba(160, 130, 109, 0.3)',
}))

const images = [
  {
    src: '/images/startup/image1.jpg',
    alt: 'תמונה משפחתית 1',
    mobilePosition: { top: '8%', left: '5%' },
    desktopPosition: { top: '15%', left: '15%' }
  },
  {
    src: '/images/startup/image2.jpg',
    alt: 'תמונה משפחתית 2',
    mobilePosition: { top: '10%', right: '5%' },
    desktopPosition: { top: '20%', right: '20%' }
  },
  {
    src: '/images/startup/image3.jpg',
    alt: 'תמונה משפחתית 3',
    mobilePosition: { bottom: '8%', left: '5%' },
    desktopPosition: { bottom: '25%', left: '10%' }
  },
  {
    src: '/images/startup/image4.jpg',
    alt: 'תמונה משפחתית 4',
    mobilePosition: { bottom: '6%', right: '5%' },
    desktopPosition: { bottom: '20%', right: '15%' }
  },
]

interface StartupPageProps {
  onEnter: () => void
}

export const StartupPage: React.FC<StartupPageProps> = ({ onEnter }) => {
  const [showTitle, setShowTitle] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showImages, setShowImages] = useState(false)
  const [showDedication, setShowDedication] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowImages(true), 300),
      setTimeout(() => setShowTitle(true), 800),
      setTimeout(() => setShowSubtitle(true), 1300),
      setTimeout(() => setShowDedication(true), 1800),
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleClick = () => {
    onEnter()
  }

  return (
    <StartupContainer onClick={handleClick}>
      {/* Floating Recipe Images */}
      {images.map((image, index) => {
        const position = isMobile ? image.mobilePosition : image.desktopPosition
        return (
          <Zoom
            key={index}
            in={showImages}
            timeout={600}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            <FloatingImage
              delay={index * 0.5}
              sx={{
                position: 'absolute',
                ...position,
              }}
            >
              <img src={image.src} alt={image.alt} />
            </FloatingImage>
          </Zoom>
        )
      })}

      {/* Main Content */}
      <StaticContainer>
        <Box textAlign="center">
          {/* Main Title */}
          <Fade in={showTitle} timeout={1000}>
            <Box>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  mb: 2,
                  lineHeight: 1.2,
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                המתכונים של יעל
              </Typography>
            </Box>
          </Fade>

          {/* Subtitle */}
          <Slide direction="up" in={showSubtitle} timeout={800}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                color: 'rgba(0, 0, 0, 0.7)',
                mb: 4,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 400,
              }}
            >
              אוסף מתכונים יקרים של המשפחה
            </Typography>
          </Slide>

          {/* Dedication */}
          <Fade in={showDedication} timeout={1200}>
            <Box
              sx={{
                maxWidth: '600px',
                mx: 'auto',
                p: 3,
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(0, 0, 0, 0.8)',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  mb: 2,
                }}
              >
                לורם איפסום דולור סיט אמט, קונסקטטור אדיפיסינג אלית גילם מבוסטר טרום
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontSize: '0.9rem',
                }}
              >
                טקסט מעולה פיטום בפרון לפרגום סיטו דיפרעש, כאמיר סנון שיבר עלסטמי
              </Typography>
            </Box>
          </Fade>

          {/* Click hint */}
          <Fade in={showDedication} timeout={1000} style={{ transitionDelay: '500ms' }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 4,
                color: 'rgba(0, 0, 0, 0.5)',
                fontSize: '0.8rem',
              }}
            >
              לחצו בכל מקום כדי להמשיך
            </Typography>
          </Fade>
        </Box>
      </StaticContainer>
    </StartupContainer>
  )
}