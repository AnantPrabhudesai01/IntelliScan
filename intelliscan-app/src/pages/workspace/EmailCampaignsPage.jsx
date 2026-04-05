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
      <div className="max-w-6xl mx-auto space-y-6 pt-6 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-[#161c28] rounded-2xl border border-gray-200 dark:border-gray-800"></div>)}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-[#161c28] rounded-2xl border border-gray-200 dark:border-gray-800"></div>
      </div>
    );
  }

  // Calculate high level metrics
  const totalSent = campaigns.reduce((acc, c) => acc + Number(c.delivered_count ?? c.sent_count ?? 0), 0);
  const avgOpenRate = campaigns.length > 0 
    ? (campaigns.reduce((acc, c) => acc + (c.open_rate || 0), 0) / campaigns.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Mail className="text-indigo-600 dark:text-indigo-400" size={28} />
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Email Marketing</h1>
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">Enterprise Only</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
            Target your explicitly scanned contacts using AI-inferred demographics. Create high-converting campaigns directly from your pipeline.
          </p>
        </div>
        {!isDrafting && (
          <button
            onClick={() => setIsDrafting(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all shadow-indigo-500/20 active:scale-95 text-sm"
          >
            <Send size={16} /> New AI Campaign
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
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={20} /> AI Campaign Builder
            </h2>
            <button onClick={() => setIsDrafting(false)} className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white">Cancel</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Audience Segmentation */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Filter size={16} className="text-indigo-500" /> Audience Segmentation
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Target Industry (AI)</label>
                    <select 
                      value={newCampaign.targetIndustry} 
                      onChange={e => setNewCampaign((prev) => ({ ...prev, targetIndustry: e.target.value }))}
                      className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Any Industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Target Seniority (AI)</label>
                    <select 
                      value={newCampaign.targetSeniority} 
                      onChange={e => setNewCampaign((prev) => ({ ...prev, targetSeniority: e.target.value }))}
                      className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                    >
                      <option value="">Any Seniority</option>
                      <option value="CXO / Founder">CXO / Founder</option>
                      <option value="VP / Director">VP / Director</option>
                      <option value="Senior">Senior</option>
                      <option value="Mid-Level">Mid-Level</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Dynamically Routed Audience</div>
                  <div className="flex items-center justify-center gap-2 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {isPreviewLoading ? <RefreshCw size={20} className="animate-spin" /> : <Users size={24} />}
                    {audienceCount !== null ? audienceCount : '--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Editor */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Internal Campaign Name (e.g., Tech VP Outreach Q3)"
                value={newCampaign.name}
                onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161c28] text-lg font-bold rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-400 dark:text-white"
              />
              
              <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition-colors bg-white dark:bg-[#161c28]">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subject:</span>
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-gray-900 dark:text-white placeholder:font-normal placeholder:text-gray-400"
                      placeholder="Catchy subject line..."
                      value={newCampaign.subject}
                      onChange={e => setNewCampaign({...newCampaign, subject: e.target.value})}
                    />
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={!newCampaign.targetIndustry || !newCampaign.targetSeniority}
                    className="shrink-0 flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={14} /> Auto-Write Email
                  </button>
                </div>
                <textarea
                  className="w-full h-64 p-4 bg-transparent outline-none resize-none text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-body placeholder:text-gray-400"
                  placeholder="Draft your message here. You can use {{firstName}} and {{company}} as dynamic variables..."
                  value={newCampaign.body}
                  onChange={e => setNewCampaign({...newCampaign, body: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSendCampaign}
                  disabled={!newCampaign.subject || !newCampaign.body || !audienceCount || isSending || isPreviewLoading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:disabled:bg-indigo-900/40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all"
                >
                  {isSending ? <><RefreshCw size={16} className="animate-spin" /> Blasting to {audienceCount} contacts...</> : <><Send size={16} /> Send Campaign to {audienceCount} Contacts</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top Level Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                <Send className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Total Emails Sent</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalSent.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Target className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Average Open Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{avgOpenRate}%</p>
                  <span className="text-xs text-emerald-500 font-bold flex items-center"><TrendingUp size={12} className="mr-0.5" /> +2.4%</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Activity className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Campaigns Active</p>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{campaigns.length}</p>
              </div>
            </div>
          </div>

          {/* Campaigns Database */}
          <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 flex items-center gap-2">
              <BarChart3 size={18} className="text-indigo-500" />
              <h3 className="font-bold text-gray-900 dark:text-white">Marketing Telemetry Logs</h3>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <Mail size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No active campaigns</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">Your data is just sitting there. Build an email campaign to actionably route your extracted leads.</p>
                <button onClick={() => setIsDrafting(true)} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">Start First Campaign</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-gray-900/20">
                  <div className="col-span-4">Campaign Details</div>
                  <div className="col-span-3">Target Audience (AI)</div>
                  <div className="col-span-2 text-right">Sent</div>
                  <div className="col-span-3 text-right">Performance Metrics</div>
                </div>
                {campaigns.map((camp, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                    <div className="col-span-4">
                      <p className="font-bold text-sm text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{camp.name}</p>
                      <p className="text-xs text-gray-500 truncate">{camp.subject}</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono flex items-center gap-2">
                        <span>{new Date(camp.created_at).toLocaleDateString()}</span>
                        <span className={`px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${camp.send_mode === 'smtp' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {camp.send_mode === 'smtp' ? 'LIVE' : 'SIM'}
                        </span>
                      </p>
                    </div>
                    <div className="col-span-3">
                      <div className="flex flex-col gap-1.5 items-start">
                        {camp.target_industry ? <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800/50 dark:text-purple-400 truncate max-w-full">IND: {camp.target_industry}</span> : null}
                        {camp.target_seniority ? <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400 truncate max-w-full">LVL: {camp.target_seniority}</span> : null}
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-lg font-black text-gray-900 dark:text-white">{Number(camp.delivered_count ?? camp.sent_count ?? 0)}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">Delivered</p>
                      {Number(camp.failed_count || 0) > 0 ? (
                        <p className="text-[10px] text-red-500 font-bold mt-1">{camp.failed_count} failed</p>
                      ) : null}
                    </div>
                    <div className="col-span-3 flex flex-col justify-center items-end gap-2">
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-gray-500">Open Rate</span>
                          <span className={`${camp.open_rate > 40 ? 'text-emerald-500' : 'text-gray-700 dark:text-gray-300'}`}>{camp.open_rate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${camp.open_rate > 40 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${camp.open_rate}%` }}></div>
                        </div>
                      </div>
                      <div className="w-full max-w-[120px]">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-gray-500">Clicks</span>
                          <span className="text-gray-700 dark:text-gray-300">{camp.click_rate}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${camp.click_rate}%` }}></div>
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
