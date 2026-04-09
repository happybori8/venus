import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { STRINGS } from '../i18n/homeStrings'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'venus_lang'
const LEGACY_LANG_KEY = 'shopmall_lang'

function readInitialLang() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'ko') return saved
  const legacy = localStorage.getItem(LEGACY_LANG_KEY)
  if (legacy === 'en' || legacy === 'ko') {
    localStorage.setItem(STORAGE_KEY, legacy)
    localStorage.removeItem(LEGACY_LANG_KEY)
    return legacy
  }
  return 'ko'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang === 'en' ? 'en' : 'ko'
  }, [lang])

  const setLang = (next) => {
    if (next === 'ko' || next === 'en') setLangState(next)
  }

  const t = useMemo(() => {
    return (key, vars) => {
      const table = STRINGS[lang] || STRINGS.ko
      let s = table[key] ?? STRINGS.ko[key] ?? key
      if (vars && typeof s === 'string') {
        Object.entries(vars).forEach(([k, v]) => {
          s = s.split(`{${k}}`).join(String(v))
        })
      }
      return s
    }
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return ctx
}
