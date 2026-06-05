import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Mail, Phone, User, KeyRound, ArrowLeft, Shield } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // signin | signup
  const [step, setStep] = useState('details') // details | otp
  const [channel, setChannel] = useState('phone') // phone | email
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(null) // { channel, identifier, dev_otp }

  // Form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [signinIdentifier, setSigninIdentifier] = useState('')
  const [otp, setOtp] = useState('')

  const { signup, sendOTP, verifyOTP, googleLogin } = useAuth()
  const navigate = useNavigate()

  const resetForm = () => {
    setName(''); setPhone(''); setEmail(''); setOtp(''); setSigninIdentifier('')
    setStep('details'); setError(''); setOtpSent(null)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    resetForm()
  }

  // ─── SIGN UP ───────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Please enter your full name'); return }
    if (channel === 'phone' && !phone.trim()) { setError('Please enter your phone number'); return }
    if (channel === 'email' && !email.trim()) { setError('Please enter your email address'); return }

    setLoading(true)
    try {
      await signup({
        full_name: name.trim(),
        phone: channel === 'phone' ? phone.trim() : null,
        email: channel === 'email' ? email.trim() : null,
        auth_provider: channel,
      })
      navigate('/dashboard')
    } catch (err) {
      console.error('Signup Error:', err)
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── SIGN IN: Send OTP ─────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e?.preventDefault()
    setError('')

    if (!signinIdentifier.trim()) {
      setError('Please enter your phone number or email')
      return
    }

    setLoading(true)
    try {
      const isEmail = signinIdentifier.includes('@')
      const payload = isEmail 
        ? { email: signinIdentifier.trim() } 
        : { phone: signinIdentifier.trim() }
      
      console.log('Requesting OTP for:', payload)
      const res = await sendOTP(payload)
      
      setOtpSent({ 
        channel: res.channel || (isEmail ? 'email' : 'phone'), 
        identifier: signinIdentifier.trim(), 
        dev_otp: res.dev_otp 
      })
      setStep('otp')
    } catch (err) {
      console.error('Send OTP Error Detail:', err)
      setError(err.message || 'Connection error. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // ─── SIGN IN: Verify OTP ──────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e?.preventDefault()
    setError('')

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const isEmail = otpSent.channel === 'email'
      const payload = isEmail 
        ? { email: otpSent.identifier, otp: otp.trim() } 
        : { phone: otpSent.identifier, otp: otp.trim() }
      
      await verifyOTP(payload)
      navigate('/dashboard')
    } catch (err) {
      console.error('Verify OTP Error:', err)
      setError(err.message || 'Invalid OTP. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── GOOGLE AUTH ───────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await googleLogin()
      navigate('/dashboard')
    } catch (err) {
      console.error('Google Login Error:', err)
      setError(err.message || 'Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] via-white to-[#FFF7ED] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to home
        </button>

        <div className="bg-white rounded-2xl border border-navy-100 shadow-lg shadow-navy-900/5 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold text-navy-900">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-navy-500 mt-1">
              {mode === 'signin'
                ? 'Sign in to access your government service dashboard'
                : 'Join Saarthi AI to navigate government services easily'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-navy-50 rounded-xl p-1 mb-6">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-500 hover:text-navy-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-navy-500 hover:text-navy-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Dev OTP hint */}
          {otpSent?.dev_otp && (
            <div className="mb-4 p-3 bg-saffron-50 border border-saffron-200 rounded-lg text-sm text-saffron-700">
              <span className="font-medium">Dev Mode:</span> OTP is <code className="font-mono bg-saffron-100 px-1.5 py-0.5 rounded">{otpSent.dev_otp}</code>
            </div>
          )}

          {/* ═══════════════ SIGN UP ═══════════════ */}
          {mode === 'signup' && step === 'details' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Channel Toggle */}
              <div className="flex bg-navy-50 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setChannel('phone')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                    channel === 'phone' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'
                  }`}
                >
                  <Phone size={14} />
                  Phone
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                    channel === 'email' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'
                  }`}
                >
                  <Mail size={14} />
                  Email
                </button>
              </div>

              {channel === 'phone' ? (
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              ) : (
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                <User size={18} />
                Create Account
              </Button>
            </form>
          )}

          {/* ═══════════════ SIGN IN: Details ═══════════════ */}
          {mode === 'signin' && step === 'details' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                label="Phone or Email"
                type="text"
                placeholder="98765 43210 or you@email.com"
                value={signinIdentifier}
                onChange={(e) => {
                  setSigninIdentifier(e.target.value)
                  setError('')
                }}
                required
              />

              <p className="text-xs text-navy-400">
                We'll send a one-time password to verify it's you.
              </p>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                <KeyRound size={18} />
                Send OTP
              </Button>
            </form>
          )}

          {/* ═══════════════ SIGN IN: OTP Verification ═══════════════ */}
          {mode === 'signin' && step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-2">
                <p className="text-sm text-navy-600">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-sm font-medium text-navy-900">
                  {otpSent?.channel === 'phone' ? `📱 ${otpSent.identifier}` : `📧 ${otpSent.identifier}`}
                </p>
              </div>

              <Input
                label="OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
              />

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                <KeyRound size={18} />
                Verify & Sign In
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep('details'); setOtp(''); setError('') }}
                  className="text-navy-500 hover:text-navy-700 transition-colors"
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-saffron-600 hover:text-saffron-700 font-medium transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════ DIVIDER ═══════════════ */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-navy-400">or continue with</span>
            </div>
          </div>

          {/* ═══════════════ GOOGLE ═══════════════ */}
          <button
            onClick={handleGoogle}
            type="button"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-navy-200 rounded-xl text-sm font-medium text-navy-700 hover:bg-navy-50 hover:border-navy-300 disabled:opacity-50 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
        </div>

        {/* Admin Access Link */}
        <div className="mt-8 pt-6 border-t border-navy-100/50 text-center">
          <p className="text-xs text-navy-400 mb-2 font-medium">Government Official?</p>
          <button
            onClick={() => navigate('/admin')}
            className="text-sm font-bold text-navy-600 hover:text-navy-900 transition-colors inline-flex items-center gap-1.5"
          >
            <Shield size={14} />
            Sign in to Officer Portal
          </button>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-navy-400 mt-6">
          By continuing, you agree to Saarthi AI's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
