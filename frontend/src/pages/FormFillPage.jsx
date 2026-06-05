import FormPreview from '../components/forms/FormPreview'
import Button from '../components/ui/Button'
import { Download } from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export default function FormFillPage() {
  const handleDownloadChecklist = () => {
    try {
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(22)
      doc.setTextColor(30, 58, 138) // Navy 900
      doc.text('Saarthi AI - Application Checklist', 20, 20)
      
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30)
      
      // Application Info
      doc.setFontSize(16)
      doc.setTextColor(0)
      doc.text('Application Summary', 20, 45)
      
      const summaryData = [
        ['Application Type', 'Trade License (GHMC)'],
        ['Applicant Name', 'Ramesh Kumar'],
        ['Status', 'Form Pre-filled (Ready for Submission)'],
        ['Location', 'Hyderabad, Telangana']
      ]
      
      doc.autoTable({
        startY: 50,
        head: [['Field', 'Details']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138] }
      })
      
      // Checklist Table
      doc.setFontSize(16)
      doc.text('Required Documents Checklist', 20, doc.lastAutoTable.finalY + 15)
      
      const checklistData = [
        ['Aadhaar Card', 'Uploaded', 'Verified via DigiLocker'],
        ['PAN Card', 'Uploaded', 'Extracted via AI (98% Confidence)'],
        ['Rental Agreement', 'Uploaded', 'Manual Upload'],
        ['Property Tax Receipt', 'Pending', 'Action Required'],
        ['Passport Size Photo', 'Uploaded', 'Verified']
      ]
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Document Name', 'Status', 'Verification Method']],
        body: checklistData,
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] } // Saffron 500
      })
      
      // Footer
      const finalY = doc.lastAutoTable.finalY + 30
      doc.setFontSize(10)
      doc.setTextColor(150)
      doc.text('Note: This is an AI-generated checklist for your reference. Please ensure all original', 20, finalY)
      doc.text('documents are available for physical verification if requested by the department.', 20, finalY + 5)
      
      doc.save('Saarthi_AI_Application_Checklist.pdf')
    } catch (err) {
      console.error("PDF Generation failed", err)
      alert("Failed to generate PDF. Downloading text version instead.")
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Form Auto-Fill & Submission</h1>
          <p className="text-sm text-navy-500 mt-1">Review and complete your pre-filled application</p>
        </div>
        <Button onClick={handleDownloadChecklist} variant="outline" className="bg-white hover:bg-navy-50 border-navy-200 text-navy-700">
          <Download size={16} className="mr-2" />
          Download Checklist (PDF)
        </Button>
      </div>
      <FormPreview />
    </div>
  )
}
