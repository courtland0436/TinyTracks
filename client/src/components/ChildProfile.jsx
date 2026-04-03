import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import LogCategory from './LogCategory'
import ExportModal from './ExportModal'
import HealthGuidance from './HealthGuidance'

// Assets
import feedIcon from '../assets/Icon_Feed.svg'
import sleepIcon from '../assets/Icon_Sleep.svg'
import diaperIcon from '../assets/Icon_Diaper.svg'
import feedImg from '../assets/Image_Feed.jpg'
import sleepImg from '../assets/Image_Sleep.jpg'
import diaperImg from '../assets/Image_Diaper.jpg'

function ChildProfile() {
  const { id } = useParams() 
  const navigate = useNavigate()
  const [child, setChild] = useState(null)
  const [logs, setLogs] = useState([])
  
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({ name: '', birthdate: '', image: null })

  const todayLocal = new Date().toLocaleDateString('en-CA') 
  const [selectedDate, setSelectedDate] = useState(todayLocal)

  const [oz, setOz] = useState("4")
  const [diaperStatus, setDiaperStatus] = useState("Wet")
  const [sleepH, setSleepH] = useState("1")
  const [sleepM, setSleepM] = useState("30")

  const [showExport, setShowExport] = useState(false)
  const [exportDates, setExportDates] = useState({ start: todayLocal, end: todayLocal })

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setChild(data)
        setLogs(data.logs || [])
        setEditFormData({ 
          name: data.name, 
          birthdate: data.birthdate || '',
          image: null 
        })
      })
  }, [id])

  function handleDownload() {
    const url = `/api/export/${id}?start=${exportDates.start}&end=${exportDates.end}`;
    window.location.href = url;
    setShowExport(false);
  }

  const dailyLogs = logs.filter(log => {
    if (!log.timestamp) return false;
    const logDate = log.timestamp.includes('T') ? log.timestamp.split('T')[0] : log.timestamp.split(' ')[0];
    return logDate === selectedDate;
  })

  const totalOz = dailyLogs.filter(l => l.activity_type === 'Feeding').reduce((sum, l) => sum + (parseFloat(l.details) || 0), 0)
  const totalSleepMinutes = dailyLogs.filter(l => l.activity_type === 'Sleep').reduce((sum, l) => {
      const h = parseInt(l.details.split('h')[0]) || 0
      const m = parseInt(l.details.split(' ')[1]) || 0
      return sum + (h * 60) + m
    }, 0)
  
  const sleepDisplay = `${Math.floor(totalSleepMinutes / 60)}h ${totalSleepMinutes % 60}m`
  const getFilteredLogs = (type) => dailyLogs.filter(log => log.activity_type === type)

  function handleUpdateProfile() {
    const data = new FormData()
    data.append('name', editFormData.name)
    data.append('birthdate', editFormData.birthdate)
    if (editFormData.image) data.append('image', editFormData.image)

    fetch(`/api/children/${id}`, { method: 'PATCH', body: data })
      .then((r) => r.json())
      .then((updatedChild) => {
        setChild(updatedChild)
        setIsEditing(false)
      })
  }

  function postLog(activity, details) {
    fetch('/api/care_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_type: activity, details, child_id: id, date: selectedDate }),
    })
      .then((r) => r.json())
      .then((newLog) => setLogs([newLog, ...logs]))
  }

  function updateLog(logId, newDetails) {
    fetch(`/api/care_logs/${logId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ details: newDetails }),
    })
    .then(r => r.json())
    .then(updatedLog => {
      setLogs(logs.map(l => l.id === logId ? updatedLog : l))
    })
  }

  function handleDelete(logId) {
    fetch(`/api/care_logs/${logId}`, { method: 'DELETE' }).then((r) => {
      if (r.ok) setLogs(logs.filter((log) => log.id !== logId))
    })
  }

  function handleDeleteChild() {
    if (window.confirm(`Are you sure you want to delete ${child.name}?`)) {
      fetch(`/api/children/${id}`, { method: 'DELETE' }).then((r) => {
        if (r.ok) navigate('/')
      })
    }
  }

  if (!child) return <div className="mt-20 text-slate-400 text-center italic">Loading profile...</div>

  return (
    <div className="w-full max-w-6xl px-4 pb-20 mx-auto">
      {showExport && (
        <ExportModal 
          isOpen={showExport} 
          onClose={() => setShowExport(false)} 
          dates={exportDates} 
          setDates={setExportDates} 
          onDownload={handleDownload} 
        />
      )}

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <Link to="/" className="text-blue-500 hover:text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] transition block mb-3">
            ← Back to Dashboard
          </Link>
          
          {isEditing ? (
            <div className="flex flex-col gap-3 bg-white p-6 rounded-3xl border border-blue-100 shadow-sm max-w-md">
              <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="text-4xl font-black text-slate-900 outline-none border-b-2 border-blue-200 focus:border-blue-500 pb-1" />
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Birthdate</label>
                <input type="date" value={editFormData.birthdate} onChange={(e) => setEditFormData({...editFormData, birthdate: e.target.value})} className="text-slate-600 font-bold text-sm bg-transparent outline-none" />
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Update Dashboard Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setEditFormData({...editFormData, image: e.target.files[0]})} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleUpdateProfile} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition">Save Changes</button>
                <button onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter">{child.name}</h2>
              <p className="text-blue-600 font-black tracking-widest uppercase text-xs mt-1">{child.age_display}</p>
            </>
          )}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => setShowExport(true)} className="flex-1 md:flex-none bg-white hover:bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm text-slate-900 transition flex flex-col items-center justify-center min-w-[110px]">
            <span className="block text-[9px] uppercase font-black text-slate-400 mb-1">Reports</span>
            <span className="font-bold text-sm text-blue-600">Export</span>
          </button>
          <div className="flex-1 md:flex-none bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-[9px] uppercase font-black mb-1 text-slate-400">Log Date</label>
            <input type="date" value={selectedDate} max={todayLocal} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer text-sm w-full" />
          </div>
        </div>
      </div>

      {/* Desktop Quick-Log Grid */}
      <div className="hidden md:block bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 mb-12">
        <div className="grid grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <button onClick={() => postLog('Feeding', `${oz}oz Bottle`)} className="flex flex-col items-center gap-3 p-8 rounded-3xl transition border border-blue-100 active:scale-95 text-blue-600 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(239, 246, 255, 0.7), rgba(239, 246, 255, 0.7)), url(${feedImg})` }}>
              <img src={feedIcon} alt="" className="h-12 w-12" />
              <span className="font-black text-xs uppercase tracking-[0.2em]">Log Feeding</span>
            </button>
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
              <input type="number" value={oz} onChange={(e) => setOz(e.target.value)} className="bg-transparent text-slate-900 font-black w-full outline-none text-center text-xl" />
              <span className="text-[10px] text-blue-500 font-black ml-2 uppercase">oz</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button onClick={() => postLog('Sleep', `${sleepH}h ${sleepM}m`)} className="flex flex-col items-center gap-3 p-8 rounded-3xl transition border border-indigo-100 active:scale-95 text-indigo-600 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(238, 242, 255, 0.7), rgba(238, 242, 255, 0.7)), url(${sleepImg})` }}>
              <img src={sleepIcon} alt="" className="h-12 w-12" />
              <span className="font-black text-xs uppercase tracking-[0.2em]">Log Sleep</span>
            </button>
            <div className="flex gap-2">
              <select value={sleepH} onChange={(e) => setSleepH(e.target.value)} className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3 text-slate-900 font-black text-center outline-none cursor-pointer">{[...Array(13).keys()].map(h => <option key={h} value={h}>{h}h</option>)}</select>
              <select value={sleepM} onChange={(e) => setSleepM(e.target.value)} className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3 text-slate-900 font-black text-center outline-none cursor-pointer">{["0", "15", "30", "45"].map(m => <option key={m} value={m}>{m}m</option>)}</select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button onClick={() => postLog('Diaper', diaperStatus)} className="flex flex-col items-center gap-3 p-8 rounded-3xl transition border border-emerald-100 active:scale-95 text-emerald-600 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgba(236, 253, 245, 0.7), rgba(236, 253, 245, 0.7)), url(${diaperImg})` }}>
              <img src={diaperIcon} alt="" className="h-12 w-12" />
              <span className="font-black text-xs uppercase tracking-[0.2em]">Log Diaper</span>
            </button>
            <select value={diaperStatus} onChange={(e) => setDiaperStatus(e.target.value)} className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-slate-900 font-black text-center outline-none cursor-pointer appearance-none">
              <option value="Wet">Wet</option>
              <option value="Dirty">Dirty</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log History Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <LogCategory title="Feeding" iconPath={feedIcon} stat={`${totalOz}oz total`} logs={getFilteredLogs('Feeding')} onDelete={handleDelete} onUpdate={updateLog} accentColor="text-blue-600" bgColor="bg-white">
          <div className="md:hidden mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col gap-3">
             <div className="flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2">
                <input type="number" value={oz} onChange={(e) => setOz(e.target.value)} className="bg-transparent text-slate-900 font-black w-full outline-none text-center text-lg" />
                <span className="text-[8px] text-blue-500 font-black ml-1 uppercase">oz</span>
             </div>
             <button onClick={() => postLog('Feeding', `${oz}oz Bottle`)} className="w-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl">Log Feeding</button>
          </div>
        </LogCategory>

        <LogCategory title="Sleep" iconPath={sleepIcon} stat={`${sleepDisplay} total`} logs={getFilteredLogs('Sleep')} onDelete={handleDelete} onUpdate={updateLog} accentColor="text-indigo-600" bgColor="bg-white">
          <div className="md:hidden mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col gap-3">
             <div className="flex gap-2">
                <select value={sleepH} onChange={(e) => setSleepH(e.target.value)} className="flex-1 bg-white rounded-xl border border-slate-200 p-2 text-slate-900 font-black text-center outline-none text-sm">{[...Array(13).keys()].map(h => <option key={h} value={h}>{h}h</option>)}</select>
                <select value={sleepM} onChange={(e) => setSleepM(e.target.value)} className="flex-1 bg-white rounded-xl border border-slate-200 p-2 text-slate-900 font-black text-center outline-none text-sm">{["0", "15", "30", "45"].map(m => <option key={m} value={m}>{m}m</option>)}</select>
             </div>
             <button onClick={() => postLog('Sleep', `${sleepH}h ${sleepM}m`)} className="w-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl">Log Sleep</button>
          </div>
        </LogCategory>

        <LogCategory title="Diaper" iconPath={diaperIcon} stat={`${getFilteredLogs('Diaper').length} changes`} logs={getFilteredLogs('Diaper')} onDelete={handleDelete} onUpdate={updateLog} accentColor="text-emerald-600" bgColor="bg-white">
          <div className="md:hidden mb-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col gap-3">
             <select value={diaperStatus} onChange={(e) => setDiaperStatus(e.target.value)} className="w-full bg-white rounded-xl border border-slate-200 p-2 text-slate-900 font-black text-center outline-none text-sm">
                <option value="Wet">Wet</option>
                <option value="Dirty">Dirty</option>
                <option value="Both">Both</option>
             </select>
             <button onClick={() => postLog('Diaper', diaperStatus)} className="w-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl">Log Diaper</button>
          </div>
        </LogCategory>
      </div>

      {/* MODULAR Health Guidance Section */}
      <HealthGuidance childId={id} childName={child.name} />

      {/* Action Links */}
      <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center gap-6">
        <span onClick={() => { setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="cursor-pointer text-[10px] font-black uppercase tracking-[0.4em] text-emerald-200 hover:text-emerald-600 transition">
          Edit Profile
        </span>
        <span onClick={handleDeleteChild} className="cursor-pointer text-[10px] font-black uppercase tracking-[0.4em] text-red-200 hover:text-red-600 transition">
          Delete {child.name}'s Profile
        </span>
      </div>
    </div>
  )
}

export default ChildProfile;