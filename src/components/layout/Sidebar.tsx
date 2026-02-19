import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Layers, Sparkles, Package, ChevronLeft, ChevronRight, Plus, RotateCcw, Zap } from 'lucide-react';
import { useUIStore, useSwipeStore } from '../../store';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/swipe-file', icon: Layers,          label: 'Swipe File' },
  { to: '/brand-dna',  icon: Sparkles,        label: 'Brand DNA'  },
  { to: '/brand-kit',  icon: Package,         label: 'Brand Kit'  },
];

export function Sidebar() {
  const collapsed      = useUIStore((s) => s.sidebarCollapsed);
  const setCollapsed   = useUIStore((s) => s.setSidebarCollapsed);
  const setSaveModal   = useUIStore((s) => s.setSaveModalOpen);
  const resetDemo      = useSwipeStore((s) => s.resetDemo);
  const navigate       = useNavigate();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0 border-r border-[#3F3F46] glass z-20 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#3F3F46]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#5E6AD2] flex items-center justify-center shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-[#FAFAFA] text-[15px] tracking-tight whitespace-nowrap overflow-hidden">
            GitABrand
          </span>
        )}
      </div>

      {/* Save New CTA */}
      <div className={collapsed ? 'px-2 pt-4 pb-2' : 'px-3 pt-4 pb-2'}>
        {collapsed ? (
          <button
            onClick={() => setSaveModal(true)}
            className="w-full flex items-center justify-center p-2.5 rounded-lg bg-[#A78BFA] text-[#09090B] hover:bg-[#C4B5FD] transition-colors btn-press"
          >
            <Plus size={16} />
          </button>
        ) : (
          <button
            onClick={() => setSaveModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#A78BFA] text-[#09090B] font-semibold text-sm hover:bg-[#C4B5FD] transition-colors btn-press"
          >
            <Plus size={15} />
            Save New
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-hidden">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group ${
                isActive
                  ? 'text-[#FAFAFA] bg-[#27272A]'
                  : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1F1F22]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#A78BFA] rounded-r-full" />
                )}
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="truncate font-medium whitespace-nowrap">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#3F3F46] p-3 space-y-1.5">
        {!collapsed && (
          <button
            onClick={() => { resetDemo(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#1F1F22] transition-colors"
          >
            <RotateCcw size={13} />
            Reset Demo
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#1F1F22] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <><ChevronLeft size={14} /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}
