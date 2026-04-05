import React from 'react';
import { Mail, CheckCircle2, Clock, PlayCircle, AlertCircle, Send } from 'lucide-react';

export default function EmailStatusBadge({ status }) {
  const configs = {
    draft: {
      color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      icon: <Clock size={12} />,
      label: 'Draft'
    },
    scheduled: {
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: <PlayCircle size={12} />,
      label: 'Scheduled'
    },
    sending: {
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: <Send size={12} className="animate-pulse" />,
      label: 'Sending'
    },
    sent: {
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <CheckCircle2 size={12} />,
      label: 'Sent'
    },
    failed: {
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: <AlertCircle size={12} />,
      label: 'Failed'
    }
  };

  const config = configs[status] || configs.draft;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
