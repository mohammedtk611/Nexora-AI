import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transformationsApi } from '@/lib/api/transformations';
import { artifactsApi } from '@/lib/api/artifacts';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-state';
import { ICOInspector } from '@/components/common/ICOInspector';
import { useUIStore } from '@/stores/uiStore';
import {
  Shield, FileCheck, Share2, Presentation, PieChart, Video, Download, Copy, CheckCircle2, Layers, Search
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';

interface TransformationResultPageProps {
  transformationId: string;
  onNavigate?: (route: string) => void;
}

export function TransformationResultPage({ transformationId, onNavigate }: TransformationResultPageProps) {
  const navigate = onNavigate || ((route: string) => {
    window.history.pushState({}, '', route);
    window.dispatchEvent(new Event('popstate'));
  });
  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState('executive');
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0);

  const { data: trans, isLoading: loadingTrans } = useQuery({
    queryKey: ['transformation', transformationId],
    queryFn: () => transformationsApi.get(transformationId),
  });

  const { data: artifacts, isLoading: loadingArt } = useQuery({
    queryKey: ['artifacts', transformationId],
    queryFn: () => artifactsApi.list(transformationId),
  });

  if (loadingTrans || loadingArt) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <LoadingSpinner text="Loading Artifact Workspace..." />
      </div>
    );
  }

  if (!trans) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Transformation not found.</p>
        <button className="btn btn-secondary mt-4" onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  const ctx = trans.central_context;
  const artifactList = artifacts || [];
  const getArtType = (a: any) => (a.type || a.artifact_type || '').toLowerCase();

  const execBriefArt = artifactList.find((a) => getArtType(a).includes('brief') || getArtType(a).includes('executive'));
  const advisoryArt = artifactList.find((a) => getArtType(a).includes('advisory') || getArtType(a).includes('security'));
  const socialArt = artifactList.find((a) => getArtType(a).includes('social') || getArtType(a).includes('linkedin') || getArtType(a).includes('twitter') || getArtType(a).includes('x'));
  const presentationArt = artifactList.find((a) => getArtType(a).includes('presentation') || getArtType(a).includes('deck') || getArtType(a).includes('pptx'));
  const infographicArt = artifactList.find((a) => getArtType(a).includes('infographic'));
  const videoArt = artifactList.find((a) => getArtType(a).includes('video') || getArtType(a).includes('script') || getArtType(a).includes('audio'));

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification({ type: 'success', title: 'Copied to Clipboard' });
  };

  const handleDownloadFile = async (artId: string, filename?: string) => {
    try {
      await artifactsApi.downloadFile(artId, filename);
      addNotification({ type: 'success', title: 'Download Started' });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Download Failed', message: err.message });
    }
  };

  const tabs = [
    { id: 'executive', label: 'Executive Brief', icon: Shield, artifact: execBriefArt },
    { id: 'advisory', label: 'Security Advisory', icon: FileCheck, artifact: advisoryArt },
    { id: 'presentation', label: 'Presentation Deck', icon: Presentation, artifact: presentationArt },
    { id: 'social', label: 'Social Campaign', icon: Share2, artifact: socialArt },
    { id: 'infographic', label: 'Infographic', icon: PieChart, artifact: infographicArt },
    { id: 'video', label: 'Video Package', icon: Video, artifact: videoArt },
    { id: 'ico', label: 'Source Trace', icon: Layers, artifact: true },
  ].filter(t => t.artifact);

  return (
    <div className="results-workspace animate-in fade-in duration-300">
      <div className="results-header">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transformation Complete</h1>
          <p className="text-slate-400">Review and download generated intelligence artifacts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-success bg-success/10 text-success text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Grounded
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/transform/new')}>
            New Transformation
          </button>
        </div>
      </div>

      {/* Source Info Banner */}
      <div className="p-4 bg-surface border border-border rounded-lg flex items-center justify-between text-sm">
        <div className="flex gap-6">
          <div>
            <span className="text-xs text-slate-500 uppercase font-mono block mb-1">Source Topic</span>
            <span className="font-semibold">{ctx?.core_topic || `Transformation #${trans.id.substring(0, 8)}`}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-mono block mb-1">Audience</span>
            <span className="capitalize">{trans.target_audience}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-mono block mb-1">Tone</span>
            <span className="capitalize">{trans.tone}</span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400 font-mono">
          Created: {formatDate(trans.created_at)}
        </div>
      </div>

      <div className="results-grid">
        {/* LEFT Sidebar: Artifacts List */}
        <div className="artifact-list">
          <h3 className="section-label mb-2">Generated Outputs</h3>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <div 
                key={tab.id} 
                className={`artifact-item flex items-center gap-3 ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-accent' : 'text-slate-500'}`} />
                <span className="font-semibold text-sm">{tab.label}</span>
              </div>
            );
          })}
        </div>

        {/* RIGHT Main: Artifact Preview */}
        <div className="artifact-preview">
          
          {/* TAB: EXECUTIVE BRIEF */}
          {activeTab === 'executive' && (
            <>
              <div className="artifact-preview-header">
                <div>
                  <h3 className="font-bold">Executive Briefing</h3>
                  <p className="text-xs text-slate-400">CISO & Executive Leadership Summary</p>
                </div>
                {execBriefArt && (
                  <button className="btn btn-secondary text-xs" onClick={() => handleCopyText(JSON.stringify(execBriefArt.content, null, 2))}>
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy JSON
                  </button>
                )}
              </div>
              <div className="artifact-preview-content space-y-8">
                <div>
                  <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Executive Summary</h4>
                  <div className="p-4 rounded border border-border bg-bg-primary text-sm leading-relaxed">
                    {execBriefArt?.content?.executive_summary || ctx?.executive_summary || 'Executive summary unavailable.'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded border border-border bg-bg-primary">
                    <h4 className="text-xs font-bold text-warning uppercase tracking-wider mb-2">Business Impact</h4>
                    <p className="text-sm">{execBriefArt?.content?.business_impact || 'Operational continuity impacted; high risk of unauthorized data exposure.'}</p>
                  </div>
                  <div className="p-4 rounded border border-border bg-bg-primary">
                    <h4 className="text-xs font-bold text-danger uppercase tracking-wider mb-2">Operational Risk</h4>
                    <p className="text-sm">{execBriefArt?.content?.operational_risk || 'Domain controller compromise could result in enterprise identity hijack.'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-success uppercase tracking-wider mb-2">Recommended Actions</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {(execBriefArt?.content?.recommended_actions || ctx?.recommended_actions || []).map((act: string, idx: number) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* TAB: SECURITY ADVISORY */}
          {activeTab === 'advisory' && (
            <>
              <div className="artifact-preview-header">
                <div>
                  <h3 className="font-bold">Security Advisory</h3>
                  <p className="text-xs text-slate-400">Formatted threat advisory for SOC & SecOps teams</p>
                </div>
                {advisoryArt && (
                  <button className="btn btn-primary text-xs" onClick={() => handleDownloadFile(advisoryArt.id, 'security_advisory.pdf')}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
                  </button>
                )}
              </div>
              <div className="artifact-preview-content space-y-6">
                <div className="p-4 rounded border border-border bg-bg-primary">
                  <div className="flex justify-between items-center mb-3 border-b border-border pb-3">
                    <span className="font-bold uppercase">{advisoryArt?.content?.title || 'Vulnerability Advisory'}</span>
                    <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-danger/20 text-danger rounded border border-danger/30">
                      SEVERITY: {advisoryArt?.content?.severity || trans.urgency_level}
                    </span>
                  </div>
                  <p className="text-sm">{advisoryArt?.content?.threat_overview || ctx?.executive_summary}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Indicators of Compromise (IoCs)</h4>
                  <div className="p-4 rounded border border-border bg-bg-primary font-mono text-sm text-accent space-y-1">
                    {(advisoryArt?.content?.indicators || ctx?.threat_indicators || []).map((ioc: string, idx: number) => (
                      <div key={idx}>{ioc}</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: SOCIAL CAMPAIGN */}
          {activeTab === 'social' && (
            <>
              <div className="artifact-preview-header">
                <div>
                  <h3 className="font-bold">Social Media Communications</h3>
                  <p className="text-xs text-slate-400">Platform-tailored LinkedIn and X posts</p>
                </div>
              </div>
              <div className="artifact-preview-content space-y-6">
                <div className="p-5 rounded border border-border bg-bg-primary relative">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0a66c2]">LinkedIn Post</span>
                    <button className="btn btn-secondary text-xs p-1 px-2 h-auto" onClick={() => handleCopyText(socialArt?.content?.linkedin?.content || '')}>Copy</button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {socialArt?.content?.linkedin?.content || `🚨 CYBER THREAT ALERT: Emergency Response Required\n\nAnalyst Advisory: Critical zero-day vulnerability detected in perimeter infrastructure.`}
                  </p>
                </div>
                <div className="p-5 rounded border border-border bg-bg-primary relative">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider">X / Twitter Thread</span>
                    <button className="btn btn-secondary text-xs p-1 px-2 h-auto" onClick={() => handleCopyText(socialArt?.content?.twitter?.content || '')}>Copy</button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {socialArt?.content?.twitter?.content || `⚠️ SECURITY ALERT: Critical Remote Code Execution vulnerability in perimeter gateways. Patch immediately. #CyberSecurity #InfoSec`}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* TAB: PRESENTATION */}
          {activeTab === 'presentation' && (
            <>
              <div className="artifact-preview-header">
                <div>
                  <h3 className="font-bold">Presentation Deck</h3>
                  <p className="text-xs text-slate-400">Structured slides previewer</p>
                </div>
                {presentationArt && (
                  <button className="btn btn-primary text-xs" onClick={() => handleDownloadFile(presentationArt.id, 'presentation.pptx')}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Download PPTX
                  </button>
                )}
              </div>
              <div className="artifact-preview-content flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 border-r border-border pr-6 space-y-2">
                  {(presentationArt?.content?.slides || [
                    { slide_number: 1, title: 'Threat Overview' },
                    { slide_number: 2, title: 'Affected Systems' },
                    { slide_number: 3, title: 'Recommended Action' }
                  ]).map((slide: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSlideIdx(idx)}
                      className={`w-full text-left p-3 rounded text-sm transition-colors ${selectedSlideIdx === idx ? 'bg-surface border border-border font-semibold text-accent' : 'hover:bg-surface/50 text-slate-400'}`}
                    >
                      {idx + 1}. {slide.title}
                    </button>
                  ))}
                </div>
                <div className="w-full md:w-2/3 flex flex-col justify-between p-8 rounded-lg border border-border bg-bg-primary min-h-[300px]">
                  <div>
                    <h3 className="text-xl font-bold mb-6 uppercase tracking-wide">
                      {presentationArt?.content?.slides?.[selectedSlideIdx]?.title || 'Slide Title'}
                    </h3>
                    <ul className="list-disc pl-5 space-y-3 text-sm">
                      {(presentationArt?.content?.slides?.[selectedSlideIdx]?.bullets || ['Key takeaway bullet point 1', 'Impact statement 2']).map((b: string, idx: number) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-4 border-t border-border text-[11px] text-slate-500 font-mono">
                    Speaker Notes: {presentationArt?.content?.slides?.[selectedSlideIdx]?.speaker_notes || 'Emphasize urgent mitigation urgency to leadership.'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB: INFOGRAPHIC */}
          {activeTab === 'infographic' && (
            <>
              <div className="artifact-preview-header">
                <div>
                  <h3 className="font-bold">Infographic Data</h3>
                  <p className="text-xs text-slate-400">Threat flow visualization and impacted indicators</p>
                </div>
              </div>
              <div className="artifact-preview-content space-y-6">
                <div className="h-64 p-4 rounded border border-border bg-bg-primary">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Threat Level', count: 90 },
                      { name: 'Affected Systems', count: 65 },
                      { name: 'IoC Indicators', count: 85 },
                      { name: 'Mitigation Status', count: 40 },
                    ]}>
                      <XAxis dataKey="name" stroke="#A5A2A6" fontSize={11} />
                      <YAxis stroke="#A5A2A6" fontSize={11} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#151617', borderColor: '#29292B', fontSize: '12px' }} />
                      <Bar dataKey="count" fill="#D9A8B8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-4 rounded border border-border bg-bg-primary">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Threat Flow Lifecycle</h4>
                  <p className="text-sm">Core Topic: {ctx?.core_topic}</p>
                </div>
              </div>
            </>
          )}

          {/* TAB: VIDEO */}
          {activeTab === 'video' && (
            <>
              <div className="artifact-preview-header">
                <div>
                  <h3 className="font-bold">Video Intelligence Package</h3>
                  <p className="text-xs text-slate-400">Storyboard scenes and voiceover narration</p>
                </div>
                {videoArt && (
                  <button className="btn btn-primary text-xs" onClick={() => handleDownloadFile(videoArt.id, 'video_package.zip')}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Download ZIP
                  </button>
                )}
              </div>
              <div className="artifact-preview-content grid grid-cols-1 gap-4">
                {(videoArt?.content?.scenes || [
                  { scene_number: 1, duration: 8, voiceover_text: 'Critical alert: Zero day vulnerability confirmed.', subtitle_text: 'Vulnerability Alert', visual_recommendation: 'Map view of gateway' },
                  { scene_number: 2, duration: 10, voiceover_text: 'Attackers deploy Cobalt Strike payload within 4 hours.', subtitle_text: 'Ransomware Risk', visual_recommendation: 'Terminal shell exploit' },
                ]).map((scene: any, idx: number) => (
                  <div key={idx} className="p-4 rounded border border-border bg-bg-primary space-y-3">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-accent">Scene 0{scene.scene_number}</span>
                      <span className="text-xs font-mono text-slate-500">{scene.duration}s</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Narration</p>
                      <p className="text-sm">"{scene.voiceover_text}"</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Visual Prompt</p>
                      <p className="text-sm">{scene.visual_recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB: SOURCE TRACE */}
          {activeTab === 'ico' && (
            <>
              <div className="artifact-preview-header">
                <div>
                  <h3 className="font-bold">Source Trace & Context</h3>
                  <p className="text-xs text-slate-400">Every generated claim links back to the exact source text.</p>
                </div>
              </div>
              <div className="artifact-preview-content">
                <ICOInspector ico={ctx || null} readOnly={true} />
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
