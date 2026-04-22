import React, { useState } from 'react';

export default function GenAdvancedApiExplorerSandbox() {
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(420);

  const handleTryItOut = () => {
    setLoading(true);
    const newTime = Math.floor(Math.random() * 600) + 300;
    setTimeout(() => {
      setResponseTime(newTime);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="w-full h-full animate-fade-in relative">
      <section className="flex-1 p-8 overflow-hidden flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold font-headline tracking-tight text-white">API Sandbox</h2>
            <p className="text-gray-400 mt-2 max-w-2xl">Test your extraction payloads against our production-grade OCR engines. Real-time feedback, confidence scoring, and raw JSON response data.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#161c28] px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
              <span className="material-symbols-outlined text-brand-400 text-sm">key</span>
              <code className="text-xs text-gray-400 font-mono">sk_prod_********8291</code>
              <button className="text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
            <button 
              onClick={handleTryItOut}
              disabled={loading}
              className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'sync' : 'play_arrow'}
              </span>
              {loading ? 'Processing...' : 'Try it Out'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 grid-rows-6 gap-6 flex-1 min-h-0">
          <div className="col-span-12 lg:col-span-5 row-span-6 bg-[#161c28] rounded-xl overflow-hidden flex flex-col shadow-lg border border-white/5">
            <div className="px-6 py-4 bg-[#0d1117] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-brand-400 text-sm">code</span>
                <span className="text-xs font-bold uppercase tracking-widest text-white">Request Payload</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded uppercase font-bold">POST</span>
                <span className="text-xs font-mono text-gray-500">/v2/extract</span>
              </div>
            </div>
            <div className="flex-1 p-6 font-mono text-sm overflow-auto hide-scrollbar bg-[#0d1117]/30 relative">
              <div className="ml-4 text-brand-300">
                <pre className="whitespace-pre-wrap">{"{"}
                  <span className="text-gray-400"> "engine"</span>: <span className="text-amber-400">"OCR-PRO-V3"</span>,
                  <span className="text-gray-400"> "options"</span>: {"{"}
                    <span className="text-gray-400"> "confidence_threshold"</span>: <span className="text-amber-400">0.85</span>,
                    <span className="text-gray-400"> "auto_rotate"</span>: <span className="text-amber-400">true</span>,
                    <span className="text-gray-400"> "extract_tables"</span>: <span className="text-amber-400">true</span>
                  {"}"},
                  <span className="text-gray-400"> "document"</span>: {"{"}
                    <span className="text-gray-400"> "type"</span>: <span className="text-amber-400">"remote_url"</span>,
                    <span className="text-gray-400"> "url"</span>: <span className="text-amber-400">"https://cdn.is.ai/samples/inv_92.pdf"</span>
                  {"}"}
                {"}"}</pre>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 row-span-4 bg-[#161c28] rounded-xl overflow-hidden flex flex-col shadow-2xl border border-white/5">
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0d1117]/50">
              <div className="flex gap-6">
                <button className="text-sm font-bold text-white border-b-2 border-brand-500 pb-1">Response View</button>
                <button className="text-sm font-medium text-gray-500 hover:text-white transition-all">Visual Overlay</button>
                <button className="text-sm font-medium text-gray-500 hover:text-white transition-all">Headers</button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span className={`text-xs font-bold uppercase ${loading ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {loading ? 'Processing' : '200 OK'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Time: {loading ? '...' : `${responseTime}ms`}</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2">
              <div className="p-6 border-r border-white/5 space-y-4">
                <div className="bg-[#0d1117] p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Confidence Score</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-white">98.4<span className="text-brand-500">%</span></span>
                    <div className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">High Confidence</div>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div className={`h-full bg-brand-500 transition-all duration-1000 ${loading ? 'w-0' : 'w-[98.4%]'}`}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Extracted Entities</p>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">Merchant Name</span>
                      <span className="text-sm font-bold text-white">TECH-GLOBAL SOLUTIONS</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500">Total Amount</span>
                      <span className="text-sm font-bold text-white">$12,450.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] p-6 font-mono text-[11px] overflow-auto hide-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-600 animate-pulse">Waiting for engine response...</div>
                ) : (
                  <pre className="text-brand-400">{"{"}
                    <span className="text-gray-400"> "status"</span>: "success",
                    <span className="text-gray-400"> "request_id"</span>: "req_{Math.random().toString(36).substring(7)}",
                    <span className="text-gray-400"> "data"</span>: {"{"}
                      <span className="text-gray-400"> "merchant"</span>: "TECH-GLOBAL SOLUTIONS",
                      <span className="text-gray-400"> "total"</span>: 12450.00,
                      <span className="text-gray-400"> "currency"</span>: "USD"
                    {"}"}
                  {"}"}</pre>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 row-span-2 bg-[#161c28] rounded-xl p-6 border border-white/5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-gray-500">receipt_long</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">System Execution Logs</span>
              </div>
              <button className="text-[10px] text-brand-400 hover:underline">Clear Logs</button>
            </div>
            <div className="space-y-2 overflow-auto max-h-24 hide-scrollbar font-mono text-[11px]">
              <div className="flex gap-4">
                <span className="text-gray-600">14:20:01.002</span>
                <span className="text-emerald-500 font-bold">[INFO]</span>
                <span className="text-gray-400">Authentication successful. Session validated.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-gray-600">14:20:01.421</span>
                <span className="text-brand-400 font-bold">[POST]</span>
                <span className="text-gray-400">Request received. Routing to engine OCR-PRO-V3...</span>
              </div>
              {!loading && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-left-2 transition-all">
                  <span className="text-gray-600">14:20:0{1 + responseTime/1000}</span>
                  <span className="text-emerald-500 font-bold">[DONE]</span>
                  <span className="text-gray-400">Extraction complete. Identity verified.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



    </div>
  );
}
