import { sql } from "@vercel/postgres";
import { saveEntry } from "./actions";

export default async function Page() {
  // Fetch all logs from the database
  const { rows } = await sql`SELECT * FROM ojt_logs ORDER BY date DESC`;
  
  const totalHours = rows.reduce((sum, row) => sum + Number(row.hours_worked), 0);
  const remainingHours = 550 - totalHours;

  // Weekday-only Projection Logic
  const getProjectedEnd = (rem: number) => {
    let date = new Date();
    let hours = rem;
    while (hours > 0) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) hours -= 8; // Assuming 8hr days
    }
    return date.toDateString();
  };

  return (
    <main className="p-4 max-w-xl mx-auto space-y-8 font-sans">
      <section className="bg-blue-50 p-6 rounded-xl border border-blue-200">
        <h1 className="text-2xl font-bold text-blue-900">OJT Tracker</h1>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-3 rounded shadow-sm">
            <p className="text-xs uppercase text-gray-500">Completed</p>
            <p className="text-2xl font-mono font-bold">{totalHours}h</p>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <p className="text-xs uppercase text-gray-500">Remaining</p>
            <p className="text-2xl font-mono font-bold text-red-600">{remainingHours}h</p>
          </div>
        </div>
        <p className="mt-4 text-sm">Projected Finish: <b>{getProjectedEnd(remainingHours)}</b></p>
      </section>

      {/* Entry Form */}
      <form action={saveEntry} className="space-y-4 border p-6 rounded-xl">
        <h2 className="font-bold">Add New Log</h2>
        
        {/* Simple Preset Button (using a little trick to fill inputs) */}
        <div className="flex gap-2">
          <button type="button" 
            onClick={() => {
              (document.getElementById('d') as HTMLInputElement).valueAsDate = new Date();
              (document.getElementById('s') as HTMLInputElement).value = "07:00";
              (document.getElementById('e') as HTMLInputElement).value = "16:00";
            }}
            className="text-xs bg-gray-200 px-2 py-1 rounded">Fill Default (7am-4pm)</button>
        </div>

        <input id="d" name="date" type="date" required className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs">Start</label>
            <input id="s" name="start" type="time" required className="w-full p-2 border rounded" />
          </div>
          <div className="flex-1">
            <label className="text-xs">End</label>
            <input id="e" name="end" type="time" required className="w-full p-2 border rounded" />
          </div>
        </div>
        <button type="submit" className="w-full bg-black text-white p-3 rounded-lg font-bold">Save to Cloud</button>
      </form>

      {/* History Log */}
      <section>
        <h2 className="font-bold mb-4">Activity Log</h2>
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.id} className="flex justify-between text-sm border-b pb-2">
              <span>{new Date(row.date).toLocaleDateString()}</span>
              <span className="font-mono">{row.hours_worked} hrs</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}