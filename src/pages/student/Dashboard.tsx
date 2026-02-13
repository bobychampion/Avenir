import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Card, LinkButton } from '../../components/ui';
import { getPublishedConfig } from '../../lib/config';
import { listReports } from '../../lib/reportStore';
import { getClusterImage } from '../../lib/pathwayImages';
import { getCurrentStudent } from '../../lib/studentAuth';
import { getStudentProfile, isProfileComplete, type StudentProfile } from '../../lib/studentProfile';
import type { ConfigSnapshot, Report } from '../../lib/types';

const BentoItem = ({ className, children, title, subtitle }: { className?: string, children?: React.ReactNode, title?: string, subtitle?: string }) => (
    <div className={`p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}>
        {title && <h3 className="text-xl font-bold font-display mb-1">{title}</h3>}
        {subtitle && <p className="text-sm opacity-80 mb-4">{subtitle}</p>}
        <div className="relative z-10 h-full">{children}</div>
    </div>
);

export default function StudentDashboard() {
    const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
    const [config, setConfig] = useState<ConfigSnapshot | null>(null);
    const [latestReport, setLatestReport] = useState<Report | null>(null);
    const [profile, setProfile] = useState<StudentProfile | null>(null);

    useEffect(() => {
        getPublishedConfig().then(setConfig);
        const load = async () => {
            const user = await getCurrentStudent();
            if (!user) {
                setLatestReport(null);
                return;
            }
            const [profileData, reports] = await Promise.all([
                getStudentProfile(user.id),
                listReports(user.id)
            ]);
            setProfile(profileData);
            const report = reports[0] || null;
            setLatestReport(report);
            if (report?.result_json?.report_code && typeof window !== 'undefined') {
                window.localStorage.setItem('avenir:last_report_code', report.result_json.report_code);
            }
        };
        load();
    }, []);

    const chosenCluster = useMemo(() => {
        if (!latestReport) return null;
        const clusterId = latestReport.result_json.primary_cluster;
        const label = config?.clusters.find((cluster) => cluster.id === clusterId)?.label || clusterId;
        return {
            id: clusterId,
            label,
            reportCode: latestReport.result_json.report_code,
            image: getClusterImage(clusterId)
        };
    }, [latestReport, config]);

    const displayName = profile?.first_name || 'Future Star';
    const avatarUrl = profile?.avatar_url || null;
    const profileComplete = isProfileComplete(profile);

    return (
        <AppShell>
            <div className="mb-12 animate-rise">
                <div className="flex flex-wrap items-center gap-4">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-16 w-16 rounded-2xl object-cover border border-white shadow-soft"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {displayName.charAt(0) || 'S'}
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black font-display text-dark tracking-tight">
                            {timeOfDay}, <span className="text-primary">{displayName}!</span>
                        </h1>
                        <p className="text-slate-500 text-lg mt-2 font-medium">Ready to discover where your potential leads?</p>
                    </div>
                </div>
            </div>

            {!profileComplete && (
                <Card className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Profile needed</div>
                        <div className="text-xl font-bold text-dark">Complete your profile to personalize your journey.</div>
                        <p className="text-sm text-slate-500 mt-1">Add your school and basic details before taking assessments.</p>
                    </div>
                    <LinkButton to="/student/profile" className="!px-5 !py-3">
                        Complete profile
                    </LinkButton>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-rise" style={{ animationDelay: '0.1s' }}>

                {/* Main Action - Start Assessment (Hero Card) - WHITE BACKGROUND */}
                <div className="lg:col-span-2">
                    <Link to="/student/onboarding" className="block h-full">
                        <div className="h-full rounded-3xl bg-white overflow-hidden relative group transition-all duration-500 hover:shadow-2xl hover:scale-[1.005] border border-slate-100">
                            {/* Subtle background decoration for depth */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="grid md:grid-cols-2 h-full relative z-10">
                                <div className="p-8 md:p-12 flex flex-col justify-center h-full">
                                    <div>
                                        <div className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                                            New Assessment
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-black text-dark mb-6 leading-tight">
                                            Discover Your <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Career Path</span>
                                        </h2>
                                        <p className="text-slate-500 text-lg leading-relaxed mb-8">
                                            Take the adaptive test to find the subjects and careers that match your unique personality.
                                        </p>
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center gap-3 px-8 py-4 bg-dark text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:bg-black transition-all group-hover:-translate-y-1">
                                            Start Now <span className="text-xl">⚡️</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Student Hero Art */}
                                <div className="relative min-h-[300px] md:min-h-full flex items-end justify-center overflow-visible">
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/80 to-transparent blur-xl z-20"></div>
                                    <img
                                        src="/images/steping.png"
                                        alt="Student confidently stepping into a futuristic portal"
                                        className="relative z-10 h-[115%] w-auto object-contain object-bottom drop-shadow-2xl animate-float-slow transform translate-y-4"
                                    />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Chosen Pathway */}
                    <BentoItem className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="sm:pr-4">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Your pathway</div>
                                <div className="mt-4 text-2xl font-bold text-dark font-display">
                                    {chosenCluster ? chosenCluster.label : 'Complete assessment to unlock'}
                                </div>
                                <p className="text-sm text-slate-500 mt-2">
                                    {chosenCluster
                                        ? 'Your results are ready. Continue with your personalized action plan.'
                                        : 'Take the assessment to see your recommended career direction.'}
                                </p>
                            </div>
                            {chosenCluster?.image && (
                                <img
                                    src={chosenCluster.image}
                                    alt={chosenCluster.label}
                                    className="mt-5 h-40 w-full rounded-3xl border border-slate-200 object-cover shadow-md"
                                />
                            )}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            {chosenCluster ? (
                                <LinkButton
                                    to={`/student/plan/${chosenCluster.id}?reportCode=${encodeURIComponent(chosenCluster.reportCode)}`}
                                    className="!px-5 !py-3"
                                >
                                    View dashboard
                                </LinkButton>
                            ) : (
                                <LinkButton to="/student/onboarding" className="!px-5 !py-3">
                                    Take assessment
                                </LinkButton>
                            )}
                            <LinkButton to="/student/onboarding" variant="outline" className="!px-5 !py-3">
                                Retake assessment
                            </LinkButton>
                        </div>
                    </BentoItem>

                    {/* Explore Card - Kept vibrant for balance */}
                    <Link to="/student/pathways" className="block flex-1">
                        <BentoItem className="h-full bg-primary text-white relative overflow-hidden group shadow-lg shadow-primary/20 hover:shadow-primary/40 border-none">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Explore Pathways</h3>
                                    <p className="text-primary-100">Browse all available career tracks and requirements.</p>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white text-white group-hover:text-primary transition-all">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </BentoItem>
                    </Link>
                </div>

                {/* Recent Activity - Full Width Bottom */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold font-display text-dark mb-6">Recent Activity</h3>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 hover:bg-slate-100 transition-colors cursor-pointer">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl">
                                    🏁
                                </div>
                                <div>
                                    <div className="font-bold text-dark">Account Created</div>
                                    <div className="text-sm text-slate-500">Just now</div>
                                </div>
                            </div>

                            <div className="text-center py-8 text-slate-400 font-medium italic">
                                Start your first assessment to see more activity!
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AppShell>
    );
}
