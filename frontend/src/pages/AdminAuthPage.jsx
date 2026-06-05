import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Shield, KeyRound, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminAuthPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { loginAsAdmin } = useAuth()

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Hardcoded admin auth for hackathon/demo purposes
      if (username === 'admin' && password === 'admin123') {
        loginAsAdmin()
        navigate('/officer')
      } else {
        throw new Error('Invalid admin credentials')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm text-navy-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-saffron-500 flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-navy-900">Officer Portal</h1>
            <p className="text-sm text-navy-500 mt-1">Authorized personnel only</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="pt-2">
              <Button type="submit" className="w-full bg-navy-900 hover:bg-navy-800" size="lg" loading={loading}>
                <KeyRound size={18} />
                Access Command Center
              </Button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-navy-50 rounded-lg text-xs text-navy-600 text-center">
            Demo Credentials: <br/> Username: <strong>admin</strong> | Password: <strong>admin123</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
