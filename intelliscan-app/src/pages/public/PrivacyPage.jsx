import PublicLayout from '../../layouts/PublicLayout';

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-6">
        <h1 className="text-4xl font-extrabold text-white tracking-tight font-headline">Privacy Policy</h1>
        <p className="text-white/70 text-sm leading-relaxed">
          This is a student project deployment of IntelliScan. In a production deployment, this page should describe
          what data is collected, how long it is stored, and how users can request deletion. Data policies in the
          dashboard control retention and PII masking behavior at the workspace level.
        </p>
        <p className="text-white/60 text-sm leading-relaxed">
          For demo purposes, contact records and logs are stored in the application database. Do not upload sensitive
          personal information unless you control the deployment environment.
        </p>
      </div>
    </PublicLayout>
  );
}

