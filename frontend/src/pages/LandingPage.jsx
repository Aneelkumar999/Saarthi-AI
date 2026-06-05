import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Hero from '../components/landing/Hero'
import FeatureCards from '../components/landing/FeatureCards'
import HowItWorks from '../components/landing/HowItWorks'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = "Saarthi AI | Government Copilot"
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div>
...
      <FeatureCards />
      <HowItWorks />

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to simplify your government services?
          </h2>
          <p className="text-navy-300 text-lg mb-8">
            Join thousands of citizens who are navigating government services with confidence.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-saffron-500 text-white rounded-xl text-base font-medium hover:bg-saffron-600 transition-colors shadow-lg shadow-saffron-500/25"
          >
            Get Started Free
          </a>
        </div>
      </section>
    </div>
  )
}
