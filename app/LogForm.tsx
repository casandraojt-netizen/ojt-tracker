"use client"; // This tells Next.js this file is interactive

import { saveEntry } from "./actions";

export default function LogForm() {
  const setPreset = () => {
    const d = document.getElementById('d') as HTMLInputElement;
    const s = document.getElementById('s') as HTMLInputElement;
    const e = document.getElementById('e') as HTMLInputElement;
    if (d && s && e) {
      d.valueAsDate = new Date();
      s.value = "07:00";
      e.value = "16:00";
    }
  };

  return (
    <form action={saveEntry} className="space-y-4 border p-6 rounded-xl bg-white shadow-sm">
      <h2 className="font-bold text-lg">Add New Log</h2>
      
      <button 
        type="button" 
        onClick={setPreset}
        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-200 transition"
      >
        ✨ Fill Default (7am-4pm)
      </button>

      <div className="grid gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
          <input id="d" name="date" type="date" required className="w-full p-2 border rounded mt-1" />
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Start Time</label>
            <input id="s" name="start" type="time" required className="w-full p-2 border rounded mt-1" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">End Time</label>
            <input id="e" name="end" type="time" required className="w-full p-2 border rounded mt-1" />
          </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-gray-800 transition">
        Save to Cloud
      </button>
    </form>
  );
}