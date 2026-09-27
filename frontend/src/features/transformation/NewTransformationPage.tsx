import React, { useState } from 'react';
import { useWizardStore, WizardStage } from '@/stores/transformationWizardStore';
import { useUIStore } from '@/stores/uiStore';
import { ingestionApi } from '@/lib/api/ingestion';
import { transformationsApi } from '@/lib/api/transformations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUploader } from '@/components/common/FileUploader';
import { OutputFormat, TargetAudience, Tone, Objective, UrgencyLevel } from '@/types/transformation';
import {
  FileText, Globe, AlignLeft, CheckCircle2, ArrowRight, Shield, FileCheck, Video, Presentation, Share2, PieChart, Database, Zap, Settings, ChevronDown, ChevronUp, Check
} from 'lucide-react';

interface NewTransformationPageProps {
  onNavigate?: (route: string) => void;
}

export function NewTransformationPage({ onNavigate }: NewTransformationPageProps) {
  const navigate = onNavigate || ((route: string) => {
    window.history.pushState({}, '', route);
    window.dispatchEvent(new Event('popstate'));
  });
  
  const {
    projectId,
    sourceType,
    ingestedDocument,
    extractedText,
    targetAudience,
    tone,
    objective,
    urgencyLevel,
    language,
    selectedOutputs,
    setSourceType,
    setIngestedDocument,
    setExtractedText,
    setTargetAudience,
    setTone,
    setObjective,
    setUrgencyLevel,
    toggleOutput,
  } = useWizardStore();

  const { addNotification } = useUIStore();

  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('Cybersecurity Intelligence Feed');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const res = await ingestionApi.uploadFile(projectId, file);
      setIngestedDocument(res);
      addNotification({ type: 'success', title: 'Document Ingested', message: `Successfully parsed ${file.name}` });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Ingestion Failed', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput) return;
    setIsUploading(true);
    try {
      const res = await ingestionApi.ingestUrl(projectId, urlInput);
      setIngestedDocument(res);
      addNotification({ type: 'success', title: 'URL Ingested', message: `Parsed webpage content` });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'URL Fetch Failed', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput) return;
    setIsUploading(true);
    try {
      const res = await ingestionApi.ingestText(projectId, textTitle, textInput);
      setIngestedDocument(res);
      setExtractedText(textInput);
      addNotification({ type: 'success', title: 'Text Ingested', message: 'Raw text normalized successfully' });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Text Ingestion Failed', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateTransformation = async () => {
    if (!ingestedDocument) {
      addNotification({ type: 'error', title: 'Missing Source', message: 'Please ingest a source document first' });
      return;
    }

    if (selectedOutputs.length === 0) {
      addNotification({ type: 'error', title: 'Missing Outputs', message: 'Please select at least one output format' });
      return;
    }

    setIsUploading(true);
    try {
      const res = await transformationsApi.create({
        project_id: projectId,
        source_document_ids: [ingestedDocument.source_document_id],
        target_audience: targetAudience,
        tone: tone,
        objective: objective,
        urgency_level: urgencyLevel,
        language: language,
        output_formats: selectedOutputs,
      });

      addNotification({ type: 'success', title: 'Transformation Job Enqueued', message: `Job #${res.job_id.substring(0, 8)} created` });
      navigate(`/jobs/${res.job_id}`);
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Transformation Failed', message: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const availableOutputs: { id: OutputFormat; title: string; desc: string; icon: any }[] = [
    { id: 'executive_brief', title: 'Executive Brief', desc: 'High-level risk & impact report', icon: Shield },
    { id: 'advisory', title: 'Security Advisory', desc: 'Technical advisory with IoCs', icon: FileCheck },
    { id: 'presentation', title: 'Presentation Deck', desc: 'Editable PPTX with structured slides', icon: Presentation },
    { id: 'social', title: 'Social Campaign', desc: 'Formatted LinkedIn post & X thread', icon: Share2 },
    { id: 'infographic', title: 'Infographic', desc: 'Visual data representations', icon: PieChart },
    { id: 'video', title: 'Video Package', desc: 'Audio narration & script', icon: Video },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">New Transformation</h1>
        <p className="text-slate-400">Ingest intelligence and generate structured audience-ready deliverables.</p>
      </div>

      <div className="transform-workspace">
        {/* LEFT COLUMN: Source Upload */}
        <div className="transform-panel">
          <div>
            <span className="section-label mb-2 block">1. SOURCE</span>
            <h3 className="text-xl font-bold mb-4">Add your source</h3>
            
            <div className="flex gap-2 mb-6 border-b border-border pb-2">
              <button onClick={() => setSourceType('file')} className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${sourceType === 'file' ? 'bg-surface text-primary border border-border' : 'text-slate-400 hover:text-slate-200'}`}>File Upload</button>
              <button onClick={() => setSourceType('url')} className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${sourceType === 'url' ? 'bg-surface text-primary border border-border' : 'text-slate-400 hover:text-slate-200'}`}>URL</button>
              <button onClick={() => setSourceType('text')} className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${sourceType === 'text' ? 'bg-surface text-primary border border-border' : 'text-slate-400 hover:text-slate-200'}`}>Text</button>
            </div>

            {sourceType === 'file' && (
              <div className="mb-4">
                <FileUploader onFileSelect={handleFileUpload} isLoading={isUploading} />
              </div>
            )}

            {sourceType === 'url' && (
              <div className="space-y-4 mb-4">
                <Input label="Target Web URL" placeholder="https://cisa.gov/advisories/aa26-080a" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                <Button variant="secondary" onClick={handleUrlSubmit} isLoading={isUploading} disabled={!urlInput} className="w-full btn btn-secondary">
                  Fetch & Parse URL
                </Button>
              </div>
            )}

            {sourceType === 'text' && (
              <div className="space-y-4 mb-4">
                <Input label="Intelligence Title" value={textTitle} onChange={(e) => setTextTitle(e.target.value)} />
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Raw Content</label>
                  <textarea rows={6} className="w-full rounded-md border border-border bg-bg-primary p-3 text-sm text-slate-100 focus:outline-none focus:border-accent" placeholder="Paste raw threat feed or notes here..." value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                </div>
                <Button variant="secondary" onClick={handleTextSubmit} isLoading={isUploading} disabled={!textInput} className="w-full btn btn-secondary">
                  Ingest Text
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Configuration */}
        <div className="transform-panel">
          {ingestedDocument ? (
            <div className="space-y-8 fade-in">
              {/* Analyzed Source info */}
              <div>
                <span className="section-label mb-2 block text-success flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> 2. ANALYZED</span>
                <div className="p-4 rounded-lg bg-surface border border-border">
                  <h4 className="font-semibold text-sm mb-1">{ingestedDocument.title || 'Ingested Document'}</h4>
                  <div className="flex gap-4 text-xs text-slate-400 font-mono">
                    <span>TYPE: {ingestedDocument.source_type}</span>
                    <span>STATUS: {ingestedDocument.status}</span>
                  </div>
                </div>
              </div>

              {/* Audience */}
              <div>
                <span className="section-label mb-2 block">3. AUDIENCE</span>
                <div className="audience-selector">
                  {(['technical', 'executive', 'general_public', 'defense'] as TargetAudience[]).map((aud) => (
                    <div key={aud} onClick={() => setTargetAudience(aud)} className={`selector-card ${targetAudience === aud ? 'selected' : ''}`}>
                      <div className="flex justify-between items-start">
                        <h4 className="selector-title capitalize">{aud.replace('_', ' ')}</h4>
                        {targetAudience === aud && <Check className="w-4 h-4 text-accent" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <div>
                <button onClick={() => setAdvancedOpen(!advancedOpen)} className="flex items-center text-xs text-slate-400 hover:text-slate-200 transition-colors">
                  <Settings className="w-3 h-3 mr-1" /> Advanced Configuration {advancedOpen ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                </button>
                
                {advancedOpen && (
                  <div className="mt-4 p-4 rounded-lg bg-surface border border-border space-y-4 text-sm animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">Tone</label>
                      <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="w-full bg-bg-primary border border-border rounded p-2 text-slate-200">
                        <option value="urgent">Urgent</option>
                        <option value="formal">Formal</option>
                        <option value="educational">Educational</option>
                        <option value="neutral">Neutral</option>
                        <option value="threat_alert">Threat Alert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">Objective</label>
                      <select value={objective} onChange={(e) => setObjective(e.target.value as Objective)} className="w-full bg-bg-primary border border-border rounded p-2 text-slate-200">
                        <option value="action_required">Action Required</option>
                        <option value="information_dissemination">Information Dissemination</option>
                        <option value="policy_compliance">Policy Compliance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">Urgency Level</label>
                      <select value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)} className="w-full bg-bg-primary border border-border rounded p-2 text-slate-200">
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Outputs */}
              <div>
                <span className="section-label mb-2 block">4. OUTPUTS</span>
                <div className="output-selector">
                  {availableOutputs.map((out) => {
                    const Icon = out.icon;
                    const isSelected = selectedOutputs.includes(out.id);
                    return (
                      <div key={out.id} onClick={() => toggleOutput(out.id)} className={`selector-card flex items-start gap-3 ${isSelected ? 'selected' : ''}`}>
                        <div className={`mt-0.5 ${isSelected ? 'text-accent' : 'text-slate-500'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="selector-title">{out.title}</h4>
                          <p className="selector-desc">{out.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generate Action */}
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <div className="text-xs text-slate-400">{selectedOutputs.length} format(s) selected</div>
                <button onClick={handleCreateTransformation} disabled={isUploading || selectedOutputs.length === 0} className="btn btn-primary px-8">
                  <Zap className="w-4 h-4 mr-2" /> GENERATE TRANSFORMATION
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
              <Database className="w-12 h-12 mb-4 opacity-20" />
              <p>Awaiting source document...</p>
              <p className="text-sm mt-2 max-w-xs">Upload or input a source on the left to configure the transformation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
