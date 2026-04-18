'use client'

import { DeviceShell } from '@/components/responsive/device-shell'

export default function Shell({ children }: { children: React.ReactNode }) {
  return <DeviceShell>{children}</DeviceShell>
}
