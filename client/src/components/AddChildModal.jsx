import { useState } from 'react'

function AddChildModal({ isOpen, onClose, onAddChild }) {
  const [name, setName] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [image, setImage] = useState(null)

  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('birthdate', birthdate)
    if (image) formData.append('image', image)

    fetch('/api/children', {
      method: 'POST',
      body: formData,
    })
    .then(r => {
      if (!r.ok) throw new Error("Failed to save child")
      return r.json()
    })
    .then(newChild => {
      onAddChild(newChild)
      onClose()
      setName('')
      setBirthdate('')
      setImage(null)
    })
    .catch(err => console.error(err))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
        <h3 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tighter">Add Child</h3>
        <p className="text-slate-400 text-sm mb-8 text-center">Create a profile to start tracking care.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-black text-blue-600 mb-2 tracking-widest">Name</label>
            <input 
              required
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Child's Name"
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-colors" 
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-black text-blue-600 mb-2 tracking-widest">Birth Date</label>
            <input 
              required
              type="date" 
              value={birthdate} 
              onChange={(e) => setBirthdate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-colors" 
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-black text-blue-600 mb-2 tracking-widest">Profile Image</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition">Cancel</button>
            <button type="submit" className="px-6 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-200">Save Profile</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddChildModal