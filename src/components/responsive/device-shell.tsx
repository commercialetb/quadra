'use client'

import { usePathname } from 'next/navigation'
import { useDeviceClass } from './use-device-class'
import { ShellDesktop } from '@/components/shell/shell-desktop'
import { ShellTablet } from '@/components/shell/shell-tablet'
import { ShellMobile } from '@/components/shell/shell-mobile'

export function DeviceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const deviceClass = useDeviceClass()

  if (deviceClass === 'mobile') {
    return <ShellMobile pathname={pathname}>
      {children}
    </ShellMobile>
  }

  if (deviceClass === 'tablet') {
    return <ShellTablet pathname={pathname}>
      {children}
    </ShellTablet>
  }

  return <ShellDesktop pathname={pathname}>{children}</ShellDesktop>
}
