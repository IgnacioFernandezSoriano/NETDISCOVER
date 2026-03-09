import { useState, useEffect } from 'react'
import { ShoppingBag, Search, ExternalLink, Mail, Loader2, Filter } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import type { MarketProvider } from '../lib/supabase'

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'technology', label: 'Technology' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'training', label: 'Training' },
  { value: 'measurement', label: 'Measurement' },
  { value: 'rfid', label: 'RFID / Tracking' },
  { value: 'platform', label: 'Platform' },
  { value: 'other', label: 'Other' },
]

const PHASE_FILTERS = [
  { value: 'all', label: 'All Phases' },
  { value: 'phase1', label: 'Measurement Design' },
  { value: 'phase2', label: 'Ecosystem Mapping' },
  { value: 'phase3', label: 'SLA Establishment' },
  { value: 'phase4', label: 'Network Diagnosis' },
  { value: 'phase5', label: 'Improvement' },
  { value: 'phase6', label: 'Enforcement' },
  { value: 'phase7', label: 'Benchmarking' },
]

const CATEGORY_COLORS: Record<string, string> = {
  technology: 'bg-blue-50 text-blue-700',
  consulting: 'bg-purple-50 text-purple-700',
  training: 'bg-amber-50 text-amber-700',
  measurement: 'bg-green-50 text-green-700',
  rfid: 'bg-cyan-50 text-cyan-700',
  platform: 'bg-indigo-50 text-indigo-700',
  other: 'bg-gray-50 text-gray-600',
}

interface ContactForm {
  name: string
  email: string
  organization: string
  message: string
}

export default function Market() {
  const [providers, setProviders] = useState<MarketProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPhase, setSelectedPhase] = useState('all')
  const [contactProvider, setContactProvider] = useState<MarketProvider | null>(null)
  const [contactForm, setContactForm] = useState<ContactForm>({ name: '', email: '', organization: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('market_providers')
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false })
      setProviders(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = providers.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false
    if (selectedPhase !== 'all' && !(p.relevant_phases ?? []).includes(selectedPhase)) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.name_en.toLowerCase().includes(q) ||
        (p.description_en ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleContact = async () => {
    if (!contactProvider || !contactForm.name || !contactForm.email) return
    setSubmitting(true)
    try {
      await supabase.from('provider_leads').insert({
        provider_id: contactProvider.id,
        name: contactForm.name,
        email: contactForm.email,
        organization: contactForm.organization,
        message: contactForm.message,
      })
      setSubmitted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <section style={{ background: 'var(--brand-navy)' }} className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag size={24} style={{ color: 'var(--brand-cyan)' }} />
            <p className="section-label">Solution Market</p>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            Find providers and solutions
          </h1>
          <p className="text-white/50 text-sm max-w-xl">
            Discover technology providers, consultants and training organizations that can help improve your postal quality maturity.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-48 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search providers..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <select
            value={selectedPhase}
            onChange={e => setSelectedPhase(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          >
            {PHASE_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-cyan)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <ShoppingBag size={32} className="mx-auto mb-4 text-gray-300" />
            <h3 className="font-bold text-gray-600 mb-2">No providers found</h3>
            <p className="text-sm text-gray-400">
              {providers.length === 0
                ? 'The provider catalog will be populated soon. Check back later.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(provider => (
              <div key={provider.id} className={`card p-5 ${provider.featured ? 'ring-2 ring-offset-1 ring-cyan-400' : ''}`}>
                {provider.featured && (
                  <div className="text-xs font-bold mb-3 px-2 py-0.5 rounded inline-flex"
                    style={{ background: 'var(--brand-cyan)', color: 'white' }}>
                    Featured
                  </div>
                )}

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--brand-navy)' }}>{provider.name_en}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium mt-1 inline-block ${CATEGORY_COLORS[provider.category] ?? 'bg-gray-50 text-gray-600'}`}>
                      {provider.category}
                    </span>
                  </div>
                  {provider.logo_url && (
                    <img src={provider.logo_url} alt={provider.name_en} className="w-12 h-12 object-contain rounded" />
                  )}
                </div>

                {provider.description_en && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{provider.description_en}</p>
                )}

                {/* Relevant phases */}
                {(provider.relevant_phases ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(provider.relevant_phases ?? []).map(phase => (
                      <span key={phase} className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'var(--brand-light)', color: 'var(--brand-navy)' }}>
                        {PHASE_FILTERS.find(f => f.value === phase)?.label ?? phase}
                      </span>
                    ))}
                  </div>
                )}

                {/* Case studies */}
                {(provider.case_studies ?? []).length > 0 && (
                  <div className="mb-3 border-t border-gray-100 pt-3">
                    <p className="text-xs font-semibold text-gray-400 mb-2">Case Studies</p>
                    {(provider.case_studies ?? []).slice(0, 2).map((cs, i) => (
                      <div key={i} className="mb-1">
                        <p className="text-xs font-medium text-gray-700">{cs.titleEn}</p>
                        <p className="text-xs text-gray-500">{cs.descriptionEn}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Website
                    </a>
                  )}
                  <button
                    onClick={() => { setContactProvider(provider); setSubmitted(false); setContactForm({ name: '', email: '', organization: '', message: '' }) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all hover:opacity-90"
                    style={{ background: 'var(--brand-navy)' }}
                  >
                    <Mail size={12} />
                    Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Contact modal */}
      {contactProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--brand-green)', opacity: 0.9 }}>
                  <Mail size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--brand-navy)' }}>Message sent!</h3>
                <p className="text-sm text-gray-500 mb-4">
                  {contactProvider.name_en} will be in touch with you shortly.
                </p>
                <button
                  onClick={() => setContactProvider(null)}
                  className="btn-primary mx-auto"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--brand-navy)' }}>
                  Contact {contactProvider.name_en}
                </h3>
                <p className="text-sm text-gray-500 mb-5">Your profile will be shared with the provider.</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Organization</label>
                    <input
                      type="text"
                      value={contactForm.organization}
                      onChange={e => setContactForm(f => ({ ...f, organization: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Your organization"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                      placeholder="Describe your needs..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setContactProvider(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContact}
                    disabled={!contactForm.name || !contactForm.email || submitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                    style={{ background: 'var(--brand-navy)' }}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
