import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useScoreStore } from '../stores/scoreStore'

type Difficulty = 'easy' | 'normal' | 'hard'

interface Target {
  id: number
  x: number
  y: number
  size: number
  color: string
  createdAt: number
}

const difficultyConfig: Record<Difficulty, { targetCount: number; timeLimit: number; minSize: number; maxSize: number }> = {
  easy: { targetCount: 10, timeLimit: 15, minSize: 40, maxSize: 60 },
  normal: { targetCount: 15, timeLimit: 15, minSize: 30, maxSize: 50 },
  hard: { targetCount: 20, timeLimit: 20, minSize: 20, maxSize: 40 },
}

const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899']

function createTarget(config: { minSize: number; maxSize: number }, existingTargets: Target[]): Target {
  const size = Math.floor(Math.random() * (config.maxSize - config.minSize)) + config.minSize
  let x: number, y: number
  let attempts = 0

  do {
    x = Math.random() * (100 - (size / 8))
    y = Math.random() * (100 - (size / 8))
    attempts++
  } while (
    attempts < 50 &&
    existingTargets.some((t) =>
      Math.abs(t.x - x) < (t.size + size) / 8 &&
      Math.abs(t.y - y) < (t.size + size) / 8
    )
  )

  return {
    id: Date.now() + Math.random(),
    x,
    y,
    size,
    color: colors[Math.floor(Math.random() * colors.length)],
    createdAt: Date.now(),
  }
}

export default function TargetClickGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [targets, setTargets] = useState<Target[]>([])
  const [score, setScore] = useState(0)
  const [clickedCount, setClickedCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState<'selecting' | 'playing' | 'finished'>('selecting')
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const startTimeRef = useRef<number>(0)
  const { submitScore } = useScoreStore()

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    setScore(0)
    setClickedCount(0)
    setTimeLeft(difficultyConfig[diff].timeLimit)
    setGameState('playing')
    setReactionTimes([])
    startTimeRef.current = Date.now()
    setTargets([createTarget(difficultyConfig[diff], [])])
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
        gameId: 'target-click',
        score,
        difficulty,
        duration,
      })
    }
  }, [gameState])

  const handleTargetClick = useCallback((target: Target) => {
    const reactionTime = Date.now() - target.createdAt
    setReactionTimes((prev) => [...prev, reactionTime])

    const baseScore = 100
    const speedBonus = Math.max(0, 500 - reactionTime)
    setScore((prev) => prev + baseScore + speedBonus)
    setClickedCount((prev) => prev + 1)

    setTargets((prev) => {
      const newTargets = prev.filter((t) => t.id !== target.id)
      if (difficulty && newTargets.length < 3) {
        newTargets.push(createTarget(difficultyConfig[difficulty], newTargets))
      }
      return newTargets
    })
  }, [difficulty])

  if (gameState === 'selecting') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white shadow dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">ターゲットクリック</h1>
            <Link to="/games/reaction" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ゲーム一覧に戻る
            </Link>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">難易度を選んでください</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">出現するターゲットを素早くクリックしましょう</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => startGame('easy')} className="rounded-md bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500">
                  やさしい（15秒）
                </button>
                <button onClick={() => startGame('normal')} className="rounded-md bg-yellow-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-yellow-500">
                  ふつう（15秒）
                </button>
                <button onClick={() => startGame('hard')} className="rounded-md bg-red-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-red-500">
                  むずかしい（20秒）
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const avgReactionTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">ターゲットクリック</h1>
          <Link to="/games/reaction" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
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
                <span className={`font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {timeLeft}秒
                </span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">スコア: </span>
                <span className="font-bold text-gray-900 dark:text-white">{score}</span>
              </div>
              <div className="text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">クリック数: </span>
                <span className="font-bold text-gray-900 dark:text-white">{clickedCount}</span>
              </div>
            </div>
          </div>

          {gameState === 'finished' && (
            <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-6 text-center">
              <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200">タイムアップ！</h2>
              <p className="mt-2 text-blue-700 dark:text-blue-300">
                最終スコア: {score}点 | クリック数: {clickedCount} | 平均反応速度: {avgReactionTime}ms
              </p>
              <button onClick={() => setGameState('selecting')} className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                もう一度プレイ
              </button>
            </div>
          )}

          <div className="relative w-full h-96 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            {targets.map((target) => (
              <button
                key={target.id}
                onClick={() => handleTargetClick(target)}
                className="absolute rounded-full transition-transform hover:scale-110 active:scale-95"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: `${target.size}px`,
                  height: `${target.size}px`,
                  backgroundColor: target.color,
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
