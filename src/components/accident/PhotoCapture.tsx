import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, RotateCcw, ImagePlus, Plus, X } from 'lucide-react';
import { StepWizard } from '../layout/StepWizard';
import { useCamera } from '../../hooks/useCamera';
import type { CameraResult } from '../../hooks/useCamera';
import { useAccidentStore } from '../../store/useAccidentStore';
import { db } from '../../db/database';
import { PHOTO_PROMPTS } from '../../constants/photoPrompts';
import type { IncidentPhoto } from '../../types/incident';

const CATEGORIES: Record<string, string> = {
  scene: 'Scene Photos', your_vehicle: 'Your Vehicle', other_vehicle: 'Other Vehicle',
  other_party_docs: "Other Party's Documents", evidence: 'Evidence',
  injuries: 'Injuries', your_docs: 'Your Documents', miscellaneous: 'Miscellaneous',
};

export function PhotoCapture() {
  const navigate = useNavigate();
  const { capture, isCapturing } = useCamera();
  const { currentIncident } = useAccidentStore();
  const [capturedPhotos, setCapturedPhotos] = useState<Map<string, IncidentPhoto>>(new Map());
  const [miscPhotos, setMiscPhotos] = useState<IncidentPhoto[]>([]);

  useEffect(() => {
    if (!currentIncident) return;
    db.photos.where('incidentId').equals(currentIncident.id).toArray().then(photos => {
      const map = new Map<string, IncidentPhoto>();
      const misc: IncidentPhoto[] = [];
      for (const p of photos) {
        if (p.promptId.startsWith('misc_')) {
          misc.push(p);
        } else {
          map.set(p.promptId, p);
        }
      }
      setCapturedPhotos(map);
      setMiscPhotos(misc);
    });
  }, [currentIncident]);

  if (!currentIncident) { navigate('/'); return null; }

  const requiredCount = PHOTO_PROMPTS.filter(p => p.required).length;
  const capturedRequiredCount = PHOTO_PROMPTS.filter(p => p.required && capturedPhotos.has(p.id)).length;

  const promptRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const savePhoto = async (promptId: string, result: CameraResult) => {
    const photo: IncidentPhoto = {
      id: crypto.randomUUID(),
      incidentId: currentIncident.id,
      promptId,
      blob: result.blob,
      thumbnail: result.thumbnail,
      latitude: result.metadata.latitude,
      longitude: result.metadata.longitude,
      timestamp: result.metadata.timestamp,
      compassHeading: result.metadata.compassHeading,
      caption: '',
    };
    await db.photos.put(photo);
    return photo;
  };

  const handleCapture = async (promptId: string, mode: 'camera' | 'gallery' = 'camera') => {
    const result = await capture(mode);
    if (!result) return;

    const photo = await savePhoto(promptId, result);
    const newMap = new Map(capturedPhotos).set(promptId, photo);
    setCapturedPhotos(newMap);

    // Auto-advance to next uncaptured required photo
    const nextPrompt = PHOTO_PROMPTS.find(p => p.required && !newMap.has(p.id));
    if (nextPrompt) {
      const el = promptRefs.current.get(nextPrompt.id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleRetake = async (promptId: string, mode: 'camera' | 'gallery' = 'camera') => {
    const existing = capturedPhotos.get(promptId);
    if (existing) await db.photos.delete(existing.id);
    await handleCapture(promptId, mode);
  };

  const handleAddMiscPhoto = async (mode: 'camera' | 'gallery' = 'camera') => {
    const result = await capture(mode);
    if (!result) return;

    const promptId = `misc_${crypto.randomUUID()}`;
    const photo = await savePhoto(promptId, result);
    setMiscPhotos(prev => [...prev, photo]);
  };

  const handleRemoveMiscPhoto = async (photo: IncidentPhoto) => {
    await db.photos.delete(photo.id);
    setMiscPhotos(prev => prev.filter(p => p.id !== photo.id));
  };

  const groupedPrompts = PHOTO_PROMPTS.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof PHOTO_PROMPTS[number][]>);

  const handleNext = () => {
    if (capturedRequiredCount < requiredCount) {
      if (!confirm(`You have ${requiredCount - capturedRequiredCount} required photos remaining. Continue anyway?`)) return;
    }
    navigate('/accident/other-party');
  };

  return (
    <StepWizard currentStep={2} totalSteps={8} stepLabel="Photo Evidence" onNext={handleNext}>
      <div className="space-y-6">
        {/* Progress */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{capturedRequiredCount} of {requiredCount} required photos</span>
            <span className="text-xs text-gray-500">{capturedPhotos.size + miscPhotos.length} total</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-success rounded-full transition-all" style={{ width: `${(capturedRequiredCount / requiredCount) * 100}%` }} />
          </div>
        </div>

        {/* Photo groups */}
        {/* Predefined photo groups */}
        {Object.entries(groupedPrompts).map(([category, prompts]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{CATEGORIES[category] || category}</h3>
            <div className="space-y-2">
              {prompts.map(prompt => {
                const captured = capturedPhotos.get(prompt.id);
                return (
                  <div key={prompt.id} ref={el => { if (el) promptRefs.current.set(prompt.id, el); }} className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      {captured ? (
                        <img src={captured.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <Camera size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{prompt.label}</span>
                          {prompt.required ? (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${captured ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                              {captured ? 'Done' : 'Required'}
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Optional</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{prompt.description}</p>
                        <div className="flex gap-2 mt-2">
                          {captured ? (
                            <>
                              <button onClick={() => handleRetake(prompt.id, 'camera')} disabled={isCapturing} className="flex items-center gap-1 text-xs text-navy font-medium disabled:opacity-50">
                                <RotateCcw size={12} /> Retake
                              </button>
                              <button onClick={() => handleRetake(prompt.id, 'gallery')} disabled={isCapturing} className="flex items-center gap-1 text-xs text-navy font-medium disabled:opacity-50">
                                <ImagePlus size={12} /> Re-upload
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleCapture(prompt.id, 'camera')} disabled={isCapturing}
                                className="flex items-center gap-1 px-3 py-1.5 bg-navy text-white rounded-lg text-xs font-medium disabled:opacity-50">
                                <Camera size={12} /> Camera
                              </button>
                              <button onClick={() => handleCapture(prompt.id, 'gallery')} disabled={isCapturing}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white text-navy border border-navy rounded-lg text-xs font-medium disabled:opacity-50">
                                <ImagePlus size={12} /> Gallery
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {captured && <Check size={20} className="text-success shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Miscellaneous Photos */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{CATEGORIES.miscellaneous}</h3>
          <p className="text-xs text-gray-500 mb-3">Add any additional photos to support your claim (e.g. witness details, nearby CCTV, weather conditions, traffic congestion).</p>
          <div className="space-y-2">
            {miscPhotos.map(photo => (
              <div key={photo.id} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <img src={photo.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">Additional photo</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(photo.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <button onClick={() => handleRemoveMiscPhoto(photo)} className="text-gray-400 hover:text-danger shrink-0 p-1">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button onClick={() => handleAddMiscPhoto('camera')} disabled={isCapturing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-navy hover:text-navy disabled:opacity-50 transition-colors">
                <Plus size={16} /> <Camera size={16} /> Take Photo
              </button>
              <button onClick={() => handleAddMiscPhoto('gallery')} disabled={isCapturing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-navy hover:text-navy disabled:opacity-50 transition-colors">
                <Plus size={16} /> <ImagePlus size={16} /> From Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    </StepWizard>
  );
}
