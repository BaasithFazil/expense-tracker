'use client'

import { useState } from 'react'
import MobileSidebar from './MobilesideBar'

type Props = {
  user: any
  profile: any
  onLogout: () => void
}

export default function Navbar({ user, profile, onLogout }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center px-4 py-3 bg-white shadow">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen(true)} className="text-xl">
            ☰
          </button>

          <div>
            <h1 className="text-lg font-bold">Dashboard</h1>
            {user && (
              <p className="text-xs text-gray-500">
                {profile?.username || user.email}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-3 py-1 rounded-lg"
        >
          Logout
        </button>
      </div>

      <MobileSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
}