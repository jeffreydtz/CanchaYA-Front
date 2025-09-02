export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Términos de Servicio
          </h1>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Aceptación de los Términos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Al utilizar CanchaYA, aceptas estos términos de servicio en su totalidad. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. Descripción del Servicio
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                CanchaYA es una plataforma que conecta usuarios con instalaciones deportivas 
                para facilitar la reserva de canchas y espacios deportivos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Registro y Cuenta de Usuario
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Para utilizar nuestros servicios, debes crear una cuenta proporcionando información 
                precisa y actualizada. Eres responsable de mantener la confidencialidad de tu cuenta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Reservas y Pagos
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Las reservas están sujetas a disponibilidad. Los pagos se procesan de manera segura 
                y las políticas de cancelación varían según la instalación.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Contacto
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Si tienes preguntas sobre estos términos, contáctanos en: 
                <a href="mailto:support@canchaya.com" className="text-primary hover:underline ml-1">
                  support@canchaya.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}