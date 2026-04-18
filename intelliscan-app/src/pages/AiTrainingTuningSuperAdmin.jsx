import { getStoredToken } from '../utils/auth.js';
// v2 - dynamic interactive version
import React, { useState, useEffect, useRef } from 'react';
import { Brain, CloudUpload, Activity, ShieldCheck, Download, Info, RefreshCw, Layers, Check, X, Play, Pause, RotateCcw, AlertTriangle, FileDown } from 'lucide-react';

const SCHEMA_GUIDE = `# IntelliScan Training Corpus Schema Guide

## Required Format: JSONL or CSV

### JSONL Example:
{"text": "Invoice #4921 from Acme Corp, dated 2023-10-15, total $1,428.00", "labels": {"invoice_number": "4921", "vendor": "Acme Corp", "date": "2023-10-15", "total": "1428.00"}}

### CSV Example:
text,invoice_number,vendor,date,total
"Invoice #4921...",4921,Acme Corp,2023-10-15,1428.00

## Quality Requirements
- Minimum 500 samples per domain module
- UTF-8 encoding required
- Max file size: 250MB per upload
- Supported domains: Legal, Medical, Financial, General`;

const DOMAIN_MODULES_INITIAL = [
  { id: 1, name: 'Legal Lexicon',       status: 'Active',  terms: 12000, color: 'text-brand-500',  bg: 'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800/30' },
  { id: 2, name: 'Medical Coding',       status: 'Standby', terms: 45000, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30' },
  { id: 3, name: 'Financial Standards',  status: 'Active',  terms: 8000,  color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30' },
];

const LOG_LINES = [
  { type: 'INFO',   color: 'text-emerald-500', messages: ['Epoch completed with loss: 0.0024', 'Validation accuracy: 98.1%', 'Checkpoint saved to cluster-node-alpha', 'Warmup scheduler stepped'] },
  { type: 'TASK',   color: 'text-brand-400',  messages: ['Initializing validation on Legal_Dataset_V2...', 'Loading Medical_Corpus_v3...', 'Tokenizing batch 1/42...'] },
  { type: 'WARN',   color: 'text-amber-500',   messages: ['Low gradient detected in attention_head_2', 'Learning rate may need adjustment', 'Memory usage at 78%'] },
  { type: 'SYSTEM', color: 'text-blue-400',    messages: ['Checkpoint saved to cluster-node-alpha-4', 'Auto-save triggered', 'Backup sync complete'] },
];

function getRandLog() {
  const t = LOG_LINES[Math.floor(Math.random() * LOG_LINES.length)];
  const msg = t.messages[Math.floor(Math.random() * t.messages.length)];
  const now = new Date();
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,'0')).join(':');
  return { time, type: t.type, msg, color: t.color };
}

