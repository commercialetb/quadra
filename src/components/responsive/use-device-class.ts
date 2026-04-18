'use client'

import { useEffect, useState } from 'react'

export type DeviceClass = 'desktop' | 'tablet' | 'mobile'

function detectDevice(): DeviceClass {
  if (typeof window === 'undefined') return 'desktop'

  const width = window.innerWidth
  const height = window.innerHeight
  const isLandscapePhone = window.matchMedia('(orientation: landscape) and (max-height: 500px) and (hover: none) and (pointer: coarse)').matches

  if (isLandscapePhone || width < 768) return 'mobile'
  if (width < 1180) return 'tablet'
  return 'desktop'
}

export function useDeviceClass() {
  const [deviceClass, setDeviceClass] = useState<DeviceClass>('desktop')

  useEffect(() => {
    const sync = () => setDeviceClass(detectDevice())
    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
    }
  }, [])

  return deviceClass
}
