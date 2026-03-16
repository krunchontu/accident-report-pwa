import { useNavigate } from 'react-router-dom';
import { Check, X, Phone } from 'lucide-react';

const DOS = [
  'Stop immediately and switch on hazard lights',
  'Check for injuries — call 995 if anyone is hurt',
  'Call 999 (Police) if required',
  'Take photos of EVERYTHING — damage, plates, licence, insurance',
  'Exchange details with the other driver',
  'Note down time, location, weather, road conditions',
  'Get witness contact details',
  'File SAS within 24 hours at www.gia.org.sg',
  'Notify your insurer within 24 hours',
  'See a doctor within 72 hours (even if no obvious injury)',
  'Keep all receipts and documents',
];

const DONTS = [
  "DON'T admit fault or say sorry",
  "DON'T move vehicles before police arrive (if injuries/required)",
  "DON'T sign any blank forms",
  "DON'T accept cash settlement on the spot",
  "DON'T engage third-party tow trucks (use insurer's panel)",
  "DON'T repair your vehicle before insurer assessment",
  "DON'T give recorded statements without legal advice",
  "DON'T post about the accident on social media",
];

export function DosAndDonts() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-navy mb-4">Quick Reference</h1>

      <div className="space-y-4">
        <div className="bg-success/5 rounded-xl p-4 border border-success/20">
          <h2 className="font-bold text-success mb-3 flex items-center gap-2"><Check size={18} /> DO</h2>
          <ul className="space-y-2">
            {DOS.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check size={14} className="text-success shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-danger/5 rounded-xl p-4 border border-danger/20">
          <h2 className="font-bold text-danger mb-3 flex items-center gap-2"><X size={18} /> DON'T</h2>
          <ul className="space-y-2">
            {DONTS.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <X size={14} className="text-danger shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button onClick={() => navigate('/emergency-numbers')}
          className="w-full py-4 bg-navy text-white rounded-xl font-semibold flex items-center justify-center gap-2">
          <Phone size={18} /> Emergency Numbers & Links
        </button>
      </div>
    </div>
  );
}
