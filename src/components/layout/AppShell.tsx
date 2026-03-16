import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

export function AppShell() {
  const isOffline = useOfflineStatus();

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      {isOffline && (
        <div className="bg-warning text-white text-center text-xs py-1 font-medium">
          You are offline — data is saved locally
        </div>
      )}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
