import React from 'react'

export function AIBrainIcon({ className = "h-6 w-6", strokeWidth = 1.5 }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Brain */}
      <path d="M9.5 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
      <path d="M14.5 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
      <path d="M8 7v3" />
      <path d="M16 7v3" />
      <path d="M12 17v-6.5" />
      <path d="M7 10a4 4 0 0 0 8 0" />
      <path d="M16 10a4 4 0 0 0-8 0" />
      
      {/* Chat bubble */}
      <path d="M8 16a6 6 0 0 0 8 0" />
      <path d="M18 14a8 8 0 1 0-3 6.5l2.5 2.5 2-2a8 8 0 0 0-1.5-6.5" />
      
      {/* Circuit lines */}
      <path d="M12 7v-2" />
      <path d="M10 9h-2" />
      <path d="M14 9h2" />
    </svg>
  )
} 