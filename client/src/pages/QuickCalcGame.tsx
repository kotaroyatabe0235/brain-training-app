import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useScoreStore } from '../stores/scoreStore'

type Difficulty = 'easy' | 'normal' | 'hard'

interface Question {
  num1: number
  num2: number
  operator: string
  correctAnswer: number
}

const difficultyConfig: Record<Difficulty, { timeLimit: number; maxNumber: number; operators: string[] }> = {
  easy: { timeLimit: 30, maxNumber: 10, operators: ['+', '-'] },
  normal: { timeLimit: 60, maxNumber: 50, operators: ['+', '-', '×'] },
  hard: { timeLimit: 90, maxNumber: 100, operators: ['+', '-', '×', '÷'] },
}

function generateQuestion(config: { maxNumber: number; operators: string[] }): Question {
  const operator = config.operators[Math.floor(Math.random() * config.operators.length)]
  let num1: number, num2: number, correctAnswer: number

  if (operator === '÷') {
    num2 = Math.floor(Math.random() * 9) + 2
    correctAnswer = Math.floor(Math.random() * config.maxNumber / num2) + 1
    num1 = num2 * correctAnswer
  } else if (operator === '×') {
    num1 = Math.floor(Math.random() * 10) + 1
    num2 = Math.floor(Math.random() * 10) + 1
    correctAnswer = num1 * num2
  } else {
    num1 = Math.floor(Math.random() * config.maxNumber) + 1
    num2 = Math.floor(Math.random() * config.maxNumber) + 1
    if (operator === '-' && num1 < num2) {
      [num1, num2] = [num2, num1]
    }
    correctAnswer = operator === '+' ? num1 + num2 : num1 - num2
  }

  return { num1, num2, operator, correctAnswer }
}

export default function QuickCalcGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState<'selecting' | 'playing' | 'finished'>('selecting')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef<number>(0)
  const { submitScore } = useScoreStore()

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    setScore(0)
    setCorrectCount(0)
    setTotalCount(0)
    setTimeLeft(difficultyConfig[diff].timeLimit)
    setGameState('playing')
    setFeedback(null)
    setUserAnswer('')
    startTimeRef.current = Date.now()
    setCurrentQuestion(generateQuestion(difficultyConfig[diff]))
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
        gameId: 'quick-calc',
        score,
        difficulty,
        duration,
      })
    }
  }, [gameState])

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameState, currentQuestion])

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || userAnswer === '') return

    const answer = parseInt(userAnswer, 10)
    const isCorrect = answer === currentQuestion.correctAnswer

    setTotalCount((prev) => prev + 1)
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1)
      setScore((prev) => prev + 100)
      setFeedback('correct')
    } else {
      setFeedback('wrong')
    }

    setUserAnswer('')

    setTimeout(() => {
      setFeedback(null)
      if (difficulty) {
        setCurrentQuestion(generateQuestion(difficultyConfig[difficulty]))
      }
    }, 500)
  }, [currentQuestion, userAnswer, difficulty])

  if (gameState === 'selecting') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white shadow dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              速算チャレンジ
            </h1>
            <Link to="/games/calculation" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ゲーム一覧に戻る
            </Link>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">難易度を選んでください</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">制限時間内にできるだけ多くの計算問題を解きましょう</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => startGame('easy')} className="rounded-md bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500">
                  やさしい（30秒）
                </button>
                <button onClick={() => startGame('normal')} className="rounded-md bg-yellow-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-yellow-500">
                  ふつう（60秒）
                </button>
                <button onClick={() => startGame('hard')} className="rounded-md bg-red-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-red-500">
                  むずかしい（90秒）
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">速算チャレンジ</h1>
          <Link to="/games/calculation" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
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
                <span className="font-semibold text-gray-900 dark:text-white">スコア: </span>
                <span className="font-bold text-gray-900 dark:text-white">{score}</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">正解率: </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {gameState === 'finished' && (
            <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-6 text-center">
              <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200">タイムアップ！</h2>
              <p className="mt-2 text-blue-700 dark:text-blue-300">
                最終スコア: {score}点（{correctCount}/{totalCount}正解）
              </p>
              <button onClick={() => setGameState('selecting')} className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                もう一度プレイ
              </button>
            </div>
          )}

          {currentQuestion && gameState === 'playing' && (
            <div className="flex flex-col items-center">
              {feedback && (
                <div className={`mb-4 text-2xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                  {feedback === 'correct' ? '正解！' : '不正解...'}
                </div>
              )}
              <div className="text-6xl font-bold text-gray-900 dark:text-white mb-8">
                {currentQuestion.num1} {currentQuestion.operator} {currentQuestion.num2} = ?
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="flex gap-4">
                <input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="rounded-md border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-2xl text-center w-32 focus:border-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white"
                  autoFocus
                />
                <button type="submit" className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500">
                  答え合わせ
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
