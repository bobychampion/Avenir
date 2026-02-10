import { Link } from 'react-router-dom';
import { AppShell } from '../components/layout';

const FeatureCard = ({ title, description, to, color, delay }: { title: string, description: string, to: string, color: string, delay: string }) => (
  <Link to={to} className={`group relative overflow-hidden rounded-3xl bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-glow ${delay} animate-rise`}>
    <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl transition-all group-hover:scale-150 group-hover:opacity-30`}></div>

    <div className="relative z-10">
      <h3 className="text-2xl font-bold font-display text-dark group-hover:text-primary transition-colors">{title}</h3>
      <p className="mt-2 text-slate-500 font-medium leading-relaxed">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        Access Portal
        <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </div>
  </Link>
);

export default function Home() {
  return (
    <AppShell>
      {/* Hero Section */}
      <div className="text-center py-20 animate-rise">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/50 border border-white/40 backdrop-blur-sm text-sm font-semibold text-primary shadow-sm animate-bounce-slow">
          ✨ Your future awaits
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6">
          <span className="text-dark">Find your </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-pulse-glow">
            Spark.
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-slate-600 font-medium leading-relaxed mb-10">
          Not just another test. An adaptive journey to discover the career path that actually fits
          <span className="italic text-primary font-bold"> your vibe</span>.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/student" className="relative group px-8 py-4 rounded-full bg-dark text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-black transition-all hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
              Start Assessment <span className="text-xl">🚀</span>
            </span>
          </Link>
          <Link to="/about" className="px-8 py-4 rounded-full bg-white text-dark font-bold text-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-all hover:-translate-y-1">
            Learn More
          </Link>
        </div>
      </div>

      {/* Grid Menu */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <FeatureCard
          title="Student"
          description="Take the adaptive assessment, unlock badges, and explore your future career pathways."
          to="/student"
          color="from-primary to-secondary"
          delay="animation-delay-100" // Note: need to ensure standard CSS handles delay or add utility
        />
        <FeatureCard
          title="Teacher"
          description="Track class progress, view analytics, and support your students' journey."
          to="/teacher"
          color="from-accent to-secondary"
          delay="animation-delay-200"
        />
        <FeatureCard
          title="Admin"
          description="Manage the question bank, branching logic, and publish new versions."
          to="/admin"
          color="from-primary to-accent"
          delay="animation-delay-300"
        />
        <div className="hidden lg:block lg:col-span-3">
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              title="Parent"
              description="View your child's report and understand their career strengths."
              to="/parent"
              color="from-green-400 to-emerald-600"
              delay="animation-delay-400"
            />
            <FeatureCard
              title="Counselor"
              description="Deep dive into student data for personalized guidance sessions."
              to="/counselor"
              color="from-blue-400 to-indigo-600"
              delay="animation-delay-500"
            />
          </div>
        </div>
        {/* Mobile Fallback for 3-col grid above (simplification) */}
        <div className="lg:hidden md:col-span-2 space-y-6">
          <FeatureCard
            title="Parent"
            description="View your child's report and understand their career strengths."
            to="/parent"
            color="from-green-400 to-emerald-600"
            delay="animation-delay-400"
          />
          <FeatureCard
            title="Counselor"
            description="Deep dive into student data for personalized guidance sessions."
            to="/counselor"
            color="from-blue-400 to-indigo-600"
            delay="animation-delay-500"
          />
        </div>
      </div>

    </AppShell>
  );
}
