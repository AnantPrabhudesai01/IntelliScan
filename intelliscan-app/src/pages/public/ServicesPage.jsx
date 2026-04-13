import PublicLayout from '../../layouts/PublicLayout';

const SERVICES = [
  {
    title: 'Business Card Digitization',
    body: 'Single-card scans, group-photo scans (2-25 cards), and batch uploads. Output is normalized contact data with confidence scoring.'
  },
  {
    title: 'Contact Management',
    body: 'Centralized contacts with tags, notes, event attribution, dedupe support, exports, and CRM-ready mapping.'
  },
  {
    title: 'Outreach Automation',
    body: 'AI drafts and sequences built on top of your scanned contacts, with SMTP-based sending and campaign analytics.'
  },
  {
    title: 'Enterprise Governance',
    body: 'Workspace policies (retention/redaction/audit storage), role-based access, webhooks, and audit trail coverage.'
  }
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">Services</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            IntelliScan is an end-to-end system: capture, clean, enrich, and activate your networking data.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white font-extrabold">{s.title}</p>
              <p className="mt-2 text-white/70 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

