import { useNavigate } from 'react-router-dom';
import { Phone, ExternalLink, ChevronLeft } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../../constants/emergencyContacts';

export function EmergencyNumbers() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-navy text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>
      <h1 className="text-xl font-bold text-navy mb-4">Emergency Numbers & Links</h1>

      <div className="space-y-2">
        {EMERGENCY_CONTACTS.map((contact, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium text-sm">{contact.label}</div>
              {'number' in contact && contact.number && (
                <div className="text-sm text-gray-500">{'displayNumber' in contact ? contact.displayNumber : contact.number}</div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              {(contact.type === 'call' || contact.type === 'both') && 'number' in contact && (
                <a href={`tel:${contact.number}`}
                  className="p-2.5 bg-success text-white rounded-xl">
                  <Phone size={18} />
                </a>
              )}
              {(contact.type === 'link' || contact.type === 'both') && 'url' in contact && (
                <a href={contact.url} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 bg-navy text-white rounded-xl">
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
