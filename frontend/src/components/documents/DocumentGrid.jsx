import DocumentCard from './DocumentCard'

export default function DocumentGrid({ documents, onDownloadDocument, onDeleteDocument, search }) {
  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredDocuments.map((doc) => (
        <DocumentCard 
          key={doc.id} 
          document={doc} 
          onDownloadDocument={onDownloadDocument}
          onDeleteDocument={onDeleteDocument}
        />
      ))}
    </div>
  )
}
