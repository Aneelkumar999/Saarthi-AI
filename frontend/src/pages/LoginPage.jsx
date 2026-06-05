import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { ArrowLeft, Phone, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  const handleSendOTP = (e) => {
    e.preventDefault()
    setStep('otp')
  }

  const handleVerifyOTP = (e) => {
    e.preventDefault()
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-700 mb-8 transition-colors">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-navy-900 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold text-navy-900">Welcome to Saarthi AI</h1>
            <p className="text-sm text-navy-500 mt-1">
              {step === 'phone' ? 'Enter your mobile number to get started' : 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg">
                <Phone size={18} />
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <Input
                label="OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <Button type="submit" className="w-full" size="lg">
                <KeyRound size={18} />
                Verify OTP
              </Button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-center text-sm text-navy-500 hover:text-navy-700 transition-colors"
              >
                Change phone number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
