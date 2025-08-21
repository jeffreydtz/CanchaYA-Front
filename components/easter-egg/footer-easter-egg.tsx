'use client'

export function FooterEasterEgg() {
  return (
    <span 
      className="ml-2 text-xs opacity-20 hover:opacity-100 transition-opacity cursor-pointer select-none"
      onClick={() => {
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