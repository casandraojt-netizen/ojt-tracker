import { sql } from "@vercel/postgres";
import LogForm from "./LogForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  // Fetch logs from Postgres
  const { rows } = await sql`SELECT * FROM ojt_logs ORDER BY date DESC`;
  
  const totalHours = rows.reduce((sum, row) => sum + Number(row.hours_worked), 0);
  const remainingHours = Math.max(0, 550 - totalHours);

  // Weekday-only Projection
  const getProjectedEnd = (rem: number) => {
    let date = new Date();
    let hours = rem;
    while (hours > 0) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) hours -= 8; 
    }
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <main className="p-4 max-w-xl mx-auto space-y-8 font-sans bg-gray-50 min-h-screen">
      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">OJT Progress</h1>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-xs uppercase text-gray-500 font-bold">Done</p>
            <p className="text-3xl font-mono font-bold">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <p className="text-xs uppercase text-gray-500 font-bold">Left</p>
            <p className="text-3xl font-mono font-bold text-red-600">{remainingHours.toFixed(1)}h</p>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t text-sm text-gray-600">
          🎯 Estimated Finish: <span className="font-bold text-black">{getProjectedEnd(remainingHours)}</span>
        </div>
      </section>

      {/* Insert the Client Component here */}
      <LogForm />

      <section>
        <h2 className="font-bold mb-4 px-2">Recent Entries</h2>
        <div className="bg-white rounded-xl border shadow-sm divide-y">
          {rows.length === 0 && <p className="p-4 text-gray-400 text-sm">No entries yet...</p>}
          {rows.map((row) => (
            <div key={row.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{new Date(row.date).toLocaleDateString()}</p>
                <p className="text-xs text-gray-400">{row.start_time} - {row.end_time}</p>
              </div>
              <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded text-sm">
                +{row.hours_worked}h
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}