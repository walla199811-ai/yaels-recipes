'use client'

import React, { useState, useRef, useCallback } from 'react'
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardActions,
} from '@mui/material'
import {
  CloudUpload,
  PhotoCamera,
  Delete,
  Edit,
  DragIndicator,
} from '@mui/icons-material'

interface PhotoUploadProps {
  value?: string
  onChange: (photoUrl: string | null) => void
  maxSizeMB?: number
  acceptedFormats?: string[]
  disabled?: boolean
}

export function PhotoUpload({
  value,
  onChange,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  disabled = false,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `סוג קובץ לא נתמך. אנא בחרו: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `גודל הקובץ חורג מ-${maxSizeMB}MB`
    }

    return null
  }, [acceptedFormats, maxSizeMB])

  const processFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
      }
      reader.readAsDataURL(file)

      // In a real app, you would upload to Cloudinary here
      // For now, we'll simulate upload and use the data URL
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate upload time

      // Convert to data URL for now (in production, this would be the Cloudinary URL)
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      onChange(dataUrl)
    } catch (error) {
      console.error('Upload failed:', error)
      setError('העלאת התמונה נכשלה. אנא נסו שוב.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }, [validateFile, onChange])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)

    const file = event.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }, [])

  const handleDelete = () => {
    setPreview(null)
    onChange(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (preview) {
    return (
      <Card sx={{ maxWidth: 400, mx: 'auto' }}>
        <CardMedia
          component="img"
          height="250"
          image={preview}
          alt="תמונת מתכון"
          sx={{ objectFit: 'cover' }}
        />
        <CardActions sx={{ justifyContent: 'space-between' }}>
          <Button
            startIcon={<Edit />}
            onClick={openFileDialog}
            disabled={disabled || uploading}
            size="small"
          >
            החלף תמונה
          </Button>
          <IconButton
            onClick={handleDelete}
            disabled={disabled || uploading}
            color="error"
            size="small"
          >
            <Delete />
          </IconButton>
        </CardActions>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          disabled={disabled}
        />
      </Card>
    )
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
      <Paper
        elevation={dragOver ? 8 : 1}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          p: 4,
          textAlign: 'center',
          border: dragOver ? '2px dashed' : '2px dashed transparent',
          borderColor: dragOver ? 'primary.main' : 'grey.300',
          backgroundColor: dragOver ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
        onClick={!disabled && !uploading ? openFileDialog : undefined}
      >
        {uploading ? (
          <>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary">
              מעלה תמונה...
            </Typography>
          </>
        ) : (
          <>
            <DragIndicator sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6" gutterBottom>
              העלו תמונה למתכון
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              גררו תמונה לכאן או לחצו לבחירת קובץ
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                disabled={disabled}
              >
                בחרו קובץ
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  // In a real app, this would open camera
                  openFileDialog()
                }}
              >
                מצלמה
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              פורמטים נתמכים: JPEG, PNG, WebP | גודל מקסימלי: {maxSizeMB}MB
            </Typography>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          disabled={disabled}
        />
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}