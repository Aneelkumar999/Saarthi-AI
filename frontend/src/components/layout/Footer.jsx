import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">
                Saarthi<span className="text-saffron-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-navy-300 leading-relaxed">
              Your AI Guide Through Government Services. State your goal, and we build the path.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/chat" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/documents" className="hover:text-white transition-colors">Document Vault</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">Business Registration</span></li>
              <li><span className="cursor-default">Birth Certificate</span></li>
              <li><span className="cursor-default">Farm Subsidies</span></li>
              <li><span className="cursor-default">Trade License</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">Help Center</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><span className="cursor-default">Contact Us</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-navy-400">
            &copy; 2026 Saarthi AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400">Made for Digital India</span>
            <span className="text-saffron-400">&#9733;</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
