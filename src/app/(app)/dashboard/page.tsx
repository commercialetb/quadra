'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Target, 
  Clock,
  ArrowUpRight
} from 'lucide-react'
import './dashboard-home.css'

export default function DashboardPage() {
  return (
    <div className="dashboard-home-v3">
      
      {/* HEADER AI */}
      <header className="ai-welcome-section">
        <div className="flex items-center gap-2 text-[#007AFF] font-bold text-xs mb-4">
          <Sparkles size={14} fill="currentColor" />
          <span>INTELLIGENZA OPERATIVA</span>
        </div>
        <div className="ai-greeting">
          <h1>Buongiorno, Marco.</h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Oggi hai 3 azioni prioritarie. Il cliente Luce e Design S.r.l. richiede attenzione immediata per un'opportunità ferma.
          </p>
        </div>
      </header>

      {/* GRID RESPONSIVA */}
      <main className="op-grid">
        
        {/* AZIONI IMMEDIATE (Colonna principale) */}
        <section className="op-card col-main">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-extrabold tracking-tight">Azioni immediate</h2>
            <Link href="/followups" className="text-blue-600 text-sm font-bold">Vedi tutte</Link>
          </div>

          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="action-item-card">
                <div className="action-header">
                  <div>
                    <span className="status-badge badge-high">Alta Priorità</span>
                    <h3 className="font-bold text-md mt-2">Apri opportunità da ordini</h3>
                    <p className="text-xs text-gray-400">Luce e Design S.r.l.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Scadenza</p>
                    <p className="text-sm font-bold">2 giorni</p>
                  </div>
                </div>
                <div className="action-body">
                  Storico ordini da 173.811€ ma nessuna opportunità collegata.
                </div>
                <button className="w-full mt-2 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  Crea follow-up
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* MONITORAGGIO (Colonna laterale su Desktop, sotto su Mobile) */}
        <aside className="op-card col-side">
          <div className="flex items-center gap-2 mb-6">
            <Target size={18} className="text-gray-400" />
            <h2 className="text-lg font-extrabold tracking-tight">Monitoraggio</h2>
          </div>
          
          <div className="space-y-4">
            {['Webuild spa', 'Luce e Design S.r.l.', '3MP DESIGN S.r.l.'].map((name) => (
              <div key={name} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className="min-width-0">
                  <p className="font-bold text-sm truncate">{name}</p>
                  <p className="text-[10px] text-gray-400">Score: 35/100</p>
                </div>
                <ArrowUpRight size={16} className="text-gray-300" />
              </div>
            ))}
          </div>
        </aside>

        {/* ATTIVITÀ RECENTE */}
        <section className="op-card col-main">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-gray-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Log Attività</h2>
          </div>
          <p className="text-sm text-gray-500">Nessuna attività recente nelle ultime 2 ore.</p>
        </section>

      </main>

      {/* TASTO PLUS IPHONE */}
      <button className="mobile-action-btn">
        <Plus size={32} />
      </button>

    </div>
  )
}
