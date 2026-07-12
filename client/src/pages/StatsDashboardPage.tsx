import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useScoreStore } from '../stores/scoreStore'

const categoryNames: Record<string, string> = {
  memory: '記憶力',
  calculation: '計算力',
  vocabulary: '語彙力',
  logic: '論理思考',
  reaction: '反応速度',
}

const categoryColors: Record<string, string> = {
  memory: 'bg-blue-500',
  calculation: 'bg-green-500',
  vocabulary: 'bg-yellow-500',
  logic: 'bg-purple-500',
  reaction: 'bg-red-500',
}

export default function StatsDashboardPage() {
  const { stats, fetchStats, isLoading } = useScoreStore()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}時間${minutes}分`
    }
    return `${minutes}分${secs}秒`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Brain Training App
          </h1>
          <nav className="flex gap-4">
            <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ホーム
            </Link>
            <Link to="/stats/history" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              履歴
            </Link>
            <Link to="/stats/ranking" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ランキング
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            統計ダッシュボード
          </h2>

          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">総プレイ回数</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalGamesPlayed}回</p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">総プレイ時間</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{formatDuration(stats.totalDuration)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">平均スコア</h3>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.averageScore}点</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  カテゴリ別平均スコア
                </h3>
                {stats.categoryAverages.length > 0 ? (
                  <div className="space-y-4">
                    {stats.categoryAverages.map((cat) => (
                      <div key={cat.category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {categoryNames[cat.category] || cat.category}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {cat.averageScore}点（{cat.gamesPlayed}回プレイ）
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`${categoryColors[cat.category] || 'bg-gray-500'} h-2.5 rounded-full`}
                            style={{ width: `${Math.min(100, cat.averageScore / 10)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">まだプレイ履歴がありません</p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  ベストスコア
                </h3>
                {stats.bestScores.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">ゲーム</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">カテゴリ</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">難易度</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">スコア</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {stats.bestScores.map((best, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{best.gameName}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{categoryNames[best.category] || best.category}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{best.difficulty}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{best.score}点</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">まだスコアがありません</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">データを読み込めませんでした</p>
          )}
        </div>
      </main>
    </div>
  )
}
