import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Récupérer la langue sauvegardée ou utiliser français par défaut
    return localStorage.getItem('language') || 'fr'
  })
  
  const toggleLanguage = (newLang) => {
    // Si on passe un paramètre, utiliser ce paramètre, sinon alterner
    const nextLang = newLang || (language === 'fr' ? 'en' : 'fr')
    setLanguage(nextLang)
    localStorage.setItem('language', nextLang)
  }
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}