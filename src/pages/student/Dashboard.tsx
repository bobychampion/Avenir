import { Link } from 'react-router-dom';
import { AppShell } from '../../components/layout';

const BentoItem = ({ className, children, title, subtitle }: { className?: string, children?: React.ReactNode, title?: string, subtitle?: string }) => (
    <div className={`p-6 rounded-3xl transition-all duration-300 hover:shadow-glow hover:-translate-y-1 ${className}`}>
        {title && <h3 className="text-xl font-bold font-display mb-1">{title}</h3>}
        {subtitle && <p className="text-sm opacity-80 mb-4">{subtitle}</p>}
        <div className="relative z-10">{children}</div>
    </div>
);

export default function StudentDashboard() {
    const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <AppShell>
            <div className="mb-8 animate-rise">
                <h1 className="text-4xl font-bold font-display text-dark">
                    {timeOfDay}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Future Star!</span> 🚀
                </h1>
                <p className="text-slate-500 mt-2">Ready to discover where your potential leads?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-rise" style={{ animationDelay: '0.1s' }}>

                {/* Main Action - Start Assessment */}
                <div className="md:col-span-2">
                    <Link to="/student/onboarding" className="block h-full">
                        <BentoItem className="h-full bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                        New Assessment
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">Discover Your Career Path</h2>
                                    <p className="text-white/90 max-w-md">
                                        Take the adaptive test to find the subjects and careers that match your unique personality.
                                    </p>
                                </div>
                                <div className="mt-8">
                                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-full shadow-lg group-hover:scale-105 transition-transform">
                                        Start Now ⚡️
                                    </span>
                                </div>
                            </div>
                        </BentoItem>
                    </Link>
                </div>

                {/* Stats / Streak */}
                <BentoItem className="bg-white border border-slate-100 shadow-soft flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-4xl mb-4 animate-bounce-slow">
                        🔥
                    </div>
                    <div className="text-5xl font-black text-dark font-display">0</div>
                    <div className="text-slate-500 font-medium">Daily Streak</div>
                    <p className="text-xs text-slate-400 mt-2">Keep learning to build your streak!</p>
                </BentoItem>

                {/* Recent Activity */}
                <BentoItem title="Recent Journey" subtitle="Your latest activities" className="md:col-span-1 bg-white border border-slate-100 shadow-soft">
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                🏁
                            </div>
                            <div>
                                <div className="font-bold text-dark text-sm">Account Created</div>
                                <div className="text-xs text-slate-400">Just now</div>
                            </div>
                        </div>
                        {/* Placeholder for real history */}
                        <div className="text-center py-4 text-sm text-slate-400 italic">
                            No assessments taken yet.
                        </div>
                    </div>
                </BentoItem>

                {/* Explore Card */}
                <div className="md:col-span-2">
                    <Link to="/student/pathways" className="block h-full">
                        <BentoItem className="h-full bg-dark text-white relative overflow-hidden group">
                            <div className="absolute inset-0 bg-mesh opacity-50 group-hover:opacity-70 transition-opacity"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Explore Pathways</h3>
                                    <p className="text-slate-300 text-sm">Browse all available career tracks and requirements.</p>
                                </div>
                                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    ➡️
                                </div>
                            </div>
                        </BentoItem>
                    </Link>
                </div>

            </div>
        </AppShell>
    );
}
