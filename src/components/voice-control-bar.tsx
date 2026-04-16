'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type SpeechRecognitionAlternative = { transcript: string }
type SpeechRecognitionResult = {
  0: SpeechRecognitionAlternative
  isFinal: boolean
}
type SpeechRecognitionEventLike = Event & {
  resultIndex: number
  results: SpeechRecognitionResult[]
}

type SpeechRecognitionInstance = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: Event & { error?: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance
    SpeechRecognition?: new () => SpeechRecognitionInstance
  }
}

export function VoiceControlBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  function goToVoicePage(note = '') {
    const query = note.trim() ? `?note=${encodeURIComponent(note.trim())}` : ''
    router.push(`/capture/voice${query}`)
  }

  function startListening() {
    if (typeof window === 'undefined') return
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      goToVoicePage()
      return
    }

    recognitionRef.current?.stop()
    const recognition = new Recognition()
    recognition.lang = 'it-IT'
    recognition.continuous = false
    recognition.interimResults = true

    let finalTranscript = ''
    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i]?.[0]?.transcript ?? ''
        if (event.results[i]?.isFinal) finalTranscript += `${text} `
        else interim += text
      }
      setStatus((finalTranscript || interim).trim() || 'Sto ascoltando...')
    }

    recognition.onerror = (event) => {
      setListening(false)
      setStatus(event.error === 'not-allowed' ? 'Microfono non autorizzato.' : 'Dettatura non disponibile.')
    }

    recognition.onend = () => {
      setListening(false)
      const note = finalTranscript.trim()
      if (note) goToVoicePage(note)
    }

    recognitionRef.current = recognition
    setListening(true)
    setStatus('Sto ascoltando...')
    recognition.start()
  }

  return (
    <div className={`voice-control-bar ${compact ? 'is-compact' : ''} ${listening ? 'is-listening' : ''}`}>
      <button
        type="button"
        className="voice-trigger"
        onClick={startListening}
        aria-label={supported ? 'Avvia dettatura vocale' : 'Apri workspace vocale'}
      >
        <span className="voice-trigger-dot" />
        <span className="voice-trigger-wave" aria-hidden="true"><i /><i /><i /><i /></span>
        <span className="voice-trigger-label">{listening ? 'Ascolto in corso' : 'Voice Control Bar'}</span>
      </button>

      {!compact ? (
        <div className="voice-control-actions">
          <Link href="/capture/voice" className="voice-link">Detta</Link>
          <Link href="/assistant" className="voice-link">Assistente</Link>
          <Link href="/capture/siri" className="voice-link">Shortcut</Link>
        </div>
      ) : null}

      <div className="voice-control-status" aria-live="polite">
        {status || (supported ? 'Tocca per dettare e aprire la nota vocale.' : 'Apre il workspace vocale.')}
      </div>
    </div>
  )
}
