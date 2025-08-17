"use client"

import { useEffect } from 'react'

export function ExtensionHandler() {
  useEffect(() => {
    // Prevent browser extension conflicts on client side only
    try {
      const originalDefineProperty = Object.defineProperty;
      Object.defineProperty = function(obj, prop, descriptor) {
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
  }, [])

  return null // This component doesn't render anything
}