import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Play, Key, Copy, Code, CheckCircle2, Clock, Trash2, List } from 'lucide-react';
import { getStoredToken } from '../utils/auth.js';

export default function AdvancedApiExplorerSandbox() {
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

  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const token = getStoredToken();
      const res = await apiClient.get('/sandbox/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load sandbox logs", err);
    }
  };

  const handleTestApi = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const token = getStoredToken();
      const reqData = JSON.parse(payload);
      const res = await apiClient.post('/sandbox/test', reqData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResponse(res.data);
      fetchLogs(); // refresh logs immediately
    } catch {
      setResponse({ error: 'Failed to execute API call. Check payload JSON format.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      const token = getStoredToken();
      await apiClient.delete('/sandbox/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs([]);
    } catch (err) {
      console.error("Failed to clear logs", err);
    }
  };

  return (
    <div className="w-full h-full animate-fade-in flex flex-col pt-4">
      <section className="flex-1 px-8 pb-8 overflow-hidden flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold font-headline tracking-tight text-gray-900 dark:text-white">API Sandbox</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl text-sm leading-relaxed">
              Test your extraction payloads against our production-grade OCR engines. Real-time feedback, confidence scoring, and raw JSON response data.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 dark:bg-[#161c28] px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-3 shadow-sm">
              <Key size={16} className="text-indigo-600 dark:text-indigo-400" />
              <code className="text-xs text-gray-600 dark:text-gray-400 font-mono tracking-wider font-bold">sk_prod_********8291</code>
              <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Copy Key">
                <Copy size={16} />
              </button>
            </div>
            <button 
              onClick={handleTestApi} 
              disabled={isLoading}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold font-headline flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? <Clock size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
              {isLoading ? 'Processing...' : 'Try it Out'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 grid-rows-6 gap-6 flex-1 min-h-0">
          {/* Request Payload Area */}
          <div className="col-span-12 lg:col-span-5 row-span-6 bg-white dark:bg-[#161c28] rounded-xl overflow-hidden flex flex-col shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60">
              <div className="flex items-center gap-2">
                <Code size={18} className="text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">Request Payload</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest">POST</span>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">/v2/extract</span>
              </div>
            </div>
            <div className="flex-1 p-0 relative bg-[#0d1117] dark:bg-black/40">
              <textarea 
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-full p-6 text-sm font-mono text-green-400 bg-transparent resize-none focus:outline-none custom-scrollbar leading-loose"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Response Data Area */}
          <div className="col-span-12 lg:col-span-7 row-span-4 bg-white dark:bg-[#161c28] rounded-xl overflow-hidden flex flex-col shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 bg-gray-50 dark:bg-transparent">
              <div className="flex gap-6">
                <button className="text-sm font-bold text-gray-900 dark:text-white border-b-2 border-indigo-600 pb-1">Response View</button>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all pb-1">Visual Overlay</button>
              </div>
              {response && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">200 OK</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Time: {response._latency_ms || 420}ms</span>
                </div>
              )}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800/60 space-y-6 overflow-y-auto">
                {response ? (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-widest mb-2">Confidence Score</p>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black font-headline text-gray-900 dark:text-white">
                          {(response.data?.meta?.confidence * 100).toFixed(1)}<span className="text-indigo-500">%</span>
                        </span>
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] px-2 py-1 rounded w-fit font-bold uppercase tracking-widest">High Confidence</div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${response.data?.meta?.confidence * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-widest pl-1">Extracted Entities</p>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-transparent">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Merchant Name</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{response.data?.merchant}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-transparent">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">${response.data?.total}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                    <Play size={32} className="opacity-20" />
                    <p className="text-sm">Click "Try it Out" to execute payload</p>
                  </div>
                )}
              </div>
              <div className="bg-[#0d1117] dark:bg-black/40 p-6 font-mono text-xs overflow-auto hide-scrollbar custom-scrollbar">
                {response ? (
                  <pre className="text-indigo-300 leading-loose">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                ) : (
                  <div className="text-gray-600 italic">No response data yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Logs Area */}
          <div className="col-span-12 lg:col-span-7 row-span-2 bg-white dark:bg-[#161c28] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <List size={16} className="text-gray-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">System Execution Logs</span>
              </div>
              <button onClick={handleClearLogs} className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1 uppercase tracking-widest">
                <Trash2 size={12} /> Clear Logs
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar space-y-2">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="flex gap-4 font-mono text-[11px] py-1">
                  <span className="text-gray-400">{(new Date(log.timestamp)).toLocaleTimeString()}</span>
                  <span className="text-emerald-500 font-bold">[{log.status_code}]</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">[POST]</span>
                  <span className="text-gray-600 dark:text-gray-300 flex-1 truncate">Routed to {log.engine}. Latency: {log.latency_ms}ms.</span>
                </div>
              )) : (
                <div className="text-[11px] font-mono text-gray-400 py-2">No execution logs found.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
