import { PrismaClient, GameCategory, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

const games = [
  // 記憶力
  { id: 'card-match', name: 'カードマッチ', category: 'memory' as GameCategory, description: '2枚のカードの組み合わせを記憶してめくる', config: { pairs: [6, 8, 12], timeLimit: [60, 90, 120] } },
  { id: 'number-memory', name: '数字記憶', category: 'memory' as GameCategory, description: '表示された数字列を覚えて再入力', config: { digits: [3, 5, 7], displayTime: [3, 5, 8] } },
  { id: 'color-memory', name: '色記憶', category: 'memory' as GameCategory, description: '色の順序を記憶して再現', config: { colors: [4, 6, 8], displayTime: [2, 3, 4] } },

  // 計算力
  { id: 'quick-calc', name: '速算チャレンジ', category: 'calculation' as GameCategory, description: '制限時間内に計算問題を解く', config: { operations: ['+', '-', '×', '÷'], timeLimit: [30, 60, 90], maxNumber: [10, 50, 100] } },
  { id: 'calc-puzzle', name: '電卓パズル', category: 'calculation' as GameCategory, description: '数字を組み合わせて目標値を作る', config: { numbers: [3, 4, 5], targetRange: [10, 50, 100] } },
  { id: 'number-sequence', name: '数列完成', category: 'calculation' as GameCategory, description: 'パターンを理解し次にくる数字を当てる', config: { difficulty: ['easy', 'normal', 'hard'] } },

  // 語彙力
  { id: 'synonym', name: '類義語チェック', category: 'vocabulary' as GameCategory, description: '似た意味の言葉を選ぶ', config: { timeLimit: [15, 10, 5] } },
  { id: 'fill-blank', name: '穴埋めクイズ', category: 'vocabulary' as GameCategory, description: '文脈に合う言葉を選択', config: { timeLimit: [20, 15, 10] } },
  { id: 'word-length', name: '文字数パズル', category: 'vocabulary' as GameCategory, description: '指定文字数で言葉を作成', config: { charCount: [3, 4, 5], timeLimit: [60, 45, 30] } },

  // 論理思考
  { id: 'pattern', name: 'パターン認識', category: 'logic' as GameCategory, description: '図形の並びから次を当てる', config: { choices: [4, 6, 8], timeLimit: [15, 10, 5] } },
  { id: 'riddle', name: '推理クイズ', category: 'logic' as GameCategory, description: '条件から正解を導く論理パズル', config: { timeLimit: [120, 90, 60] } },
  { id: 'grid-logic', name: 'グリッドロジック', category: 'logic' as GameCategory, description: '条件からグリッドを埋める', config: { gridSize: [4, 6, 8], timeLimit: [300, 240, 180] } },

  // 反応速度
  { id: 'target-click', name: 'ターゲットクリック', category: 'reaction' as GameCategory, description: '出現したターゲットを素早くクリック', config: { targets: [10, 15, 20], timeLimit: [10, 15, 20] } },
  { id: 'stroop', name: '色文字マッチ', category: 'reaction' as GameCategory, description: '文字の色と意味の不一致を判定', config: { rounds: [10, 15, 20], timeLimit: [10, 15, 20] } },
  { id: 'typing', name: 'タイピングチャレンジ', category: 'reaction' as GameCategory, description: '表示された文字列を高速入力', config: { minLength: [3, 5, 8], timeLimit: [30, 45, 60] } },
]

const badges = [
  { id: 'first-play', name: '初挑戦', description: '初めてゲームをプレイした', criteria: { type: 'first_play' } },
  { id: 'streak-3', name: '3日連続', description: '3日連続でプレイした', criteria: { type: 'streak', days: 3 } },
  { id: 'streak-7', name: '7日連続', description: '7日連続でプレイした', criteria: { type: 'streak', days: 7 } },
  { id: 'streak-30', name: '30日連続', description: '30日連続でプレイした', criteria: { type: 'streak', days: 30 } },
  { id: 'memory-master', name: '記憶マスター', description: '記憶力カテゴリで全ゲームクリア', criteria: { type: 'category_clear', category: 'memory' } },
  { id: 'calc-master', name: '計算マスター', description: '計算力カテゴリで全ゲームクリア', criteria: { type: 'category_clear', category: 'calculation' } },
  { id: 'vocab-master', name: '語彙マスター', description: '語彙力カテゴリで全ゲームクリア', criteria: { type: 'category_clear', category: 'vocabulary' } },
  { id: 'logic-master', name: '論理マスター', description: '論理思考カテゴリで全ゲームクリア', criteria: { type: 'category_clear', category: 'logic' } },
  { id: 'reaction-master', name: '反応マスター', description: '反応速度カテゴリで全ゲームクリア', criteria: { type: 'category_clear', category: 'reaction' } },
  { id: 'full-master', name: 'フルマスター', description: '全カテゴリを制覇した', criteria: { type: 'all_categories_clear' } },
  { id: 'play-100', name: '100回プレイ', description: '100回プレイした', criteria: { type: 'total_plays', count: 100 } },
  { id: 'perfect-score', name: 'パーフェクト', description: 'いずれかのゲームで満点を取った', criteria: { type: 'perfect_score' } },
]

async function main() {
  console.log('Seeding database...')

  for (const game of games) {
    await prisma.game.upsert({
      where: { id: game.id },
      update: {},
      create: game,
    })
  }
  console.log(`Seeded ${games.length} games`)

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: badge.id },
      update: {},
      create: badge,
    })
  }
  console.log(`Seeded ${badges.length} badges`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
