import { useState } from 'react'
// Import the logo asset
import Logo from '../assets/TinyTracks_Logo.svg'

function Login({ setUser }) {
  const [isSignup, setIsSignup] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const endpoint = isSignup ? '/api/signup' : '/api/login'
    
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then((r) => {
      if (r.ok) {
        r.json().then((user) => setUser(user))
      } else {
        alert('Authentication failed. Please check your credentials.')
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 p-12 rounded-[2.5rem] shadow-xl shadow-blue-900/5 w-full max-w-md mx-auto mt-20">
      <div className="text-center mb-10 flex flex-col items-center">
        {}
        <img 
          src={Logo} 
          alt="TinyTracks Logo" 
          className="w-50 h-50 mb-6" 
        />
        
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">
          {isSignup ? 'Join the Family' : 'Welcome Back'}
        </h2>
        <p className="text-blue-500 font-black tracking-widest uppercase text-[10px]">
          {isSignup ? 'Start tracking care today' : 'Continue your care logs'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-black text-slate-400 mb-2 ml-1 tracking-widest">Username</label>
          <input
            type="text"
            required
            placeholder="Your username"
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] uppercase font-black text-slate-400 mb-2 ml-1 tracking-widest">Password</label>
          <input
            type="password"
            required
            placeholder="••••••••"
            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="bg-blue-500 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 active:scale-95 mt-4">
          {isSignup ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-2">
        <p className="text-slate-400 text-xs font-bold italic">
          {isSignup ? 'Already have an account?' : "New to the app?"}
        </p>
        <button 
          onClick={() => setIsSignup(!isSignup)}
          className="text-blue-600 font-black uppercase text-[10px] tracking-widest hover:text-blue-800 transition-colors"
        >
          {isSignup ? 'Login instead' : 'Create an account'}
        </button>
      </div>
    </div>
  )
}

export default Login