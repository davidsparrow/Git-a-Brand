import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SaveModal } from '../modals/SaveModal';
import { useUIStore } from '../../store';

export function AppLayout() {
  const saveModalOpen = useUIStore((s) => s.saveModalOpen);

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      {saveModalOpen && <SaveModal />}
    </div>
  );
}
