import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Button, Card, Input, SectionTitle } from '../../components/ui';
import { signInStudent, signUpStudent } from '../../lib/studentAuth';
import { isSupabaseEnabled } from '../../lib/supabase';

export default function StudentAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    if (!isSupabaseEnabled) {
      setError('Supabase is not configured.');
      return;
    }
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: signInError } = await signInStudent(email, password);
        if (signInError) {
          setError(signInError.message);
          return;
        }
        navigate('/student/profile');
        return;
      }

      const { data, error: signUpError } = await signUpStudent(email, password);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (!data.session) {
        setInfo('Check your email to confirm your account, then sign in.');
        return;
      }
      navigate('/student/profile');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-[1fr,1fr] items-center">
        <div>
          <SectionTitle
            title={mode === 'login' ? 'Student login' : 'Create your student account'}
            subtitle="Your profile keeps your assessments and progress unique to you."
          />

          <Card className="space-y-6">
            <div className="flex gap-3">
              <Button
                variant={mode === 'login' ? 'primary' : 'outline'}
                className="!px-4 !py-2 text-xs"
                onClick={() => setMode('login')}
                type="button"
              >
                Sign in
              </Button>
              <Button
                variant={mode === 'signup' ? 'primary' : 'outline'}
                className="!px-4 !py-2 text-xs"
                onClick={() => setMode('signup')}
                type="button"
              >
                Create account
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</label>
                <Input
                  type="email"
                  placeholder="student@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error ? <div className="text-sm text-red-500 font-semibold">{error}</div> : null}
              {info ? <div className="text-sm text-emerald-600 font-semibold">{info}</div> : null}

              <Button type="submit" disabled={loading}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </Button>
            </form>
          </Card>
        </div>

        <Card className="space-y-6">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            Exploring future possibilities
          </div>
          <h2 className="text-3xl font-black text-dark">
            Discover where your strengths can take you.
          </h2>
          <p className="text-slate-600">
            Join thousands of students building a clearer roadmap for subjects, careers, and real-world skills.
          </p>
          <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-soft">
            <img
              src="/images/hero-3d-group.png"
              alt="Students exploring future possibilities"
              className="w-full h-[320px] object-contain"
            />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
