import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout';
import { Badge, Button, Card, SectionTitle, Textarea } from '../../components/ui';
import { db } from '../../lib/db';
import { answerSessionQuestion, completeSession } from '../../lib/session';
import { getPublishedConfig } from '../../lib/config';
import { getCurrentStudent } from '../../lib/studentAuth';
import { useSessionStore } from '../../store/session';
import type { ConfigSnapshot, Option, Question, QuestionResponse } from '../../lib/types';

const getOptions = (config: ConfigSnapshot | null, questionId: string) =>
  config?.options.filter((option) => option.question_id === questionId) ?? [];

export default function StudentAssessment() {
  const navigate = useNavigate();
  const sessionId = useSessionStore((state) => state.activeSessionId);
  const [config, setConfig] = useState<ConfigSnapshot | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [response, setResponse] = useState<QuestionResponse>({ type: 'mcq', optionIds: [] });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Animation state
  const [isExiting, setIsExiting] = useState(false);

  const isValidImageUrl = (value?: string | null) =>
    Boolean(
      value &&
      (value.startsWith('data:image') ||
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('blob:'))
    );

  const resetResponse = (questionData: Question, optionList: Option[]) => {
    setTouched(false);
    if (questionData.type === 'drag_rank') {
      setResponse({ type: 'drag_rank', optionIds: optionList.map((option) => option.id) });
      return;
    }
    if (questionData.type === 'open_short') {
      setResponse({ type: 'open_short', text: '' });
      return;
    }
    setResponse({ type: questionData.type, optionIds: [] });
  };

  const loadSession = async () => {
    if (!sessionId) {
      navigate('/student');
      return;
    }

    try {
      const [session, published] = await Promise.all([
        db.sessions.get(sessionId),
        getPublishedConfig()
      ]);

      if (!session || !published) {
        navigate('/student');
        return;
      }

      const currentId = session.state_json.currentQuestionId;
      const questionData = published.questions.find((item) => item.id === currentId) || null;
      if (!questionData) {
        const result = await completeSession(sessionId, studentId);
        navigate(`/student/results/${sessionId}`, { state: result });
        return;
      }

      const optionList = getOptions(published, questionData.id);
      setConfig(published);
      setQuestion(questionData);
      setOptions(optionList);
      resetResponse(questionData, optionList);
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [sessionId, navigate]);

  useEffect(() => {
    getCurrentStudent().then((user) => setStudentId(user?.id ?? null));
  }, []);

  const handleSubmit = async (explicitResponse?: QuestionResponse) => {
    if (!sessionId || !question || isSubmitting) return;

    const payload = explicitResponse || response;
    if (question.type === 'open_short' && (payload.text || '').trim().length < 3) return;
    if (question.type !== 'open_short' && (payload.optionIds || []).length === 0) return;
    setIsSubmitting(true);
    setIsExiting(true);

    // Short delay to allow animation to play
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const nextState = await answerSessionQuestion(sessionId, question.id, payload);

      if (!nextState.currentQuestionId) {
        const result = await completeSession(sessionId, studentId);
        navigate(`/student/results/${sessionId}`, { state: result });
        return;
      }

      const nextQuestion = config?.questions.find((item) => item.id === nextState.currentQuestionId) || null;
      if (!nextQuestion || !config) {
        console.error('Next question not found in config');
        return;
      }

      const optionList = getOptions(config, nextQuestion.id);

      // Reset state for next question
      setQuestion(nextQuestion);
      setOptions(optionList);
      resetResponse(nextQuestion, optionList);
      setIsExiting(false);

      // Scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('Something went wrong. Please try again.');
      setIsExiting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (question?.type !== 'drag_rank' || !touched) return;
    const timer = setTimeout(() => {
      handleSubmit(response);
    }, 1200);
    return () => clearTimeout(timer);
  }, [response, question?.type, touched]);

  const handleSelection = (optionId: string) => {
    const newResponse = { type: question?.type || 'mcq', optionIds: [optionId] } as QuestionResponse;
    setResponse(newResponse);

    // Auto-submit for single choice interactions
    if (['mcq', 'scenario', 'image_select'].includes(question?.type || '')) {
      handleSubmit(newResponse);
    }
  };

  if (loading || !question) {
    return (
      <AppShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-2xl font-bold text-primary animate-pulse">Loading adventure...</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={`transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        {/* Progress Header (Mockup for now) */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/student')} className="!px-3 !py-1">
              ← Exit
            </Button>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Adaptive Mode
            </div>
          </div>
          <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/3 animate-pulse"></div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 max-w-5xl mx-auto">

          {/* Question Column */}
          <div className="lg:col-span-8 space-y-8">
            <SectionTitle
              title="Your choice matters."
              subtitle="Select the option that feels most like you."
            />

            <Card className="!p-8 md:!p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Badge className="!bg-secondary/10 !text-secondary">{question.type.replace('_', ' ')}</Badge>
                  <span className="text-xs font-bold text-slate-300">ID: {question.id}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold font-display text-dark leading-tight">
                  {question.prompt}
                </h2>
              </div>
            </Card>

            {/* Input Area */}
            <div className="space-y-4">
              {['mcq', 'scenario'].includes(question.type) &&
                options.map((option) => {
                  const isSelected = response.optionIds?.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={`group flex cursor-pointer items-center justify-between rounded-xl border-2 p-6 transition-all duration-200 ${isSelected
                        ? 'border-primary bg-primary/5 shadow-glow'
                        : 'border-white bg-white hover:border-primary/30 hover:shadow-soft'
                        }`}
                      onClick={() => handleSelection(option.id)}
                    >
                      <span className={`text-lg font-medium transition-colors ${isSelected ? 'text-primary font-bold' : 'text-slate-600'}`}>
                        {option.label}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-primary/50'}`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                      <input
                        type="radio"
                        name="option"
                        className="hidden"
                        checked={isSelected || false}
                        readOnly
                      />
                    </label>
                  );
                })}

              {question.type === 'image_select' && (
                <div className="grid gap-4 md:grid-cols-2">
                  {options.map((option) => {
                    const isSelected = response.optionIds?.includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className={`group cursor-pointer flex flex-col gap-4 rounded-3xl border-2 p-4 transition-all duration-300 ${isSelected
                          ? 'border-primary bg-primary/5 shadow-glow scale-[1.02]'
                          : 'border-white bg-white hover:border-primary/30 hover:shadow-soft hover:scale-[1.01]'
                          }`}
                        onClick={() => handleSelection(option.id)}
                      >
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
                          {isValidImageUrl(option.image_url) ? (
                            <img
                              src={option.image_url ?? undefined}
                              alt={option.label}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                              Add a valid image URL.
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-primary text-xl">✓</div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between px-2">
                          <span className={`font-bold transition-colors ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{option.label}</span>
                          <input
                            type="radio"
                            name="option"
                            className="hidden"
                            checked={isSelected || false}
                            readOnly
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.type === 'drag_rank' && (
                <div className="space-y-4">
                  <div className="text-sm text-slate-500 italic mb-2">Use the buttons to reorder your preferences.</div>
                  {(response.optionIds || []).map((optionId, index) => {
                    const option = options.find((item) => item.id === optionId);
                    if (!option) return null;
                    return (
                      <div
                        key={option.id}
                        className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                            {index + 1}
                          </div>
                          <span className="font-bold text-dark">{option.label}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="!px-3 !py-1 text-xs"
                            disabled={index === 0}
                            onClick={() => {
                              if (index === 0) return;
                              const next = [...(response.optionIds || [])];
                              [next[index - 1], next[index]] = [next[index], next[index - 1]];
                              setTouched(true);
                              setResponse({ type: 'drag_rank', optionIds: next });
                            }}
                          >
                            ▲
                          </Button>
                          <Button
                            variant="outline"
                            className="!px-3 !py-1 text-xs"
                            disabled={index === (response.optionIds || []).length - 1}
                            onClick={() => {
                              if (index === (response.optionIds || []).length - 1) return;
                              const next = [...(response.optionIds || [])];
                              [next[index + 1], next[index]] = [next[index], next[index + 1]];
                              setTouched(true);
                              setResponse({ type: 'drag_rank', optionIds: next });
                            }}
                          >
                            ▼
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-slate-400 italic">We will move on automatically after you finish reordering.</p>
                </div>
              )}

              {question.type === 'open_short' && (
                <div className="rounded-3xl bg-white p-2 shadow-soft border border-slate-100">
                  <Textarea
                    rows={5}
                    value={response.text || ''}
                    onChange={(event) => {
                      setTouched(true);
                      setResponse({ type: 'open_short', text: event.target.value });
                    }}
                    onKeyDown={(event) => {
                      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                        handleSubmit({ type: 'open_short', text: response.text || '' });
                      }
                    }}
                    placeholder="Type your thoughts here..."
                    className="!bg-transparent !border-none !shadow-none !text-lg !p-4 placeholder:text-slate-300"
                  />
                  <div className="px-4 pb-3 text-xs text-slate-400">Press Ctrl+Enter (or Cmd+Enter) to continue.</div>
                </div>
              )}
            </div>

          </div>

          {/* Sidebar / Actions */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="sticky top-32 space-y-6">
              <Card className="!bg-gradient-to-br from-primary to-secondary !border-none text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-10 blur-xl"></div>
                <div className="relative z-10 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Question Illustration</div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                    {isValidImageUrl(question.illustration_url) ? (
                      <img
                        src={question.illustration_url ?? undefined}
                        alt="Question illustration"
                        className="h-48 w-full rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center rounded-xl bg-white/15 text-xs text-white/70">
                        Add a valid illustration URL in the question editor.
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/70">
                    Use this panel for visual prompts or context images.
                  </p>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
