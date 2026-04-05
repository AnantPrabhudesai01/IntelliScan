import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, MousePointerClick, Users, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PublicAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/analytics/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    // Refresh every 10 seconds for a "live" feel
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface text-on-surface dark:bg-[#0e131f] dark:text-[#dde2f3] min-h-screen selection:bg-primary selection:text-white font-body">
      <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-[#0e131f]/80 backdrop-blur-md border-b border-outline-variant/30">
        <nav className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto">
          <Link to="/" className="text-xl font-bold font-headline tracking-tighter flex items-center gap-2">
            <Activity className="text-primary" /> IntelliScan Public Stats
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/sign-in" className="text-sm font-semibold hover:text-primary transition-colors">Sign In</Link>
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-container dark:bg-tertiary-container/10 text-tertiary text-xs font-bold rounded-full">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            LIVE TELEMETRY
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">Open Product Analytics</h1>
          <p className="text-on-surface-variant text-lg">
            We believe in complete transparency. See how users are interacting with the IntelliScan platform in real-time.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              icon={<Users />} 
              label="Tracked Logins" 
              value={stats.registeredUsersTracked} 
              desc="Unique authenticated accounts" 
            />
            <StatCard 
              icon={<Activity />} 
              label="Page Views" 
              value={stats.totalVisits} 
              desc="Total screens loaded" 
            />
            <StatCard 
              icon={<MousePointerClick />} 
              label="Total Clicks" 
              value={stats.totalClicks} 
              desc="Buttons & links engaged" 
            />
            <StatCard 
              icon={<Clock />} 
              label="Avg Time" 
              value={`${stats.avgTimeSeconds}s`} 
              desc="Time spent per view" 
            />

            <div className="lg:col-span-4 mt-8 bg-surface-container-low dark:bg-surface-container-low/20 border border-outline-variant/20 rounded-3xl p-8">
              <h3 className="text-2xl font-bold font-headline mb-6 flex items-center gap-2">
                <ShieldCheck className="text-secondary" /> Most Trafficked Routes
              </h3>
              <div className="space-y-3">
                {stats.topPaths.map((pathItem, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-surface dark:bg-surface-container-highest/10 rounded-xl hover:bg-surface-container-high transition-colors">
                    <span className="font-mono text-sm text-primary dark:text-primary-container">{pathItem.path}</span>
                    <span className="font-bold bg-primary-container text-on-primary-container dark:bg-primary/20 dark:text-primary-container px-3 py-1 rounded-full text-xs">
                      {pathItem.count} visits
                    </span>
                  </div>
                ))}
                {stats.topPaths.length === 0 && (
                  <div className="p-8 text-center text-on-surface-variant border border-dashed border-outline-variant/50 rounded-xl">
                    No traffic logged yet. Navigate around the app to generate data!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-error p-8 bg-error-container/10 rounded-xl">
            Failed to load telemetry data. Server might be offline.
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, desc }) {
  return (
    <div className="bg-surface-container dark:bg-[#161c28] border border-outline-variant/20 p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300 shadow-sm">
      <div className="w-12 h-12 bg-primary-container dark:bg-primary/20 text-primary dark:text-primary-container rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <p className="text-3xl font-black font-headline mb-1">{value}</p>
      <p className="font-bold text-sm mb-1">{label}</p>
      <p className="text-xs text-on-surface-variant">{desc}</p>
    </div>
  );
}
