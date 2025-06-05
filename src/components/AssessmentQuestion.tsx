'use client'

import React, { useState } from 'react'
import { AssessmentQuestion, AssessmentOption } from '@/types/chat'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline'

interface AssessmentQuestionProps {
  question: AssessmentQuestion
  onAnswer: (answer: string | string[]) => void
  isLoading?: boolean
  className?: string
}

export function AssessmentQuestionComponent({ 
  question, 
  onAnswer, 
  isLoading = false,
  className 
}: AssessmentQuestionProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasAnswered, setHasAnswered] = useState(false)

  const handleOptionSelect = (optionValue: string) => {
    if (isLoading || hasAnswered) return

    let newSelection: string[]

    if (question.type === 'single-choice') {
      newSelection = [optionValue]
      setSelectedOptions(newSelection)
      setHasAnswered(true)
      // Submit immediately for single choice
      setTimeout(() => {
        onAnswer(optionValue)
      }, 500) // Small delay for visual feedback
    } else if (question.type === 'multiple-choice') {
      if (selectedOptions.includes(optionValue)) {
        newSelection = selectedOptions.filter(val => val !== optionValue)
      } else {
        newSelection = [...selectedOptions, optionValue]
      }
      setSelectedOptions(newSelection)
    }
  }

  const handleSubmit = () => {
    if (selectedOptions.length === 0 || hasAnswered) return

    const validation = question.validation
    if (validation?.minSelections && selectedOptions.length < validation.minSelections) return
    if (validation?.maxSelections && selectedOptions.length > validation.maxSelections) return

    setHasAnswered(true)
    setTimeout(() => {
      onAnswer(question.type === 'single-choice' ? selectedOptions[0] : selectedOptions)
    }, 300)
  }

  const canSubmit = () => {
    if (question.type === 'single-choice') return true // Auto-submits
    if (selectedOptions.length === 0) return false

    const validation = question.validation
    if (validation?.minSelections && selectedOptions.length < validation.minSelections) return false
    if (validation?.maxSelections && selectedOptions.length > validation.maxSelections) return false

    return true
  }

  const getValidationMessage = () => {
    const validation = question.validation
    if (!validation) return null

    if (question.type === 'multiple-choice') {
      if (validation.minSelections && validation.maxSelections) {
        if (validation.minSelections === validation.maxSelections) {
          return `Please select exactly ${validation.minSelections} option${validation.minSelections > 1 ? 's' : ''}`
        }
        return `Please select ${validation.minSelections}-${validation.maxSelections} options`
      } else if (validation.minSelections) {
        return `Please select at least ${validation.minSelections} option${validation.minSelections > 1 ? 's' : ''}`
      } else if (validation.maxSelections) {
        return `Please select up to ${validation.maxSelections} option${validation.maxSelections > 1 ? 's' : ''}`
      }
    }

    return null
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Question Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {question.question}
        </h2>
        {question.description && (
          <p className="text-lg text-gray-600 leading-relaxed">
            {question.description}
          </p>
        )}
        {getValidationMessage() && (
          <p className="text-sm text-blue-600 mt-2 font-medium">
            {getValidationMessage()}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3 mb-8">
        {question.options?.map((option: AssessmentOption) => {
          const isSelected = selectedOptions.includes(option.value)
          const isDisabled = isLoading || hasAnswered

          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.value)}
              disabled={isDisabled}
              className={cn(
                "w-full p-4 md:p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] focus:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20",
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md",
                isDisabled && "opacity-60 cursor-not-allowed transform-none hover:scale-100 focus:scale-100",
                hasAnswered && !isSelected && "opacity-40"
              )}
            >
              <div className="flex items-start space-x-4">
                {/* Selection Indicator */}
                <div className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 bg-white"
                )}>
                  {isSelected && (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Option Content */}
                <div className="flex-1">
                  <p className={cn(
                    "font-medium transition-colors duration-200",
                    isSelected ? "text-blue-900" : "text-gray-900"
                  )}>
                    {option.label}
                  </p>
                  {option.description && (
                    <p className={cn(
                      "text-sm mt-1 transition-colors duration-200",
                      isSelected ? "text-blue-700" : "text-gray-600"
                    )}>
                      {option.description}
                    </p>
                  )}
                </div>

                {/* Arrow for single choice */}
                {question.type === 'single-choice' && isSelected && (
                  <ChevronRightIcon className="w-5 h-5 text-blue-500 animate-pulse" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Submit Button for Multiple Choice */}
      {question.type === 'multiple-choice' && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit() || hasAnswered}
            className={cn(
              "px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:transform-none disabled:hover:scale-100 disabled:focus:scale-100",
              canSubmit() && !hasAnswered
                ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl"
                : "bg-gray-300 cursor-not-allowed",
              hasAnswered && "bg-green-600"
            )}
          >
            {hasAnswered ? (
              <span className="flex items-center space-x-2">
                <CheckIcon className="w-5 h-5" />
                <span>Submitted!</span>
              </span>
            ) : (
              `Continue with ${selectedOptions.length} selected`
            )}
          </button>

          {/* Selected Count for Multiple Choice */}
          {selectedOptions.length > 0 && !hasAnswered && (
            <p className="text-sm text-gray-600 mt-3">
              {selectedOptions.length} of {question.validation?.maxSelections || 'unlimited'} selected
            </p>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Processing your answer...</span>
          </div>
        </div>
      )}
    </div>
  )
} 