import { useEffect, useState } from 'react';
import { AppShell, AdminNav } from '../../components/layout';
import { Badge, Button, Card, SectionTitle, Textarea } from '../../components/ui';
import { getPublishedConfig } from '../../lib/config';
import { answerQuestion, startAssessment, traitIds } from '../../lib/engine';
import type { ConfigSnapshot, EngineState, Question, QuestionResponse } from '../../lib/types';

export default function Simulator() {
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);
  const [state, setState] = useState<EngineState | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState<QuestionResponse>({ type: 'mcq', optionIds: [] });
  const isValidImageUrl = (value?: string | null) =>
    Boolean(
      value &&
      (value.startsWith('data:image') ||
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('blob:'))
    );

  useEffect(() => {
    const load = async () => {
      const published = await getPublishedConfig();
      if (!published) return;
      const initial = startAssessment(published, 'JSS', null, 10);
      setConfig(published);
      setState(initial);
      const current = published.questions.find((item) => item.id === initial.currentQuestionId) || null;
      if (current) {
        setQuestion(current);
        if (current.type === 'open_short') {
          setResponse({ type: 'open_short', text: '' });
        } else if (current.type === 'drag_rank') {
          const optionIds = published.options
            .filter((option) => option.question_id === current.id)
            .map((option) => option.id);
          setResponse({ type: 'drag_rank', optionIds });
        } else {
          setResponse({ type: current.type, optionIds: [] });
        }
      }
    };
    load();
  }, []);

  if (!config || !state) {
    return (
      <AppShell>
        <SectionTitle title="Simulator" subtitle="Loading published config..." />
      </AppShell>
    );
  }

  if (!question) {
    return (
      <AppShell>
        <SectionTitle title="Simulator" subtitle="Simulation complete. Start again to test another flow." />
        <AdminNav />
        <Card className="mt-6 max-w-xl">
          <Button
            onClick={() => {
              const initial = startAssessment(config, 'JSS', null, 10);
              setState(initial);
              const current = config.questions.find((item) => item.id === initial.currentQuestionId) || null;
              setQuestion(current);
              if (current?.type === 'open_short') {
                setResponse({ type: 'open_short', text: '' });
              } else if (current?.type === 'drag_rank') {
                const optionIds = config.options
                  .filter((option) => option.question_id === current.id)
                  .map((option) => option.id);
                setResponse({ type: 'drag_rank', optionIds });
              } else if (current) {
                setResponse({ type: current.type, optionIds: [] });
              }
            }}
          >
            Restart Simulator
          </Button>
        </Card>
      </AppShell>
    );
  }

  const options = config.options.filter((option) => option.question_id === question.id);

  const advance = () => {
    const nextState = answerQuestion(config, state, 'JSS', null, question.id, response);
    setState(nextState);
    if (!nextState.currentQuestionId) {
      setQuestion(null);
      return;
    }
    const nextQuestion = config.questions.find((item) => item.id === nextState.currentQuestionId) || null;
    if (!nextQuestion) return;
    setQuestion(nextQuestion);
    if (nextQuestion.type === 'open_short') {
      setResponse({ type: 'open_short', text: '' });
    } else if (nextQuestion.type === 'drag_rank') {
      const optionIds = config.options
        .filter((option) => option.question_id === nextQuestion.id)
        .map((option) => option.id);
      setResponse({ type: 'drag_rank', optionIds });
    } else {
      setResponse({ type: nextQuestion.type, optionIds: [] });
    }
  };

  return (
    <AppShell>
      <SectionTitle title="Simulator" subtitle="Try the published assessment with live trait scoring." />
      <AdminNav />

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Question</div>
            <Badge>{question.type.replace('_', ' ')}</Badge>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-night">{question.prompt}</h2>
          <div className="mt-4 space-y-3">
            {['mcq', 'scenario'].includes(question.type) &&
              options.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    response.optionIds?.includes(option.id)
                      ? 'border-night bg-night text-ink'
                      : 'border-night/10 bg-white/80 text-night'
                  }`}
                >
                  <span>{option.label}</span>
                  <input
                    type="radio"
                    name="option"
                    className="ml-3"
                    checked={response.optionIds?.includes(option.id)}
                    onChange={() => setResponse({ type: question.type, optionIds: [option.id] })}
                  />
                </label>
              ))}

            {question.type === 'image_select' && (
              <div className="grid gap-3 md:grid-cols-2">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 text-sm font-semibold transition ${
                      response.optionIds?.includes(option.id)
                        ? 'border-night bg-night text-ink'
                        : 'border-night/10 bg-white/80 text-night'
                    }`}
                  >
                    {isValidImageUrl(option.image_url) ? (
                      <img
                        src={option.image_url ?? undefined}
                        alt={option.label}
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center rounded-xl bg-night/10 text-xs text-slate-500">
                        Add a valid image URL.
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      <input
                        type="radio"
                        name="option"
                        checked={response.optionIds?.includes(option.id)}
                        onChange={() => setResponse({ type: question.type, optionIds: [option.id] })}
                      />
                    </div>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'drag_rank' && (
              <div className="space-y-3">
                {(response.optionIds || []).map((optionId, index) => {
                  const option = options.find((item) => item.id === optionId);
                  if (!option) return null;
                  return (
                    <div
                      key={option.id}
                      className="flex items-center justify-between rounded-2xl border border-night/10 bg-white/80 px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-night">#{index + 1} {option.label}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (index === 0) return;
                            const next = [...(response.optionIds || [])];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            setResponse({ type: 'drag_rank', optionIds: next });
                          }}
                        >
                          Up
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (index === (response.optionIds || []).length - 1) return;
                            const next = [...(response.optionIds || [])];
                            [next[index + 1], next[index]] = [next[index], next[index + 1]];
                            setResponse({ type: 'drag_rank', optionIds: next });
                          }}
                        >
                          Down
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {question.type === 'open_short' && (
              <Textarea
                rows={4}
                value={response.text || ''}
                onChange={(event) => setResponse({ type: 'open_short', text: event.target.value })}
              />
            )}
          </div>
          <div className="mt-6">
            <Button onClick={advance}>Next</Button>
          </div>
        </Card>

        <Card>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Live Scores</div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {traitIds.map((trait) => (
              <div key={trait} className="flex items-center justify-between">
                <span className="font-semibold text-night">{trait}</span>
                <span>{state.scores[trait].toFixed(1)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
