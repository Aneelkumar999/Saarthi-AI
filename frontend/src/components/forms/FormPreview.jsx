import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { CheckCircle, AlertCircle, Edit3, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { documentAPI } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

const formTemplate = {
  title: 'GHMC Trade License Application',
  fields: [
    { label: 'Full Name', key: 'name', profileKey: 'full_name', value: '', autoFilled: false, source: null },
    { label: 'Father/Husband Name', key: 'father_name', value: '', autoFilled: false, source: null },
    { label: 'Date of Birth', key: 'dob', value: '', autoFilled: false, source: null },
    { label: 'Aadhaar Number', key: 'id_number', value: '', autoFilled: false, source: null, docType: 'Aadhaar Card' },
    { label: 'PAN Number', key: 'pan_number', value: '', autoFilled: false, source: null, docType: 'PAN Card' },
    { label: 'Business Name', key: 'business_name', value: '', autoFilled: false, source: null },
    { label: 'Business Address', key: 'address', value: '', autoFilled: false, source: null },
    { label: 'Nature of Business', key: 'nature', value: 'Food & Beverages', autoFilled: false, source: null },
    { label: 'Mobile Number', key: 'phone', profileKey: 'phone', value: '', autoFilled: false, source: null },
    { label: 'Email', key: 'email', profileKey: 'email', value: '', autoFilled: false, source: null },
  ],
}

export default function FormPreview() {
  const { user } = useAuth()
  const [fields, setFields] = useState(formTemplate.fields)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const autoFill = async () => {
      try {
        setLoading(true)
        const docs = await documentAPI.list()
        
        const newFields = fields.map(field => {
          let updatedField = { ...field }
          
          // 1. Try to find in documents
          for (const doc of docs) {
            const extracted = doc.intelligence?.extracted_fields || {}
            
            if (field.docType && doc.type !== field.docType) continue

            if (extracted[field.key]) {
              updatedField.value = extracted[field.key].value
              updatedField.autoFilled = true
              updatedField.source = doc.type
              break 
            }
          }

          // 2. If still empty, try to find in user profile
          if (!updatedField.value && field.profileKey && user && user[field.profileKey]) {
            updatedField.value = user[field.profileKey]
            updatedField.autoFilled = true
            updatedField.source = 'User Profile'
          }

          return updatedField
        })
        
        setFields(newFields)
      } catch (err) {
        console.error('Auto-fill failed:', err)
      } finally {
        setLoading(false)
      }
    }

    autoFill()
  }, [user])

  const autoFilledCount = fields.filter(f => f.autoFilled).length
  const emptyCount = fields.filter(f => !f.value).length

  if (loading) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-navy-900 mb-4" />
        <p className="text-navy-500 font-medium">Saarthi AI is extracting data from your vault...</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-navy-900">{formTemplate.title}</h3>
          <p className="text-sm text-navy-500 mt-0.5">Review auto-filled fields before submission</p>
        </div>
        <Badge color={emptyCount === 0 ? 'green' : 'saffron'}>
          {emptyCount === 0 ? 'All fields ready' : `${emptyCount} fields pending`}
        </Badge>
      </div>

      <div className="flex items-center gap-4 mb-6 p-3 bg-navy-50 rounded-xl text-xs">
        <span className="flex items-center gap-1.5 text-green-600 font-bold">
          <CheckCircle size={14} /> {autoFilledCount} AUTO-FILLED BY AI
        </span>
        {emptyCount > 0 && (
          <span className="flex items-center gap-1.5 text-saffron-600 font-bold">
            <AlertCircle size={14} /> {emptyCount} NEED MANUAL INPUT
          </span>
        )}
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
            field.autoFilled
              ? 'bg-green-50/30 border-green-200'
              : field.value
              ? 'bg-white border-navy-200'
              : 'bg-saffron-50/30 border-saffron-200'
          }`}>
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-bold text-navy-400 uppercase tracking-tight">{field.label}</label>
              <div className="flex items-center gap-2 mt-0.5">
                {field.value ? (
                  <span className="text-sm text-navy-900 font-medium">{field.value}</span>
                ) : (
                  <span className="text-sm text-saffron-500 italic">Requires manual input</span>
                )}
              </div>
            </div>
            {field.autoFilled && (
              <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md shrink-0 uppercase tracking-tighter">
                Verified via {field.source}
              </span>
            )}
            {!field.autoFilled && (
              <button className="p-1.5 text-navy-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors shrink-0">
                <Edit3 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6">
        <Button variant="secondary" className="flex-1">Save Draft</Button>
        <Button className="flex-1 bg-navy-900 text-white hover:bg-navy-800 shadow-lg">Submit Application</Button>
      </div>
    </Card>
  )
}
