import DocumentGrid from '../components/documents/DocumentGrid'
import Button from '../components/ui/Button'
import { Upload, Search, Filter, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { documentAPI } from '../api/client'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [documentName, setDocumentName] = useState('')
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const data = await documentAPI.list()
      setDocuments(data)
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const resetUploadDialog = () => {
    setSelectedFile(null)
    setDocumentName('')
    setShowUploadDialog(false)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setDocumentName(file.name.replace(/\.[^/.]+$/, ''))
      setShowUploadDialog(true)
    }
    e.target.value = null
  }

  const handleSaveUpload = async () => {
    if (!selectedFile) return
    if (!documentName.trim()) {
      alert('Please enter a document name before saving.')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('document_name', documentName.trim())

    try {
      const result = await documentAPI.upload(formData)
      if (result.document) {
        await fetchDocuments()
        resetUploadDialog()
        alert(`Document "${documentName.trim()}" saved successfully!`)
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert(err.message || 'Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadDocument = (document) => {
    // In a real app, this might download the actual file from S3
    // For now, we'll continue with the text info download
    const textContent = `
Document Name: ${document.name}
Type: ${document.type}
Status: ${document.status}
Uploaded At: ${document.uploadedAt}
${document.intelligence ? 
  `AI Extraction Confidence: ${(document.intelligence.overall_confidence * 100).toFixed(0)}%\n` + 
  Object.entries(document.intelligence.extracted_fields || {}).map(([key, data]) => 
    `${key.replace('_', ' ')}: ${data.value} (${(data.confidence * 100).toFixed(0)}% confidence)`
  ).join('\n') : ''}`.trim()

    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    a.href = url
    a.download = `${document.name.replace(/\s+/g, '_')}_info.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return

    try {
      await documentAPI.delete(id)
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete document.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Document Vault</h1>
          <p className="text-sm text-navy-500 mt-1">Securely store and manage all your documents for auto-filling</p>
        </div>
        <Button onClick={() => window.document.getElementById('file-input').click()} disabled={uploading}>
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
        <input
          type="file"
          id="file-input"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-300"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-navy-200 rounded-lg text-sm text-navy-600 hover:bg-navy-50 transition-colors">
          <Filter size={14} />
          Filter
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900 mx-auto mb-4"></div>
          <p className="text-navy-500">Loading your vault...</p>
        </div>
      ) : (
        <DocumentGrid 
          documents={documents} 
          onDownloadDocument={handleDownloadDocument}
          onDeleteDocument={handleDeleteDocument}
          search={search}
        />
      )}

      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-navy-900">Save Document</h2>
                <p className="mt-1 text-sm text-navy-500">Add a clear name before saving this file to your vault.</p>
              </div>
              <button
                type="button"
                onClick={resetUploadDialog}
                className="rounded-lg p-2 text-navy-400 transition-colors hover:bg-navy-50 hover:text-navy-700"
                disabled={uploading}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Selected file</p>
                <p className="mt-1 truncate text-sm font-medium text-navy-900">{selectedFile?.name}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">Document name</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                  className="w-full rounded-lg border border-navy-200 px-3.5 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10"
                  disabled={uploading}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={resetUploadDialog} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveUpload} loading={uploading}>
                  Save Document
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
