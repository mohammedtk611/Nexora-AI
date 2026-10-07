import React from 'react';

interface FooterProps {
  onNavigate: (route: string) => void;
  isHome?: boolean;
}

export function Footer({ onNavigate, isHome }: FooterProps) {
  return (
    <footer className={`footer ${isHome ? 'footer-home' : ''}`}>
      <div className="footer-section">
        <div className="nav-brand mb-1">
          <span className="nav-brand-title text-sm">NEXORA</span>
          <span className="nav-brand-subtitle text-[10px] ml-1.5">SIH 154 | NTRO</span>
        </div>
        <p className={`text-[11px] max-w-[210px] leading-relaxed ${isHome ? 'text-slate-300' : 'text-slate-400'}`}>
          A serious intelligence transformation platform turning raw information into actionable intelligence.
        </p>
      </div>

      <div className="footer-section">
        <h4 className="footer-title">Platform</h4>
        <ul className="footer-list">
          <li className="footer-item flex items-center gap-1.5 flex-wrap">
            <span className="footer-bullet">•</span>
            <button onClick={() => onNavigate('/transform/new')} className="footer-link text-left">Transform</button>
            <span className="footer-bullet ml-2.5">•</span>
            <button onClick={() => onNavigate('/artifacts')} className="footer-link text-left">Artifacts</button>
          </li>
          <li className="footer-item">
            <span className="footer-bullet">•</span>
            <button onClick={() => onNavigate('/projects')} className="footer-link text-left">Projects</button>
          </li>
          <li className="footer-item">
            <span className="footer-bullet">•</span>
            <button onClick={() => onNavigate('/knowledge-base')} className="footer-link text-left">Knowledge</button>
          </li>
          <li className="footer-item">
            <span className="footer-bullet">•</span>
            <button onClick={() => onNavigate('/templates')} className="footer-link text-left">Templates</button>
          </li>
        </ul>
      </div>

      <div className="footer-section">
        <h4 className="footer-title">Resources</h4>
        <ul className="footer-list">
          <li className="footer-item">
            <span className="footer-bullet">•</span>
            <button onClick={() => onNavigate('/activity')} className="footer-link text-left">Activity</button>
          </li>
          <li className="footer-item">
            <span className="footer-bullet">•</span>
            <button onClick={() => onNavigate('/settings')} className="footer-link text-left">Settings</button>
          </li>
        </ul>
      </div>

      <div className="footer-section">
        <h4 className="footer-title">Context</h4>
        <ul className="footer-list">
          <li className={`footer-item text-[11px] ${isHome ? 'text-slate-300' : 'text-slate-400'}`}>
            <span className="footer-bullet">•</span>
            <span>SIH 154 / NTRO context.</span>
          </li>
          <li className={`footer-item text-[11px] ${isHome ? 'text-slate-300' : 'text-slate-400'}`}>
            <span className="footer-bullet">•</span>
            <span>© 2026 Nexora</span>
          </li>
        </ul>
      </div>
    </footer>
  );
}
