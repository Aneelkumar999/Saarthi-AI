import { useState, createContext, useContext } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [language, setLanguage] = useState('en')
  const [chatMessages, setChatMessages] = useState([])
  const [activeJourney, setActiveJourney] = useState(null)

  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'te' : 'en')

  return (
    <AppContext.Provider value={{
      user, setUser,
      language, toggleLanguage,
      chatMessages, setChatMessages,
      activeJourney, setActiveJourney,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
