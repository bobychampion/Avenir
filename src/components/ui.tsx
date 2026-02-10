import React from 'react';
import { Link } from 'react-router-dom';

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'outline' }) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-glow hover:-translate-y-0.5',
    ghost: 'bg-transparent text-dark hover:bg-primary/5 hover:text-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const ButtonLink = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: 'primary' | 'ghost' | 'outline' }) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-glow hover:-translate-y-0.5',
    ghost: 'bg-transparent text-dark hover:bg-primary/5 hover:text-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
  };
  return (
    <a className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </a>
  );
};

export const LinkButton = ({
  to,
  children,
  variant = 'primary',
  className = ''
}: {
  to: string;
  children: React.ReactNode;
  variant?: 'primary' | 'ghost' | 'outline';
  className?: string;
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:scale-95';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-glow hover:-translate-y-0.5',
    ghost: 'bg-transparent text-dark hover:bg-primary/5 hover:text-primary',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
  };
  return (
    <Link to={to} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
};

export const Input = ({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`w-full rounded-2xl border-2 border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium transition-all outline-none ring-0 focus:border-primary/50 focus:bg-white focus:shadow-glow-secondary ${className}`}
    {...props}
  />
);

export const Textarea = ({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={`w-full rounded-2xl border-2 border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium transition-all outline-none ring-0 focus:border-primary/50 focus:bg-white focus:shadow-glow-secondary ${className}`}
    {...props}
  />
);

export const Select = ({ className = '', ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className={`w-full rounded-2xl border-2 border-slate-100 bg-white/50 px-4 py-3 text-sm font-medium transition-all outline-none ring-0 focus:border-primary/50 focus:bg-white focus:shadow-glow-secondary ${className}`}
    {...props}
  />
);

export const Badge = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider ${className}`}>
    {children}
  </span>
);

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-3xl bg-white p-8 shadow-soft border border-white/40 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

export const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-3xl bg-white p-6 shadow-soft border border-slate-100">
    <div className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
      {title}
    </div>
    {children}
  </div>
);

export const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-8 animate-rise">
    <h1 className="text-3xl md:text-4xl font-bold font-display text-dark">{title}</h1>
    {subtitle ? <p className="mt-2 text-lg text-slate-500 font-medium">{subtitle}</p> : null}
  </div>
);
