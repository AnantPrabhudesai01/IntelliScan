import React from 'react';

export default function GenSecurityKeyMfaSetup() {
  return (
    <div className="w-full h-full animate-fade-in relative">
      <div className="absolute top-0 right-0 m-4 z-50 px-3 py-1 bg-amber-500/20 text-amber-500 text-[10px] font-bold uppercase rounded-full border border-amber-500/20 backdrop-blur-md">Auto-Migrated Route</div>
      



<div className="flex-1 p-8 max-w-5xl mx-auto w-full">

<div className="mb-12">
<h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Security Verification</h1>
<p className="text-on-surface-variant max-w-2xl leading-relaxed">Protect your Enterprise account with military-grade hardware authentication and multi-factor verification layers.</p>
</div>

<div className="grid grid-cols-12 gap-6">

<div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
<div className="bg-surface-container-low rounded-xl p-6">
<h3 className="text-xs uppercase tracking-widest text-primary font-bold mb-6">Setup Progress</h3>
<div className="space-y-8 relative">

<div className="absolute left-4 top-4 bottom-4 w-px bg-outline-variant/30"></div>

<div className="relative flex items-center gap-4 group">
<div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center z-10 ring-4 ring-surface">
<span className="material-symbols-outlined text-white text-sm" data-icon="shield">shield</span>
</div>
<div>
<p className="text-sm font-bold text-white">Identify Method</p>
<p className="text-xs text-on-surface-variant">Select authentication layer</p>
</div>
</div>

<div className="relative flex items-center gap-4 group opacity-50">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center z-10 ring-4 ring-surface">
<span className="material-symbols-outlined text-on-surface-variant text-sm" data-icon="fingerprint">fingerprint</span>
</div>
<div>
<p className="text-sm font-bold text-on-surface-variant">Verify Identity</p>
<p className="text-xs text-on-surface-variant">Interaction required</p>
</div>
</div>

<div className="relative flex items-center gap-4 group opacity-50">
<div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center z-10 ring-4 ring-surface">
<span className="material-symbols-outlined text-on-surface-variant text-sm" data-icon="check_circle">check_circle</span>
</div>
<div>
<p className="text-sm font-bold text-on-surface-variant">Finalize Setup</p>
<p className="text-xs text-on-surface-variant">Secure tokens stored</p>
</div>
</div>
</div>
</div>

<div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-6">
<div className="flex items-start gap-3 mb-4">
<span className="material-symbols-outlined text-primary-container" data-icon="verified_user">verified_user</span>
<h4 className="font-bold text-sm text-white">Security Recommendation</h4>
</div>
<p className="text-xs text-on-surface-variant leading-relaxed">We recommend Hardware Security Keys (FIDO2) for high-privilege administrative access. TOTP apps should be used as a secondary fallback.</p>
</div>
</div>

<div className="col-span-12 lg:col-span-8 space-y-6">

<div className="group bg-surface-container-low rounded-xl p-8 transition-all hover:bg-surface-container duration-300 relative overflow-hidden">
<div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
<span className="material-symbols-outlined text-9xl" data-icon="key">key</span>
</div>
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="key">key</span>
</div>
<div>
<h3 className="text-xl font-bold text-white">Hardware Security Key</h3>
<p className="text-sm text-on-surface-variant">WebAuthn, YubiKey, or Titan Security Key</p>
</div>
</div>
<span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wider">Recommended</span>
</div>
<p className="text-sm text-on-surface-variant mb-8 leading-relaxed">The most secure way to protect your account. Use a physical device to verify your identity via USB, NFC, or Bluetooth.</p>
<button className="w-full sm:w-auto px-8 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all">
                            Setup Security Key
                        </button>
</div>

<div className="group bg-surface-container-low rounded-xl p-8 transition-all hover:bg-surface-container duration-300">
<div className="flex items-center justify-between mb-6">
<div className="flex items-center gap-4">
<div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center">
<span className="material-symbols-outlined text-secondary text-3xl" data-icon="smartphone">smartphone</span>
</div>
<div>
<h3 className="text-xl font-bold text-white">Authenticator App</h3>
<p className="text-sm text-on-surface-variant">Google Authenticator, Authy, or Microsoft Auth</p>
</div>
</div>
</div>
<p className="text-sm text-on-surface-variant mb-8 leading-relaxed">Generate time-based one-time passwords on your mobile device. Works offline and is a standard for multi-factor authentication.</p>
<div className="flex flex-col sm:flex-row gap-3">
<button className="px-8 py-3 bg-surface-container-high text-white font-bold rounded-xl hover:bg-surface-container-highest transition-all border border-outline-variant/20 hover:border-outline-variant/50">
                                Configure TOTP
                            </button>
</div>
</div>

<div className="bg-tertiary-container/20 border border-tertiary-container/30 rounded-xl p-6 flex items-center gap-6">
<div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-on-tertiary-container" data-icon="verified" style={{}}>verified</span>
</div>
<div>
<h4 className="font-bold text-white">Active Protection: Bio-Key v4</h4>
<p className="text-xs text-on-surface-variant">Last verified: 2 hours ago. Registered as Primary.</p>
</div>
<button className="ml-auto text-xs font-bold text-error hover:underline">Revoke</button>
</div>
</div>
</div>
</div>



    </div>
  );
}