import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation';


type Props = {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
  }
  
  export default function MobileSidebar({ isOpen, setIsOpen }: Props) {
    const router = useRouter();
    if(!isOpen) return null

    return createPortal(
      <>
        
      
        {/* Overlay */}
        {isOpen && (
          <div
            className={`fixed inset-0 bg-black/50 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
          />
        )}
  
        {/* Sidebar */}
        <div 
            className={`fixed top-0 left-0 h-full w-64 
            bg-white text-black 
            z-[9999] shadow-lg 
            border-r border-gray-200 
            transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
                >
                ✕
                </button>
            </div>

            {/* Menu */}
            <ul className="p-4 space-y-2">
                <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
                onClick={()=> router.push('dashboard')}>
                <span>🏠</span>
                <span>Dashboard</span>
                </li>

                <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
                onClick={()=> router.push('add-expense')}>
                <span>💸</span>
                <span>Expenses</span>
                </li>

                <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
                onClick={()=> router.push('add-account')}>
                <span>💼</span>
                <span>Accounts</span>
                </li>

                <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition">
                <span>⚙️</span>
                <span>Settings</span>
                </li>
            </ul>
            </div>
      </>,
      document.body
    )
  }