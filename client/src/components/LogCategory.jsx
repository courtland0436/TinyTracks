import { useState } from 'react'

function LogCategory({ title, iconPath, stat, logs, onDelete, onUpdate, accentColor, bgColor, children }) {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")

  return (
    <div className={`border border-slate-200 rounded-[2rem] p-8 flex flex-col shadow-sm ${bgColor}`}>
      <div className="mb-8">
        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
          <img src={iconPath} alt="" className="h-8 w-8" /> 
          {title}
        </h3>
        <p className={`text-[10px] font-black uppercase tracking-widest ${accentColor}`}>{stat}</p>
      </div>

      {children}

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        <div className="text-[10px] font-black uppercase text-slate-300 mb-2 border-b border-slate-100 pb-2">Activity History</div>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-300 italic text-center py-12">No logs found for today.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center group">
              <div className="flex flex-col flex-1">
                <span className={`font-black text-[10px] uppercase tracking-tighter ${accentColor} mb-0.5`}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </span>
                {editingId === log.id ? (
                  <input 
                    autoFocus 
                    className="bg-white text-sm rounded-lg px-2 py-1 outline-none border border-blue-200 text-slate-900 w-full shadow-inner" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    onBlur={() => { onUpdate(log.id, editValue); setEditingId(null); }} 
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} 
                  />
                ) : (
                  <span onClick={() => { setEditingId(log.id); setEditValue(log.details); }} className="text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                    {log.details}
                  </span>
                )}
              </div>
              <button onClick={() => onDelete(log.id)} className="text-slate-200 hover:text-red-500 transition-colors px-2 text-xl ml-4">×</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LogCategory;