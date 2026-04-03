function ExportModal({ isOpen, onClose, dates, setDates, onDownload, today }) {
  if (!isOpen) return null

  // Helper to handle the double action
  const handleDownloadAndClose = () => {
    onDownload(); // Triggers the CSV generation/download
    onClose();    // Closes the modal immediately
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
        <h3 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tighter">Export Data</h3>
        <p className="text-slate-400 text-sm mb-8 text-center">Select the date range for your CSV report.</p>
        
        <div className="space-y-5">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-black text-blue-600 mb-2 tracking-widest">Start Date</label>
            <input 
              type="date" 
              max={today} 
              value={dates.start} 
              onChange={(e) => setDates({...dates, start: e.target.value})} 
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-colors" 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-black text-blue-600 mb-2 tracking-widest">End Date</label>
            <input 
              type="date" 
              max={today} 
              value={dates.end} 
              onChange={(e) => setDates({...dates, end: e.target.value})} 
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 outline-none focus:border-blue-500 transition-colors" 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-10">
          <button 
            onClick={onClose} 
            className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button 
            onClick={handleDownloadAndClose} 
            className="px-6 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportModal