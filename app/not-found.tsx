import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <span className="text-5xl">🛒</span>
        <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mt-3">GroceryHelper</h1>

        <div className="mt-10">
          <p className="text-8xl font-bold text-green-200 dark:text-green-900">404</p>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 mt-2">Página não encontrada</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            O endereço que você acessou não existe ou foi removido.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Ir para o Painel
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </div>
  )
}
