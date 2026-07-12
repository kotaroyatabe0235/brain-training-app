import { Link, useParams } from 'react-router-dom'

interface GameItem {
  id: string
  name: string
  description: string
  isAvailable: boolean
}

const gameCategories: Record<string, { title: string; games: GameItem[] }> = {
  memory: {
    title: '記憶力トレーニング',
    games: [
      { id: 'card-match', name: 'カードマッチ', description: '2枚のカードの組み合わせを記憶してめくる', isAvailable: true },
      { id: 'number-memory', name: '数字記憶', description: '表示された数字列を覚えて再入力', isAvailable: true },
      { id: 'color-memory', name: '色記憶', description: '色の順序を記憶して再現', isAvailable: false },
    ],
  },
  calculation: {
    title: '計算力トレーニング',
    games: [
      { id: 'quick-calc', name: '速算チャレンジ', description: '制限時間内に計算問題を解く', isAvailable: true },
      { id: 'calc-puzzle', name: '電卓パズル', description: '数字を組み合わせて目標値を作る', isAvailable: false },
      { id: 'number-sequence', name: '数列完成', description: 'パターンを理解し次にくる数字を当てる', isAvailable: false },
    ],
  },
  vocabulary: {
    title: '語彙力トレーニング',
    games: [
      { id: 'synonym', name: '類義語チェック', description: '似た意味の言葉を選ぶ', isAvailable: false },
      { id: 'fill-blank', name: '穴埋めクイズ', description: '文脈に合う言葉を選択', isAvailable: false },
      { id: 'word-length', name: '文字数パズル', description: '指定文字数で言葉を作成', isAvailable: false },
    ],
  },
  logic: {
    title: '論理思考トレーニング',
    games: [
      { id: 'pattern', name: 'パターン認識', description: '図形の並びから次を当てる', isAvailable: true },
      { id: 'riddle', name: '推理クイズ', description: '条件から正解を導く論理パズル', isAvailable: false },
      { id: 'grid-logic', name: 'グリッドロジック', description: '条件からグリッドを埋める', isAvailable: false },
    ],
  },
  reaction: {
    title: '反応速度トレーニング',
    games: [
      { id: 'target-click', name: 'ターゲットクリック', description: '出現したターゲットを素早くクリック', isAvailable: true },
      { id: 'stroop', name: '色文字マッチ', description: '文字の色と意味の不一致を判定', isAvailable: false },
      { id: 'typing', name: 'タイピングチャレンジ', description: '表示された文字列を高速入力', isAvailable: false },
    ],
  },
}

export default function GameCategoryPage() {
  const { category } = useParams<{ category: string }>()
  const categoryData = gameCategories[category || '']

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            カテゴリが見つかりません
          </h2>
          <Link
            to="/"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Brain Training App
          </h1>
          <Link
            to="/"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            ホームに戻る
          </Link>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {categoryData.title}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryData.games.map((game) => (
              <div
                key={game.id}
                className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-shadow ${
                  game.isAvailable
                    ? 'hover:shadow-lg cursor-pointer'
                    : 'opacity-75'
                }`}
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {game.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {game.description}
                </p>
                <div className="mt-4">
                  {game.isAvailable ? (
                    <Link
                      to={`/games/${category}/${game.id}`}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      プレイする
                    </Link>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      準備中
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
