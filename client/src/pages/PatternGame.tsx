import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useScoreStore } from '../stores/scoreStore'

type Difficulty = 'easy' | 'normal' | 'hard'

interface PatternQuestion {
  sequence: number[]
  correctAnswer: number
  choices: number[]
}

const difficultyConfig: Record<Difficulty, { questionCount: number; timeLimit: number; maxNumber: number; patternComplexity: number }> = {
  easy: { questionCount: 5, timeLimit: 60, maxNumber: 10, patternComplexity: 1 },
  normal: { questionCount: 7, timeLimit: 60, maxNumber: 20, patternComplexity: 2 },
  hard: { questionCount: 10, timeLimit: 60, maxNumber: 50, patternComplexity: 3 },
}

function generatePattern(maxNumber: number, complexity: number): PatternQuestion {
  const patternType = Math.floor(Math.random() * (complexity + 1))

  let sequence: number[] = []
  let correctAnswer: number = 0

  switch (patternType) {
    case 0: {
      const start = Math.floor(Math.random() * 5) + 1
      const diff = Math.floor(Math.random() * 5) + 1
      sequence = Array.from({ length: 4 }, (_, i) => start + diff * i)
      correctAnswer = start + diff * 4
      break
    }
    case 1: {
      const base = Math.floor(Math.random() * 3) + 2
      sequence = Array.from({ length: 4 }, (_, i) => base ** (i + 1))
      correctAnswer = base ** 5
      break
    }
    case 2: {
      const a = Math.floor(Math.random() * 3) + 1
      const b = Math.floor(Math.random() * 3) + 1
      sequence = Array.from({ length: 4 }, (_, i) => a * (i + 1) + b)
      correctAnswer = a * 5 + b
      break
    }
    default: {
      const start = Math.floor(Math.random() * 5) + 1
      const diff = Math.floor(Math.random() * 5) + 1
      sequence = Array.from({ length: 4 }, (_, i) => start + diff * i)
      correctAnswer = start + diff * 4
    }
  }

  const choices = [correctAnswer]
  while (choices.length < 4) {
    const wrong = correctAnswer + Math.floor(Math.random() * 10) - 5
    if (wrong !== correctAnswer && !choices.includes(wrong) && wrong > 0) {
      choices.push(wrong)
    }
  }

  return {
    sequence,
    correctAnswer,
    choices: choices.sort(() => Math.random() - 0.5),
  }
}

export default function PatternGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<PatternQuestion | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState<'selecting' | 'playing' | 'finished'>('selecting')
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const startTimeRef = useRef<number>(0)
  const { submitScore } = useScoreStore()

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    setCurrentRound(0)
    setCorrectCount(0)
    setScore(0)
    setTimeLeft(difficultyConfig[diff].timeLimit)
    setGameState('playing')
    setFeedback(null)
    setSelectedAnswer(null)
    startTimeRef.current = Date.now()
    setCurrentQuestion(generatePattern(difficultyConfig[diff].maxNumber, difficultyConfig[diff].patternComplexity))
  }, [])

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === 'finished' && difficulty) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      submitScore({
        gameId: 'pattern',
        score,
        difficulty,
        duration,
      })
    }
  }, [gameState])

  const handleAnswer = useCallback((answer: number) => {
    if (!currentQuestion || feedback) return

    setSelectedAnswer(answer)
    const isCorrect = answer === currentQuestion.correctAnswer

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
      setScore((prev) => prev + 200)
      setFeedback('correct')
    } else {
      setFeedback('wrong')
    }

    setTimeout(() => {
      setFeedback(null)
      setSelectedAnswer(null)
      const nextRound = currentRound + 1

      if (difficulty && nextRound >= difficultyConfig[difficulty].questionCount) {
        setGameState('finished')
      } else {
        setCurrentRound(nextRound)
        setCurrentQuestion(generatePattern(difficultyConfig[difficulty!].maxNumber, difficultyConfig[difficulty!].patternComplexity))
      }
    }, 800)
  }, [currentQuestion, currentRound, difficulty, feedback])

  if (gameState === 'selecting') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white shadow dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">パターン認識</h1>
            <Link to="/games/logic" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ゲーム一覧に戻る
            </Link>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">難易度を選んでください</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">数列のパターンを理解して次の数字を当てましょう</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => startGame('easy')} className="rounded-md bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500">
                  やさしい（5問）
                </button>
                <button onClick={() => startGame('normal')} className="rounded-md bg-yellow-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-yellow-500">
                  ふつう（7問）
                </button>
                <button onClick={() => startGame('hard')} className="rounded-md bg-red-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-red-500">
                  むずかしい（10問）
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">パターン認識</h1>
          <Link to="/games/logic" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            ゲーム一覧に戻る
          </Link>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-6">
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">残り時間: </span>
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {timeLeft}秒
                </span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">問題: </span>
                <span className="font-bold text-gray-900 dark:text-white">{currentRound + 1}/{difficulty ? difficultyConfig[difficulty].questionCount : 0}</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">スコア: </span>
                <span className="font-bold text-gray-900 dark:text-white">{score}</span>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`mb-6 text-center text-2xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback === 'correct' ? '正解！' : '不正解...'}
            </div>
          )}

          {currentQuestion && gameState === 'playing' && (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">次の数字は？</p>
              <div className="flex gap-4 mb-8">
                {currentQuestion.sequence.map((num, i) => (
                  <div key={i} className="w-16 h-16 flex items-center justify-center text-2xl font-bold bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    {num}
                  </div>
                ))}
                <div className="w-16 h-16 flex items-center justify-center text-2xl font-bold bg-gray-200 dark:bg-gray-700 rounded-lg">
                  ?
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.choices.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => handleAnswer(choice)}
                    disabled={feedback !== null}
                    className={`w-32 h-16 text-xl font-bold rounded-lg transition-all ${
                      selectedAnswer === choice
                        ? feedback === 'correct'
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600'
                    } disabled:cursor-not-allowed`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-6">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200">ゲーム終了！</h2>
                <p className="mt-2 text-blue-700 dark:text-blue-300">
                  スコア: {score}点（{correctCount}/{difficultyConfig[difficulty!].questionCount}正解）
                </p>
                <button onClick={() => setGameState('selecting')} className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  もう一度プレイ
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
