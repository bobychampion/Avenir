import { useEffect, useMemo, useState } from 'react';
import { AppShell, AdminNav } from '../../components/layout';
import { Badge, Card, Input, LinkButton, SectionTitle, Select } from '../../components/ui';
import { listQuestions } from '../../lib/configStore';
import type { Question, QuestionType } from '../../lib/types';

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'ALL' | 'JSS' | 'SSS'>('ALL');
  const [type, setType] = useState<'ALL' | QuestionType>('ALL');

  useEffect(() => {
    listQuestions().then(setQuestions);
  }, []);

  const filtered = useMemo(() => {
    return questions.filter((question) => {
      if (mode !== 'ALL' && question.mode !== mode) return false;
      if (type !== 'ALL' && question.type !== type) return false;
      const text = `${question.prompt} ${question.tags.join(' ')}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }, [questions, query, mode, type]);

  return (
    <AppShell>
      <SectionTitle title="Question Bank" subtitle="Search, filter, and edit assessment items." />
      <AdminNav />

      <div className="mt-6 grid gap-4 md:grid-cols-[2fr,1fr,1fr,auto]">
        <Input
          placeholder="Search questions or tags"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
          <option value="ALL">All Modes</option>
          <option value="JSS">JSS</option>
          <option value="SSS">SSS</option>
        </Select>
        <Select value={type} onChange={(event) => setType(event.target.value as QuestionType | 'ALL')}>
          <option value="ALL">All Types</option>
          <option value="mcq">MCQ</option>
          <option value="scenario">Scenario</option>
          <option value="image_select">Image Select</option>
          <option value="drag_rank">Drag Rank</option>
          <option value="open_short">Open Short</option>
        </Select>
        <LinkButton to="/admin/questions/new">New Question</LinkButton>
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.map((question) => (
          <Card key={question.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                {question.mode} - {question.type} - {question.status}
              </div>
              <div className="mt-2 text-lg font-semibold text-night">{question.prompt}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </div>
            <LinkButton to={`/admin/questions/${question.id}`} variant="outline">
              Edit
            </LinkButton>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
