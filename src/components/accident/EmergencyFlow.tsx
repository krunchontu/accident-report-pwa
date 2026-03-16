import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAccidentStore } from '../../store/useAccidentStore';

export function EmergencyFlow() {
  const navigate = useNavigate();
  const { currentIncident, updateTriage } = useAccidentStore();

  if (!currentIncident) { navigate('/'); return null; }

  const handleCall = useCallback(async (tel: string, triageUpdate: Parameters<typeof updateTriage>[0]) => {
    updateTriage(triageUpdate);
    await useAccidentStore.getState().saveToDb();
    window.location.href = `tel:${tel}`;
  }, [updateTriage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-danger text-white px-4 py-4 text-center">
        <h1 className="text-xl font-bold">Emergency — Injuries Reported</h1>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <button
          onClick={() => handleCall('995', { ambulanceCalled: true })}
          className="block w-full bg-warning text-white rounded-2xl p-6 text-center shadow-lg active:scale-[0.98] transition-transform"
        >
          <Phone size={36} className="mx-auto mb-2" />
          <div className="text-2xl font-bold">Call 995</div>
          <div className="text-sm opacity-90">Ambulance — for injured persons</div>
        </button>

        <button
          onClick={() => handleCall('999', { policeCalled: true })}
          className="block w-full bg-danger text-white rounded-2xl p-6 text-center shadow-lg active:scale-[0.98] transition-transform"
        >
          <Phone size={36} className="mx-auto mb-2" />
          <div className="text-2xl font-bold">Call 999</div>
          <div className="text-sm opacity-90">Police — mandatory if injuries</div>
        </button>

        <div className="bg-danger/10 border-2 border-danger rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-danger font-bold">
            <AlertTriangle size={20} /> IMPORTANT
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2"><span className="text-danger font-bold mt-0.5">•</span> DO NOT move any vehicles until police arrive</li>
            <li className="flex items-start gap-2"><span className="text-danger font-bold mt-0.5">•</span> DO NOT admit fault or say sorry</li>
            <li className="flex items-start gap-2"><span className="text-danger font-bold mt-0.5">•</span> Turn on hazard lights</li>
            <li className="flex items-start gap-2"><span className="text-danger font-bold mt-0.5">•</span> Check if you can safely assist the injured</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/accident/scene')}
          className="w-full py-4 bg-navy text-white rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          Emergency services contacted — Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
