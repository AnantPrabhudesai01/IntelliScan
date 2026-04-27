import React, { useState, useEffect } from 'react';
import { getStoredToken } from '../../utils/auth';

export default function GenAdvancedApiExplorerSandbox() {
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [activeTab, setActiveTab] = useState('response');
  const [payload, setPayload] = useState(JSON.stringify({
    engine: "OCR-PRO-V3",
    options: {
      confidence_threshold: 0.85,
      auto_rotate: true,
      extract_tables: true
    },
    document: {
      type: "remote_url",
      url: "https://cdn.is.ai/samples/inv_92.pdf"
    }
  }, null, 2));

  const [results, setResults] = useState({
    confidence: 98.4,
    entities: [
      { label: 'Merchant Name', value: 'TECH-GLOBAL SOLUTIONS' },
      { label: 'Total Amount', value: '$12,450.00' }
    ],
    raw: { status: 'success', merchant: 'TECH-GLOBAL SOLUTIONS', total: 12450.00 }
  });

  const [logs, setLogs] = useState([
    { time: '14:20:01', type: 'INFO', msg: 'Authentication successful. Session validated.' },
    { time: '14:20:01', type: 'POST', msg: 'Request received. Waiting for execution...' }
  ]);

  const handleTryItOut = async () => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const res = await fetch('/api/admin/sandbox/process', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });
      
      if (res.ok) {
        const json = await res.json();
        setResults(json.data);
        setResponseTime(json.data.latency);
        setLogs(prev => [...prev, ...json.data.logs]);
      } else {
        throw new Error('Engine processing failed');
      }
    } catch (err) {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'ERR', msg: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('sk_prod_5921_8291_X902');
    alert('API Key copied to clipboard!');
  };

  const handleClearLogs = () => setLogs([]);

  return (
    <div className="w-full h-full animate-fade-in relative text-white">
      <section className="flex-1 p-8 overflow-hidden flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold font-headline tracking-tight">API Sandbox</h2>
            <p className="text-gray-400 mt-2 max-w-2xl text-sm font-medium">Test your extraction payloads against our production-grade OCR engines. Real-time feedback, confidence scoring, and raw JSON response data.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#161c28] px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-brand-400 text-sm">key</span>
              <code className="text-[10px] text-gray-500 font-mono">sk_prod_********8291</code>
              <button onClick={handleCopyKey} className="text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
            <button 
              onClick={handleTryItOut}
              disabled={loading}
              className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-500/20"
            >
              <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'sync' : 'play_arrow'}
              </span>
              {loading ? 'Processing...' : 'Try it Out'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 grid-rows-6 gap-6 flex-1 min-h-0">
          <div className="col-span-12 lg:col-span-5 row-span-6 bg-[#161c28] rounded-2xl overflow-hidden flex flex-col shadow-xl border border-white/5">
            <div className="px-6 py-4 bg-[#0d1117] flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-400 text-sm">code</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Request Payload</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded uppercase font-bold">POST</span>
                <span className="text-[10px] font-mono text-gray-500">/v2/extract</span>
              </div>
            </div>
            <div className="flex-1 p-0 font-mono text-sm overflow-hidden bg-[#0d1117]/30">
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-full bg-transparent p-6 text-brand-300 resize-none outline-none hide-scrollbar font-mono text-xs leading-relaxed"
                spellCheck="false"
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 row-span-4 bg-[#161c28] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/5">
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/50">
              <div className="flex gap-6">
                {['response', 'visual', 'headers'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all pb-1 border-b-2 ${activeTab === tab ? 'text-white border-brand-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                  >
                    {tab} view
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span className={`text-[10px] font-black uppercase ${loading ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {loading ? 'Processing' : '200 OK'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Time: {loading ? '...' : `${responseTime}ms`}</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-white/5 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
                <div className="bg-[#0d1117] p-5 rounded-2xl border border-white/5 shadow-inner">
                  <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest mb-3">Confidence Score</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white">{results.confidence}<span className="text-brand-500">%</span></span>
                    <div className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${results.confidence > 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {results.confidence > 90 ? 'High Confidence' : 'Manual Review'}
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full mt-4 overflow-hidden">
                    <div 
                      className={`h-full bg-brand-500 transition-all duration-1000 ease-out`}
                      style={{ width: loading ? '0%' : `${results.confidence}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest mb-1">Extracted Entities</p>
                  {results.entities.map((entity, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{entity.label}</span>
                        <span className="text-sm font-black text-white">{entity.value}</span>
                      </div>
                      <span className="material-symbols-outlined text-gray-700 group-hover:text-brand-500 transition-colors">check_circle</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0d1117] p-6 font-mono text-[11px] overflow-auto no-scrollbar">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                    <div className="w-6 h-6 border-2 border-gray-800 border-t-brand-500 rounded-full animate-spin"></div>
                    <span className="animate-pulse italic">Waiting for engine response...</span>
                  </div>
                ) : (
                  <pre className="text-brand-400 leading-relaxed">
                    {JSON.stringify(results.raw || results, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 row-span-2 bg-[#161c28] rounded-2xl p-6 border border-white/5 shadow-inner flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm text-gray-500">receipt_long</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">System Execution Logs</span>
              </div>
              <button onClick={handleClearLogs} className="text-[9px] font-black uppercase tracking-widest text-brand-400 hover:text-brand-300 transition-colors">Clear Logs</button>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 no-scrollbar font-mono text-[10px]">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-1 duration-300">
                  <span className="text-gray-600 w-16">{log.time}</span>
                  <span className={`font-black w-10 ${log.type === 'INFO' ? 'text-emerald-500' : log.type === 'POST' ? 'text-brand-400' : log.type === 'DONE' ? 'text-brand-500' : 'text-red-500'}`}>[{log.type}]</span>
                  <span className="text-gray-400">{log.msg}</span>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4 animate-pulse">
                  <span className="text-gray-700 italic">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
