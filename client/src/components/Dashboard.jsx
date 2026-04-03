import { useState, useEffect } from 'react'
import ChildCard from './ChildCard'
import AddChildModal from './AddChildModal'
import TeddyIcon from '../assets/Icon_Teddy.svg'

function Dashboard({ user }) {
  const [children, setChildren] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Function to fetch children - shared so it can be called after adding
  const fetchChildren = () => {
    fetch('/api/children')
      .then((r) => r.json())
      .then((data) => setChildren(data))
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  return (
    <div className="w-full max-w-6xl px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Your Family</h2>
          <p className="text-blue-500 font-black tracking-widest uppercase text-xs mt-1">
            {children.length} {children.length === 1 ? 'Child' : 'Children'} Tracked
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          + Add Child
        </button>
      </div>

      {children.length === 0 ? (
        <div className="text-center p-20 border border-slate-200 bg-white rounded-[2.5rem] shadow-sm flex flex-col items-center">
          <img src={TeddyIcon} alt="Teddy Bear" className="w-20 h-20 mb-4" />
          <p className="text-slate-400 font-bold italic">No children registered yet. Add your first child above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}

      <AddChildModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddChild={() => fetchChildren()} // Refresh the whole list to get the new image_url
      />
    </div>
  )
}

export default Dashboard