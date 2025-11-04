'use client'

import { useState, useEffect } from 'react'

const FIRST_VISIT_KEY = 'yael-recipes-first-visit'

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if this is the first visit in this session
    const hasVisited = sessionStorage.getItem(FIRST_VISIT_KEY)
    setIsFirstVisit(!hasVisited)
    setIsLoading(false)
  }, [])

  const markAsVisited = () => {
    sessionStorage.setItem(FIRST_VISIT_KEY, 'true')
    setIsFirstVisit(false)
  }

  const resetFirstVisit = () => {
    sessionStorage.removeItem(FIRST_VISIT_KEY)
    setIsFirstVisit(true)
  }

  return {
    isFirstVisit,
    isLoading,
    markAsVisited,
    resetFirstVisit,
  }
}