import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gameApi, scoreApi, type Game, type RankingEntry } from '../services/scoreApi'

export default function RankingPage() {
  const [games, setGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>('')
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    gameApi.getAllGames().then(setGames)
  }, [])

  useEffect(() => {
    if (!selectedGameId) return

    setIsLoading(true)
    scoreApi.getRanking(selectedGameId).then((data) => {
      setRanking(data)
      setIsLoading(false)
    })
  }, [selectedGameId])

  const selectedGame = games.find((g) => g.id === selectedGameId)

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
            <Link to="/stats/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              ダッシュボード
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            ランキング
          </h2>

          <div className="mb-6">
            <label htmlFor="game-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ゲームを選択
            </label>
            <select
              id="game-select"
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="rounded-md border-2 border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">ゲームを選んでください</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {selectedGame && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {selectedGame.name} - ランキング
            </h3>
          )}

          {isLoading ? (
            <p className="text-gray-600 dark:text-gray-400">読み込み中...</p>
          ) : ranking.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      順位
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      プレイヤー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      スコア
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ranking.map((entry) => (
                    <tr key={entry.rank}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}位`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {entry.user?.displayName || '不明'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {entry.bestScore}点
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedGameId ? (
            <p className="text-gray-600 dark:text-gray-400">まだスコアがありません</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">ゲームを選択してください</p>
          )}
        </div>
      </main>
    </div>
  )
}
