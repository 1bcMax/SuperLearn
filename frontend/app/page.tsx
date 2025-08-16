"use client"

import { ErrorBoundary } from "react-error-boundary"
import { LearningFlow } from "@/components/learning-flow"

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">Please refresh the page to try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <LearningFlow />
    </ErrorBoundary>
  )
}
