import { create } from 'zustand';
import { TargetAudience, Tone, Objective, UrgencyLevel, OutputFormat } from '@/types/transformation';
import { IngestionResponse } from '@/types/ingestion';

export type WizardStage = 'source' | 'inspect' | 'configure' | 'outputs' | 'summary';

interface WizardState {
  currentStage: WizardStage;
  projectId: string;
  sourceType: 'file' | 'url' | 'text';
  ingestedDocument: IngestionResponse | null;
  extractedText: string;
  
  // Configuration
  targetAudience: TargetAudience;
  tone: Tone;
  objective: Objective;
  urgencyLevel: UrgencyLevel;
  language: string;
  selectedOutputs: OutputFormat[];

  setStage: (stage: WizardStage) => void;
  setProjectId: (id: string) => void;
  setSourceType: (type: 'file' | 'url' | 'text') => void;
  setIngestedDocument: (doc: IngestionResponse | null) => void;
  setExtractedText: (text: string) => void;
  setTargetAudience: (audience: TargetAudience) => void;
  setTone: (tone: Tone) => void;
  setObjective: (obj: Objective) => void;
  setUrgencyLevel: (urgency: UrgencyLevel) => void;
  setLanguage: (lang: string) => void;
  toggleOutput: (output: OutputFormat) => void;
  resetWizard: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  currentStage: 'source',
  projectId: 'proj_01',
  sourceType: 'file',
  ingestedDocument: null,
  extractedText: '',

  targetAudience: 'executive',
  tone: 'formal',
  objective: 'action_required',
  urgencyLevel: 'high',
  language: 'English',
  selectedOutputs: ['executive_brief', 'advisory', 'social', 'presentation', 'infographic', 'video'],

  setStage: (stage) => set({ currentStage: stage }),
  setProjectId: (id) => set({ projectId: id }),
  setSourceType: (type) => set({ sourceType: type }),
  setIngestedDocument: (doc) => set({ ingestedDocument: doc }),
  setExtractedText: (text) => set({ extractedText: text }),
  setTargetAudience: (audience) => set({ targetAudience: audience }),
  setTone: (tone) => set({ tone }),
  setObjective: (objective) => set({ objective }),
  setUrgencyLevel: (urgencyLevel) => set({ urgencyLevel }),
  setLanguage: (language) => set({ language }),

  toggleOutput: (output) =>
    set((state) => {
      const exists = state.selectedOutputs.includes(output);
      const updated = exists
        ? state.selectedOutputs.filter((o) => o !== output)
        : [...state.selectedOutputs, output];
      return { selectedOutputs: updated };
    }),

  resetWizard: () =>
    set({
      currentStage: 'source',
      ingestedDocument: null,
      extractedText: '',
      targetAudience: 'executive',
      tone: 'formal',
      objective: 'action_required',
      urgencyLevel: 'high',
      language: 'English',
      selectedOutputs: ['executive_brief', 'advisory', 'social', 'presentation', 'infographic', 'video'],
    }),
}));
