'use client'

export function FooterEasterEgg() {
  return (
    <span 
      className="ml-2 text-xs opacity-50 hover:opacity-100 hover:text-yellow-400 transition-all cursor-pointer select-none bg-black/10 dark:bg-white/10 rounded-full w-4 h-4 inline-flex items-center justify-center"
      onClick={(e) => {
        e.preventDefault()
        console.log('Easter egg clicked!')
        
        const messages = [
          '🟡🔵 ¡Dale Canalla!',
          '⚽ ¡Vamos Central carajo!',
          '🏆 El Gigante de Arroyito',
          '💙💛 Académico hasta la muerte'
        ]
        const randomMsg = messages[Math.floor(Math.random() * messages.length)]
        console.log(randomMsg)
        
        // Create temporary yellow-blue flash
        document.body.style.transition = 'background-color 0.3s'
        document.body.style.backgroundColor = '#FFD700'
        setTimeout(() => {
          document.body.style.backgroundColor = '#1E40AF'
          setTimeout(() => {
            document.body.style.backgroundColor = ''
          }, 150)
        }, 150)
      }}
      title="¿Sos de Central?"
    >
      •
    </span>
  )
}