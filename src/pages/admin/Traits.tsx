import { useEffect, useState } from 'react';
import { AppShell, AdminNav } from '../../components/layout';
import { Button, Card, Input, SectionTitle, Textarea } from '../../components/ui';
import { db } from '../../lib/db';
import { buildDraftSnapshot } from '../../lib/config';
import type { Trait } from '../../lib/types';

const now = () => new Date().toISOString();

export default function TraitManager() {
  const [traits, setTraits] = useState<Trait[]>([]);

  const load = async () => {
    const items = await db.traits.toArray();
    setTraits(items.sort((a, b) => a.id.localeCompare(b.id)));
  };

  useEffect(() => {
    load();
  }, []);

  const updateTrait = (id: string, patch: Partial<Trait>) => {
    setTraits((prev) => prev.map((trait) => (trait.id === id ? { ...trait, ...patch } : trait)));
  };

  const saveTrait = async (trait: Trait) => {
    await db.traits.put(trait);
    const snapshot = await buildDraftSnapshot();
    await db.drafts.put({ id: 'draft_default', name: 'Default Draft', updated_at: now(), draft_json: snapshot });
    await load();
  };

  return (
    <AppShell>
      <SectionTitle title="Trait Management" subtitle="Edit trait labels and descriptions used for scoring." />
      <AdminNav />

      <div className="mt-6 grid gap-4">
        {traits.map((trait) => (
          <Card key={trait.id} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trait ID</label>
                <Input
                  value={trait.id}
                  disabled
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Label</label>
                <Input
                  value={trait.label}
                  onChange={(event) => updateTrait(trait.id, { label: event.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</label>
              <Textarea
                rows={3}
                value={trait.description}
                onChange={(event) => updateTrait(trait.id, { description: event.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => saveTrait(trait)}>Save</Button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
