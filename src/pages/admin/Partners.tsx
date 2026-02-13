import { useEffect, useState } from 'react';
import { AppShell, AdminNav } from '../../components/layout';
import { Button, Card, Input, SectionTitle } from '../../components/ui';
import { isSupabaseEnabled } from '../../lib/supabase';
import { createPartnerSchool, deletePartnerSchool, listPartnerSchools, type PartnerSchool } from '../../lib/partnerSchools';

export default function PartnerSchoolsAdmin() {
  const [schools, setSchools] = useState<PartnerSchool[]>([]);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const data = await listPartnerSchools();
    setSchools(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    setError('');
    setMessage('');

    if (!isSupabaseEnabled) {
      setError('Supabase is not configured.');
      return;
    }

    if (!name.trim() || !logoUrl.trim()) {
      setError('Name and logo URL are required.');
      return;
    }

    setLoading(true);
    const created = await createPartnerSchool({
      name: name.trim(),
      logo_url: logoUrl.trim(),
      website_url: websiteUrl.trim() || null
    });

    if (!created) {
      setError('Could not add partner school.');
      setLoading(false);
      return;
    }

    setSchools((prev) => [created, ...prev]);
    setName('');
    setLogoUrl('');
    setWebsiteUrl('');
    setMessage('Partner school added.');
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const ok = await deletePartnerSchool(id);
    if (ok) {
      setSchools((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <AppShell>
      <SectionTitle title="Partner Schools" subtitle="Add partner school logos and names for the home page." />
      <AdminNav />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr,2fr]">
        <Card className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Add partner</div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">School name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Delta Science Academy" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Logo URL</label>
            <Input value={logoUrl} onChange={(event) => setLogoUrl(event.target.value)} placeholder="https://.../logo.png" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Website (optional)</label>
            <Input value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://school.edu" />
          </div>

          {error ? <div className="text-sm text-red-500 font-semibold">{error}</div> : null}
          {message ? <div className="text-sm text-emerald-600 font-semibold">{message}</div> : null}

          <Button onClick={handleAdd} disabled={loading}>
            {loading ? 'Saving…' : 'Add partner'}
          </Button>
          <p className="text-xs text-slate-400">
            Tip: Use a transparent PNG or SVG logo for the cleanest look.
          </p>
        </Card>

        <Card className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Current partners</div>
          {schools.length === 0 ? (
            <div className="text-sm text-slate-500">No partner schools yet.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {schools.map((school) => (
                <div key={school.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 overflow-hidden">
                      <img src={school.logo_url} alt={school.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-700">{school.name}</div>
                      {school.website_url ? (
                        <div className="text-xs text-slate-400">{school.website_url}</div>
                      ) : null}
                    </div>
                    <Button
                      variant="outline"
                      className="!px-3 !py-2 text-xs"
                      onClick={() => handleDelete(school.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
