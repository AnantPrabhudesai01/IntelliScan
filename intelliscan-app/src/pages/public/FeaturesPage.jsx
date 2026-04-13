import PublicLayout from '../../layouts/PublicLayout';

const FEATURES = [
  { title: 'Single Card OCR', body: 'Scan one card at a time with strict validation to avoid mixed-card errors.' },
  { title: 'Group Photo (Multi-Card)', body: 'Scan 2-25 cards from a single photo, returning an array of structured contacts with duplicate flags.' },
  { title: 'Batch Upload', body: 'Upload multiple images and process them sequentially with plan-based limits.' },
  { title: 'Events & Campaigns', body: 'Attribute scans to events and filter contacts by event for follow-up workflows.' },
  { title: 'AI Drafts', body: 'Generate follow-up drafts, edit, and send via SMTP with audit logs.' },
  { title: 'AI Outreach Sequences', body: 'Create multi-step sequences and enroll contacts for scheduled sending.' },
  { title: 'Data Quality', body: 'Detect duplicates and propose merges with safe merge suggestions.' },
  { title: 'Compliance Policies', body: 'Retention + PII redaction policies with audit trail storage controls.' },
  { title: 'Billing (Razorpay)', body: 'Razorpay orders + signature verification to upgrade tiers and unlock features.' },
  { title: 'Webhooks', body: 'Register outbound webhooks and inspect delivery logs for integrations.' }
];

const FAQ = [
  { q: 'Does IntelliScan support multi-language cards?', a: 'Yes. The extraction pipeline is instructed to preserve native-script fields and detect the primary language.' },
  { q: 'Will group-photo scans auto-save contacts?', a: 'Group-photo extraction returns detected contacts, then you can save individually or “Save All New” to your contacts list.' },
  { q: 'How are limits enforced?', a: 'Quota is enforced server-side on save (credits) and on some scan actions (group scans), based on your tier.' }
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">Features</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            A complete workflow product: capture, normalize, activate, and govern contact data.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-white font-extrabold">{f.title}</p>
              <p className="mt-2 text-white/70 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-extrabold text-white font-headline">Feature FAQ</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <p className="text-white font-extrabold">{item.q}</p>
                <p className="mt-2 text-white/70 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

