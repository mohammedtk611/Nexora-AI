import React from 'react';
import { 
  ArrowRight, FileText, Database, Share2, LineChart, FileVideo, FileImage, Search, 
  ShieldAlert, CheckCircle2, Cpu, Layers 
} from 'lucide-react';
import ScrollWaveField from '../../components/common/ScrollWaveField';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  // Activate scroll-triggered reveal animations
  useScrollReveal();

  return (
    <div className="home-page-root w-full relative">
      {/* Persistent Flowing 3D Scroll Wave Field Background */}
      <div className="hero-wave-canvas-container">
        <ScrollWaveField
          background="transparent"
          colors={["#D98FA5", "#F0A6B8", "#B85F7A", "#FFB6C8", "#F5F2F0", "#E9B96E"]}
          density={160}
          dotSize={2.2}
          scatter={90}
          cameraHeight={52}
          wave={{ waveSpeed: 220, waveHeight: 180, waveLength: 2200 }}
          tilt={{ tiltStart: 12, rollStart: 0 }}
          cursor={{ cursorLift: 65, cursorRadius: 30, hoverGlow: 320 }}
          transition={{ mass: 1, type: "spring", delay: 0, damping: 45, stiffness: 500 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "auto",
          }}
        />
        <div className="hero-wave-fade-overlay" />
      </div>

      {/* Hero Section */}
      <section className="home-hero texture-overlay-relative w-full">
        <div className="texture-overlay"></div>
        <div className="hero-content-overlay relative -top-[15px]">
          <span className="home-hero-label animate-fade-up stagger-1">SIH 154 | NTRO</span>
          <h1 className="home-hero-title animate-fade-up stagger-2">
            Turn raw information <br /> into actionable intelligence.
          </h1>
          <p className="home-hero-desc animate-fade-up stagger-3">
            Upload documents, images, audio, video, or other source material. 
            Nexora analyzes the information, understands its context, 
            and transforms it into structured, audience-ready deliverables.
          </p>
          <div className="home-hero-actions animate-fade-up stagger-4">
            <button className="btn btn-primary" onClick={() => onNavigate('/transform/new')}>
              Try a Transformation <ArrowRight className="h-4 w-4" />
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('/projects')}>
              Explore Use Cases
            </button>
          </div>
        </div>
      </section>

      {/* Centered content container for lower sections */}
      <div className="home-container">
        {/* Three Steps */}
        <section id="steps-section" className="home-section pt-8">
          <div className="home-section-header scroll-reveal">
            <span className="section-label">GET STARTED</span>
            <h2 className="text-3xl font-bold mt-2">Three steps to transform</h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
              Turn any source of information into structured, audience-ready outputs through a simple workflow.
            </p>
          </div>
          <div className="home-grid-3">
            <div className="editorial-card scroll-reveal stagger-1">
              <div className="flex items-center justify-between mb-2">
                <FileText className="editorial-card-icon h-6 w-6 mb-0" />
                <span className="editorial-card-step-num">01</span>
              </div>
              <h3 className="editorial-card-title mt-2">Add your source</h3>
              <p className="editorial-card-desc">
                Upload a document, image, audio file, video, text, or source link.
              </p>
            </div>
            <div className="editorial-card scroll-reveal stagger-2">
              <div className="flex items-center justify-between mb-2">
                <Cpu className="editorial-card-icon h-6 w-6 mb-0" />
                <span className="editorial-card-step-num">02</span>
              </div>
              <h3 className="editorial-card-title mt-2">Understand the information</h3>
              <p className="editorial-card-desc">
                Nexora extracts relevant content, entities, topics and context.
              </p>
            </div>
            <div className="editorial-card scroll-reveal stagger-3">
              <div className="flex items-center justify-between mb-2">
                <Layers className="editorial-card-icon h-6 w-6 mb-0" />
                <span className="editorial-card-step-num">03</span>
              </div>
              <h3 className="editorial-card-title mt-2">Create what you need</h3>
              <p className="editorial-card-desc">
                Choose your audience and desired outputs and generate structured deliverables.
              </p>
            </div>
          </div>
        </section>

      {/* Capabilities */}
      <section className="home-section">
        <div className="home-section-header scroll-reveal">
          <span className="section-label">CAPABILITIES</span>
          <h2 className="text-3xl font-bold mt-2">What you can create</h2>
        </div>
        <div className="home-grid-3">
          <div className="editorial-card group cursor-pointer scroll-reveal stagger-1" onClick={() => onNavigate('/transform/new')}>
            <FileText className="editorial-card-icon h-6 w-6" />
            <h3 className="editorial-card-title">Intelligence Briefs</h3>
            <p className="editorial-card-desc">Comprehensive summaries and analysis for informed decision-making.</p>
            <ArrowRight className="h-4 w-4 absolute bottom-6 right-6 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="editorial-card group cursor-pointer scroll-reveal stagger-2" onClick={() => onNavigate('/transform/new')}>
            <ShieldAlert className="editorial-card-icon h-6 w-6 text-warning" />
            <h3 className="editorial-card-title">Security Advisories</h3>
            <p className="editorial-card-desc">Actionable threat intelligence and mitigation strategies.</p>
            <ArrowRight className="h-4 w-4 absolute bottom-6 right-6 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="editorial-card group cursor-pointer scroll-reveal stagger-3" onClick={() => onNavigate('/transform/new')}>
            <LineChart className="editorial-card-icon h-6 w-6" />
            <h3 className="editorial-card-title">Presentation Decks</h3>
            <p className="editorial-card-desc">Ready-to-present PPTX files with structured talking points.</p>
            <ArrowRight className="h-4 w-4 absolute bottom-6 right-6 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="editorial-card group cursor-pointer scroll-reveal stagger-4" onClick={() => onNavigate('/transform/new')}>
            <Share2 className="editorial-card-icon h-6 w-6" />
            <h3 className="editorial-card-title">Social & Awareness</h3>
            <p className="editorial-card-desc">Campaigns tailored for public or internal awareness programs.</p>
            <ArrowRight className="h-4 w-4 absolute bottom-6 right-6 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="editorial-card group cursor-pointer scroll-reveal stagger-5" onClick={() => onNavigate('/transform/new')}>
            <FileImage className="editorial-card-icon h-6 w-6" />
            <h3 className="editorial-card-title">Infographics</h3>
            <p className="editorial-card-desc">Visual representations of complex data and relationships.</p>
            <ArrowRight className="h-4 w-4 absolute bottom-6 right-6 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="editorial-card group cursor-pointer scroll-reveal stagger-6" onClick={() => onNavigate('/transform/new')}>
            <FileVideo className="editorial-card-icon h-6 w-6" />
            <h3 className="editorial-card-title">Video Packages</h3>
            <p className="editorial-card-desc">Automated video summaries and briefings.</p>
            <ArrowRight className="h-4 w-4 absolute bottom-6 right-6 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      {/* Grounded Intelligence */}
      <section className="home-section border-t border-border mt-8">
        <div className="home-section-header scroll-reveal">
          <h2 className="text-3xl font-bold">Transform with context, not just content.</h2>
        </div>
        <div className="home-grid-3">
          <div className="editorial-card scroll-reveal stagger-1">
            <Database className="editorial-card-icon h-5 w-5" />
            <h3 className="editorial-card-title">Knowledge Sources</h3>
            <p className="editorial-card-desc">Integrate organizational history and policy.</p>
          </div>
          <div className="editorial-card scroll-reveal stagger-2">
            <Search className="editorial-card-icon h-5 w-5" />
            <h3 className="editorial-card-title">Context Retrieval</h3>
            <p className="editorial-card-desc">Enhance raw inputs with known related entities.</p>
          </div>
          <div className="editorial-card scroll-reveal stagger-3">
            <CheckCircle2 className="editorial-card-icon h-5 w-5" />
            <h3 className="editorial-card-title">Source Trace</h3>
            <p className="editorial-card-desc">Every generated claim links back to the exact source text.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-section border-t border-border mt-8 text-center scroll-reveal">
        <h2 className="text-3xl font-bold mb-4">Ready to transform your information?</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Upload a source, choose what you need, and let Nexora handle the transformation.
        </p>
        <div className="home-hero-actions">
          <button className="btn btn-primary" onClick={() => onNavigate('/transform/new')}>
            Start a Transformation <ArrowRight className="h-4 w-4" />
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('/templates')}>
            Explore Templates
          </button>
        </div>
      </section>
      </div>
    </div>
  );
}
