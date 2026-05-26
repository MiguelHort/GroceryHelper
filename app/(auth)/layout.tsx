export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🛒</span>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mt-3">GroceryHelper</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestão inteligente da sua despensa</p>
        </div>
        {children}
      </div>
    </div>
  )
}
