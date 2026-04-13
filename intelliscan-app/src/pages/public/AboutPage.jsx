import PublicLayout from '../../layouts/PublicLayout';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">About IntelliScan</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            IntelliScan converts physical business cards (single cards, group photos, and batch uploads) into structured contact records,
            then turns those contacts into workflows: outreach drafts, sequences, events, and CRM exports.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-white/50">Mission</p>
            <p className="mt-3 text-white font-semibold">
              Remove manual data entry and help teams follow up faster with trustworthy, enriched contact data.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-white/50">Core Engine</p>
            <p className="mt-3 text-white/80 text-sm leading-relaxed">
              Gemini-first extraction with fallback engines, role-based access control, quota enforcement, and audit logging.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-white/50">Built For</p>
            <p className="mt-3 text-white/80 text-sm leading-relaxed">
              Students, solo founders, and enterprise teams that need clean CRM-ready contact pipelines.
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

