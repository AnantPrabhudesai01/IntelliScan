import React from 'react';
import { Link } from 'react-router-dom';
import { User, Building, ChevronRight, Globe } from 'lucide-react';

const SidebarSwitcher = ({ activeMode = 'personal', collapsed = false, isMobile = false }) => {
  const isPersonal = activeMode === 'personal';
  
  return (
    <div className={`px-3 py-4 ${collapsed && !isMobile ? 'flex flex-col items-center' : ''}`} style={{ minHeight: '80px' }}>
      <div className={`flex p-1 bg-black/40 rounded-xl border border-white/5 shadow-inner ${collapsed && !isMobile ? 'flex-col gap-2' : 'gap-1'}`}>
        {/* Personal Tab */}
        <Link 
          to="/dashboard/scan"
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${isPersonal ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          title="Personal Space"
        >
          <User size={14} />
          {(!collapsed || isMobile) && <span>Personal</span>}
        </Link>
        
        {/* Business Tab */}
        <Link 
          to="/workspace/dashboard"
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${!isPersonal ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          title="Business Workspace"
        >
          <Building size={14} />
          {(!collapsed || isMobile) && <span>Business</span>}
        </Link>
      </div>
      
      {(!collapsed || isMobile) && (
        <div className="mt-3 px-3 py-2 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group cursor-default transition-all hover:border-white/10">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
               <Globe size={8} className={isPersonal ? 'text-brand-400' : 'text-blue-400'} />
               <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">{isPersonal ? 'Personal Area' : 'Workspace HQ'}</span>
            </div>
            <span className="text-[10px] font-bold text-white truncate max-w-[110px]">
              {isPersonal ? 'My Private Desk' : 'IntelliScan Global'}
            </span>
          </div>
          <ChevronRight size={10} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
        </div>
      )}
    </div>
  );
};

export default SidebarSwitcher;
