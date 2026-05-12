'use client'

import * as React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorBoundaryProps {
  /** Optional label shown in the fallback ("section X failed"). */
  label?: string
  /** Custom fallback renderer. Receives the caught error and a `reset` callback. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Per-section error containment. A 404 on `/reports/{id}/trades` fails that section,
 * not the entire page. The dashboard runs against a backend that can be killed at any
 * time — every chart and table is wrapped in one of these per the spec.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', this.props.label ?? 'section', error, info)
    }
  }

  private reset = () => this.setState({ error: null })

  override render() {
    const { error } = this.state
    if (error) {
      if (this.props.fallback) return this.props.fallback(error, this.reset)
      return (
        <Alert variant="destructive" className="bg-negative-soft text-negative border-transparent">
          <AlertTitle className="text-sm font-medium">
            {this.props.label ? `${this.props.label} failed` : 'Section failed'}
          </AlertTitle>
          <AlertDescription className="text-xs font-mono">{error.message}</AlertDescription>
        </Alert>
      )
    }
    return this.props.children
  }
}
