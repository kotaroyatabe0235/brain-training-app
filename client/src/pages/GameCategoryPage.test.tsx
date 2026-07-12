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
  it('should display category title for memory', () => {
    renderWithRoute(['/games/memory'])

    expect(screen.getByText('記憶力トレーニング')).toBeInTheDocument()
  })

  it('should display games for memory category', () => {
    renderWithRoute(['/games/memory'])

    expect(screen.getByText('カードマッチ')).toBeInTheDocument()
    expect(screen.getByText('数字記憶')).toBeInTheDocument()
    expect(screen.getByText('色記憶')).toBeInTheDocument()
  })

  it('should show play button for available games', () => {
    renderWithRoute(['/games/memory'])

    const playButtons = screen.getAllByText('プレイする')
    expect(playButtons.length).toBe(2)
  })

  it('should show coming soon for unavailable games', () => {
    renderWithRoute(['/games/memory'])

    const comingSoonButtons = screen.getAllByText('準備中')
    expect(comingSoonButtons.length).toBe(1)
  })

  it('should have link to home page', () => {
    renderWithRoute(['/games/memory'])

    expect(screen.getByText('ホームに戻る')).toHaveAttribute('href', '/')
  })

  it('should display not found for invalid category', () => {
    renderWithRoute(['/games/invalid'])

    expect(screen.getByText('カテゴリが見つかりません')).toBeInTheDocument()
  })
})
