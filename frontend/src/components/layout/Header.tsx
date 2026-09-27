import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Globe, ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function Header({ currentRoute, onNavigate }: HeaderProps) {
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Home', route: '/' },
    { label: 'Transform', route: '/transform/new' },
    { label: 'Artifacts', route: '/artifacts' },
    { label: 'Projects', route: '/projects' },
    { label: 'Knowledge', route: '/knowledge-base' },
    { label: 'Templates', route: '/templates' },
    { label: 'Activity', route: '/activity' },
  ];

  const handleNav = (route: string) => {
    onNavigate(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <div className="nav-brand cursor-pointer" onClick={() => handleNav('/')}>
          <span className="nav-brand-title">REVAMP AI</span>
          <span className="nav-brand-subtitle">SIH 154 | NTRO</span>
        </div>
      </div>

      <nav className="top-nav-center hidden md:flex">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route || (item.route !== '/' && currentRoute.startsWith(item.route.split('/')[1]));
          return (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className={`top-nav-link ${isActive ? 'active text-slate-100 font-semibold' : ''}`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="top-nav-right hidden md:flex items-center space-x-4">
        <button className="text-slate-400 hover:text-white transition-colors" title="Global settings">
          <Globe className="h-4 w-4" />
        </button>
        {user ? (
          <div className="text-xs font-medium text-slate-300 border border-dark-800 px-3 py-1.5 rounded-full bg-dark-900 cursor-pointer hover:bg-dark-800" onClick={() => handleNav('/settings')}>
            {user.full_name}
          </div>
        ) : (
          <Button variant="primary" size="sm" onClick={() => handleNav('/transform/new')} className="btn btn-primary rounded-full px-4">
            Get Started <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        )}
      </div>

      <div className="md:hidden flex items-center">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-400 hover:text-white">
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-dark-950 border-b border-dark-800 p-4 flex flex-col space-y-2 z-50">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className="text-left px-4 py-2 text-sm text-slate-300 hover:bg-dark-900 rounded-md"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
