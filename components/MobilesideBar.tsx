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
            z-9999 shadow-lg 
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

                <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition"
                onClick={()=> router.push('transactions')}>
                <span><svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M11.3536 1.64645C11.1583 1.45118 10.8417 1.45118 10.6464 1.64645C10.4512 1.84171 10.4512 2.15829 10.6464 2.35355L12.2929 4H2.5C2.22386 4 2 4.22386 2 4.5C2 4.77614 2.22386 5 2.5 5H12.2929L10.6464 6.64645C10.4512 6.84171 10.4512 7.15829 10.6464 7.35355C10.8417 7.54882 11.1583 7.54882 11.3536 7.35355L13.8536 4.85355C14.0488 4.65829 14.0488 4.34171 13.8536 4.14645L11.3536 1.64645ZM5.35355 9.35355C5.54882 9.15829 5.54882 8.84171 5.35355 8.64645C5.15829 8.45118 4.84171 8.45118 4.64645 8.64645L2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536L4.64645 14.3536C4.84171 14.5488 5.15829 14.5488 5.35355 14.3536C5.54882 14.1583 5.54882 13.8417 5.35355 13.6464L3.70711 12H13.5C13.7761 12 14 11.7761 14 11.5C14 11.2239 13.7761 11 13.5 11H3.70711L5.35355 9.35355Z"/></svg></span>
                <span>All Transactions</span>
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