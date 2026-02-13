import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppShell } from './layout';
import { Button, Card, LinkButton } from './ui';
import { isSupabaseEnabled, supabase } from '../lib/supabase';
import { getStudentProfile, isProfileComplete } from '../lib/studentProfile';

const LoadingScreen = ({ message }: { message: string }) => (
  <AppShell>
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-2xl font-bold text-slate-300 animate-pulse">{message}</div>
    </div>
  </AppShell>
);

const MissingSupabase = () => (
  <AppShell>
    <div className="max-w-2xl mx-auto">
      <Card className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Configuration needed</div>
        <h2 className="text-2xl font-bold text-dark">Connect Supabase to enable student profiles</h2>
        <p className="text-sm text-slate-500">
          Student accounts and personalized dashboards require Supabase Auth and the profile tables.
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton to="/" variant="outline">Back home</LinkButton>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    </div>
  </AppShell>
);

export default function StudentGuard({
  children,
  requireProfile = false
}: {
  children: React.ReactNode;
  requireProfile?: boolean;
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'needs-auth' | 'needs-profile' | 'no-supabase'>(
    'loading'
  );

  useEffect(() => {
    const load = async () => {
      if (!isSupabaseEnabled || !supabase) {
        setStatus('no-supabase');
        return;
      }
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setStatus('needs-auth');
        return;
      }
      if (!requireProfile) {
        setStatus('ready');
        return;
      }
      const profile = await getStudentProfile(data.user.id);
      if (!isProfileComplete(profile)) {
        setStatus('needs-profile');
        return;
      }
      setStatus('ready');
    };

    load();
  }, [requireProfile]);

  if (status === 'loading') {
    return <LoadingScreen message="Preparing your dashboard..." />;
  }

  if (status === 'no-supabase') {
    return <MissingSupabase />;
  }

  if (status === 'needs-auth') {
    return <Navigate to="/student/login" replace />;
  }

  if (status === 'needs-profile') {
    return <Navigate to="/student/profile" replace />;
  }

  return <>{children}</>;
}
