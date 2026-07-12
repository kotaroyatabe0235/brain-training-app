import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GameCategoryPage from './GameCategoryPage'

function renderWithRoute(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/games/:category" element={<GameCategoryPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GameCategoryPage', () => {
  describe('memory category', () => {
    it('should display category title for memory', () => {
      renderWithRoute(['/games/memory'])
      expect(screen.getByText('記憶力トレーニング')).toBeInTheDocument()
    })

    it('should display all memory games', () => {
      renderWithRoute(['/games/memory'])
      expect(screen.getByText('カードマッチ')).toBeInTheDocument()
      expect(screen.getByText('数字記憶')).toBeInTheDocument()
      expect(screen.getByText('色記憶')).toBeInTheDocument()
    })

    it('should display memory game descriptions', () => {
      renderWithRoute(['/games/memory'])
      expect(screen.getByText('2枚のカードの組み合わせを記憶してめくる')).toBeInTheDocument()
      expect(screen.getByText('表示された数字列を覚えて再入力')).toBeInTheDocument()
      expect(screen.getByText('色の順序を記憶して再現')).toBeInTheDocument()
    })

    it('should show play button for available memory games', () => {
      renderWithRoute(['/games/memory'])
      const playButtons = screen.getAllByText('プレイする')
      expect(playButtons.length).toBe(2)
    })

    it('should show coming soon for unavailable memory games', () => {
      renderWithRoute(['/games/memory'])
      const comingSoonButtons = screen.getAllByText('準備中')
      expect(comingSoonButtons.length).toBe(1)
    })

    it('should have correct link for card-match', () => {
      renderWithRoute(['/games/memory'])
      const links = screen.getAllByText('プレイする').map(el => el.closest('a'))
      expect(links[0]).toHaveAttribute('href', '/games/memory/card-match')
    })
  })

  describe('calculation category', () => {
    it('should display calculation category title', () => {
      renderWithRoute(['/games/calculation'])
      expect(screen.getByText('計算力トレーニング')).toBeInTheDocument()
    })

    it('should display all calculation games', () => {
      renderWithRoute(['/games/calculation'])
      expect(screen.getByText('速算チャレンジ')).toBeInTheDocument()
      expect(screen.getByText('電卓パズル')).toBeInTheDocument()
      expect(screen.getByText('数列完成')).toBeInTheDocument()
    })

    it('should display calculation game descriptions', () => {
      renderWithRoute(['/games/calculation'])
      expect(screen.getByText('制限時間内に計算問題を解く')).toBeInTheDocument()
      expect(screen.getByText('数字を組み合わせて目標値を作る')).toBeInTheDocument()
      expect(screen.getByText('パターンを理解し次にくる数字を当てる')).toBeInTheDocument()
    })

    it('should show 1 play button and 2 coming soon for calculation', () => {
      renderWithRoute(['/games/calculation'])
      expect(screen.getAllByText('プレイする').length).toBe(1)
      expect(screen.getAllByText('準備中').length).toBe(2)
    })
  })

  describe('vocabulary category', () => {
    it('should display vocabulary category title', () => {
      renderWithRoute(['/games/vocabulary'])
      expect(screen.getByText('語彙力トレーニング')).toBeInTheDocument()
    })

    it('should display all vocabulary games', () => {
      renderWithRoute(['/games/vocabulary'])
      expect(screen.getByText('類義語チェック')).toBeInTheDocument()
      expect(screen.getByText('穴埋めクイズ')).toBeInTheDocument()
      expect(screen.getByText('文字数パズル')).toBeInTheDocument()
    })

    it('should display vocabulary game descriptions', () => {
      renderWithRoute(['/games/vocabulary'])
      expect(screen.getByText('似た意味の言葉を選ぶ')).toBeInTheDocument()
      expect(screen.getByText('文脈に合う言葉を選択')).toBeInTheDocument()
      expect(screen.getByText('指定文字数で言葉を作成')).toBeInTheDocument()
    })

    it('should show all 3 as coming soon for vocabulary', () => {
      renderWithRoute(['/games/vocabulary'])
      expect(screen.queryAllByText('プレイする').length).toBe(0)
      expect(screen.getAllByText('準備中').length).toBe(3)
    })
  })

  describe('logic category', () => {
    it('should display logic category title', () => {
      renderWithRoute(['/games/logic'])
      expect(screen.getByText('論理思考トレーニング')).toBeInTheDocument()
    })

    it('should display all logic games', () => {
      renderWithRoute(['/games/logic'])
      expect(screen.getByText('パターン認識')).toBeInTheDocument()
      expect(screen.getByText('推理クイズ')).toBeInTheDocument()
      expect(screen.getByText('グリッドロジック')).toBeInTheDocument()
    })

    it('should display logic game descriptions', () => {
      renderWithRoute(['/games/logic'])
      expect(screen.getByText('図形の並びから次を当てる')).toBeInTheDocument()
      expect(screen.getByText('条件から正解を導く論理パズル')).toBeInTheDocument()
      expect(screen.getByText('条件からグリッドを埋める')).toBeInTheDocument()
    })

    it('should show 1 play button and 2 coming soon for logic', () => {
      renderWithRoute(['/games/logic'])
      expect(screen.getAllByText('プレイする').length).toBe(1)
      expect(screen.getAllByText('準備中').length).toBe(2)
    })
  })

  describe('reaction category', () => {
    it('should display reaction category title', () => {
      renderWithRoute(['/games/reaction'])
      expect(screen.getByText('反応速度トレーニング')).toBeInTheDocument()
    })

    it('should display all reaction games', () => {
      renderWithRoute(['/games/reaction'])
      expect(screen.getByText('ターゲットクリック')).toBeInTheDocument()
      expect(screen.getByText('色文字マッチ')).toBeInTheDocument()
      expect(screen.getByText('タイピングチャレンジ')).toBeInTheDocument()
    })

    it('should display reaction game descriptions', () => {
      renderWithRoute(['/games/reaction'])
      expect(screen.getByText('出現したターゲットを素早くクリック')).toBeInTheDocument()
      expect(screen.getByText('文字の色と意味の不一致を判定')).toBeInTheDocument()
      expect(screen.getByText('表示された文字列を高速入力')).toBeInTheDocument()
    })

    it('should show 1 play button and 2 coming soon for reaction', () => {
      renderWithRoute(['/games/reaction'])
      expect(screen.getAllByText('プレイする').length).toBe(1)
      expect(screen.getAllByText('準備中').length).toBe(2)
    })
  })

  describe('common UI elements', () => {
    it('should have link to home page', () => {
      renderWithRoute(['/games/memory'])
      expect(screen.getByText('ホームに戻る')).toHaveAttribute('href', '/')
    })

    it('should display app title', () => {
      renderWithRoute(['/games/memory'])
      expect(screen.getByText('Brain Training App')).toBeInTheDocument()
    })

    it('should display not found for invalid category', () => {
      renderWithRoute(['/games/invalid'])
      expect(screen.getByText('カテゴリが見つかりません')).toBeInTheDocument()
    })

    it('should have correct link for number-memory game', () => {
      renderWithRoute(['/games/memory'])
      const links = screen.getAllByRole('link')
      const numberMemoryLink = links.find(
        (link) => link.getAttribute('href') === '/games/memory/number-memory',
      )
      expect(numberMemoryLink).toBeDefined()
    })

    it('should have correct link for quick-calc game', () => {
      renderWithRoute(['/games/calculation'])
      const links = screen.getAllByRole('link')
      const quickCalcLink = links.find(
        (link) => link.getAttribute('href') === '/games/calculation/quick-calc',
      )
      expect(quickCalcLink).toBeDefined()
    })

    it('should have correct link for pattern game', () => {
      renderWithRoute(['/games/logic'])
      const links = screen.getAllByRole('link')
      const patternLink = links.find(
        (link) => link.getAttribute('href') === '/games/logic/pattern',
      )
      expect(patternLink).toBeDefined()
    })

    it('should have correct link for target-click game', () => {
      renderWithRoute(['/games/reaction'])
      const links = screen.getAllByRole('link')
      const targetClickLink = links.find(
        (link) => link.getAttribute('href') === '/games/reaction/target-click',
      )
      expect(targetClickLink).toBeDefined()
    })
  })
})
