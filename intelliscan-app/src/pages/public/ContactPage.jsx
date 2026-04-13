import { useState } from 'react';
import PublicLayout from '../../layouts/PublicLayout';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    setSubmitting(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Failed with status ${res.status}`);
      setStatus({ type: 'success', text: 'Message sent successfully. We will get back to you soon.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to send message.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">Contact Us</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            For enterprise plans, custom pricing, or support, send us a message. This form sends an email via the server SMTP configuration.
          </p>
        </header>

        {status.text ? (
          <div
            className={`rounded-2xl p-5 border text-sm font-semibold ${
              status.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
                : 'bg-red-500/10 border-red-500/20 text-red-200'
            }`}
          >
            {status.text}
          </div>
        ) : null}

        <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-3xl p-7 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50">Name</label>
              <input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="mt-2 w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                required
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-white/50">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className="mt-2 w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/50">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
              className="mt-2 w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              required
            />
          </div>
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-white/50">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className="mt-2 w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 min-h-[140px] resize-y"
              required
            />
          </div>
          <button
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-brand hover:bg-brand-light disabled:opacity-60 text-white font-extrabold transition-colors"
          >
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </PublicLayout>
  );
}

