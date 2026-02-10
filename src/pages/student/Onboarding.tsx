import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Button, Card, SectionTitle } from '../../components/ui';
import { createSession } from '../../lib/session';
import { useSessionStore } from '../../store/session';
import type { Mode, Track } from '../../lib/types';

export default function StudentOnboarding() {
  const [mode, setMode] = useState<Mode>('JSS');
  const [track, setTrack] = useState<Track>('SCIENCE');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setActiveSession = useSessionStore((state) => state.setActiveSession);

  const startAssessment = async () => {
    setLoading(true);
    const session = await createSession(mode, mode === 'SSS' ? track : null);
    setActiveSession(session.id);
    navigate('/student/assessment');
  };

  return (
    <AppShell>
      <SectionTitle
        title="Student Onboarding"
        subtitle="Choose your level to begin the adaptive assessment."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Select Mode
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {(['JSS', 'SSS'] as Mode[]).map((value) => (
              <label
                key={value}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  mode === value
                    ? 'border-night bg-night text-ink'
                    : 'border-night/10 bg-white/80 text-night'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  className="mr-2"
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                {value === 'JSS' ? 'JSS Discovery' : 'SSS Refinement'}
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            SSS Track (if applicable)
          </div>
          <div className="mt-4 grid gap-3">
            {(['SCIENCE', 'ARTS', 'COMMERCIAL'] as Track[]).map((value) => (
              <label
                key={value}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  mode === 'SSS' && track === value
                    ? 'border-night bg-night text-ink'
                    : 'border-night/10 bg-white/80 text-night'
                }`}
              >
                <input
                  type="radio"
                  name="track"
                  className="mr-2"
                  checked={track === value}
                  onChange={() => setTrack(value)}
                  disabled={mode !== 'SSS'}
                />
                {value}
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Button onClick={startAssessment} disabled={loading}>
          {loading ? 'Starting...' : 'Begin Assessment'}
        </Button>
      </div>
    </AppShell>
  );
}
