import PublicLayout from '../../layouts/PublicLayout';

const ROLES = [
  { title: 'Full-Stack Developer (React + Node)', level: 'Intern / Junior', location: 'Remote / India' },
  { title: 'AI Engineer (OCR + LLM Pipelines)', level: 'Junior', location: 'Remote / India' },
  { title: 'Product & UX Designer', level: 'Intern', location: 'Remote' }
];

export default function CareersPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight font-headline">Careers</h1>
          <p className="text-white/70 text-lg leading-relaxed font-body">
            IntelliScan is built as a production-style SaaS system. If you like building reliable systems with great UX, you’ll fit in.
          </p>
        </header>

        <div className="space-y-4">
          {ROLES.map((r) => (
            <div key={r.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-white font-extrabold">{r.title}</p>
                <p className="mt-1 text-white/60 text-sm">{r.level}</p>
              </div>
              <p className="text-white/60 text-sm">{r.location}</p>
            </div>
          ))}
        </div>

        <p className="text-white/60 text-sm">
          To apply, use the Contact page and mention the role title in your message.
        </p>
      </div>
    </PublicLayout>
  );
}

