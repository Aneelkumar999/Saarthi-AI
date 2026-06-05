import { useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { 
  User, Mail, Phone, Calendar, MapPin, 
  Languages, UserCircle, FileText, CheckCircle, 
  Loader2, Save, ShieldCheck
} from 'lucide-react'
import { profileAPI, documentAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState({
    full_name: authUser?.full_name || '',
    phone: authUser?.phone || '',
    email: authUser?.email || '',
    location: 'Telangana',
    district: 'Hyderabad',
    citizen_type: 'general',
    preferred_language: 'English',
    dob: '',
  })
  const [docCount, setDocCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const profileData = await profileAPI.get()
        setProfile(prev => ({ ...prev, ...profileData }))
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError(err.message || 'Failed to load profile details.')
      }

      try {
        const docs = await documentAPI.list()
        setDocCount(docs.length)
      } catch (err) {
        console.error('Failed to fetch documents:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authUser])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await profileAPI.update(profile)
      setProfile(updated)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Loader2 size={40} className="animate-spin text-navy-200 mx-auto mb-4" />
        <p className="text-navy-500 font-medium">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">My Citizen Profile</h1>
          <p className="text-sm text-navy-500 mt-1">Manage your identity for seamless government service applications</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-xl shadow-lg shadow-navy-900/10">
          <FileText size={18} className="text-saffron-400" />
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none">Vault Status</p>
            <p className="text-sm font-bold">{docCount} Documents Uploaded</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600 flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
              <UserCircle className="text-navy-400" size={20} />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Username / Full Name"
                icon={<User size={16} />}
                value={profile?.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Anil Kumar"
              />
              <Input
                label="Email Address"
                icon={<Mail size={16} />}
                value={profile?.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="anil@example.com"
                type="email"
              />
              <Input
                label="Phone Number"
                icon={<Phone size={16} />}
                value={profile?.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 90000 00000"
              />
              <Input
                label="Date of Birth"
                icon={<Calendar size={16} />}
                type="date"
                value={profile?.dob || ''}
                onChange={(e) => handleChange('dob', e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
              <MapPin className="text-navy-400" size={20} />
              Address & Category
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700">Location / State</label>
                <select 
                  value={profile?.location || ''} 
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 outline-none"
                >
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700">Preferred Language</label>
                <select 
                  value={profile?.preferred_language || ''} 
                  onChange={(e) => handleChange('preferred_language', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 outline-none"
                >
                  <option value="Telugu">Telugu</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Urdu">Urdu</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700">Citizen Category</label>
                <select 
                  value={profile?.citizen_type || ''} 
                  onChange={(e) => handleChange('citizen_type', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-navy-200 bg-white text-navy-900 text-sm focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 outline-none"
                >
                  <option value="general">General</option>
                  <option value="sc_st">SC / ST</option>
                  <option value="obc">OBC</option>
                  <option value="minority">Minority</option>
                  <option value="farmer">Farmer</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <Input
                label="District"
                value={profile?.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
                placeholder="Hyderabad"
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Actions & Stats */}
        <div className="space-y-6">
          <Card className="p-6 bg-navy-900 text-white">
            <h3 className="font-bold text-lg mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-saffron-500 hover:bg-saffron-600 text-white border-none" 
                loading={saving}
              >
                <Save size={18} />
                Save Profile
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                className="w-full bg-navy-800 border-navy-700 text-navy-100 hover:bg-navy-700"
                onClick={() => window.location.href = '/documents'}
              >
                <FileText size={18} />
                Manage Vault
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-saffron-500">
            <h3 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-saffron-500" />
              Saarthi Trust Score
            </h3>
            <p className="text-xs text-navy-500 mb-4">Complete your profile to unlock faster verifications</p>
            
            <div className="w-full bg-navy-100 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-saffron-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (docCount * 25) + 25)}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider text-right">
              {Math.min(100, (docCount * 25) + 25)}% Profile Strength
            </p>
          </Card>
        </div>
      </form>
    </div>
  )
}
