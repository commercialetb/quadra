'use client'

import { useDeviceClass } from '@/components/responsive/use-device-class'
import { DashboardDesktop } from './dashboard-desktop'
import { DashboardMobile } from './dashboard-mobile'
import { DashboardTablet } from './dashboard-tablet'
import type { DashboardData } from './shared/dashboard-types'

export function DashboardResponsive({ data }: { data: DashboardData }) {
  const deviceClass = useDeviceClass()

  if (deviceClass === 'mobile') return <DashboardMobile data={data} />
  if (deviceClass === 'tablet') return <DashboardTablet data={data} />
  return <DashboardDesktop data={data} />
}
