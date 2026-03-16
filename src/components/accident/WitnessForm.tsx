import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { useAccidentStore } from '../../store/useAccidentStore';

export function WitnessForm() {
  const navigate = useNavigate();
  const { currentIncident, addWitness, updateWitness, removeWitness } = useAccidentStore();

  if (!currentIncident) { navigate('/'); return null; }
  const witnesses = currentIncident.witnesses;

  const inputClass = "w-full p-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-navy/30 bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const handleAdd = () => {
    addWitness({ id: crypto.randomUUID(), fullName: '', contactNumber: '', statement: '' });
  };

  return (
    <StepWizard currentStep={5} totalSteps={8} stepLabel="Witnesses" onNext={() => navigate('/accident/sketch')}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Users size={20} />
          <p className="text-sm">Were there any witnesses to the accident?</p>
        </div>

        {witnesses.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <Users size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No witnesses added yet</p>
          </div>
        )}

        {witnesses.map((w, i) => (
          <div key={w.id} className="bg-white rounded-xl p-4 space-y-3 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Witness {i + 1}</span>
              <button onClick={() => removeWitness(w.id)} className="text-danger text-sm flex items-center gap-1">
                <Trash2 size={14} /> Remove
              </button>
            </div>
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={w.fullName} onChange={e => updateWitness(w.id, { fullName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Contact Number</label>
              <input className={inputClass} type="tel" value={w.contactNumber} onChange={e => updateWitness(w.id, { contactNumber: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Statement</label>
              <textarea className={inputClass} rows={3} value={w.statement} onChange={e => updateWitness(w.id, { statement: e.target.value })} placeholder="What did they see?" />
            </div>
          </div>
        ))}

        <button onClick={handleAdd}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2">
          <Plus size={18} /> Add Witness
        </button>
      </div>
    </StepWizard>
  );
}
