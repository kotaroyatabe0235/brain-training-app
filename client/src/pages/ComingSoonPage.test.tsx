import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ComingSoonPage from './ComingSoonPage'

describe('ComingSoonPage', () => {
  it('should render title', () => {
    render(
      <MemoryRouter>
        <ComingSoonPage title="テストゲーム" category="memory" />
      </MemoryRouter>,
    )

    expect(screen.getByText('テストゲーム')).toBeInTheDocument()
  })

  it('should render preparing message', () => {
    render(
      <MemoryRouter>
        <ComingSoonPage title="テストゲーム" category="memory" />
      </MemoryRouter>,
    )

    expect(screen.getByText('準備中です。もうしばらくお待ちください。')).toBeInTheDocument()
  })

  it('should contain link back to game list', () => {
    render(
      <MemoryRouter>
        <ComingSoonPage title="テストゲーム" category="memory" />
      </MemoryRouter>,
    )

    const link = screen.getByText('ゲーム一覧に戻る')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/games/memory')
  })
})
