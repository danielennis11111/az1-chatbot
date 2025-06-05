'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AssessmentProgressProps {
  currentStep: number
  totalSteps: number
  title?: string
  className?: string
}

export function AssessmentProgress({ 
  currentStep, 
  totalSteps, 
  title = "Digital Skills Assessment",
  className 
}: AssessmentProgressProps) {
  const progress = Math.round((currentStep / totalSteps) * 100)
  const isComplete = currentStep > totalSteps

  return (
    <div className={cn("w-full max-w-2xl mx-auto mb-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {title}
        </h1>
        <span className="text-sm text-gray-600">
          {isComplete ? totalSteps : Math.min(currentStep, totalSteps)} of {totalSteps}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          {/* Progress Fill */}
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              isComplete 
                ? "bg-green-500" 
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mt-3">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1
            const isCurrentStep = stepNumber === currentStep
            const isPastStep = stepNumber < currentStep
            const isCompleted = isComplete && stepNumber === totalSteps

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    isPastStep || isCompleted
                      ? "bg-blue-500 text-white shadow-lg"
                      : isCurrentStep
                        ? "bg-blue-100 text-blue-700 border-2 border-blue-500 shadow-md"
                        : "bg-gray-200 text-gray-500"
                  )}
                >
                  {isPastStep || isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step Label - Only show for mobile breakpoint */}
                <span className={cn(
                  "text-xs mt-1 text-center hidden sm:block",
                  isPastStep || isCompleted
                    ? "text-blue-600 font-medium"
                    : isCurrentStep
                      ? "text-blue-700 font-medium"
                      : "text-gray-500"
                )}>
                  {stepNumber}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="text-center mt-4">
        <span className={cn(
          "text-sm font-medium",
          isComplete ? "text-green-600" : "text-blue-600"
        )}>
          {isComplete ? "Complete!" : `${progress}% Complete`}
        </span>
      </div>
    </div>
  )
} 