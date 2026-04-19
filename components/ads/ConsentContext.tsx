'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const CONSENT_KEY = 'camer360_consent'

interface ConsentCtx {
  hasConsent: boolean
  hasDeclined: boolean
  hasMadeChoice: boolean
  accept: () => void
  decline: () => void
}

const ConsentContext = createContext<ConsentCtx>({
  hasConsent:    false,
  hasDeclined:   false,
  hasMadeChoice: false,
  accept:        () => {},
  decline:       () => {},
})

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<'1' | '0' | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as '1' | '0' | null
    setValue(stored)
  }, [])

  function accept() {
    localStorage.setItem(CONSENT_KEY, '1')
    setValue('1')
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, '0')
    setValue('0')
  }

  return (
    <ConsentContext.Provider value={{
      hasConsent:    value === '1',
      hasDeclined:   value === '0',
      hasMadeChoice: value !== null,
      accept,
      decline,
    }}>
      {children}
    </ConsentContext.Provider>
  )
}

export const useConsent = () => useContext(ConsentContext)
