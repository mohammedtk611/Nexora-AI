import React from 'react';
import { LayoutTemplate, ArrowRight, ShieldAlert, FileText, Presentation, Share2, Sparkles } from 'lucide-react';

interface TransformationTemplate {
  id: string;
  name: string;
  description: string;
  audience: string;
  tone: string;
  severity: string;
  objective: string;
  outputs: string[];
  icon: React.ReactNode;
}

const TEMPLATES: TransformationTemplate[] = [
  {
    id: 'exec_brief_standard',
    name: 'Executive Cyber Briefing',
    description: 'Concise financial and operational risk summary designed for Board members, CISOs, and executive leadership.',
    audience: 'Executive',
    tone: 'Formal',
    severity: 'High',
    objective: 'Action Required',
    outputs: ['executive_brief', 'presentation'],
    icon: <FileText className="h-5 w-5 text-sky-400" />,
  },
  {
    id: 'critical_advisory',
    name: 'Critical Vulnerability Advisory',
    description: 'Technical threat breakdown detailing IOCs, zero-day exploitation, affected CVE systems, and immediate mitigation commands.',
    audience: 'Technical',
    tone: 'Threat Alert',
    severity: 'Critical',
    objective: 'Action Required',
    outputs: ['security_advisory', 'executive_brief', 'infographic'],
    icon: <ShieldAlert className="h-5 w-5 text-rose-400" />,
  },
  {
    id: 'public_threat_awareness',
    name: 'Public Threat Alert & Social Campaign',
    description: 'Multi-channel social awareness thread breaking down scam patterns, phishing vectors, and public security advisories.',
    audience: 'General Public',
    tone: 'Educational',
    severity: 'Medium',
    objective: 'Information Dissemination',
    outputs: ['social_linkedin', 'social_twitter', 'video_package'],
    icon: <Share2 className="h-5 w-5 text-emerald-400" />,
  },
  {
    id: 'defense_briefing_deck',
    name: 'Defense Incident Response Briefing',
    description: 'Formal tactical slide presentation and video package for Security Operations Center (SOC) shift handover.',
    audience: 'Defense / Security',
    tone: 'Formal',
    severity: 'Critical',
    objective: 'Policy Compliance',
    outputs: ['presentation', 'video_package', 'security_advisory'],
    icon: <Presentation className="h-5 w-5 text-accent" />,
  },
];

interface TemplatesPageProps {
  onNavigate?: (route: string) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ onNavigate }) => {
  const handleUseTemplate = (tmpl: TransformationTemplate) => {
    const params = new URLSearchParams({
      audience: tmpl.audience,
      tone: tmpl.tone,
      severity: tmpl.severity,
      objective: tmpl.objective,
      outputs: tmpl.outputs.join(','),
    });
    if (onNavigate) {
      onNavigate(`/transform/new?${params.toString()}`);
    } else {
      window.location.href = `/transform/new?${params.toString()}`;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <LayoutTemplate className="h-7 w-7 text-accent" />
            Transformation Templates
          </h1>
          <p className="text-sm text-slate-400">
            Pre-configured target audiences, tones, and deliverable combinations optimized for rapid operational deployment.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {TEMPLATES.map(tmpl => (
          <div key={tmpl.id} className="bg-surface border border-border hover:border-slate-600 transition rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded bg-bg-primary border border-border shrink-0">
                    {tmpl.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{tmpl.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded border border-accent/30 text-accent bg-accent/10 text-[10px] uppercase font-bold tracking-wider font-mono">
                        {tmpl.audience}
                      </span>
                      <span className="px-2 py-0.5 rounded border border-slate-700 text-slate-300 text-[10px] uppercase font-bold tracking-wider font-mono">
                        {tmpl.tone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                {tmpl.description}
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="p-4 rounded bg-bg-primary border border-border/80 space-y-2 text-sm mb-4">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 uppercase">Objective:</span>
                  <strong className="text-slate-200">{tmpl.objective}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500 uppercase">Deliverables:</span>
                  <strong className="text-accent uppercase">{tmpl.outputs.length} Selected</strong>
                </div>
              </div>

              <button
                onClick={() => handleUseTemplate(tmpl)}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Launch Template
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
