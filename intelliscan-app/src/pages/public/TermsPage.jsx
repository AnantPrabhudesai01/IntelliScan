import PublicLayout from '../../layouts/PublicLayout';

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-6 py-16 space-y-6">
        <h1 className="text-4xl font-extrabold text-white tracking-tight font-headline">Terms of Service</h1>
        <p className="text-white/70 text-sm leading-relaxed">
          IntelliScan is provided as-is for educational and demonstration purposes. In a production deployment,
          terms should define acceptable use, subscription policies, refunds, and service guarantees.
        </p>
      </div>
    </PublicLayout>
  );
}

