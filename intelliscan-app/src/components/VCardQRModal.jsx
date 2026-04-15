import { X, Download, Share2, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function VCardQRModal({ contact, onClose }) {
  if (!contact) return null;

  // Generate vCard string
  const generateVCard = () => {
    let vcf = `BEGIN:VCARD\nVERSION:3.0\n`;
    vcf += `FN:${contact.name || 'Unknown'}\n`;
    if (contact.company) vcf += `ORG:${contact.company}\n`;
    if (contact.job_title || contact.title) vcf += `TITLE:${contact.job_title || contact.title}\n`;
    if (contact.phone) vcf += `TEL;TYPE=CELL:${contact.phone}\n`;
    if (contact.email) vcf += `EMAIL;TYPE=WORK,INTERNET:${contact.email}\n`;
    if (contact.website) vcf += `URL:${contact.website}\n`;
    vcf += `END:VCARD`;
    return vcf;
  };

  const vCardString = generateVCard();

  const downloadVCard = () => {
    const blob = new Blob([vCardString], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${contact.name || 'contact'}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#111827] w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                <Share2 size={20} />
             </div>
             <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">Share Contact</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Scan QR to Save</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* QR Code Section */}
        <div className="px-8 py-6 flex flex-col items-center">
           <div className="p-6 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-6 border-4 border-indigo-50">
              <QRCodeSVG 
                value={vCardString} 
                size={200}
                level="H" 
                includeMargin={false}
              />
           </div>
           
           <div className="text-center mb-8">
              <p className="font-bold text-gray-900 dark:text-white text-base mb-1">{contact.name || 'Unknown User'}</p>
              <p className="text-xs text-gray-500 font-medium">{contact.company || 'Private Contact'}</p>
           </div>

           <button 
             onClick={downloadVCard}
             className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 hover:scale-[1.02] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
           >
             <Download size={16} />
             Download vCard (.vcf)
           </button>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-center">
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Powered by IntelliScan AI Identity</p>
        </div>
      </div>
    </div>
  );
}
