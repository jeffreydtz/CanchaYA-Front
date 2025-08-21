'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { useLanguage } from '@/lib/language-context'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isEnglish = language === 'en'

  return (
    <div className="flex items-center space-x-3 bg-white/10 dark:bg-gray-800/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 dark:border-gray-700/30">
      <span className={`text-sm font-semibold transition-colors ${!isEnglish ? 'text-white' : 'text-gray-400'}`}>
        ES
      </span>
      <Switch
        checked={isEnglish}
        onCheckedChange={(checked) => setLanguage(checked ? 'en' : 'es')}
        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-green-600"
      />
      <span className={`text-sm font-semibold transition-colors ${isEnglish ? 'text-white' : 'text-gray-400'}`}>
        EN
      </span>
    </div>
  )
}