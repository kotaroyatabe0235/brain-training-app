import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useScoreStore } from '../stores/scoreStore'

type Difficulty = 'easy' | 'normal' | 'hard'

interface Card {
  id: number
  symbol: string
  isFlipped: boolean
  isMatched: boolean
}

const difficultyConfig: Record<Difficulty, { pairs: number; timeLimit: number }> = {
  easy: { pairs: 6, timeLimit: 60 },
  normal: { pairs: 8, timeLimit: 90 },
  hard: { pairs: 12, timeLimit: 120 },
}

const symbols = ['🍎', '🍊', '🍋', '🍇', '🍉', '🍓', '🫐', '🥝', '🍑', '🍒', '🥭', '🍍']

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function createCards(difficulty: Difficulty): Card[] {
  const { pairs } = difficultyConfig[difficulty]
  const selectedSymbols = shuffleArray(symbols).slice(0, pairs)
  const cards: Card[] = []

  selectedSymbols.forEach((symbol, index) => {
    cards.push({ id: index * 2, symbol, isFlipped: false, isMatched: false })
    cards.push({ id: index * 2 + 1, symbol, isFlipped: false, isMatched: false })
  })

  return shuffleArray(cards)
}

export default function CardMatchGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameState, setGameState] = useState<'selecting' | 'playing' | 'won' | 'lost'>('selecting')
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [scoreSubmitted, setScoreSubmitted] = useState(false)
  const startTimeRef = useRef<number>(0)
  const { submitScore } = useScoreStore()

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff)
    setCards(createCards(diff))
    setFlippedCards([])
    setMoves(0)
    setTimeLeft(difficultyConfig[diff].timeLimit)
    setGameState('playing')
    setMatchedPairs(0)
    setScoreSubmitted(false)
    startTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('lost')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === 'won' && !scoreSubmitted && difficulty) {
      setScoreSubmitted(true)
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const { pairs } = difficultyConfig[difficulty]
      const baseScore = pairs * 100
      const moveBonus = Math.max(0, (pairs * 3 - moves) * 10)
      const timeBonus = timeLeft * 5
      const score = baseScore + moveBonus + timeBonus

      submitScore({
        gameId: 'card-match',
        score,
        difficulty,
        duration,
      })
    }
  }, [gameState, scoreSubmitted, difficulty, moves, timeLeft, submitScore])

  const handleCardClick = useCallback(
    (id: number) => {
      if (gameState !== 'playing') return
      if (flippedCards.length >= 2) return

      const card = cards.find((c) => c.id === id)
      if (!card || card.isFlipped || card.isMatched) return

      const newFlipped = [...flippedCards, id]
      setFlippedCards(newFlipped)

      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
      )

      if (newFlipped.length === 2) {
        setMoves((prev) => prev + 1)
        const [firstId, secondId] = newFlipped
        const firstCard = cards.find((c) => c.id === firstId)
        const secondCard = cards.find((c) => c.id === secondId)

        if (firstCard?.symbol === secondCard?.symbol) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c
            )
          )
          const newMatchedPairs = matchedPairs + 1
          setMatchedPairs(newMatchedPairs)
          setFlippedCards([])

          if (difficulty && newMatchedPairs === difficultyConfig[difficulty].pairs) {
            setGameState('won')
          }
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            )
            setFlippedCards([])
          }, 800)
        }
      }
    },
    [cards, flippedCards, gameState]
  )

  if (gameState === 'selecting') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white shadow dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              カードマッチ
            </h1>
            <Link
              to="/games/memory"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ゲーム一覧に戻る
            </Link>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                難易度を選んでください
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => startGame('easy')}
                  className="rounded-md bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500"
                >
                  やさしい（6ペア）
                </button>
                <button
                  onClick={() => startGame('normal')}
                  className="rounded-md bg-yellow-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-yellow-500"
                >
                  ふつう（8ペア）
                </button>
                <button
                  onClick={() => startGame('hard')}
                  className="rounded-md bg-red-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-red-500"
                >
                  むずかしい（12ペア）
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            カードマッチ
          </h1>
          <Link
            to="/games/memory"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
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
                <span className="font-semibold text-gray-900 dark:text-white">手数: </span>
                <span className="font-bold text-gray-900 dark:text-white">{moves}</span>
              </div>
            </div>
            <button
              onClick={() => startGame(difficulty!)}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              やり直す
            </button>
          </div>

          {gameState === 'won' && (
            <div className="mb-6 rounded-lg bg-green-50 dark:bg-green-900/30 p-6 text-center">
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                おめでとうございます！
              </h2>
              <p className="mt-2 text-green-700 dark:text-green-300">
                {moves}手でクリアしました！
              </p>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 p-6 text-center">
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-200">
                時間切れです
              </h2>
              <p className="mt-2 text-red-700 dark:text-red-300">
                もう一度挑戦しましょう！
              </p>
            </div>
          )}

          <div
            className="grid gap-3 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${difficulty === 'easy' ? 4 : difficulty === 'normal' ? 4 : 6}, minmax(0, 1fr))`,
            }}
          >
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched || gameState !== 'playing'}
                className={`aspect-square flex items-center justify-center text-3xl font-bold rounded-lg transition-all duration-200 ${
                  card.isFlipped || card.isMatched
                    ? card.isMatched
                      ? 'bg-green-100 dark:bg-green-900/50 border-2 border-green-400'
                      : 'bg-white dark:bg-gray-700 border-2 border-indigo-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
                } disabled:cursor-not-allowed`}
              >
                {card.isFlipped || card.isMatched ? card.symbol : '?'}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
