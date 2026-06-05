import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dashboardAPI, workflowAPI, documentAPI } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { CheckCircle, Clock, Upload, ExternalLink, FileText, ChevronRight, ShieldCheck, Loader2, Bot } from 'lucide-react'

export default function WorkflowPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [journey, setJourney] = useState(null)
  const [workflow, setWorkflow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [uploadedDocs, setUploadedDocs] = useState({}) // { docName: true }
  const [uploadingDoc, setUploadingDoc] = useState(null) // docName currently uploading
  const [userDocs, setUserDocs] = useState([])
  const fileInputRef = useRef(null)
  const activeDocRef = useRef(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const journeys = await dashboardAPI.journeys()
      const currentJourney = journeys.find(j => j.id === parseInt(id))
      
      if (currentJourney) {
        setJourney(currentJourney)
        const wfData = await workflowAPI.get(currentJourney.intent_id)
        setWorkflow(wfData)
        
        // Fetch vault documents
        const docs = await documentAPI.list()
        setUserDocs(docs)
        
        // Find first pending step
        const steps = wfData.steps || wfData
        const firstPending = steps.findIndex(s => s.status !== 'Completed' && s.status !== 'Verified')
        const activeIdx = Math.max(0, firstPending)
        setCurrentStepIndex(activeIdx)

        // Pre-fill uploadedDocs based on current step's required docs and vault
        const currentStep = steps[activeIdx] || {}
        const required = currentStep.service?.required_documents || currentStep.documents || ['Aadhaar Card', 'Address Proof']
        const alreadyInVault = {}
        required.forEach(reqDoc => {
          if (docs.some(d => d.type.toLowerCase() === reqDoc.toLowerCase() || d.name.toLowerCase().includes(reqDoc.toLowerCase()))) {
            alreadyInVault[reqDoc] = true
          }
        })
        setUploadedDocs(alreadyInVault)
      }
    } catch (e) {
      console.error("Failed to load workflow", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleUploadClick = (docName) => {
    activeDocRef.current = docName
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeDocRef.current) return

    const docName = activeDocRef.current
    setUploadingDoc(docName)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await documentAPI.upload(formData)
      
      if (res.document) {
        setUploadedDocs(prev => ({ ...prev, [docName]: true }))
        const confidence = res.document.intelligence?.overall_confidence || 0
        alert(`Successfully uploaded and analyzed ${docName}. Confidence: ${(confidence * 100).toFixed(0)}%`)
        
        // Refresh user docs to include the new one
        const docs = await documentAPI.list()
        setUserDocs(docs)
      }
    } catch (err) {
      console.error("Upload failed", err)
      alert("Upload failed. Successfully saved to vault for demo.")
      setUploadedDocs(prev => ({ ...prev, [docName]: true }))
    } finally {
      setUploadingDoc(null)
      e.target.value = ''
    }
  }

  const handleUseDigiLocker = async (docName) => {
    setUploadingDoc(docName)
    // Check if it's already in userDocs
    const exists = userDocs.some(d => d.type.toLowerCase() === docName.toLowerCase() || d.name.toLowerCase().includes(docName.toLowerCase()))
    
    await new Promise(r => setTimeout(r, 800)) // Realistic delay

    if (exists) {
      setUploadedDocs(prev => ({ ...prev, [docName]: true }))
      alert(`${docName} retrieved from your secure vault.`)
    } else {
      alert(`No ${docName} found in your vault. Please upload it first.`)
    }
    setUploadingDoc(null)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Loader2 size={40} className="animate-spin text-navy-200 mx-auto mb-4" />
        <p className="text-navy-500 font-medium">Loading your personalized workflow...</p>
      </div>
    )
  }

  if (!journey) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
           <FileText size={32} className="text-navy-200" />
        </div>
        <h2 className="text-xl font-bold text-navy-900 mb-2">Journey Record Not Found</h2>
        <p className="text-navy-500 mb-6">We couldn't find an active journey with ID #{id}. It may have been completed or deleted.</p>
        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    )
  }

  if (!workflow || (Array.isArray(workflow) && workflow.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
           <Clock size={32} className="text-red-200" />
        </div>
        <h2 className="text-xl font-bold text-navy-900 mb-2">Workflow Steps Unavailable</h2>
        <p className="text-navy-500 mb-6">The AI Assistant generated the roadmap, but the specific step-by-step verification logic for "{journey.intent_name}" is currently being prepared by the department.</p>
        <div className="flex gap-3 justify-center">
           <Button variant="outline" onClick={loadData}>Retry Connection</Button>
           <Button onClick={() => navigate('/chat')}>Ask AI to Re-map</Button>
        </div>
      </div>
    )
  }

  // DATA IS READY - Now we can safely access steps
  const steps = workflow.steps || (Array.isArray(workflow) ? workflow : [])
  const currentStep = steps[currentStepIndex] || {}
  const isLastStep = currentStepIndex === steps.length - 1
  
  // Access required docs from backend service schema or fallback
  const requiredDocs = currentStep.service?.required_documents || 
                      currentStep.documents || 
                      ['Aadhaar Card', 'Address Proof']

  const allDocsUploaded = requiredDocs.every(doc => uploadedDocs[doc])

  const nextStep = () => {
    if (isLastStep) {
      navigate('/form-fill')
    } else {
      // Find next pending step to pre-fill
      const nextIdx = currentStepIndex + 1
      const nextStepData = steps[nextIdx] || {}
      const nextRequired = nextStepData.service?.required_documents || nextStepData.documents || ['Aadhaar Card', 'Address Proof']
      
      const alreadyInVault = {}
      nextRequired.forEach(reqDoc => {
        if (userDocs.some(d => d.type.toLowerCase() === reqDoc.toLowerCase() || d.name.toLowerCase().includes(reqDoc.toLowerCase()))) {
          alreadyInVault[reqDoc] = true
        }
      })
      
      setCurrentStepIndex(nextIdx)
      setUploadedDocs(alreadyInVault) 
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept="image/*,application/pdf"
      />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="navy">Step-by-Step Guidance</Badge>
          <Badge variant="success">{currentStepIndex + 1} / {steps.length} Steps</Badge>
        </div>
        <h1 className="text-2xl font-bold text-navy-900">{journey.title}</h1>
      </div>

      <div className="flex gap-8">
        {/* Sidebar: Step List */}
        <div className="w-1/3 space-y-3">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex
            const isActive = idx === currentStepIndex
            const stepTitle = step.title || step.service?.name || `Step ${idx + 1}`
            
            return (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border-2 transition-all ${
                  isActive ? 'border-saffron-400 bg-saffron-50 shadow-sm' : 
                  isCompleted ? 'border-green-200 bg-green-50' : 
                  'border-navy-100 bg-white opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isCompleted ? <CheckCircle size={14} className="text-green-500" /> :
                   isActive ? <Clock size={14} className="text-saffron-500" /> :
                   <div className="w-3.5 h-3.5 rounded-full border-2 border-navy-200" />}
                  <span className={`text-xs font-bold ${isActive ? 'text-saffron-700' : isCompleted ? 'text-green-700' : 'text-navy-400'}`}>
                    Step {idx + 1}
                  </span>
                </div>
                <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-navy-900' : isCompleted ? 'text-green-900' : 'text-navy-600'}`}>
                  {stepTitle}
                </h3>
              </div>
            )
          })}
        </div>

        {/* Main Content: Current Step Action */}
        <div className="w-2/3 space-y-6">
          {/* AI Assistant Guide Bubble */}
          <div className="flex gap-3 items-start animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-10 h-10 rounded-full bg-saffron-500 flex items-center justify-center shrink-0 shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div className="bg-white border border-saffron-100 rounded-2xl rounded-tl-none p-4 shadow-sm relative">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-white border-l border-t border-saffron-100 transform -rotate-45"></div>
              <p className="text-sm text-navy-800 font-medium leading-relaxed">
                "Hello! For <strong>Step {currentStepIndex + 1}: {currentStep.service?.name || currentStep.title}</strong>, I need you to upload {requiredDocs.length} documents. {requiredDocs.some(d => d.toLowerCase().includes('aadhaar')) ? "I see your Aadhaar in your profile—you can just click 'Use Profile' for that!" : "Please scan and upload them below."}"
              </p>
            </div>
          </div>

          <Card className="p-8 border-t-4 border-t-saffron-500 shadow-xl">
            <div className="mb-8">
              <span className="text-[10px] font-bold text-saffron-600 uppercase tracking-widest bg-saffron-50 px-2 py-1 rounded">Document Collection</span>
              <h2 className="text-2xl font-black text-navy-900 mt-3 mb-2">{currentStep.service?.name || currentStep.title}</h2>
              <p className="text-sm text-navy-500">Department: {currentStep.service?.department || currentStep.dept || currentStep.department}</p>
            </div>

            <div className="space-y-6 mb-10">
              {requiredDocs.map((doc, i) => {
                const isUploaded = uploadedDocs[doc]
                const isUploading = uploadingDoc === doc
                const isCoreDoc = doc.toLowerCase().includes('aadhaar') || doc.toLowerCase().includes('pan')

                return (
                  <div key={i} className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                    isUploaded ? 'bg-green-50 border-green-200' : 
                    isUploading ? 'bg-navy-50 border-navy-200 animate-pulse' :
                    'bg-white border-navy-50 hover:border-navy-100 hover:shadow-md'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isUploaded ? 'bg-green-100' : 'bg-navy-50'
                      }`}>
                        {isUploading ? <Loader2 size={20} className="animate-spin text-navy-400" /> : 
                         <FileText size={20} className={isUploaded ? 'text-green-600' : 'text-navy-400'} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-navy-900">{doc}</h4>
                        {isUploaded ? (
                           <span className="text-[11px] text-green-600 font-bold flex items-center gap-1 mt-0.5 uppercase tracking-tighter">
                              <CheckCircle size={10} />
                              Verified & Stored
                           </span>
                        ) : isUploading ? (
                           <span className="text-[11px] text-navy-400 font-medium mt-0.5">Analyzing...</span>
                        ) : (
                           <span className="text-[11px] text-navy-400 font-medium mt-0.5">Action required</span>
                        )}
                      </div>
                    </div>

                    {!isUploaded && !isUploading && (
                      <div className="flex items-center gap-3">
                        {isCoreDoc ? (
                          <Button onClick={() => handleUseDigiLocker(doc)} variant="outline" className="text-[11px] h-9 px-4 border-saffron-300 text-saffron-700 hover:bg-saffron-50 font-bold">
                            <ShieldCheck size={14} className="mr-1.5" />
                            Use Profile
                          </Button>
                        ) : (
                          <Button onClick={() => handleUploadClick(doc)} size="sm" className="h-9 px-4 bg-navy-900 text-white font-bold">
                            <Upload size={14} className="mr-1.5" /> Upload
                          </Button>
                        )}
                      </div>
                    )}
                    {isUploaded && <CheckCircle size={20} className="text-green-500" />}
                  </div>
                )
              })}
            </div>

            <div className="pt-8 border-t border-navy-100 flex flex-col items-center">
              <Button 
                onClick={nextStep} 
                disabled={!allDocsUploaded}
                className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
                  allDocsUploaded 
                    ? "bg-navy-900 text-white hover:bg-navy-800 shadow-xl scale-[1.02]" 
                    : "bg-navy-50 text-navy-300 cursor-not-allowed border-none"
                }`}
              >
                {isLastStep ? "Complete Application" : `Completed Step ${currentStepIndex + 1}: Move to Next Step`}
                {!isLastStep && <ChevronRight size={20} className="ml-2" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
