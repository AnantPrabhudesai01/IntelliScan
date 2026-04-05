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
      <div className="max-w-5xl mx-auto space-y-6 p-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3"></div>
        <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-2/3"></div>
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-[#161c28] rounded-2xl border border-gray-200 dark:border-gray-800"></div>)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <GitBranch className="text-indigo-600 dark:text-indigo-400" size={24} />
            Lead Routing Engine
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-lg">
            Build intelligent "If/Then" automation rules. Contacts are routed automatically when they match your configured conditions using AI-extracted data fields.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunRules}
            disabled={rules.length === 0 || isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isRunning ? <><Zap size={16} className="animate-spin" /> Running...</> : <><Zap size={16} /> Run Rules</>}
          </button>
          <button
            onClick={handleSave}
            disabled={rules.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed'
            }`}
          >
            {isSaved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Rules</>}
          </button>
        </div>
      </div>

      {/* Live Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Leads Routed</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.total_routed.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Auto-Tagged</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.auto_tagged.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Flagged Priority</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stats.flagged.toLocaleString()}</p>
        </div>
      </div>

      {/* Active Rules */}
      <div className="space-y-4">
        {rules.map((rule, idx) => {
          const ActionIcon = ACTION_TYPES.find(a => a.value === rule.action)?.icon || User;
          return (
            <div
              key={rule.id}
              className={`bg-white dark:bg-[#161c28] border rounded-2xl p-5 shadow-sm transition-all ${
                rule.is_active
                  ? 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  : 'border-dashed border-gray-300 dark:border-gray-700 opacity-50'
              }`}
            >
              {/* Rule Number & Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Rule #{idx + 1}</span>
                  <select
                    value={rule.priority}
                    onChange={e => updateRule(rule.id, 'priority', e.target.value)}
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border outline-none cursor-pointer ${PRIORITY_COLORS[rule.priority]}`}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${rule.is_active ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.is_active ? 'left-5' : 'left-0.5'}`} />
                  </button>
                  <button onClick={() => deleteRule(rule.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Condition → Action Flow */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                {/* IF Block */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 px-3 py-1.5 rounded-lg uppercase tracking-widest">IF</span>
                  <select
                    value={rule.condition_field}
                    onChange={e => updateRule(rule.id, 'condition_field', e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <select
                    value={rule.condition_op}
                    onChange={e => updateRule(rule.id, 'condition_op', e.target.value)}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {CONDITION_OPS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input
                    type="text"
                    value={rule.condition_val}
                    onChange={e => updateRule(rule.id, 'condition_val', e.target.value)}
                    placeholder="e.g. Real Estate"
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-2 outline-none w-36 focus:ring-2 focus:ring-indigo-500/40 placeholder:text-gray-400"
                  />
                </div>

                {/* Arrow */}
                <div className="hidden lg:flex items-center px-2">
                  <ArrowRight size={20} className="text-indigo-400" />
                </div>

                {/* THEN Block */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-3 py-1.5 rounded-lg uppercase tracking-widest">THEN</span>
                  <select
                    value={rule.action}
                    onChange={e => updateRule(rule.id, 'action', e.target.value)}
                    className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    {ACTION_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                  <div className="relative">
                    <ActionIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={rule.target}
                      onChange={e => updateRule(rule.id, 'target', e.target.value)}
                      placeholder={rule.action === 'tag_as' ? 'e.g. VIP' : rule.action === 'assign_to' ? 'e.g. Sarah Jenkins' : 'e.g. slack-channel'}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg pl-9 pr-3 py-2 outline-none w-44 focus:ring-2 focus:ring-emerald-500/40 placeholder:text-gray-400"
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
        className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl transition-all group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add New Rule
      </button>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-800/30 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">AI-Powered Routing</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Rules can use <strong>Industry (AI)</strong> and <strong>Seniority (AI)</strong> fields — these are automatically inferred by IntelliScan's Gemini engine during every card scan. No manual data entry required.
          </p>
        </div>
      </div>

      {/* Run Results Panel */}
      {runResult && (
        <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Check size={20} className="text-emerald-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">Rules Execution Results</h3>
            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">Completed</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Contacts Matched', value: runResult.stats?.total_routed || 0, color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Auto-Tagged', value: runResult.stats?.auto_tagged || 0, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Flagged Priority', value: runResult.stats?.flagged || 0, color: 'text-amber-600 dark:text-amber-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
          {(runResult.match_log || []).length > 0 && (
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Match Log (last 20)</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {runResult.match_log.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{m.contact_name}</span>
                    <span className="text-gray-500">{m.rule_action.replace('_', ' ')}: <strong className="text-indigo-600 dark:text-indigo-400">{m.rule_target}</strong></span>
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
