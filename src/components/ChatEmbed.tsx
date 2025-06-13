'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Chat } from './Chat'
import { AIBrainIcon } from './AIBrainIcon'
import { tailwindClasses } from '@/lib/theme'

export function ChatEmbed() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Close the chat when pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  // Add class to body when chat is open to prevent scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('chat-open')
    } else {
      document.body.classList.remove('chat-open')
    }
  }, [isOpen])

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 rounded-full ${tailwindClasses.bg.teal} p-4 text-white shadow-lg transition-all duration-300 hover:${tailwindClasses.bg.lightTeal} chat-button-pulse ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open chat"
      >
        <AIBrainIcon className="h-6 w-6" />
      </button>

      {/* Chat sidebar */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col ${tailwindClasses.bg.background} shadow-xl transition-transform duration-300 sm:max-w-lg md:max-w-xl lg:max-w-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className={`flex items-center justify-between ${tailwindClasses.bg.teal} ${tailwindClasses.border.teal} border-b p-4`}>
          <div className="flex items-center">
            <AIBrainIcon className="h-6 w-6 mr-3 text-white" />
            <h2 className="text-lg font-semibold text-white">
              Arizona Digital Navigator
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 text-white hover:bg-[#00797D] hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Chat embedMode={true} />
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#634B7B]/30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
} 