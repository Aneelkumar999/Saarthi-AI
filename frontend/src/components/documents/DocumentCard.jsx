import Badge from '../ui/Badge'
import { FileText, Download, Trash2, BrainCircuit, Check, ShieldCheck } from 'lucide-react'

const statusColors = {
  verified: 'green',
  pending: 'saffron',
  expired: 'red',
}

export default function DocumentCard({ document, index, onDownloadDocument, onDeleteDocument }) {
  const hasIntelligence = document.intelligence && document.intelligence.extracted_fields;

  const handleDownload = () => {
    onDownloadDocument(document);
  };

  const handleDelete = () => {
    onDeleteDocument(document.id);
  };

  return (
    <div className="bg-white rounded-xl border border-navy-100 p-4 hover:shadow-md hover:border-navy-200 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-navy-50 flex items-center justify-center group-hover:bg-navy-100 transition-colors">
          <FileText size={20} className="text-navy-600" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge color={statusColors[document.status]}>
            {document.status}
          </Badge>
          {document.status === 'verified' && (
             <span className="flex items-center gap-0.5 text-[8px] font-bold text-green-600 uppercase">
               <ShieldCheck size={10} />
               Gov Verified
             </span>
          )}
        </div>
      </div>

      <h4 className="text-sm font-semibold text-navy-900 mb-0.5 truncate">{document.name}</h4>
      <p className="text-[10px] text-navy-400 mb-3">{document.type} &middot; {document.uploadedAt}</p>

      {hasIntelligence && (
        <div className="mb-4 p-2.5 bg-navy-50/50 rounded-lg border border-navy-50">
          <div className="flex items-center gap-1.5 mb-2">
            <BrainCircuit size={14} className="text-saffron-500" />
            <span className="text-[10px] font-bold text-navy-900 uppercase tracking-tighter">AI Extraction</span>
            <span className="ml-auto text-[10px] font-bold text-green-600">{(document.intelligence.overall_confidence * 100).toFixed(0)}% Conf.</span>
          </div>
          
          <div className="space-y-1.5">
            {Object.entries(document.intelligence.extracted_fields).slice(0, 2).map(([key, data]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="text-navy-400 capitalize">{key.replace('_', ' ')}</span>
                  <span className="text-navy-700 font-medium truncate max-w-[80px]">{data.value}</span>
                </div>
                <div className="w-full h-1 bg-navy-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-saffron-400 rounded-full" 
                    style={{ width: `${data.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button 
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-navy-50 text-navy-600 rounded-lg text-xs font-medium hover:bg-navy-100 transition-colors"
        >
          <Download size={14} />
          Download
        </button>
        <button 
          onClick={handleDelete}
          className="p-2 text-navy-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
