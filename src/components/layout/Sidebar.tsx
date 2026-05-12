import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Layers, Sparkles, Package, ChevronLeft, ChevronRight, Plus, Zap } from 'lucide-react';
import { useUIStore } from '../../store';

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
  const navigate       = useNavigate();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0 border-r border-[#4A5568] glass z-20 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#4A5568]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6B4226] to-[#4A5568] flex items-center justify-center shrink-0">
          <Zap size={14} className="text-[#FFF8F0]" />
        </div>
        {!collapsed && (
          <span className="font-bold text-[#FFF8F0] text-[15px] tracking-tight whitespace-nowrap overflow-hidden">
            GitABrand
          </span>
        )}
      </div>

      {/* Save New CTA */}
      <div className={collapsed ? 'px-2 pt-4 pb-2' : 'px-3 pt-4 pb-2'}>
        {collapsed ? (
          <button
            onClick={() => setSaveModal(true)}
            className="w-full h-8 flex items-center justify-center rounded-lg bg-[#6B4226] text-[#FFF8F0] hover:bg-[#A0644A] transition-colors btn-press"
          >
            <Plus size={16} />
          </button>
        ) : (
          <button
            onClick={() => setSaveModal(true)}
            className="w-full h-8 flex items-center justify-center gap-2 px-3 rounded-lg bg-[#6B4226] text-[#FFF8F0] font-semibold text-sm hover:bg-[#A0644A] transition-colors btn-press"
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
                  ? 'text-[#FFF8F0] bg-[#4A5568]'
                  : 'text-[#FFE8D6] hover:text-[#FFF8F0] hover:bg-[#3D2B1F]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6B4226] rounded-r-full" />
                )}
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="truncate font-medium whitespace-nowrap">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#4A5568] p-3 space-y-1.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[#A0644A] hover:text-[#FFE8D6] hover:bg-[#3D2B1F] transition-colors"
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
