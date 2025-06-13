// Custom color palette
export const colors = {
  // Primary colors
  primary: {
    rust: '#B1591E',
    mauve: '#8A5764',
    sand: '#DDB176',
    teal: '#006269',
    lightTeal: '#A5C9CA',
    purple: '#634B7B',
    background: '#F0EDE9',
  },
  
  // Shades of primary colors
  shades: {
    rustLight: '#D18D63',
    rustDark: '#8A4416',
    mauveLight: '#B18295',
    mauveDark: '#6A424D',
    sandLight: '#E8CCA0',
    sandDark: '#C09B56',
    tealLight: '#008A93',
    tealDark: '#004A4F',
    lightTealLight: '#C5DCDD',
    lightTealDark: '#7A9B9C',
    purpleLight: '#8A6DA1',
    purpleDark: '#483657',
    backgroundDark: '#E0DCD5',
  },
  
  // Functional colors
  functional: {
    success: '#006269', // Using teal for success
    warning: '#DDB176', // Using sand for warning
    error: '#B1591E', // Using rust for error
    info: '#634B7B', // Using purple for info
  },
  
  // Text colors
  text: {
    dark: '#333333',
    medium: '#666666',
    light: '#999999',
    white: '#FFFFFF',
  },
}

// Tailwind class mappings for the custom colors
export const tailwindClasses = {
  // Background colors
  bg: {
    rust: 'bg-[#B1591E]',
    mauve: 'bg-[#8A5764]',
    sand: 'bg-[#DDB176]',
    teal: 'bg-[#006269]',
    lightTeal: 'bg-[#A5C9CA]',
    purple: 'bg-[#634B7B]',
    background: 'bg-[#F0EDE9]',
    rustLight: 'bg-[#D18D63]',
    rustDark: 'bg-[#8A4416]',
  },
  
  // Text colors
  text: {
    rust: 'text-[#B1591E]',
    mauve: 'text-[#8A5764]',
    sand: 'text-[#DDB176]',
    teal: 'text-[#006269]',
    lightTeal: 'text-[#A5C9CA]',
    purple: 'text-[#634B7B]',
  },
  
  // Border colors
  border: {
    rust: 'border-[#B1591E]',
    mauve: 'border-[#8A5764]',
    sand: 'border-[#DDB176]',
    teal: 'border-[#006269]',
    lightTeal: 'border-[#A5C9CA]',
    purple: 'border-[#634B7B]',
    background: 'border-[#F0EDE9]',
  },
  
  // Gradient backgrounds
  gradient: {
    rustToSand: 'bg-gradient-to-r from-[#B1591E] to-[#DDB176]',
    tealToLightTeal: 'bg-gradient-to-r from-[#006269] to-[#A5C9CA]',
    purpleToMauve: 'bg-gradient-to-r from-[#634B7B] to-[#8A5764]',
    sandToBackground: 'bg-gradient-to-r from-[#DDB176] to-[#F0EDE9]',
  },
} 