import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles, CheckCircle2 } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface AIQuizModalProps {
  courseId: string;
  courseTitle: string;
  category: string;
  onClose: () => void;
  onSuccess: (score: number) => void;
}

const AIQuizModal: React.FC<AIQuizModalProps> = ({ courseId, courseTitle, category, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const res = await fetch('https://backend-production-b478c.up.railway.app/api/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          courseTitle,
          category,
          difficulty: 'Medium',
          questionsCount: 5
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate quiz');

      if (!data.quiz || !Array.isArray(data.quiz) || data.quiz.length === 0) {
        throw new Error("System returned malformed quiz structure.");
      }

      setQuestions(data.quiz);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === currentQuestion.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishQuiz(selectedAnswer === currentQuestion.correctAnswerIndex ? score + 1 : score);
    }
  };

  const finishQuiz = async (finalScore: number) => {
    setQuizFinished(true);
    setScore(finalScore);

    try {
      const token = localStorage.getItem('token');
      await fetch(`https://backend-production-b478c.up.railway.app/api/users/quiz/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          score: finalScore,
          totalQuestions: questions.length,
          difficulty: 'Medium'
        })
      });
      // We rely on the parent updating state or re-fetching dashboard
    } catch (err) {
      console.error("Failed to save quiz score", err);
    }
  };

  if (quizFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 border border-border shadow-card text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 mb-4 text-success" />
          <h2 className="font-display text-2xl font-bold mb-2">Quiz Complete!</h2>
          <p className="mb-6 text-muted-foreground">You scored {score} out of {questions.length}.</p>
          <Button onClick={() => { onSuccess(score); onClose(); }} className="w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length > 0) {
    const q = questions[currentQuestionIndex];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-card p-8 border border-border shadow-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
              <Bot className="h-5 w-5" /> Interactive Quiz Active
            </h2>
            <span className="text-sm font-medium text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>

          <p className="text-lg font-medium mb-6">{q.question}</p>

          <div className="space-y-3 mb-8">
            {q.options.map((option, idx) => (
              <Button
                key={idx}
                variant={selectedAnswer === idx ? 'default' : 'outline'}
                className="w-full justify-start h-auto p-4 text-left font-normal"
                onClick={() => setSelectedAnswer(idx)}
              >
                {option}
              </Button>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button disabled={selectedAnswer === null} onClick={handleNext}>
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 border border-border shadow-card text-center relative overflow-hidden">
        {loading && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-cta animate-pulse" />}
        <Sparkles className="mx-auto h-12 w-12 text-accent mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Interactive Quiz Generator</h2>
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
          Ready to test your knowledge on <br /> <strong className="text-foreground">{courseTitle}</strong>?
          <br /><br />
          Our advanced system will construct a dynamic 5-question test covering course materials.
        </p>

        {error && <p className="mb-4 text-sm text-destructive font-medium">{error}</p>}

        <div className="flex flex-col gap-3">
          <Button onClick={startQuiz} className="bg-cta-gradient" disabled={loading}>
            {loading ? "Generating..." : "Generate & Start Quiz"}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Not right now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIQuizModal;
