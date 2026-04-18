import { useState, useEffect } from 'react';
import { GitBranch, Plus, Trash2, ArrowRight, Save, User, Check, Zap, AlertTriangle, Sparkles, Shield, Tag } from 'lucide-react';
import { getStoredToken } from '../../utils/auth';

const CONDITION_FIELDS = [
  { value: 'title', label: 'Job Title' },
  { value: 'company', label: 'Company' },
  { value: 'inferred_industry', label: 'Industry (AI)' },
  { value: 'inferred_seniority', label: 'Seniority (AI)' },
  { value: 'email', label: 'Email Domain' },
  { value: 'phone', label: 'Phone Prefix' },
  { value: 'confidence', label: 'Confidence Score' },
];

const CONDITION_OPS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
];

const ACTION_TYPES = [
  { value: 'assign_to', label: 'Assign to Rep', icon: User },
  { value: 'tag_as', label: 'Auto-Tag', icon: Tag },
  { value: 'flag_priority', label: 'Flag as Priority', icon: AlertTriangle },
  { value: 'notify', label: 'Send Notification', icon: Zap },
];

const PRIORITY_COLORS = {
  high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400',
  medium: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400',
  low: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400',
};

export default function RoutingRulesPage() {
  const [rules, setRules] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_routed: 0, auto_tagged: 0, flagged: 0 });

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const token = getStoredToken();
        const res = await fetch('/api/routing-rules', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRules(data.rules || []);
          setStats(data.stats || { total_routed: 0, auto_tagged: 0, flagged: 0 });
        }
      } catch (e) {
        console.error('Failed to fetch routing rules:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const addRule = () => {
    setRules(prev => [...prev, {
      id: Date.now(),
      condition_field: 'inferred_industry',
      condition_op: 'contains',
      condition_val: '',
      action: 'assign_to',
      target: '',
      priority: 'medium',
      is_active: true,
    }]);
  };

  const updateRule = (id, field, value) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const deleteRule = (id) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
  };

  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const handleSave = async () => {
    try {
      const token = getStoredToken();
      const res = await fetch('/api/routing-rules', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });
      if (res.ok) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
        // Auto-run rules after save
        handleRunRules();
      }
    } catch (e) {
      console.error('Failed to save routing rules:', e);
    }
  };

  const handleRunRules = async () => {
    setIsRunning(true);
    setRunResult(null);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/routing-rules/run', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        setRunResult(data);
        setStats(data.stats || stats);
      }
    } catch (e) {
      console.error('Failed to run rules:', e);
    }
    setIsRunning(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-10 py-12 animate-pulse">
        <div className="flex flex-col gap-6">
          <div className="h-12 bg-[var(--surface-card)] rounded-2xl w-1/3 border border-[var(--border-subtle)]"></div>
          <div className="h-4 bg-[var(--surface-card)] rounded-full w-2/3 border border-[var(--border-subtle)]"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-[var(--surface-card)] rounded-[2.5rem] border border-[var(--border-subtle)]"></div>)}
        </div>
        <div className="h-96 bg-[var(--surface-card)] rounded-[2.5rem] border border-[var(--border-subtle)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-[var(--brand)]/10 rounded-2xl border border-[var(--brand)]/20 shadow-inner">
               <GitBranch size={24} className="text-[var(--brand)]" />
             </div>
             <div>
               <h1 className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase leading-tight">Automation <br/>Logic Hub</h1>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">Atomic Lead Routing Protocol</p>
             </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
             Construct intelligent “If/Then” infrastructure. Data vectors are automatically routed to targets when conditions align with AI-extracted neural profiles.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRunRules}
            disabled={rules.length === 0 || isRunning}
            className="flex items-center gap-3 px-6 py-3 border border-[var(--border-subtle)] bg-[var(--surface-card)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-main)] hover:border-[var(--brand)]/30 hover:text-[var(--brand)] transition-all disabled:opacity-50"
          >
            {isRunning ? <><Zap size={14} className="animate-spin" /> Engaged</> : <><Zap size={14} /> Run Protocol</>}
          </button>
          
          <button
            onClick={handleSave}
            disabled={rules.length === 0}
            className={`flex items-center gap-4 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all italic font-headline ${
              isSaved
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-[var(--brand)] hover:brightness-110 text-white shadow-[var(--brand)]/20 active:scale-95 disabled:bg-[var(--border-subtle)] disabled:text-[var(--text-muted)]'
            }`}
          >
            {isSaved ? <><Check size={16} /> Matrix Commited</> : <><Save size={16} /> Deploy Matrix</>}
          </button>
        </div>
      </div>

      {/* Live Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-xl premium-grain flex flex-col gap-2">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Vectors Routed</p>
          <p className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">{stats.total_routed.toLocaleString()}</p>
        </div>
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-xl premium-grain flex flex-col gap-2">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Atomic Tags</p>
          <p className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">{stats.auto_tagged.toLocaleString()}</p>
        </div>
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-8 shadow-xl premium-grain flex flex-col gap-2">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Flagged Nodes</p>
          <p className="text-4xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">{stats.flagged.toLocaleString()}</p>
        </div>
      </div>

      {/* Active Rules */}
      <div className="space-y-6">
        {rules.map((rule, idx) => {
          const ActionIcon = ACTION_TYPES.find(a => a.value === rule.action)?.icon || User;
          return (
            <div
              key={rule.id}
              className={`bg-[var(--surface-card)] border rounded-[2.5rem] p-10 shadow-2xl transition-all relative overflow-hidden premium-grain ${
                rule.is_active
                  ? 'border-[var(--border-subtle)] hover:border-[var(--brand)]/30'
                  : 'border-dashed border-[var(--border-subtle)] opacity-40 grayscale'
              }`}
            >
              {/* Rule Number & Toggle */}
              <div className="flex items-center justify-between mb-10 border-b border-[var(--border-subtle)] pb-8">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-[var(--surface)] flex items-center justify-center font-headline font-black italic text-xl text-[var(--brand)] border border-[var(--border-subtle)] shadow-inner">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Protocol Block</span>
                    <div className="flex items-center gap-4">
                      <select
                        value={rule.priority}
                        onChange={e => updateRule(rule.id, 'priority', e.target.value)}
                        className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-current outline-none cursor-pointer bg-white/5 ${
                          rule.priority === 'high' ? 'text-red-500' :
                          rule.priority === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                        }`}
                      >
                        <option value="high">High Velocity</option>
                        <option value="medium">Medium Load</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`relative w-14 h-7 rounded-full transition-all border-2 border-[var(--border-subtle)] ${rule.is_active ? 'bg-[var(--brand)] border-[var(--brand)]' : 'bg-[var(--surface)]'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${rule.is_active ? 'translate-x-[28px]' : 'translate-x-[2px]'}`} />
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="w-10 h-10 flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Condition → Action Flow */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-8">
                {/* IF Block */}
                <div className="flex items-center gap-4 flex-wrap bg-[var(--surface)] p-6 rounded-[1.5rem] border border-[var(--border-subtle)] shadow-inner">
                  <div className="px-3 py-1.5 bg-[var(--brand)]/10 border border-[var(--brand)]/20 rounded-lg text-xs font-black italic font-headline text-[var(--brand)] uppercase tracking-widest">IF</div>
                  
                  <select
                    value={rule.condition_field}
                    onChange={e => updateRule(rule.id, 'condition_field', e.target.value)}
                    className="bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-[var(--brand)]/10 transition-all appearance-none cursor-pointer"
                  >
                    {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>

                  <select
                    value={rule.condition_op}
                    onChange={e => updateRule(rule.id, 'condition_op', e.target.value)}
                    className="bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-[var(--brand)]/10 transition-all appearance-none cursor-pointer"
                  >
                    {CONDITION_OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>

                  <input
                    type="text"
                    value={rule.condition_val}
                    onChange={e => updateRule(rule.id, 'condition_val', e.target.value)}
                    placeholder="Vector Value..."
                    className="flex-1 min-w-[140px] bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-medium rounded-xl px-5 py-3 outline-none focus:ring-4 focus:ring-[var(--brand)]/10 placeholder:opacity-20 shadow-inner"
                  />
                </div>

                {/* Arrow */}
                <div className="flex justify-center lg:rotate-0 rotate-90 opacity-20">
                  <ArrowRight size={32} strokeWidth={1} />
                </div>

                {/* THEN Block */}
                <div className="flex items-center gap-4 flex-wrap bg-[var(--surface)] p-6 rounded-[1.5rem] border border-[var(--border-subtle)] shadow-inner">
                  <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-black italic font-headline text-emerald-500 uppercase tracking-widest">THEN</div>
                  
                  <select
                    value={rule.action}
                    onChange={e => updateRule(rule.id, 'action', e.target.value)}
                    className="bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                  >
                    {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>

                  <div className="relative flex-1 min-w-[180px]">
                    <ActionIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 opacity-40" />
                    <input
                      type="text"
                      value={rule.target}
                      onChange={e => updateRule(rule.id, 'target', e.target.value)}
                      placeholder={rule.action === 'tag_as' ? 'e.g. VIP Cluster' : rule.action === 'assign_to' ? 'e.g. Agent Alpha' : 'Routing Target...'}
                      className="w-full bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-[11px] font-medium rounded-xl pl-12 pr-5 py-3 outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:opacity-20 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Rule Button */}
      <button
        onClick={addRule}
        className="flex items-center justify-center gap-6 w-full py-8 border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--brand)] hover:bg-[var(--brand)]/5 text-[var(--text-muted)] hover:text-[var(--brand)] font-black text-[12px] uppercase tracking-[0.4em] rounded-[2.5rem] transition-all group italic font-headline mb-10"
      >
        <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--brand)] group-hover:text-white transition-all">
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
        </div>
        Extend Logic Matrix
      </button>

      {/* Info Banner */}
      <div className="bg-[var(--brand)]/[0.03] border border-[var(--brand)]/20 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 premium-grain">
        <div className="w-20 h-20 rounded-[2rem] bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center shrink-0">
          <Sparkles size={32} className="text-[var(--brand)]" strokeWidth={1.5} />
        </div>
        <div className="space-y-3 text-center md:text-left">
          <h3 className="text-xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">Gemini Neural Routing</h3>
          <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-2xl">
            Rules leverage <strong>Industry (AI)</strong> and <strong>Seniority (AI)</strong> neural vectors — automatically synthesized by IntelliScan’s Gemini engine during card ingestion. Atomic precision achieved without manual keying.
          </p>
        </div>
      </div>

      {/* Run Results Panel */}
      {runResult && (
        <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-[2.5rem] p-10 shadow-2xl premium-grain mt-10">
          <div className="flex items-center justify-between mb-8 border-b border-[var(--border-subtle)] pb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Check size={20} />
              </div>
              <h3 className="text-xl font-headline font-black italic tracking-tighter text-[var(--text-main)] uppercase">Execution Report</h3>
            </div>
            <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full">
               Protocol Finalized
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {[
              { label: 'Matricies Matched', value: runResult.stats?.total_routed || 0, color: 'text-[var(--brand)]' },
              { label: 'Atomic Tags', value: runResult.stats?.auto_tagged || 0, color: 'text-emerald-500' },
              { label: 'Priority Alerts', value: runResult.stats?.flagged || 0, color: 'text-amber-500' },
            ].map(stat => (
              <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-inner space-y-2">
                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
                <p className={`text-3xl font-headline font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {(runResult.match_log || []).length > 0 && (
            <div className="space-y-4">
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] ml-2">Transmission Log (Recent)</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
                {runResult.match_log.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-4 px-6 bg-[var(--surface)] hover:bg-[var(--brand)]/[0.03] border border-[var(--border-subtle)] rounded-xl group transition-all">
                    <span className="text-[12px] font-bold text-[var(--text-main)]">{m.contact_name}</span>
                    <div className="flex items-center gap-4">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{m.rule_action.replace('_', ' ')}</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] opacity-20 group-hover:opacity-100 transition-opacity" />
                       <strong className="text-[11px] font-black uppercase tracking-widest text-[var(--brand)]">{m.rule_target}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