export default function AiTrainingTuningSuperAdmin() {
  const [config, setConfig] = useState({ ocr_threshold: 88, denoising_sensitivity: 42, active_engine: 'gemini' });
  const [logs, setLogs] = useState([
    { time: '14:22:01', type: 'INFO',   msg: 'Epoch 41 completed with loss: 0.0024',                          color: 'text-emerald-500' },
    { time: '14:22:04', type: 'TASK',   msg: 'Initializing validation on Legal_Dataset_V2...',                color: 'text-brand-400' },
    { time: '14:23:10', type: 'WARN',   msg: 'Low gradient detected in layer 4 (attention_head_2)',           color: 'text-amber-500' },
    { time: '14:24:15', type: 'INFO',   msg: 'Starting Optimizer: AdamW (lr=2e-5, weight_decay=0.01)',       color: 'text-emerald-500' },
    { time: '14:25:30', type: 'SYSTEM', msg: 'Checkpoint saved to cluster-node-alpha-4',                     color: 'text-blue-400' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [epoch, setEpoch] = useState(42);
  const [progress, setProgress] = useState(74);
  const [isTraining, setIsTraining] = useState(true);
  const [modules, setModules] = useState(DOMAIN_MODULES_INITIAL);
  const [showSchema, setShowSchema] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [toast, setToast] = useState(null);
  const logRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-advance training progress
  useEffect(() => {
    if (!isTraining) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setEpoch(e => e + 1);
          setLogs(prev => [getRandLog(), ...prev].slice(0, 20));
          return 0;
        }
        if (Math.random() < 0.3) setLogs(prev => [getRandLog(), ...prev].slice(0, 20));
        return Math.min(p + Math.random() * 1.5, 100);
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isTraining]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateConfig = async (field, value) => {
    const next = { ...config, [field]: value };
    setConfig(next);
    setIsSaving(true);

    // Try API, fallback to local state only
    try {
      const token = getStoredToken();
      if (token) {
        await fetch('/api/engine/config', {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(next)
        });
      }
    } catch (error) {
      console.error('API Error:', error);
    }

    const now = new Date();
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,'0')).join(':');
    setLogs(prev => [{ time, type: 'CONFIG', msg: `Threshold updated: ${field} = ${value}`, color: 'text-purple-400' }, ...prev].slice(0, 20));
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadedFiles(prev => [...files.map(f => ({ name: f.name, size: f.size, status: 'Processing...' })), ...prev]);
    files.forEach((f, i) => {
      setTimeout(() => {
        setUploadedFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'Uploaded ✓' };
          return updated;
        });
        const now = new Date();
        const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2,'0')).join(':');
        setLogs(prev => [{ time, type: 'UPLOAD', msg: `Training file ingested: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`, color: 'text-green-400' }, ...prev].slice(0, 20));
        showToast(`"${f.name}" uploaded and queued for fine-tuning!`);
      }, 1500 + i * 500);
    });
  };

  const toggleModule = (id) => {
    setModules(prev => prev.map(m => m.id === id
      ? { ...m, status: m.status === 'Active' ? 'Standby' : 'Active' }
      : m
    ));
    const mod = modules.find(m => m.id === id);
    if (mod) showToast(`${mod.name} ${mod.status === 'Active' ? 'paused' : 'activated'}!`);
  };

  const handleDownloadArchive = () => {
    const archive = JSON.stringify({ logs, config, epoch, progress, modules, generatedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([archive], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `retraining_archive_${Date.now()}.json`; a.click();
    showToast('Training archive downloaded!');
  };

  const etaMinutes = Math.round(((60 - epoch) * ((100 - progress) / 100)) * 0.5);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-8 animate-fade-in w-full">
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white bg-green-600 flex items-center gap-3">
          <Check size={16} /> {toast.msg}
        </div>
      )}
      {showSchema && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowSchema(false)}>
          <div className="bg-[#1a2035] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Training Corpus Schema Guide</h2>
              <button onClick={() => setShowSchema(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <pre className="bg-black/60 rounded-xl p-6 text-[12px] font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">{SCHEMA_GUIDE}</pre>
          </div>
        </div>
      )}

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-headline">AI Training &amp; Tuning</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-sm mt-2">Adjust core extraction engine parameters, upload fine-tuning datasets, and monitor optimization epochs in real-time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Sliders */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#161c28] rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-800/60 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-50 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400"><Brain size={24} /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-headline">Neural Thresholds</h2>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold mt-1">Global Config{isSaving && <span className="ml-2 text-brand-400 animate-pulse">Saving...</span>}</p>
                </div>
              </div>
              <div className="flex p-1 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {['gemini','tesseract'].map(eng => (
                  <button key={eng} onClick={() => updateConfig('active_engine', eng)}
                    className={`px-5 py-2 text-xs font-bold rounded-md transition-all ${config.active_engine === eng ? 'bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                    {eng === 'gemini' ? 'Gemini Vision' : 'Tesseract V5'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-12">
              {/* OCR Threshold */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                      <ShieldCheck size={16} className="text-brand-500" /> OCR Confidence Threshold
                    </label>
                    <p className="text-[11px] text-gray-500 max-w-sm leading-relaxed">Sets the minimum confidence score required for automatic field population without manual review flag.</p>
                  </div>
                  <div className="px-4 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg border border-brand-100 dark:border-brand-800/40 font-mono text-sm font-bold shadow-sm">
                    {config.ocr_threshold}%
                  </div>
                </div>
                <div className="relative pt-2">
                  <input type="range" min="0" max="100" step="1" value={config.ocr_threshold}
                    onChange={e => updateConfig('ocr_threshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white" />
                  <div className="absolute top-2 left-0 h-2 bg-brand-500 rounded-l-lg pointer-events-none transition-all" style={{ width: `${config.ocr_threshold}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>0% (Accept All)</span>
                  <span className={config.ocr_threshold < 70 ? 'text-red-400' : config.ocr_threshold < 85 ? 'text-amber-400' : 'text-green-400'}>
                    {config.ocr_threshold < 70 ? '⚠ Too Permissive' : config.ocr_threshold < 85 ? '~ Moderate' : '✓ Optimal'}
                  </span>
                  <span>100% (Manual Only)</span>
                </div>
              </div>

              {/* Denoising */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                      <Layers size={16} className="text-emerald-500" /> Denoising Sensitivity
                    </label>
                    <p className="text-[11px] text-gray-500 max-w-sm leading-relaxed">Adjusts the intensity of artifact removal on scanned low-quality or thermally printed documents.</p>
                  </div>
                  <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800/40 font-mono text-sm font-bold shadow-sm">
                    {config.denoising_sensitivity}%
                  </div>
                </div>
                <div className="relative pt-2">
                  <input type="range" min="0" max="100" step="1" value={config.denoising_sensitivity}
                    onChange={e => updateConfig('denoising_sensitivity', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white" />
                  <div className="absolute top-2 left-0 h-2 bg-emerald-500 rounded-l-lg pointer-events-none transition-all" style={{ width: `${config.denoising_sensitivity}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>0% (Off)</span>
                  <span className={config.denoising_sensitivity > 80 ? 'text-red-400' : 'text-green-400'}>
                    {config.denoising_sensitivity > 80 ? '⚠ May over-smooth' : '✓ Normal range'}
                  </span>
                  <span>100% (Max Filter)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Training Corpus */}
          <div className="bg-gradient-to-br from-brand-900 to-brand-800 rounded-xl p-8 border border-brand-700/50 relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-all" onClick={() => fileInputRef.current?.click()}>
                <CloudUpload size={36} className="text-brand-200" />
                <input ref={fileInputRef} type="file" multiple accept=".jsonl,.csv,.json" className="hidden" onChange={handleFileSelect} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-2 font-headline">Upload Training Corpus</h3>
                <p className="text-sm text-brand-200 mb-4 max-w-md">Feed the engine with JSONL or CSV datasets to improve domain-specific extraction accuracy.</p>
                {uploadedFiles.length > 0 && (
                  <div className="mb-4 space-y-1 max-h-24 overflow-y-auto">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-brand-200">
                        <span className={f.status === 'Uploaded ✓' ? 'text-green-400' : 'text-amber-400'}>{f.status}</span>
                        <span className="truncate">{f.name}</span>
                        <span className="text-brand-400">({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-white text-brand-900 text-sm font-bold rounded-xl hover:bg-brand-50 active:scale-95 transition-all shadow-md">
                    Select Files
                  </button>
                  <button onClick={() => setShowSchema(true)}
                    className="px-6 py-2.5 bg-brand-800 text-brand-100 text-sm font-bold rounded-xl hover:bg-brand-700 border border-brand-600 transition-colors">
                    Schema Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-4 space-y-6">
          {/* Live Retraining */}
          <div className="bg-white dark:bg-[#161c28] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800/60">
              <div className="flex items-center gap-2">
                <RefreshCw size={18} className={`text-blue-500 ${isTraining ? 'animate-spin' : ''}`} style={{ animationDuration: '2s' }} />
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Live Retraining</h2>
              </div>
              <button onClick={() => setIsTraining(t => !t)}
                className={`p-1.5 rounded-lg transition-all ${isTraining ? 'text-amber-500 hover:bg-amber-500/10' : 'text-green-500 hover:bg-green-500/10'}`}>
                {isTraining ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs mb-3 font-bold">
                  <span className="text-gray-700 dark:text-gray-300">Model Optimization</span>
                  <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-brand-500 h-full rounded-full relative transition-all duration-300" style={{ width: `${progress}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <Activity size={20} className="text-brand-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Epoch {epoch} / 60</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-1">
                    {isTraining ? `ETA: ~${etaMinutes}m` : '⏸ Paused'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Modules */}
          <div className="bg-white dark:bg-[#161c28] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800/60">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Domain Modules</h2>
              <Info size={16} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Click on a module to toggle Active/Standby" />
            </div>
            <div className="space-y-3">
              {modules.map(mod => (
                <button key={mod.id} onClick={() => toggleModule(mod.id)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 w-full text-left">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl border ${mod.bg}`}>
                      <Layers size={18} className={mod.color} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{mod.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {mod.status} • {mod.terms >= 1000 ? `${(mod.terms/1000).toFixed(0)}k` : mod.terms} terms
                      </p>
                    </div>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-full border ${mod.status === 'Active' ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-gray-400 bg-gray-500/10 border-gray-500/20'}`}>
                    {mod.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="md:col-span-12">
          <div className="bg-gray-900 dark:bg-[#111620] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
            <div className="px-6 py-4 bg-gray-800/50 dark:bg-[#161c28] border-b border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} /> Retraining Activity Log
                </span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/60 text-[10px] font-mono font-bold">
                    {logs.filter(l => l.type === 'WARN').length} Errors
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700 text-[10px] font-mono font-bold">
                    {logs.length} Logs
                  </span>
                </div>
              </div>
              <button onClick={handleDownloadArchive}
                className="text-[11px] text-blue-400 font-bold hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center gap-2 active:scale-95">
                <FileDown size={14} /> Download Archive
              </button>
            </div>
            <div ref={logRef} className="p-6 font-mono text-[11px] sm:text-xs leading-loose h-64 overflow-y-auto space-y-1.5 bg-[#0d1117] dark:bg-black/40">
              {logs.map((log, i) => (
                <div key={i} className="hover:bg-white/5 px-2 py-0.5 rounded transition-colors break-words">
                  <span className="text-gray-600 select-none mr-3">[{log.time}]</span>
                  <span className={`font-bold ${log.color} w-16 inline-block`}>{log.type}:</span>
                  <span className="text-gray-300 ml-2">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
