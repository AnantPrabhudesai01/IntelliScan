import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout';

export default function ProductPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">Product</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            IntelliScan is a full workflow product: scanning is only the beginning. The platform is built around turning contacts into actions.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-white/50">Capture</p>
            <p className="mt-3 text-white/80 text-sm leading-relaxed">
              Single card scans, group-photo scans, and batch uploads with multi-language extraction support.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-white/50">Organize</p>
            <p className="mt-3 text-white/80 text-sm leading-relaxed">
              Contacts, tags, notes, events & campaigns, dedupe queue, and exports to CSV/vCard/CRM.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-xs font-black uppercase tracking-widest text-white/50">Activate</p>
            <p className="mt-3 text-white/80 text-sm leading-relaxed">
              AI drafts, email sequences, marketing campaigns, webhooks, routing rules, and governance policies.
            </p>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/sign-up"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand hover:bg-brand-light text-white font-extrabold transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            to="/features"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold transition-colors"
          >
            View Full Features
          </Link>
        </section>
      </div>
    </PublicLayout>
  );
}

