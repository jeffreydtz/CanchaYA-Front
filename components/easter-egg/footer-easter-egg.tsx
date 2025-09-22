'use client'

export function FooterEasterEgg() {
  return (
    <span 
      className="ml-2 text-xs opacity-50 hover:opacity-100 hover:text-blue-400 transition-all cursor-pointer select-none bg-black/10 dark:bg-white/10 rounded-full w-4 h-4 inline-flex items-center justify-center"
      onClick={(e) => {
        e.preventDefault()
        
        // Create Rosario Central shirt stripes effect
        const body = document.body
        body.style.transition = 'all 0.3s ease'
        body.style.backgroundImage = 'repeating-linear-gradient(0deg, #FFD700 0px, #FFD700 20px, #1E40AF 20px, #1E40AF 40px)'
        body.style.backgroundSize = '100% 40px'
        
        // Add Central badge effect
        const badge = document.createElement('div')
        badge.style.position = 'fixed'
        badge.style.top = '50%'
        badge.style.left = '50%'
        badge.style.transform = 'translate(-50%, -50%)'
        badge.style.background = 'linear-gradient(45deg, #FFD700, #1E40AF)'
        badge.style.color = 'white'
        badge.style.padding = '20px 40px'
        badge.style.borderRadius = '50%'
        badge.style.fontSize = '24px'
        badge.style.fontWeight = 'bold'
        badge.style.zIndex = '9999'
        badge.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)'
        badge.textContent = 'RC'
        document.body.appendChild(badge)
        
        setTimeout(() => {
          body.style.backgroundImage = ''
          body.style.backgroundSize = ''
          document.body.removeChild(badge)
        }, 2000)
      }}
      title="¿Sos de Central?"
    >
      •
    </span>
  )
}