import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LinkButton } from './ui';

export const AppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-light text-dark font-body selection:bg-primary selection:text-white relative overflow-hidden">
    {/* Global Background Shapes */}
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <img
        src="/images/bg-shape-1.png"
        alt=""
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[800px] max-h-[800px] opacity-30 blur-3xl animate-float-slow"
      />
      <img
        src="/images/bg-shape-2.png"
        alt=""
        className="absolute bottom-[10%] -right-[5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] opacity-20 blur-3xl animate-float-delayed"
      />
    </div>

    <div className="relative z-10">
      <Navbar />
      <div className="pt-24 pb-12 min-h-screen">
        <div className="mx-auto max-w-7xl px-6 animate-rise">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  </div>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <div className={`mx-auto max-w-7xl px-6`}>
        <div className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-300 ${scrolled ? 'glass shadow-glass' : 'bg-transparent'}`}>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary animate-pulse-glow group-hover:scale-110 transition-transform"></div>
            <span className="text-xl font-bold tracking-tight font-display text-dark group-hover:text-primary transition-colors">
              Avenir
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-slate-600'}`}>
              Home
            </NavLink>
            <NavLink to="/student" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-slate-600'}`}>
              Student
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-slate-600'}`}>
              Admin
            </NavLink>
            <LinkButton to="/student" className="bg-night text-white hover:bg-primary border-none shadow-lg hover:shadow-glow transform hover:-translate-y-0.5 transition-all text-xs px-5 py-2">
              Get Started
            </LinkButton>
          </div>

          {/* Mobile Menu Button - simplified for now */}
          <button className="md:hidden p-2 text-dark">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-slate-100 py-12 mt-12">
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-primary to-secondary"></div>
            <span className="text-lg font-bold font-display">Avenir</span>
          </div>
          <p className="text-slate-500 text-sm max-w-xs">
            Empowering the next generation to discover their potential through adaptive career assessments.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Platform</h3>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link to="/student" className="hover:text-primary transition-colors">Student Portal</Link></li>
            <li><Link to="/teacher" className="hover:text-primary transition-colors">Teacher Dashboard</Link></li>
            <li><Link to="/admin" className="hover:text-primary transition-colors">Admin Controls</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Avenir. All rights reserved.
      </div>
    </div>
  </footer>
);

export const HomeHeader = () => (
  // Redirect functionality to main page layout, essentially deprecated but kept for compatibility if needed.
  // Ideally, HomeHeader content moves to the Home page itself.
  <div className="hidden"></div>
);

export const AdminNav = () => (
  <nav className="flex flex-wrap items-center gap-2 text-sm font-medium mb-8 p-1 bg-white/50 backdrop-blur rounded-full border border-white/20 w-fit">
    {[
      ['Dashboard', '/admin'],
      ['Question Bank', '/admin/questions'],
      ['Traits', '/admin/traits'],
      ['Clusters', '/admin/clusters'],
      ['Branching', '/admin/branching'],
      ['Simulator', '/admin/simulator'],
      ['Publish', '/admin/publish'],
      ['Import/Export', '/admin/import-export']
    ].map(([label, path]) => (
      <NavLink
        key={path}
        to={path}
        end={path === '/admin'}
        className={({ isActive }) =>
          `rounded-full px-4 py-2 transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-glow' : 'text-slate-500 hover:text-primary hover:bg-white'}`
        }
      >
        {label}
      </NavLink>
    ))}
  </nav>
);
