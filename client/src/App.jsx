import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ChildProfile from './components/ChildProfile'
import logo from './assets/TinyTracks_Logo.svg'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/check_session').then((r) => {
      if (r.ok) {
        r.json().then((user) => {
          setUser(user)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [])

  function handleLogout() {
    fetch('/api/logout', { method: 'DELETE' }).then(() => {
        setUser(null)
    })
  }

  if (loading) return <div className="min-h-screen bg-[#F8FAFC]"></div>

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center text-slate-900 font-sans">
        
        {user && (
          <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
            <Link to="/" className="flex items-center group transition-transform active:scale-95">
              <img 
                src={logo} 
                alt="TinyTracks Logo" 
                className="h-12 w-auto drop-shadow-sm group-hover:scale-105 transition-all" 
              />
            </Link>
            
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-slate-500 tracking-wide hidden sm:block">
                Welcome, <span className="text-slate-900 font-bold">{user.username}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="bg-slate-100 hover:bg-slate-200 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-200 text-slate-600 active:scale-95"
              >
                Logout
              </button>
            </div>
          </header>
        )}

        <main className="w-full max-w-6xl flex flex-col items-center py-12 px-4">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Dashboard user={user} /> : <Login setUser={setUser} />} 
            />
            <Route 
              path="/children/:id" 
              element={user ? <ChildProfile /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App