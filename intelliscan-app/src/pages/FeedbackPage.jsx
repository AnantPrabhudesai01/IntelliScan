import React, { useState } from 'react';
import { Send, MessageSquare, AlertCircle, Lightbulb, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function FeedbackPage() {
  const [type, setType] = useState('feature');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSubject('');
        setMessage('');
        setType('feature');
      }, 4000);
    }, 1500);
  };

  const types = [
    { id: 'bug', label: 'Report a Problem', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { id: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { id: 'support', label: 'Help & Support', icon: HelpCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="max-w-4xl mx-auto animation-fade-in font-body">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-gray-900 dark:text-white mb-2">Platform Feedback</h1>
        <p className="text-gray-600 dark:text-gray-400">Help us improve IntelliScan by sharing your thoughts, reporting issues, or requesting new features.</p>
      </div>

      <div className="bg-white dark:bg-[#161c28] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden relative">
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-10 bg-white/80 dark:bg-[#161c28]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold font-headline text-gray-900 dark:text-white mb-2">Feedback Submitted!</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">Thank you for your valuable input. Our product team will review your message shortly.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {/* Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">What kind of feedback is this?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {types.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all
                    ${type === t.id 
                      ? `${t.bg.split(' ')[1]} ring-1 ring-inset ${t.bg.split(' ')[1].replace('border', 'ring')} bg-gray-50 dark:bg-white/5` 
                      : 'border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 bg-transparent'}`}
                >
                  <t.icon size={24} className={type === t.id ? t.color : 'text-gray-400'} />
                  <span className={`text-sm font-semibold ${type === t.id ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your feedback"
                className="w-full bg-gray-50 dark:bg-[#0e131f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Details</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder={
                  type === 'bug' ? "Please describe the problem you encountered, including steps to reproduce it." :
                  type === 'feature' ? "What new functionality would make your workflow easier?" :
                  "Tell us what's on your mind..."
                }
                className="w-full bg-gray-50 dark:bg-[#0e131f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow resize-y"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
