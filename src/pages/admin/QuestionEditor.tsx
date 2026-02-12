import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { AppShell, AdminNav } from '../../components/layout';
import { Button, Card, Input, SectionTitle, Select, Textarea } from '../../components/ui';
import { buildDraftSnapshot } from '../../lib/config';
import {
  getQuestion,
  listOptionsByQuestion,
  listQuestions,
  replaceOptionsForQuestion,
  saveDraftSnapshot,
  upsertQuestion
} from '../../lib/configStore';
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
  const [illustrationPrompt, setIllustrationPrompt] = useState('');
  const [illustrationStyle, setIllustrationStyle] = useState<'3d' | 'illustrative' | 'flat'>('3d');
  const [illustrationModel, setIllustrationModel] = useState<'flux-schnell' | 'sdxl-turbo' | 'sdxl-lightning'>('flux-schnell');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const isNew = id === 'new' || !id;

  const styleGuides: Record<typeof illustrationStyle, string> = {
    '3d': '3D illustrative art, soft lighting, clean background, friendly for teens.',
    'illustrative': 'Digital illustration, vibrant colors, simple shapes, friendly for teens.',
    'flat': 'Flat vector illustration, minimal shadows, clear shapes, friendly for teens.'
  };

  useEffect(() => {
    listQuestions().then(setAllQuestions);
  }, []);

  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      const existing = await getQuestion(id!);
      if (!existing) return;
      setQuestion(existing);
      setIllustrationPrompt(existing.prompt || '');
      const optionList = await listOptionsByQuestion(existing.id);
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
    await upsertQuestion(payload);
    const nextOptions = question.type === 'open_short'
      ? []
      : options.map((option) => ({ ...option, question_id: payload.id }));
    await replaceOptionsForQuestion(payload.id, nextOptions);
    const snapshot = await buildDraftSnapshot();
    await saveDraftSnapshot(snapshot, 'Default Draft');
    navigate('/admin/questions');
  };

  const generateIllustration = async () => {
    setGenerateError('');
    const prompt = illustrationPrompt.trim() || question.prompt.trim();
    if (!prompt) {
      setGenerateError('Add a prompt or question text first.');
      return;
    }
    setIsGenerating(true);
    try {
      const finalPrompt = `${styleGuides[illustrationStyle]} Scene: ${prompt}. School-appropriate, no text, no logos.`;
      const toDataUrl = async (response: Response) => {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          const message = data?.error || data?.message || 'Image generation failed.';
          throw new Error(message);
        }
        const blob = await response.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        });
      };

      const proxyUrl =
        (import.meta.env.VITE_IMAGE_PROXY_URL as string | undefined) || '/api/image-proxy';

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, model: illustrationModel })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Hugging Face image generation failed');
      }

      const dataUrl = await toDataUrl(response);
      setQuestion((prev) => ({ ...prev, illustration_url: dataUrl }));
    } catch (error) {
      setGenerateError(error instanceof Error ? error.message : 'Image generation failed');
    } finally {
      setIsGenerating(false);
    }
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

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI Illustration</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prompt</label>
                <Textarea
                  rows={3}
                  value={illustrationPrompt}
                  onChange={(event) => setIllustrationPrompt(event.target.value)}
                  placeholder="Describe the scene you want illustrated."
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Style</label>
                <Select
                  value={illustrationStyle}
                  onChange={(event) => setIllustrationStyle(event.target.value as typeof illustrationStyle)}
                >
                  <option value="3d">3D illustrative</option>
                  <option value="illustrative">Illustrative</option>
                  <option value="flat">Flat vector</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Model</label>
                <Select
                  value={illustrationModel}
                  onChange={(event) => setIllustrationModel(event.target.value as typeof illustrationModel)}
                >
                  <option value="flux-schnell">FLUX.1 Schnell (Best)</option>
                  <option value="sdxl-turbo">SDXL Turbo (Fast)</option>
                  <option value="sdxl-lightning">SDXL Lightning (Fast + stable)</option>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={generateIllustration} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Illustration'}
                </Button>
              </div>
            </div>
            {generateError && <div className="mt-3 text-sm text-ember">{generateError}</div>}
            {question.illustration_url && (
              <div className="mt-4 text-xs text-slate-500 break-all">Saved locally as data URL.</div>
            )}
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
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        <input
                          type="checkbox"
                          checked={option.disengaged || false}
                          onChange={(event) => updateOption(option.id, { disengaged: event.target.checked })}
                        />
                        Low engagement option
                      </label>
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
