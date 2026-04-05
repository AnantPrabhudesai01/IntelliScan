import React from 'react';

export default function GenEnterpriseSsoSamlConfig() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="pt-24 pb-12 px-12 max-w-6xl mx-auto">

<nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
<span>Workspace</span>
<span className="material-symbols-outlined text-sm">chevron_right</span>
<span>Settings</span>
<span className="material-symbols-outlined text-sm">chevron_right</span>
<span className="text-white font-medium">SSO Configuration</span>
</nav>
<div className="flex justify-between items-end mb-10">
<div>
<h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">SSO &amp; SAML Configuration</h1>
<p className="text-on-surface-variant text-lg max-w-2xl">Manage enterprise identity providers and Just-In-Time provisioning for your organization's security at scale.</p>
</div>
<div className="flex gap-3">
<button className="px-6 py-2.5 bg-surface-container-high text-white rounded-xl text-sm font-semibold border border-white/5 hover:bg-surface-bright transition-all">
                        Test Connection
                    </button>
<button className="px-6 py-2.5 bg-primary-container text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        Save Changes
                    </button>
</div>
</div>

<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-3xl p-8 border border-white/5 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined text-3xl">verified_user</span>
</div>
<h3 className="text-xl font-bold text-white mb-2">SAML 2.0 Status</h3>
<p className="text-sm text-on-surface-variant mb-8 leading-relaxed">Secure your workspace by requiring single sign-on via your preferred identity provider.</p>
</div>
<div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border border-white/5">
<span className="text-sm font-semibold text-white">Enable SAML</span>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox" value=""/>
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
</div>

<div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-3xl p-8 border border-white/5">
<div className="flex items-start justify-between mb-8">
<div>
<h3 className="text-xl font-bold text-white mb-1">Identity Provider Metadata</h3>
<p className="text-sm text-on-surface-variant">Import settings directly from your IdP metadata XML or URL.</p>
</div>
<span className="px-3 py-1 bg-secondary-container/30 text-secondary text-[10px] font-bold uppercase tracking-widest rounded-full">OCR-V2 Validated</span>
</div>
<div className="space-y-6">
<div>
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Metadata URL</label>
<div className="flex gap-3">
<input className="flex-1 bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/40 transition-all" placeholder="https://idp.example.com/saml/metadata" type="text"/>
<button className="px-5 bg-surface-container-highest text-white rounded-xl text-xs font-bold border border-white/10 hover:bg-surface-bright transition-all">Fetch</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">SSO Endpoint (HTTP-Redirect)</label>
<input className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/40 transition-all" type="text" value="https://sso.intelliscan.ai/login/callback"/>
</div>
<div>
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Identity Provider Entity ID</label>
<input className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/40 transition-all" placeholder="urn:mace:example.com:idp" type="text"/>
</div>
</div>
</div>
</div>

<div className="col-span-12 lg:col-span-7 bg-surface-container-low rounded-3xl p-8 border border-white/5">
<div className="flex items-center gap-4 mb-8">
<div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined">key</span>
</div>
<h3 className="text-xl font-bold text-white">Public Certificate</h3>
</div>
<div className="relative group cursor-pointer">
<div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
<div className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all group-hover:border-primary/40">
<span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 group-hover:text-primary transition-colors">cloud_upload</span>
<div className="text-sm font-semibold text-white mb-1">Click to upload or drag &amp; drop</div>
<div className="text-xs text-on-surface-variant">X.509 Certificate in .pem or .cer format</div>
</div>
</div>
<div className="mt-6 p-4 bg-surface-container rounded-2xl flex items-center justify-between border border-white/5">
<div className="flex items-center gap-3">
<span className="material-symbols-outlined text-on-surface-variant">description</span>
<div>
<div className="text-xs font-bold text-white">idp_prod_v3.crt</div>
<div className="text-[10px] text-on-surface-variant">Expires: Oct 24, 2026 • 2.4 KB</div>
</div>
</div>
<button className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors">
<span className="material-symbols-outlined text-lg">delete</span>
</button>
</div>
</div>

