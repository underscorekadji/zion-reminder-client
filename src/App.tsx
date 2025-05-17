import { AuthProvider } from './context/AuthContext'
import { AuthButton } from './features/auth/AuthButton'
import { Features } from './features/Features'

function App() {
  return (
    <AuthProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 pb-5 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GCP Request Emulation App</h1>
            <p className="text-gray-500 dark:text-gray-400 italic mt-1">Demo Only</p>
          </div>
          <AuthButton />
        </header>
        
        {/* Main Content */}
        <main className="py-4">
          <Features />
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
