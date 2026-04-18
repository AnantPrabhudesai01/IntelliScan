import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Book, Lock, Zap, FileJson, AlertCircle, ChevronRight, Copy, Check, Terminal, Code2 } from 'lucide-react';

const DOC_SECTIONS = [
  { id: 'intro', title: 'Introduction', icon: Book },
  { id: 'auth', title: 'Authentication', icon: Lock },
  { id: 'scan', title: 'Scan Engine API', icon: Zap },
  { id: 'contacts', title: 'Contacts API', icon: FileJson },
  { id: 'webhooks', title: 'Webhooks & Events', icon: Terminal },
  { id: 'errors', title: 'Errors & Rate Limits', icon: AlertCircle },
];

function CodeBlock({ code, language = 'bash' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden bg-[#0e131f] border border-white/10 my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
          {language === 'bash' ? <Terminal size={12} /> : <Code2 size={12} />}
          {language}
        </span>
        <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed max-h-96">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}

function EndpointDetails({ method, path, desc, reqBody, resBody }) {
  const methodColors = {
    GET: 'bg-brand-500/20 text-brand-400 border-brand-500/20',
    POST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/20',
    PUT: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="mt-8 mb-12 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#161c28]">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded border text-xs font-bold uppercase tracking-widest ${methodColors[method]}`}>{method}</span>
          <code className="text-sm font-bold text-gray-900 dark:text-gray-100">{path}</code>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 md:ml-auto">{desc}</p>
      </div>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-white/10 -translate-x-1/2" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">Request</h4>
          {reqBody ? (
            <CodeBlock language="json" code={JSON.stringify(reqBody, null, 2)} />
          ) : (
            <p className="text-sm border border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center text-gray-500 dark:text-gray-400">No content body required.</p>
          )}
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            Response <span className="px-2 border border-emerald-500/20 rounded-full text-[10px] text-emerald-500 bg-emerald-500/10">200 OK</span>
          </h4>
          <CodeBlock language="json" code={JSON.stringify(resBody, null, 2)} />
        </div>
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  const [activeHash, setActiveHash] = useState('intro');

  // Simple scroll spy behavior
  const scrollTo = (id) => {
    setActiveHash(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0e131f] text-gray-900 dark:text-[#dde2f3] font-body flex flex-col lg:flex-row">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden fixed">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="lg:w-72 border-r border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-[#131929]/50 backdrop-blur-xl lg:h-screen lg:sticky top-0 z-20 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-white/10 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <ScanLine size={24} className="text-brand-600" />
            <span className="font-bold text-xl font-headline text-gray-900 dark:text-white">API Docs</span>
          </Link>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <p className="px-3 mb-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Documentation</p>
          {DOC_SECTIONS.map(sec => (
            <button
              key={sec.id}
              onClick={() => scrollTo(sec.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${activeHash === sec.id 
                  ? 'bg-brand-50 dark:bg-brand-600/10 text-brand-700 dark:text-brand-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <sec.icon size={16} className={activeHash === sec.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'} />
              {sec.title}
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-white/10 shrink-0">
          <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-500/20 rounded-xl p-4">
            <p className="text-[10px] font-bold text-brand-800 dark:text-brand-300 uppercase tracking-widest mb-1">Current Version</p>
            <p className="text-sm font-mono font-bold text-brand-900 dark:text-brand-400">v2.1.4 (Stable)</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 lg:px-12 lg:py-16 relative z-10 w-full lg:max-w-none ml-0">
        <div className="max-w-4xl mx-auto">
          
          {/* INTRO */}
          <section id="intro" className="scroll-mt-24 mb-24">
            <h1 className="text-4xl lg:text-5xl font-extrabold font-headline mb-6 text-gray-900 dark:text-white tracking-tight">IntelliScan REST API</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Welcome to the IntelliScan Developer API. Empower your applications with our enterprise-grade AI Optical Character Recognition (OCR) engine. Automate business card extraction, contact syncing, and data residency compliance via our secure endpoints.
            </p>
            <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl my-6 flex gap-4">
              <AlertCircle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-amber-900 dark:text-amber-200/80">
                <strong className="block text-amber-800 dark:text-amber-400 mb-1">Base URL Change Notice</strong>
                As of v2.0, all API requests must be routed to <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded text-amber-900 dark:text-amber-300">https://api.intelliscan.ai/v2</code>. The legacy v1 endpoints will be deprecated on December 31, 2026.
              </div>
            </div>
          </section>

          {/* AUTHENTICATION */}
          <section id="auth" className="scroll-mt-24 mb-24">
            <h2 className="text-3xl font-bold font-headline mb-6 pb-4 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">Authentication</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              The IntelliScan API uses Bearer Tokens for authentication. You can generate active API keys from the <Link to="/marketplace" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Integrations & API Settings</Link> dashboard.
            </p>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-sm font-semibold mb-2">Include your token in the HTTP Authorization header:</p>
              <CodeBlock language="bash" code="Authorization: Bearer is_live_xxxxxxxxx" />
            </div>
          </section>

          {/* SCAN ENGINE API */}
          <section id="scan" className="scroll-mt-24 mb-24">
            <h2 className="text-3xl font-bold font-headline mb-6 pb-4 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">Scan Engine API</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Directly interface with our core machine learning OCR pipelines. Submit image payloads and receive structured JSON matrices back instantly.
            </p>
            
            <EndpointDetails 
              method="POST" 
              path="/v2/scan" 
              desc="Submit an image for AI extraction. Supports base64 encoded strings up to 10MB."
              reqBody={{
                "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZ...",
                "options": {
                  "engine": "gemini-pro-vision",
                  "enhance_quality": true,
                  "expected_language": "en"
                }
              }}
              resBody={{
                "status": "success",
                "request_id": "req_84fja9z",
                "data": {
                  "name": "Jane Doe",
                  "company": "TechStart LLC",
                  "title": "Lead Software Engineer",
                  "email": "jane@techstart.io",
                  "phone": "+1 (555) 123-4567",
                  "confidence": 98.4
                },
                "latency_ms": 412
              }}
            />
          </section>

          {/* CONTACTS API */}
          <section id="contacts" className="scroll-mt-24 mb-24">
            <h2 className="text-3xl font-bold font-headline mb-6 pb-4 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">Contacts API</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Manage the digital contacts extracted inside your IntelliScan Workspace.
            </p>

            <EndpointDetails 
              method="GET" 
              path="/v2/contacts" 
              desc="Retrieve a paginated list of all contacts stored in your workspace."
              reqBody={null}
              resBody={{
                "object": "list",
                "has_more": false,
                "data": [
                  {
                    "id": "con_19bx81A",
                    "name": "Alex Mercer",
                    "company": "Acme Corp",
                    "created_at": "2023-11-20T14:32:00Z"
                  }
                ]
              }}
            />

            <EndpointDetails 
              method="DELETE" 
              path="/v2/contacts/:id" 
              desc="Permanently delete a contact. Supports automated GDPR Right-to-be-Forgotten workflows."
              reqBody={null}
              resBody={{
                "deleted": true,
                "id": "con_19bx81A",
                "gdpr_purge_status": "Complete"
              }}
            />
          </section>

          {/* WEBHOOKS */}
          <section id="webhooks" className="scroll-mt-24 mb-24">
            <h2 className="text-3xl font-bold font-headline mb-6 pb-4 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">Webhooks & Events</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Register webhook URLs to receive real-time push notifications when certain events occur in your workspace. Highly recommended for CRM sync flows.
            </p>

            <EndpointDetails 
              method="POST" 
              path="/v2/webhooks" 
              desc="Register a new webhook listener destination."
              reqBody={{
                "url": "https://your-domain.com/webhooks/intelliscan",
                "events": ["contact.created", "scan.failed"],
                "secret": "wh_sec_your_verification_hash"
              }}
              resBody={{
                "id": "wh_9xA2vq",
                "status": "active",
                "url": "https://your-domain.com/webhooks/intelliscan"
              }}
            />
          </section>

          {/* ERRORS & RATE LIMITS */}
          <section id="errors" className="scroll-mt-24 pb-12">
            <h2 className="text-3xl font-bold font-headline mb-6 pb-4 border-b border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">Errors & Rate Limits</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              IntelliScan uses conventional HTTP response codes to indicate the success or failure of an API request. Rate limits apply based on your active subscription plan tier.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Rate Limits (Per Minute)</h4>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex justify-between items-center"><span className="font-semibold text-gray-800 dark:text-gray-300">Free Tier</span> <span className="font-mono bg-gray-200 dark:bg-black/50 px-2 py-0.5 rounded">10 req/min</span></li>
                  <li className="flex justify-between items-center"><span className="font-semibold text-gray-800 dark:text-gray-300">Professional</span> <span className="font-mono bg-gray-200 dark:bg-black/50 px-2 py-0.5 rounded">600 req/min</span></li>
                  <li className="flex justify-between items-center"><span className="font-semibold text-primary dark:text-brand-400">Enterprise</span> <span className="font-mono bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-500/20">Custom Limit</span></li>
                </ul>
              </div>

              <div className="p-6 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-2xl">
                <h4 className="font-bold text-red-900 dark:text-red-400 mb-4">Common Status Codes</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-4"><span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">200</span> <span className="text-gray-600 dark:text-gray-400">Success. Request completed.</span></li>
                  <li className="flex gap-4"><span className="font-mono font-bold text-amber-600 dark:text-amber-400">400</span> <span className="text-gray-600 dark:text-gray-400">Bad request. Payload invalid.</span></li>
                  <li className="flex gap-4"><span className="font-mono font-bold text-red-600 dark:text-red-400">401</span> <span className="text-gray-600 dark:text-gray-400">Unauthorized. Key invalid/missing.</span></li>
                  <li className="flex gap-4"><span className="font-mono font-bold text-purple-600 dark:text-purple-400">429</span> <span className="text-gray-600 dark:text-gray-400">Too many requests. Limit exceeded.</span></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 mt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm font-semibold text-gray-400">Was this page helpful?</span>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Yes, thanks!</button>
                <button className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Could be better</button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