<div className="col-span-12 lg:col-span-5 bg-surface-container-low rounded-3xl p-8 border border-white/5">
<div className="flex items-center gap-4 mb-6">
<div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined">bolt</span>
</div>
<h3 className="text-xl font-bold text-white">Just-In-Time (JIT)</h3>
</div>
<p className="text-sm text-on-surface-variant mb-6 leading-relaxed">Automatically create user accounts in IntelliScan when they sign in through your IdP for the first time.</p>
<div className="space-y-4">
<div className="flex items-start gap-4 p-4 bg-surface-container rounded-2xl border border-white/5 transition-all hover:bg-surface-container-high">
<input checked="" className="mt-1 w-4 h-4 rounded border-outline-variant bg-surface-container-highest text-primary focus:ring-primary/40" type="checkbox"/>
<div>
<div className="text-sm font-bold text-white">Enable JIT Provisioning</div>
<div className="text-xs text-on-surface-variant mt-1">Users will be added to the default team.</div>
</div>
</div>
<div className="flex items-start gap-4 p-4 bg-surface-container rounded-2xl border border-white/5 transition-all hover:bg-surface-container-high">
<input className="mt-1 w-4 h-4 rounded border-outline-variant bg-surface-container-highest text-primary focus:ring-primary/40" type="checkbox"/>
<div>
<div className="text-sm font-bold text-white">Sync Group Memberships</div>
<div className="text-xs text-on-surface-variant mt-1">Map SAML attributes to IntelliScan roles.</div>
</div>
</div>
<div>
<label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 ml-1">Default Provisioning Role</label>
<select className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-primary/40 appearance-none transition-all">
<option>Viewer</option>
<option selected="">Editor</option>
<option>Admin</option>
</select>
</div>
</div>
</div>

<div className="col-span-12 bg-surface-container-low rounded-3xl p-8 border border-white/5 relative overflow-hidden">
<div className="absolute right-0 top-0 w-64 h-full opacity-10 pointer-events-none">
<div className="w-full h-full bg-gradient-to-l from-primary to-transparent"></div>
</div>
<div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
<div>
<h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Service Provider Entity ID</h4>
<div className="flex items-center justify-between group">
<code className="text-sm text-on-surface font-mono">https://intelliscan.ai/saml/metadata</code>
<button className="text-on-surface-variant hover:text-white transition-colors">
<span className="material-symbols-outlined text-lg">content_copy</span>
</button>
</div>
</div>
<div>
<h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Assertion Consumer Service (ACS)</h4>
<div className="flex items-center justify-between group">
<code className="text-sm text-on-surface font-mono">https://api.intelliscan.ai/v1/auth/sso/saml</code>
<button className="text-on-surface-variant hover:text-white transition-colors">
<span className="material-symbols-outlined text-lg">content_copy</span>
</button>
</div>
</div>
<div>
<h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">Relay State</h4>
<div className="flex items-center justify-between group">
<code className="text-sm text-on-surface font-mono">/workspace/dashboard</code>
<button className="text-on-surface-variant hover:text-white transition-colors">
<span className="material-symbols-outlined text-lg">content_copy</span>
</button>
</div>
</div>
</div>
</div>
</div>

<div className="mt-12 pt-8 border-t border-white/5">
<div className="flex items-center gap-4 mb-6">
<div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
<span className="material-symbols-outlined text-xl">dangerous</span>
</div>
<h3 className="text-lg font-bold text-white">Danger Zone</h3>
</div>
<div className="bg-error-container/10 border border-error/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
<div>
<div className="font-bold text-white">Disconnect SSO Provider</div>
<div className="text-sm text-on-surface-variant mt-1">This will immediately disable SSO login for all users. Ensure you have admin password access.</div>
</div>
<button className="px-6 py-2.5 bg-error-container text-on-error-container rounded-xl text-sm font-bold hover:brightness-110 transition-all whitespace-nowrap">
                        Delete Configuration
                    </button>
</div>
</div>
</div>

    </div>
  );
}