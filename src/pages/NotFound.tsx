import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl font-black mb-4" style={{ color: 'var(--brand-navy)', opacity: 0.15 }}>404</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>Page not found</h1>
          <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn-primary mx-auto">
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
