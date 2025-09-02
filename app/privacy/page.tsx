export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Política de Privacidad
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Información que Recopilamos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Recopilamos información que nos proporcionas directamente, como tu nombre, 
                correo electrónico y datos de contacto cuando te registras en CanchaYA.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Cómo Utilizamos tu Información
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Utilizamos tu información para:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                <li>Procesar tus reservas de canchas</li>
                <li>Enviarte confirmaciones y actualizaciones</li>
                <li>Mejorar nuestros servicios</li>
                <li>Comunicarnos contigo sobre tu cuenta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Protección de Datos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Implementamos medidas de seguridad apropiadas para proteger tu información 
                personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Cookies
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Utilizamos cookies para mejorar tu experiencia de navegación y mantener 
                tu sesión activa de forma segura.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Tus Derechos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tienes derecho a acceder, actualizar o eliminar tu información personal. 
                Puedes ejercer estos derechos contactándonos directamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Contacto
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Si tienes preguntas sobre esta política de privacidad, contáctanos en: 
                <a href="mailto:privacy@canchaya.com" className="text-primary hover:underline ml-1">
                  privacy@canchaya.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}