import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function ChildCard({ child }) {
  const [imgError, setImgError] = useState(false)
  const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5555'
  
  useEffect(() => {
    setImgError(false)
  }, [child.image_url])

  // Helper to build a clean URL without double-slashes
  const getImageUrl = () => {
    if (!child.image_url) return null
    if (child.image_url.startsWith('http')) return child.image_url
    
    const cleanBase = backendBaseUrl.replace(/\/$/, '') // Remove trailing slash
    const cleanPath = child.image_url.replace(/^\//, '') // Remove leading slash
    return `${cleanBase}/${cleanPath}`
  }

  const fullImageUrl = getImageUrl()

  return (
    <Link 
      to={`/children/${child.id}`}
      className="group bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-xl hover:shadow-blue-900/5 transition-all transform hover:-translate-y-1 shadow-sm flex items-center justify-between"
    >
      <div className="flex flex-col">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
          {child.name}
        </h3>
        <p className="text-blue-500 font-black tracking-widest uppercase text-[10px]">
          {child.age_display} • View logs →
        </p>
      </div>

      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform bg-slate-50 flex items-center justify-center">
        {fullImageUrl && !imgError ? (
          <img 
            src={fullImageUrl} 
            alt={child.name} 
            className="w-full h-full object-cover"
            onError={() => {
              console.error("Failed to load:", fullImageUrl)
              setImgError(true)
            }}
          />
        ) : (
          <div className="bg-blue-500 text-white w-full h-full flex items-center justify-center text-xl font-black uppercase">
            {child.name ? child.name[0] : "?"}
          </div>
        )}
      </div>
    </Link>
  )
}

export default ChildCard