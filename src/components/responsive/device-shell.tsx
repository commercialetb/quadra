'use client'

import { usePathname } from 'next/navigation'

import { ShellDesktop } from '@/components/shell/shell-desktop'
import { ShellTablet } from '@/components/shell/shell-tablet'
import { ShellMobile } from '@/components/shell/shell-mobile'

type DeviceShellProps = {
  children: React.ReactNode
}

export function DeviceShell({ children }: DeviceShellProps) {
  const pathname = usePathname()

  if (pathname.startsWith('/capture')) {
    return <ShellMobile pathname={pathname}>{children}</ShellMobile>
  }

  return (
    <>
      <div className="device-shell device-shell-desktop">
        <ShellDesktop>{children}</ShellDesktop>
      </div>

      <div className="device-shell device-shell-tablet">
        <ShellTablet pathname={pathname}>{children}</ShellTablet>
      </div>

      <div className="device-shell device-shell-mobile">
        <ShellMobile pathname={pathname}>{children}</ShellMobile>
      </div>
    </>
  )
}
