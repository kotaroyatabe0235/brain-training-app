import { useAuthStore } from '../stores/authStore'

export default function HomePage() {
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Brain Training App
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-300">
              {user?.displayName}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ようこそ、{user?.displayName}さん！
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              脳トレアプリへようこそ。ゲームを選んでトレーニングを始めましょう。
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <GameCard title="記憶力トレーニング" description="カードマッチ、数字記憶など" />
            <GameCard title="計算力トレーニング" description="速算チャレンジ、電卓パズルなど" />
            <GameCard title="語彙力トレーニング" description="類義語チェック、穴埋めクイズなど" />
            <GameCard title="論理思考トレーニング" description="パターン認識、推理クイズなど" />
            <GameCard title="反応速度トレーニング" description="ターゲットクリック、色文字マッチなど" />
          </div>
        </div>
      </main>
    </div>
  )
}

function GameCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
