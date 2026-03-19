import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function Disclaimer() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'var(--brand-navy)' }} className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
            Universal Postal Union
          </p>
          <h1 className="text-3xl font-bold text-white">Disclaimer</h1>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">

          {/* Source attribution */}
          <div className="mb-8 p-4 rounded-lg border-l-4 text-sm text-gray-600"
            style={{ background: '#EFF6FF', borderColor: 'var(--brand-navy)' }}>
            Source:{' '}
            <a
              href="https://www.upu.int/en/Disclaimer"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-800"
              style={{ color: 'var(--brand-navy)' }}
            >
              www.upu.int/en/Disclaimer
            </a>
          </div>

          <ul className="space-y-6 text-gray-700 leading-relaxed">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'var(--brand-navy)' }}>1</span>
              <p>
                Anyone may use or reproduce any information presented on this website, subject to any
                specific terms of use that might appear with such information, provided that the use
                of such information is accompanied by an acknowledgement that the UPU is the source.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'var(--brand-navy)' }}>2</span>
              <p>
                The UPU makes every effort to ensure, but cannot and does not guarantee, and makes
                no warranties as to, the accuracy, accessibility, integrity and timeliness of any
                information presented on this website. The UPU assumes no liability or responsibility
                for any errors or omissions in the content of this website and further disclaims any
                liability of any nature for any loss howsoever caused in connection with using this
                website, including failure of performance, computer virus or communication line
                failure, regardless of cause, or for any damages resulting therefrom. The UPU may
                make changes to these materials at any time without notice.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'var(--brand-navy)' }}>3</span>
              <p>
                Hyperlinks to other websites are provided as a convenience only, and imply neither
                responsibility for, nor approval of, the information contained in those other web
                sites on the part of the UPU. The UPU makes no warranty, either express or implied,
                as to the accuracy, availability, reliability or content of such information, text,
                graphics and hyperlinks. The UPU has not tested any software located on other sites
                and does not make any representations as to the quality, safety, reliability or
                suitability of such software.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'var(--brand-navy)' }}>4</span>
              <p>
                As the case may be, the collection and retention of personal information by the UPU
                through its website may be subject to the terms of a UPU privacy policy.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'var(--brand-navy)' }}>5</span>
              <p>
                Nothing in or relating to this disclaimer or the UPU website shall be deemed a
                waiver, explicit or implied, of any of the privileges and immunities of the UPU.
              </p>
            </li>
          </ul>

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-800 transition-colors">← Back to NetDiscover</Link>
            <span className="w-px h-4 bg-gray-200" />
            <Link to="/copyright" className="hover:text-gray-800 transition-colors">Copyright</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
