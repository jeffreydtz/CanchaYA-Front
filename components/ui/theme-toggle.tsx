'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'

  return (
    <div className="flex items-center space-x-3 bg-gradient-to-r from-white/5 to-white/10 dark:from-gray-800/20 dark:to-gray-800/40 backdrop-blur-md rounded-full px-5 py-3 border border-white/10 dark:border-gray-700/20 shadow-lg transition-all duration-500 hover:shadow-xl hover:bg-gradient-to-r hover:from-white/10 hover:to-white/20 dark:hover:from-gray-800/30 dark:hover:to-gray-800/50">
      <Sun className={`h-5 w-5 transition-all duration-700 ease-in-out ${
        isDark 
          ? 'text-gray-500/60 scale-90 rotate-180' 
          : 'text-amber-400 scale-110 rotate-0 drop-shadow-sm'
      }`} />
      <div className="relative">
        <Switch
          checked={isDark}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
          className="transition-all duration-700 ease-in-out data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-slate-600 data-[state=checked]:to-slate-800 data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-amber-300 data-[state=unchecked]:to-yellow-400 shadow-inner"
        />
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-sm'
            : 'bg-gradient-to-r from-amber-300/30 to-yellow-400/30 blur-sm'
        }`} />
      </div>
      <Moon className={`h-5 w-5 transition-all duration-700 ease-in-out ${
        isDark 
          ? 'text-indigo-300 scale-110 rotate-0 drop-shadow-sm' 
          : 'text-gray-500/60 scale-90 -rotate-180'
      }`} />
    </div>
  )
}