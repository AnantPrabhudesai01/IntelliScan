import PublicLayout from '../../layouts/PublicLayout';

const CLIENTS = [
  { name: 'Volta Labs', note: 'Conference lead capture + follow-ups' },
  { name: 'Nebulous Finance', note: 'High-signal enrichment + routing' },
  { name: 'Quantum AI', note: 'Team rolodex + campaigns' },
  { name: 'Lumos Retail', note: 'Multi-language card ingestion' }
];

export default function ClientsPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">Our Clients</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            IntelliScan is designed to scale from personal scanning to enterprise workspaces. Here are examples of teams that typically use it.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CLIENTS.map((c) => (
            <div key={c.name} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white font-extrabold">{c.name}</p>
              <p className="mt-2 text-white/70 text-sm leading-relaxed">{c.note}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

