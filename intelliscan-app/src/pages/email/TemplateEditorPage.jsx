import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Save, ArrowLeft, Eye, Code2, Type, Layout } from 'lucide-react';
import { getStoredToken } from '../../utils/auth.js';

const STARTER_TEMPLATES = {
  blank: {
    name: '',
    subject: '',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1f2937;">
  <h1 style="color:#4f46e5;font-size:28px;margin-bottom:16px;">Your Heading Here</h1>
  <p style="font-size:16px;line-height:1.6;margin-bottom:24px;">Start writing your email content here. Replace this placeholder text with your actual message.</p>
  <a href="#" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Call to Action</a>
  <hr style="margin:40px 0;border:none;border-top:1px solid #e5e7eb;"/>
  <p style="font-size:12px;color:#6b7280;">IntelliScan · Unsubscribe</p>
</div>`
  },
  welcome: {
    name: 'Welcome Email',
    subject: 'Welcome to IntelliScan! 🎉',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1f2937;">
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 20px;border-radius:12px;font-size:20px;font-weight:bold;">IntelliScan</div>
  </div>
  <h1 style="color:#111827;font-size:28px;text-align:center;margin-bottom:16px;">Welcome aboard! 👋</h1>
  <p style="font-size:16px;line-height:1.6;color:#374151;">Hi {{name}}, we're so excited to have you join us. IntelliScan helps you scan, organize, and manage your business contacts with the power of AI.</p>
  <div style="background:#f3f4f6;border-radius:12px;padding:24px;margin:24px 0;">
    <h3 style="margin-top:0;color:#4f46e5;">Get started in 3 steps:</h3>
    <ol style="font-size:15px;line-height:2;color:#374151;padding-left:20px;">
      <li>Upload your first business card</li>
      <li>Let AI extract the contact details</li>
      <li>Export to your CRM or Excel</li>
    </ol>
  </div>
  <div style="text-align:center;margin:32px 0;">
    <a href="{{dashboard_url}}" style="background:#4f46e5;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Start Scanning Now →</a>
  </div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;"/>
  <p style="font-size:12px;color:#9ca3af;text-align:center;">IntelliScan · Unsubscribe · Privacy Policy</p>
</div>`
  },
  followup: {
    name: 'Follow-Up Email',
    subject: 'Following up on {{contact_name}}',
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1f2937;">
  <h2 style="color:#111827;">Hi {{first_name}},</h2>
  <p style="font-size:16px;line-height:1.6;">I wanted to follow up on our recent conversation. I believe our solution could be a great fit for {{company}}.</p>
  <p style="font-size:16px;line-height:1.6;">Would you be open to a quick 15-minute call this week to discuss how IntelliScan can help streamline your contact management?</p>
  <div style="background:#f0f9ff;border-left:4px solid #4f46e5;padding:16px;border-radius:0 8px 8px 0;margin:24px 0;">
    <p style="margin:0;font-size:15px;color:#1e40af;"><strong>IntelliScan helps teams like yours:</strong><br/>• Save 5+ hours/week on data entry<br/>• Capture 100% accurate contact data<br/>• Never lose a business card again</p>
  </div>
  <a href="{{booking_url}}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Book a Call</a>
  <p style="margin-top:32px;font-size:14px;color:#6b7280;">Best regards,<br/>{{sender_name}}<br/>{{sender_title}}</p>
</div>`
  }
};

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('code');
  const [starter, setStarter] = useState('blank');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [html, setHtml] = useState(STARTER_TEMPLATES.blank.html);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);

  const loadStarter = (key) => {
    setStarter(key);
    const t = STARTER_TEMPLATES[key];
    setName(t.name);
    setSubject(t.subject);
    setHtml(t.html);
  };

  const generateAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/email/templates/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.html) {
        setHtml(data.html);
        if (data.subject) setSubject(data.subject);
        setShowAiPanel(false);
      }
    } catch (err) {
      console.error('AI generation failed', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !html.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/email/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ name, subject, html_body: html, category })
      });
      const data = await res.json();
      if (data.success || data.id) {
        navigate('/dashboard/email-marketing/templates');
      }
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white font-body">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#0b0f1a]/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-5 w-px bg-gray-800" />
          <h1 className="text-base font-bold text-white">New Email Template</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 text-brand-400 rounded-lg text-sm font-semibold transition-all"
          >
            <Sparkles size={15} /> AI Generate
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-lg text-sm font-bold transition-all"
          >
            <Save size={15} /> {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-61px)]">
        {/* Left Panel — Settings */}
        <aside className="w-72 border-r border-gray-800 flex flex-col overflow-y-auto p-5 gap-5 flex-shrink-0">
          {/* Starter layouts */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Starter Layout</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STARTER_TEMPLATES).map(([key]) => (
                <button
                  key={key}
                  onClick={() => loadStarter(key)}
                  className={`p-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                    starter === key
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                      : 'border-gray-700 text-gray-500 hover:border-gray-600'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Template Name */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Template Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Welcome Email"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Default Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Welcome to IntelliScan!"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              {['general', 'welcome', 'follow-up', 'newsletter', 'promotional'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Variables reference */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Available Variables</p>
            <div className="space-y-1">
              {['{{name}}', '{{first_name}}', '{{company}}', '{{email}}', '{{dashboard_url}}', '{{sender_name}}'].map(v => (
                <code key={v} className="block text-[10px] text-brand-400 font-mono">{v}</code>
              ))}
            </div>
          </div>
        </aside>

        {/* AI Prompt Panel */}
        {showAiPanel && (
          <div className="absolute top-[61px] left-72 right-0 z-20 bg-[#0d1117]/95 backdrop-blur-sm border-b border-brand-500/20 p-5">
            <div className="max-w-2xl mx-auto flex gap-3 items-center">
              <Sparkles size={18} className="text-brand-400 flex-shrink-0" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateAI()}
                placeholder='Describe the email... e.g. "A follow-up email for a SaaS product demo request"'
                className="flex-1 bg-gray-900 border border-brand-500/30 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
                autoFocus
              />
              <button
                onClick={generateAI}
                disabled={aiLoading || !aiPrompt.trim()}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-lg text-sm font-bold transition-all flex-shrink-0"
              >
                {aiLoading ? 'Generating...' : 'Generate'}
              </button>
              <button onClick={() => setShowAiPanel(false)} className="text-gray-500 hover:text-white text-sm px-2">✕</button>
            </div>
          </div>
        )}

        {/* Right Panel — Editor + Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Tabs */}
          <div className="border-b border-gray-800 px-6 flex items-center gap-1 h-11 flex-shrink-0">
            {[
              { key: 'code', label: 'HTML Code', icon: Code2 },
              { key: 'preview', label: 'Preview', icon: Eye },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-xs font-bold transition-all ${
                  activeTab === key
                    ? 'text-brand-400 border-b-2 border-brand-500 -mb-px'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'code' ? (
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full h-full bg-[#0d1117] text-green-300 font-mono text-sm p-6 resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
                placeholder="Write your HTML email here..."
              />
            ) : (
              <div className="h-full overflow-y-auto bg-gray-100">
                <div className="flex items-center justify-center p-4 bg-gray-200 border-b border-gray-300">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Layout size={13} /> Email Preview (600px width)
                  </div>
                </div>
                <div className="flex justify-center p-8">
                  <div
                    className="w-full max-w-[600px] bg-white shadow-xl rounded overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
