'use client'

import React from 'react'
import Link from 'next/link'
// L'import ora è locale, garantito al 100% che Webpack lo trovi!
import './dashboard-home.css'

export default function DashboardPage() {
  const actions = [
    {
      id: 1,
      title: "Apri opportunità da ordini",
      company: "Luce e Design S.r.l.",
      desc: "Storico ordini da 173.811 EUR ma nessuna opportunità collegata.",
      due: "2g"
    },
    {
      id: 2,
      title: "Check-in strategico",
      company: "Webuild spa",
      desc: "Pipeline attiva ma senza prossima azione registrata.",
      due: "3g"
    }
  ]

  return (
    <div className="home-container">
      
      {/* 1. AI HEADER */}
      <header className="ai-hero-card">
        <div className="ai-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mr-1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          QUADRA AI BRIEFING
        </div>
        <h1 className="home-title">Buongiorno, Marco.</h1>
        <p className="ai-summary-text">
          Oggi hai <strong>2 azioni urgenti</strong>. Luce e Design richiede un'opportunità immediata basata sullo storico ordini.
        </p>
      </header>

      {/* 2. GRID PRINCIPALE */}
      <main className="home-grid">
        
        {/* SEZIONE AZIONI (Principale) */}
        <section className="home-card col-span-desktop-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Azioni immediate</h2>
            <Link href="/followups" className="text-[#007AFF] text-sm font-bold flex items-center gap-1">
              Tutte
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>

          <div className="space-y-4">
            {actions.map((action) => (
              <div 
                key={action.id} 
                className="matter-action-row" 
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px', background: '#f9f9fb', borderRadius: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', background: '#fee2e2', color: '#ef4444' }}>High</span>
                    <strong style={{ display: 'block', marginTop: '10px', fontSize: '1.1rem', color: '#1d1d1f' }}>{action.title}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#86868b' }}>{action.company}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: '#86868b', fontWeight: 'bold', textTransform: 'uppercase' }}>Scadenza</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1d1d1f' }}>{action.due}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.95rem', color: '#424245', marginTop: '12px', lineHeight: 1.5 }}>{action.desc}</p>
                <button style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer' }}>
                  Crea follow-up
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SEZIONE MONITORAGGIO (Sidebar) */}
        <aside className="home-card col-span-desktop-4">
          <div className="flex items-center gap-2 mb-6">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>
            </svg>
            <h2 className="text-lg font-bold">Aziende da seguire</h2>
          </div>
          
          <div className="space-y-2">
            {['Webuild spa', '3MP DESIGN S.r.l.', 'TULLI LUCE S.r.l.'].map((name) => (
              <div key={name} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                <div className="truncate pr-4">
                  <p className="font-bold text-sm truncate">{name}</p>
                  <p className="text-[10px] text-gray-500 font-bold">MONITORAGGIO • MEDIUM</p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            ))}
          </div>
        </aside>

      </main>

      {/* 3. FAB IPHONE */}
      <button className="fab-apple">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

    </div>
  )
}
