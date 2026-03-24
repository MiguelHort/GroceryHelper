export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🛒</span>
          <h1 className="text-3xl font-bold text-green-700 mt-3">GroceryHelper</h1>
          <p className="text-gray-500 mt-1">Gestão inteligente da sua despensa</p>
        </div>
        {children}
      </div>
    </div>
  )
}
