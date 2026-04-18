import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import generatedRoutes from '../pages/generated/routes.json';
import { Wrench } from 'lucide-react';

const coreRoutes = [
  { path: '/', name: 'Landing Page' },
  { path: '/sign-in', name: 'Sign In / Sign Up' },
  { path: '/dashboard/scan', name: 'User Dashboard (Scan)' },
  { path: '/workspace/dashboard', name: 'Workspace Dashboard' },
  { path: '/admin/dashboard', name: 'Platform Admin Dashboard' },
];

export default function DevTools() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)} 
        className="fixed bottom-6 right-6 z-[9999] bg-brand-600 text-white p-3 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:scale-110 active:scale-95 transition-transform"
      >
        <Wrench size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-80 max-h-[85vh] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden font-body">
      <div className="p-4 bg-brand-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
           <Wrench size={18} />
           <h3 className="font-bold text-sm tracking-wide">Prototype DevTools</h3>
        </div>
        <button onClick={() => setOpen(false)} className="text-brand-200 hover:text-white font-bold text-xs uppercase px-2 py-1 bg-black/20 rounded">Close</button>
      </div>
      
      <div className="p-5 overflow-y-auto flex-1 text-sm space-y-6 text-gray-800 dark:text-gray-200">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-2">Simulate User Role</h4>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="super_admin">Platform Admin</option>
            <option value="business_admin">Enterprise User</option>
            <option value="user">Normal Personal User</option>
            <option value="anonymous">Anonymous (Visitor)</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-2">Changing roles will trigger the RoleGuard security logic on protected routes.</p>
        </div>

        <div>
           <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-2">Primary Flows</h4>
           <div className="space-y-1">
             {coreRoutes.map(r => (
               <button 
                 key={r.path} 
                 onClick={() => {
                   if (r.path.includes('/admin')) setRole('super_admin');
                   else if (r.path.includes('/workspace')) setRole('business_admin');
                   navigate(r.path);
                 }} 
                 className="block w-full text-left px-3 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/40 rounded-lg text-brand-600 dark:text-brand-400 font-bold transition-all"
               >
                 {r.name}
               </button>
             ))}
           </div>
        </div>

        <div>
           <h4 className="font-bold text-xs uppercase tracking-widest text-gray-500 mb-2">All Screens Explorer ({generatedRoutes.length})</h4>
           <div className="space-y-0.5 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg p-1.5 bg-gray-50 dark:bg-[#161c28]">
             {generatedRoutes.map(r => (
               <button 
                 key={r.path} 
                 onClick={() => {
                   setRole('super_admin');
                   navigate(r.path);
                 }} 
                 className="block w-full text-left px-2 py-1.5 hover:bg-white dark:hover:bg-[#1a202c] border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded text-xs truncate transition-all text-gray-700 dark:text-gray-300"
               >
                 {r.name.replace('Gen', '')}
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
