import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CardMatchGame from './CardMatchGame'

describe('CardMatchGame', () => {
  it('should display difficulty selection on start', () => {
    render(
      <MemoryRouter>
        <CardMatchGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
    expect(screen.getByText('やさしい（6ペア）')).toBeInTheDocument()
    expect(screen.getByText('ふつう（8ペア）')).toBeInTheDocument()
    expect(screen.getByText('むずかしい（12ペア）')).toBeInTheDocument()
  })

  it('should display game title', () => {
    render(
      <MemoryRouter>
        <CardMatchGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('カードマッチ')).toBeInTheDocument()
  })

  it('should have link to go back to game list', () => {
    render(
      <MemoryRouter>
        <CardMatchGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('ゲーム一覧に戻る')).toHaveAttribute('href', '/games/memory')
  })
})
