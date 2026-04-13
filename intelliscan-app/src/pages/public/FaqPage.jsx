import PublicLayout from '../../layouts/PublicLayout';

const FAQ = [
  {
    q: 'Is this a real full-stack project?',
    a: 'Yes. It includes a React frontend, Node/Express backend, database persistence, RBAC/tier gating, and production-style APIs.'
  },
  {
    q: 'How do I keep contacts organized?',
    a: 'Use Events & Campaigns to tag scans, then filter the Contacts list by eventId.'
  },
  {
    q: 'Can I export to CRM?',
    a: 'Yes. Use CRM mapping and export (or webhooks) depending on your tier and workspace role.'
  },
  {
    q: 'Do I need API keys?',
    a: 'For AI extraction and AI copywriting features: yes. Configure GEMINI_API_KEY (and optionally OPENAI_API_KEY) in the server environment.'
  }
];

export default function FaqPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">FAQ</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            Common questions about IntelliScan features and how the workflow fits together.
          </p>
        </header>

        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white font-extrabold">{item.q}</p>
              <p className="mt-2 text-white/70 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

