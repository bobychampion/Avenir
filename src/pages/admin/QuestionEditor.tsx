import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { AppShell, AdminNav } from '../../components/layout';
import { Button, Card, Input, SectionTitle, Select, Textarea } from '../../components/ui';
import { db } from '../../lib/db';
import { buildDraftSnapshot } from '../../lib/config';
import type { Option, Question, QuestionType, TraitId, Track } from '../../lib/types';

const traitIds: TraitId[] = [
  'logic',
  'creativity',
  'empathy',
  'practical',
  'communication',
  'leadership',
  'curiosity',
  'organization',
  'technical'
];

const emptyQuestion = (): Question => ({
  id: nanoid(),
  mode: 'JSS',
  type: 'mcq',
  prompt: '',
  tags: [],
  branch_level: 0,
  parent_question_id: null,
  status: 'active',
  track: null,
  illustration_url: null
});

export default function QuestionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question>(emptyQuestion());
  const [options, setOptions] = useState<Option[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const isNew = id === 'new' || !id;

  useEffect(() => {
    db.questions.toArray().then(setAllQuestions);
  }, []);

  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      const existing = await db.questions.get(id!);
      if (!existing) return;
      setQuestion(existing);
      const optionList = await db.options.where('question_id').equals(existing.id).toArray();
      setOptions(optionList);
    };
    load();
  }, [id, isNew]);

  const availableNextIds = useMemo(
    () => allQuestions.filter((item) => item.id !== question.id).map((item) => item.id),
    [allQuestions, question.id]
  );

  const updateOption = (optionId: string, patch: Partial<Option>) => {
    setOptions((prev) => prev.map((opt) => (opt.id === optionId ? { ...opt, ...patch } : opt)));
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: nanoid(),
        question_id: question.id,
        label: 'New option',
        score_map: {},
        image_url: null,
        next_question_id: null
      }
    ]);
  };

  const saveQuestion = async () => {
    const payload: Question = {
      ...question,
      tags: question.tags.filter(Boolean)
    };
    await db.questions.put(payload);
    await db.options.where('question_id').equals(payload.id).delete();
    if (question.type !== 'open_short') {
      await db.options.bulkAdd(options.map((option) => ({ ...option, question_id: payload.id })));
    }
    const snapshot = await buildDraftSnapshot();
    await db.drafts.put({ id: 'draft_default', name: 'Default Draft', updated_at: new Date().toISOString(), draft_json: snapshot });
    navigate('/admin/questions');
  };

  return (
    <AppShell>
      <SectionTitle title={isNew ? 'New Question' : 'Edit Question'} subtitle="Define prompts, options, and scoring." />
      <AdminNav />
      <div className="mt-6 grid gap-6">
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Question ID</label>
              <Input
                value={question.id}
                onChange={(event) => setQuestion({ ...question, id: event.target.value })}
                disabled={!isNew}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Mode</label>
              <Select
                value={question.mode}
                onChange={(event) => setQuestion({ ...question, mode: event.target.value as Question['mode'] })}
              >
                <option value="JSS">JSS</option>
                <option value="SSS">SSS</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Question Type</label>
              <Select
                value={question.type}
                onChange={(event) => setQuestion({ ...question, type: event.target.value as QuestionType })}
              >
                <option value="mcq">MCQ</option>
                <option value="scenario">Scenario</option>
                <option value="image_select">Image Select</option>
                <option value="drag_rank">Drag Rank</option>
                <option value="open_short">Open Short</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Track (SSS)</label>
              <Select
                value={question.track || ''}
                onChange={(event) =>
                  setQuestion({
                    ...question,
                    track: (event.target.value || null) as Track | null
                  })
                }
              >
                <option value="">All Tracks</option>
                <option value="SCIENCE">SCIENCE</option>
                <option value="ARTS">ARTS</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Branch Level</label>
              <Input
                type="number"
                value={question.branch_level}
                onChange={(event) =>
                  setQuestion({ ...question, branch_level: Number(event.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Parent Question
              </label>
              <Select
                value={question.parent_question_id || ''}
                onChange={(event) =>
                  setQuestion({
                    ...question,
                    parent_question_id: event.target.value || null
                  })
                }
              >
                <option value="">None</option>
                {availableNextIds.map((qid) => (
                  <option key={qid} value={qid}>
                    {qid}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</label>
              <Select
                value={question.status}
                onChange={(event) =>
                  setQuestion({ ...question, status: event.target.value as Question['status'] })
                }
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prompt</label>
            <Textarea
              rows={4}
              value={question.prompt}
              onChange={(event) => setQuestion({ ...question, prompt: event.target.value })}
            />
          </div>

          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Illustration URL (optional)
            </label>
            <Input
              value={question.illustration_url || ''}
              onChange={(event) =>
                setQuestion({ ...question, illustration_url: event.target.value || null })
              }
            />
          </div>

          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tags (comma separated)</label>
            <Input
              value={question.tags.join(', ')}
              onChange={(event) =>
                setQuestion({
                  ...question,
                  tags: event.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                })
              }
            />
          </div>
        </Card>

        {question.type !== 'open_short' && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Options</div>
              <Button variant="outline" onClick={addOption}>Add Option</Button>
            </div>
            <div className="mt-4 space-y-4">
              {options.map((option) => (
                <div key={option.id} className="rounded-2xl border border-night/10 bg-white/70 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Label</label>
                      <Input
                        value={option.label}
                        onChange={(event) => updateOption(option.id, { label: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Image URL</label>
                      <Input
                        value={option.image_url || ''}
                        onChange={(event) => updateOption(option.id, { image_url: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Next Question</label>
                      <Select
                        value={option.next_question_id || ''}
                        onChange={(event) => updateOption(option.id, { next_question_id: event.target.value || null })}
                      >
                        <option value="">End / Next root</option>
                        {availableNextIds.map((qid) => (
                          <option key={qid} value={qid}>
                            {qid}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trait Scores</div>
                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                      {traitIds.map((trait) => (
                        <div key={trait}>
                          <label className="text-xs font-semibold text-slate-500">{trait}</label>
                          <Input
                            type="number"
                            value={option.score_map[trait] ?? 0}
                            onChange={(event) =>
                              updateOption(option.id, {
                                score_map: {
                                  ...option.score_map,
                                  [trait]: Number(event.target.value)
                                }
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button onClick={saveQuestion}>Save Question</Button>
          <Button variant="outline" onClick={() => navigate('/admin/questions')}>Cancel</Button>
        </div>
      </div>
    </AppShell>
  );
}
