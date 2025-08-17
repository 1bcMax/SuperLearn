"use client"

import { useEffect } from 'react'

export function ExtensionHandler() {
  useEffect(() => {
    // Prevent browser extension conflicts on client side only
    if (typeof window !== 'undefined') {
      try {
        // Specifically handle Unisat wallet extension conflict
        if ('unisat' in window) {
          const descriptor = Object.getOwnPropertyDescriptor(window, 'unisat')
          if (descriptor && descriptor.configurable) {
            Object.defineProperty(window, 'unisat', {
              ...descriptor,
              configurable: false,
              writable: false
            })
          }
        }
        
        // Override defineProperty to catch and handle redefinition errors
        const originalDefineProperty = Object.defineProperty;
        Object.defineProperty = function(obj, prop, descriptor) {
          // Special handling for wallet extensions
          if (prop === 'unisat' || prop === 'ethereum' || prop === 'solana') {
            try {
              // Check if property already exists
              if (prop in obj) {
                console.warn(`[Extension] Property ${prop} already exists, skipping redefinition`);
                return obj;
              }
              return originalDefineProperty.call(this, obj, prop, descriptor);
            } catch (error) {
              if (error.message && error.message.includes('Cannot redefine property')) {
                console.warn(`[Extension] Browser extension conflict prevented for: ${prop}`);
                return obj;
              }
              throw error;
            }
          }
          
          // Default behavior for other properties
          try {
            return originalDefineProperty.call(this, obj, prop, descriptor);
          } catch (error) {
            if (error.message && error.message.includes('Cannot redefine property')) {
              console.warn('Browser extension property conflict prevented:', prop);
              return obj;
            }
            throw error;
          }
        };
      } catch (e) {
        console.warn('Could not set up extension conflict prevention:', e);
      }
    }
  }, [])

  return null // This component doesn't render anything
}