import { useState, useEffect } from 'react';
import { Mail, Users, TrendingUp, Send, RefreshCw, BarChart3, Target, Sparkles, Filter, Activity } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [notice, setNotice] = useState({ type: '', message: '' });
  
  // Form State
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    targetIndustry: '',
    targetSeniority: '',
    subject: '',
    body: '',
  });

  // Audience Preview State
  const [audienceCount, setAudienceCount] = useState(null);
  const token = getStoredToken();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error('Failed to fetch campaigns', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPreview = async () => {
      if (!token) return;
      setIsPreviewLoading(true);
      try {
        const params = new URLSearchParams();
        if (newCampaign.targetIndustry) params.set('targetIndustry', newCampaign.targetIndustry);
        if (newCampaign.targetSeniority) params.set('targetSeniority', newCampaign.targetSeniority);
        const res = await fetch(`/api/campaigns/audience-preview?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
        setAudienceCount(Number(payload?.total || 0));
      } catch (error) {
        console.error('Failed to load audience preview:', error);
        setAudienceCount(0);
      } finally {
        setIsPreviewLoading(false);
      }
    };

    const timeoutId = setTimeout(loadPreview, 180);
    return () => clearTimeout(timeoutId);
  }, [newCampaign.targetIndustry, newCampaign.targetSeniority, token]);

  const handleGenerateAI = async () => {
    if (!newCampaign.targetIndustry || !newCampaign.targetSeniority || !token) return;
    setNotice({ type: '', message: '' });
    try {
      const res = await fetch('/api/campaigns/auto-write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCampaign.name,
          targetIndustry: newCampaign.targetIndustry,
          targetSeniority: newCampaign.targetSeniority
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
      setNewCampaign((prev) => ({
        ...prev,
        subject: payload.subject || prev.subject,
        body: payload.body || prev.body
      }));
    } catch (error) {
      console.error('Failed to auto-write campaign:', error);
      setNotice({ type: 'error', message: error.message || 'Failed to auto-write campaign.' });
    }
  };

  const handleSendCampaign = async () => {
    setIsSending(true);
    setNotice({ type: '', message: '' });
    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCampaign)
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || `Failed with status ${res.status}`);
      setNotice({
        type: payload.warning ? 'warn' : 'success',
        message: payload.warning || payload.message || 'Campaign dispatched successfully.'
      });
      setIsDrafting(false);
      setNewCampaign({ name: '', targetIndustry: '', targetSeniority: '', subject: '', body: '' });
      setAudienceCount(null);
      fetchCampaigns();
    } catch (e) {
      console.error('Send failed', e);
      setNotice({ type: 'error', message: e.message || 'Send failed. Please try again.' });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-10 animate-pulse py-12">
        <div className="flex flex-col gap-6">
          <div className="h-12 bg-[var(--surface-card)] rounded-2xl w-1/3 border border-[var(--border-subtle)]"></div>
          <div className="h-4 bg-[var(--surface-card)] rounded-full w-2/3 border border-[var(--border-subtle)]"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-[var(--surface-card)] rounded-[2.5rem] border border-[var(--border-subtle)]"></div>)}
        </div>
        <div className="h-96 bg-[var(--surface-card)] rounded-[2.5rem] border border-[var(--border-subtle)]"></div>
      </div>
    );
  }

  // Calculate high level metrics
  const totalSent = campaigns.reduce((acc, c) => acc + Number(c.delivered_count ?? c.sent_count ?? 0), 0);
  const avgOpenRate = campaigns.length > 0 
    ? (campaigns.reduce((acc, c) => acc + (c.open_rate || 0), 0) / campaigns.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20 shadow-inner">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">Tier 3 Authorization</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
             <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Neural Outreach Active</span>
          </div>
          <h1 className="text-5xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-tight">Neural <br/>Campaigns</h1>
          <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
            Target high-fidelity neural patterns inferred from card scans. High-conversion automated routing active across all authenticated workspace nodes.
          </p>
        </div>
        {!isDrafting && (
          <button
            onClick={() => setIsDrafting(true)}
            className="flex items-center gap-4 bg-[var(--brand)] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-[var(--brand)]/20 hover:brightness-110 active:scale-95 transition-all italic font-headline"
          >
            <Send size={14} /> Initialize Campaign
          </button>
        )}
      </div>

      {notice.message ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            notice.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-300'
              : notice.type === 'warn'
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/40 dark:text-emerald-300'
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      {isDrafting ? (
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[3rem] p-8 md:p-14 shadow-2xl relative overflow-hidden premium-grain">
          <div className="flex justify-between items-center mb-12 border-b border-[var(--border-subtle)] pb-8 relative z-10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-500">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">Blueprint Generator</h2>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Assisted Neural Copywriting</p>
              </div>
            </div>
            <button onClick={() => setIsDrafting(false)} className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-red-500 transition-colors">Abort Construction</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
            {/* Left Col: Audience Segmentation */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-[var(--surface)] p-8 rounded-[2rem] border border-[var(--border-subtle)] shadow-inner space-y-8">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-main)] flex items-center gap-3">
                    <Filter size={14} className="text-[var(--brand)]" /> Segmentation
                  </h3>
                  <div className="w-full h-px bg-[var(--border-subtle)] opacity-50"></div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Target Sector (AI)</label>
                    <select 
                      value={newCampaign.targetIndustry} 
                      onChange={e => setNewCampaign((prev) => ({ ...prev, targetIndustry: e.target.value }))}
                      className="w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-[var(--brand)]/10 transition-all text-[var(--text-main)] cursor-pointer appearance-none"
                    >
                      <option value="">Universal Sector</option>
                      <option value="Technology">Technology Matrix</option>
                      <option value="Real Estate">Property Nodes</option>
                      <option value="Finance">Capital Markets</option>
                      <option value="Healthcare">Bio-Systems</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] ml-1 font-label">Neural Rank (AI)</label>
                    <select 
                      value={newCampaign.targetSeniority} 
                      onChange={e => setNewCampaign((prev) => ({ ...prev, targetSeniority: e.target.value }))}
                      className="w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-3.5 outline-none focus:ring-4 focus:ring-[var(--brand)]/10 transition-all text-[var(--text-main)] cursor-pointer appearance-none"
                    >
                      <option value="">Universal Rank</option>
                      <option value="CXO / Founder">CXO Tier</option>
                      <option value="VP / Director">Executive Hub</option>
                      <option value="Senior">Senior Analyst</option>
                      <option value="Mid-Level">Operational Node</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 border-t border-[var(--border-subtle)] text-center space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Awaiting Handshakes</p>
                  <div className="flex items-center justify-center gap-4 py-4 bg-[var(--surface-card)] rounded-2xl border border-[var(--border-subtle)]">
                    {isPreviewLoading ? <RefreshCw size={24} className="animate-spin text-[var(--brand)]" /> : <Users size={28} className="text-[var(--brand)] opacity-50" />}
                    <span className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)]">
                      {audienceCount !== null ? audienceCount : '--'}
                    </span>
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60 italic">Identified Pipeline Nodes</p>
                </div>
              </div>
            </div>

            {/* Right Col: Editor */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <input
                type="text"
                placeholder="Blueprint ID (e.g., Tech VP Outreach Q3)"
                value={newCampaign.name}
                onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                className="w-full bg-[var(--surface)] border border-[var(--border-subtle)] focus:border-[var(--brand)]/30 focus:bg-[var(--surface-card)] text-xl font-headline font-black italic uppercase italic tracking-tighter rounded-[1.5rem] px-8 py-5 outline-none transition-all shadow-inner placeholder:text-[var(--text-muted)]/30 text-[var(--text-main)]"
              />
              
              <div className="border border-[var(--border-subtle)] rounded-[2rem] overflow-hidden focus-within:ring-4 focus-within:ring-[var(--brand)]/5 transition-all bg-[var(--surface)] shadow-inner">
                <div className="px-8 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-card)]/50 backdrop-blur-md">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Protocol Subject:</span>
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-[12px] font-black uppercase tracking-widest text-[var(--text-main)] placeholder:font-normal placeholder:opacity-30"
                      placeholder="Neural engagement hook..."
                      value={newCampaign.subject}
                      onChange={e => setNewCampaign({...newCampaign, subject: e.target.value})}
                    />
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={!newCampaign.targetIndustry || !newCampaign.targetSeniority}
                    className="shrink-0 flex items-center gap-3 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-30 border border-purple-500/20"
                  >
                    <Sparkles size={14} className="animate-pulse" /> Auto-Construct
                  </button>
                </div>
                <textarea
                  className="w-full h-80 p-8 bg-transparent outline-none resize-none text-[13px] text-[var(--text-main)] leading-relaxed font-medium placeholder:opacity-20 custom-scrollbar"
                  placeholder="Draft your blueprint here. Access variables via {{firstName}} and {{company}}..."
                  value={newCampaign.body}
                  onChange={e => setNewCampaign({...newCampaign, body: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end lg:pt-4">
                <button
                  onClick={handleSendCampaign}
                  disabled={!newCampaign.subject || !newCampaign.body || !audienceCount || isSending || isPreviewLoading}
                  className="flex items-center gap-4 bg-[var(--brand)] disabled:bg-[var(--border-subtle)] disabled:text-[var(--text-muted)] disabled:opacity-50 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-[var(--brand)]/20 hover:brightness-110 active:scale-95 transition-all italic font-headline"
                >
                  {isSending ? <><RefreshCw size={16} className="animate-spin" /> Transmitting to {audienceCount} Nodes...</> : <><Send size={16} /> Force Transmit to {audienceCount} Targets</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Level Metric Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-xl premium-grain flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
              <div className="w-16 h-16 rounded-3xl bg-[var(--brand)]/10 flex items-center justify-center shrink-0 border border-[var(--brand)]/20 shadow-inner group-hover:scale-110 transition-transform">
                <Send className="text-[var(--brand)]" size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Atomic Dispatch</p>
                <p className="text-3xl font-headline font-black italic tracking-tighter text-[var(--text-main)] group-hover:text-[var(--brand)] transition-colors">{totalSent.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-xl premium-grain flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <Target className="text-emerald-500" size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Engagement Yield</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-3xl font-headline font-black italic tracking-tighter text-[var(--text-main)] group-hover:text-emerald-500 transition-colors">{avgOpenRate}%</p>
                  <span className="text-[10px] text-emerald-500 font-black flex items-center uppercase tracking-tighter"><TrendingUp size={10} className="mr-1" /> OPTIMIZED</span>
                </div>
              </div>
            </div>
            <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-xl premium-grain flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <Activity className="text-amber-500" size={32} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Active Pipelines</p>
                <p className="text-3xl font-headline font-black italic tracking-tighter text-[var(--text-main)] group-hover:text-amber-500 transition-colors">{campaigns.length}</p>
              </div>
            </div>
          </div>

          {/* Campaigns Database */}
          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] shadow-2xl overflow-hidden premium-grain">
            <div className="px-10 py-6 border-b border-[var(--border-subtle)] bg-[var(--surface)]/50 backdrop-blur-md flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[var(--brand)]/10 rounded-xl">
                  <BarChart3 size={20} className="text-[var(--brand)]" />
                </div>
                <h3 className="text-[12px] font-headline font-black italic uppercase tracking-tighter text-[var(--text-main)]">Marketing Telemetry Logs</h3>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Real-time Stream</span>
              </div>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center relative z-10 opacity-30">
                <div className="w-24 h-24 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-8">
                  <Mail size={48} strokeWidth={1} />
                </div>
                <h4 className="text-2xl font-headline font-black italic tracking-tighter uppercase mb-2">Node Idle</h4>
                <p className="text-[11px] font-medium max-w-sm mb-10 leading-relaxed">Infrastructure awaiting routing instructions. Initialize a campaign to actionably transmit extracted lead data.</p>
                <button onClick={() => setIsDrafting(true)} className="px-10 py-4 bg-[var(--brand)] text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl italic font-headline hover:brightness-110 active:scale-95 transition-all">Initialize First Wave</button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)] relative z-10">
                <div className="grid grid-cols-12 gap-8 px-10 py-6 text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] bg-[var(--surface)]/30">
                  <div className="col-span-5">Protocol Matrix</div>
                  <div className="col-span-3">Neural Target Sector</div>
                  <div className="col-span-1 text-right">Dispatch</div>
                  <div className="col-span-3 text-right">Yield Metrics</div>
                </div>
                {campaigns.map((camp, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-8 px-10 py-8 items-center hover:bg-[var(--brand)]/[0.02] transition-all group cursor-pointer" onClick={() => navigate(`/campaigns/${camp.id}`)}>
                    <div className="col-span-5 space-y-2">
                      <div className="flex items-center gap-3">
                        <p className="font-headline font-black italic text-lg tracking-tighter text-[var(--text-main)] group-hover:text-[var(--brand)] transition-colors uppercase leading-tight">{camp.name}</p>
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${camp.send_mode === 'smtp' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                          {camp.send_mode === 'smtp' ? 'LIVE' : 'SIM'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-muted)] truncate opacity-60 italic">“{camp.subject}”</p>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-3">
                        {new Date(camp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="col-span-3">
                      <div className="flex flex-col gap-2 items-start">
                        {camp.target_industry ? <div className="px-3 py-1.5 rounded-xl border bg-purple-500/10 border-purple-500/20 text-purple-500 text-[9px] font-black uppercase tracking-widest w-fit">Sector: {camp.target_industry}</div> : null}
                        {camp.target_seniority ? <div className="px-3 py-1.5 rounded-xl border bg-[var(--brand)]/10 border-[var(--brand)]/20 text-[var(--brand)] text-[9px] font-black uppercase tracking-widest w-fit">Rank: {camp.target_seniority}</div> : null}
                      </div>
                    </div>
                    <div className="col-span-1 text-right">
                      <p className="text-2xl font-headline font-black italic tracking-tighter text-[var(--text-main)]">{Number(camp.delivered_count ?? camp.sent_count ?? 0)}</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1 opacity-60">Nodes</p>
                    </div>
                    <div className="col-span-3 space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Open Yield</span>
                          <span className={`text-[12px] font-headline font-black italic tracking-tighter ${camp.open_rate > 40 ? 'text-emerald-500' : 'text-[var(--text-main)]'}`}>{camp.open_rate}%</span>
                        </div>
                        <div className="w-full bg-[var(--surface)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)] shadow-inner">
                          <div className={`h-full rounded-full transition-all duration-1000 ${camp.open_rate > 40 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-[var(--brand)]'}`} style={{ width: `${camp.open_rate}%` }}></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Interaction Index</span>
                          <span className="text-[12px] font-headline font-black italic tracking-tighter text-[var(--text-main)]">{camp.click_rate}%</span>
                        </div>
                        <div className="w-full bg-[var(--surface)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)] shadow-inner">
                          <div className="bg-amber-500 h-full rounded-full opacity-60 shadow-[0_0_12px_rgba(245,158,11,0.3)]" style={{ width: `${camp.click_rate}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
