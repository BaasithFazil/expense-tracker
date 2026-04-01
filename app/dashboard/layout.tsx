import Navbar from '@/components/Navbar'
import { Sidebar } from 'lucide-react'
import { ReactNode } from 'react'

export default function DashboardLayout({ children } : {children: ReactNode}) {
  return (
    <>
      {children}
    </>
  )
}