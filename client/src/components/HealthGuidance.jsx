import { useState, useEffect } from 'react'

function HealthGuidance({ childId, childName }) {
  const [healthTips, setHealthTips] = useState([])
  const [loadingTips, setLoadingTips] = useState(true)

  useEffect(() => {
    setLoadingTips(true)
    fetch(`/api/children/${childId}/health_tips`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch tips")
        return r.json()
      })
      .then((tips) => {
        setHealthTips(tips)
        setLoadingTips(false)
      })
      .catch(() => {
        setHealthTips([])
        setLoadingTips(false)
      })
  }, [childId])

  return (
    <div className="mt-16 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <span className="text-2xl">💡</span>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Health Guidance</h3>
          <p className="text-blue-500 font-black tracking-widest uppercase text-[10px]">Tips for {childName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loadingTips ? (
          <p className="text-slate-400 italic text-sm py-4">Finding the best advice...</p>
        ) : healthTips.length > 0 ? (
          healthTips.map((tip) => (
            <div 
              key={tip.id} 
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
            >
              <p className="text-slate-900 font-bold text-sm leading-relaxed">
                {tip.title}
              </p>
              <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest mt-4 block">
                {tip.category}
              </span>
            </div>
          ))
        ) : (
          <p className="text-slate-400 italic text-sm py-4">No health advice available at the moment.</p>
        )}
      </div>
    </div>
  )
}

export default HealthGuidance