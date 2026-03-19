import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function Copyright() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8FAFC' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background: 'var(--brand-navy)' }} className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
            Universal Postal Union
          </p>
          <h1 className="text-3xl font-bold text-white">Copyright</h1>
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
              href="https://www.upu.int/en/Copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-800"
              style={{ color: 'var(--brand-navy)' }}
            >
              www.upu.int/en/Copyright
            </a>
          </div>

          {/* Main copyright notice */}
          <div className="mb-8 p-5 rounded-lg text-center"
            style={{ background: '#F0F4FF', border: '1px solid #C7D7F5' }}>
            <p className="text-lg font-bold" style={{ color: 'var(--brand-navy)' }}>
              ©2020 Universal Postal Union — All rights reserved.
            </p>
          </div>

          <ol className="space-y-6 text-gray-700 leading-relaxed list-none">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'var(--brand-navy)' }}>1</span>
              <p>
                None of the materials provided on this website may be used, reproduced or
                transmitted, in whole or in part, in any form or by any means, electronic or
                mechanical, including photocopying, recording or the use of any information storage
                and retrieval system, except as provided for in this website (see the{' '}
                <Link to="/disclaimer" className="underline font-medium hover:opacity-80"
                  style={{ color: 'var(--brand-navy)' }}>
                  "Disclaimer" section
                </Link>
                ), without permission in writing from the UPU or the publisher concerned.
              </p>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: 'var(--brand-navy)' }}>2</span>
              <p>
                Access to databases of the UPU for consultation of documents and/or information
                retrieval is permitted by the UPU subject to the user's acceptance of UPU's
                provisions and conditions of copyright contained within each document which obliges
                the user not to duplicate the document or parts thereof for distribution or sale
                external to the user's organization. Without prejudice to the foregoing obligations,
                such information may be utilized in the receiving organization, as required, to
                further the work of the UPU, to provide guidance for product or service development
                and implementation and to serve as support documentation associated with a product
                or service.
              </p>
            </li>
          </ol>

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-800 transition-colors">← Back to NetDiscover</Link>
            <span className="w-px h-4 bg-gray-200" />
            <Link to="/disclaimer" className="hover:text-gray-800 transition-colors">Disclaimer</Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
