import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useScoreStore } from '../stores/scoreStore'

type Difficulty = 'easy' | 'normal' | 'hard'
type GameState = 'selecting' | 'memorizing' | 'input' | 'result' | 'finished'

const difficultyConfig: Record<Difficulty, { digits: number; displayTime: number; rounds: number }> = {
  easy: { digits: 3, displayTime: 3, rounds: 5 },
  normal: { digits: 5, displayTime: 5, rounds: 5 },
  hard: { digits: 7, displayTime: 8, rounds: 5 },
}

function generateNumber(digits: number): string {
  let num = ''
  for (let i = 0; i < digits; i++) {
    num += Math.floor(Math.random() * 10)
  }
  return num
}

export default function NumberMemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [gameState, setGameState] = useState<GameState>('selecting')
  const [currentNumber, setCurrentNumber] = useState('')
  const [userInput, setUserInput] = useState('')
  const [currentRound, setCurrentRound] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const startTimeRef = useRef<number>(0)
  const { submitScore } = useScoreStore()

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    setCurrentRound(0)
    setCorrectCount(0)
    setScore(0)
    setGameState('memorizing')
    setFeedback(null)
    setUserInput('')
    startTimeRef.current = Date.now()
    setCurrentNumber(generateNumber(difficultyConfig[diff].digits))
  }, [])

  useEffect(() => {
    if (gameState !== 'memorizing' || !difficulty) return

    setTimeLeft(difficultyConfig[difficulty].displayTime)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('input')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, difficulty])

  useEffect(() => {
    if (gameState === 'input' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameState])

  const handleSubmit = useCallback(() => {
    if (userInput === currentNumber) {
      setCorrectCount((prev) => prev + 1)
      setScore((prev) => prev + currentNumber.length * 100)
      setFeedback('correct')
    } else {
      setFeedback('wrong')
    }

    setTimeout(() => {
      setFeedback(null)
      const nextRound = currentRound + 1

      if (difficulty && nextRound >= difficultyConfig[difficulty].rounds) {
        setGameState('finished')
      } else {
        setCurrentRound(nextRound)
        setUserInput('')
        setCurrentNumber(generateNumber(difficultyConfig[difficulty!].digits))
        setGameState('memorizing')
      }
    }, 1000)
  }, [userInput, currentNumber, currentRound, difficulty])

  useEffect(() => {
    if (gameState === 'finished' && difficulty) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      submitScore({
        gameId: 'number-memory',
        score,
        difficulty,
        duration,
      })
    }
  }, [gameState])

  if (gameState === 'selecting') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white shadow dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">数字記憶</h1>
            <Link to="/games/memory" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ゲーム一覧に戻る
            </Link>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">難易度を選んでください</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">表示された数字を覚えて入力しましょう</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => startGame('easy')} className="rounded-md bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500">
                  やさしい（3桁）
                </button>
                <button onClick={() => startGame('normal')} className="rounded-md bg-yellow-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-yellow-500">
                  ふつう（5桁）
                </button>
                <button onClick={() => startGame('hard')} className="rounded-md bg-red-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-red-500">
                  むずかしい（7桁）
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">数字記憶</h1>
          <Link to="/games/memory" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            ゲーム一覧に戻る
          </Link>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-6">
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">ラウンド: </span>
                <span className="font-bold text-gray-900 dark:text-white">{currentRound + 1}/{difficulty ? difficultyConfig[difficulty].rounds : 0}</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">スコア: </span>
                <span className="font-bold text-gray-900 dark:text-white">{score}</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">正解: </span>
                <span className="font-bold text-gray-900 dark:text-white">{correctCount}</span>
              </div>
            </div>
          </div>

          {feedback && (
            <div className={`mb-6 text-center text-2xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
              {feedback === 'correct' ? '正解！' : `不正解... 正解は ${currentNumber} でした`}
            </div>
          )}

          {gameState === 'memorizing' && (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">この数字を覚えてください</p>
              <div className="text-7xl font-bold text-indigo-600 dark:text-indigo-400 mb-4 tracking-widest">
                {currentNumber}
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                残り {timeLeft} 秒
              </div>
            </div>
          )}

          {gameState === 'input' && (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">覚えた数字を入力してください</p>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="flex gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
                  className="rounded-md border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-3xl text-center w-64 focus:border-indigo-500 focus:outline-none dark:bg-gray-700 dark:text-white tracking-widest"
                  autoFocus
                />
                <button type="submit" className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500">
                  答え合わせ
                </button>
              </form>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-6">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200">ゲーム終了！</h2>
                <p className="mt-2 text-blue-700 dark:text-blue-300">
                  スコア: {score}点（{correctCount}/{difficultyConfig[difficulty!].rounds}正解）
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
