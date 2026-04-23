'use client'

import { useEffect, useMemo, useState } from 'react'

type VoiceMode = 'silent' | 'assisted' | 'voice'

type Props = {
  userName?: string
  message?: string
  storageKey: string
  compact?: boolean
}

function cleanText(input: string) {
  return input.replace(/\s+/g, ' ').trim()
}

export function QuadraVoiceGreeting({ userName, message, storageKey, compact = false }: Props) {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('assisted')
  const [audioStatus, setAudioStatus] = useState('')

  const greeting = useMemo(() => {
    const name = cleanText(userName || '').split(' ')[0]
    if (message) return cleanText(message)
    if (name) return `Bentornato ${name}. Quadra ha preparato le priorita di oggi.`
    return 'Bentornato. Quadra ha preparato le priorita di oggi.'
  }, [message, userName])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('quadra_voice_mode')
    if (saved === 'silent' || saved === 'assisted' || saved === 'voice') setVoiceMode(saved)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (voiceMode === 'silent') return
    if (window.sessionStorage.getItem(storageKey)) return
    window.sessionStorage.setItem(storageKey, '1')
    if (voiceMode === 'assisted' || voiceMode === 'voice') {
      const utterance = new SpeechSynthesisUtterance(greeting)
      utterance.lang = 'it-IT'
      utterance.rate = 1
      utterance.onstart = () => setAudioStatus('Quadra sta leggendo il saluto.')
      utterance.onend = () => setAudioStatus('')
      utterance.onerror = () => setAudioStatus('Audio non disponibile su questo dispositivo.')
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }, [greeting, storageKey, voiceMode])

  function speak() {
    if (typeof window === 'undefined') return
    const utterance = new SpeechSynthesisUtterance(greeting)
    utterance.lang = 'it-IT'
    utterance.rate = 1
    utterance.onstart = () => setAudioStatus('Quadra sta leggendo il saluto.')
    utterance.onend = () => setAudioStatus('')
    utterance.onerror = () => setAudioStatus('Audio non disponibile su questo dispositivo.')
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  function stop() {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    setAudioStatus('')
  }

  return (
    <div className={`quadra-greeting-card ${compact ? 'is-compact' : ''}`}>
      <div>
        <span className="quadra-greeting-kicker">Benvenuto in Quadra</span>
        <p>{greeting}</p>
      </div>
      <div className="quadra-greeting-actions">
        <button type="button" className="quadra-pill-button primary" onClick={speak}>Ascolta Quadra</button>
        <button type="button" className="quadra-pill-button ghost" onClick={stop}>Ferma audio</button>
      </div>
      {audioStatus ? <div className="helper-text">{audioStatus}</div> : null}
    </div>
  )
}
