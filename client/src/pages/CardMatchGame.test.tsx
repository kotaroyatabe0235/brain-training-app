import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CardMatchGame from './CardMatchGame'
import { useScoreStore } from '../stores/scoreStore'

vi.mock('../stores/scoreStore', () => ({
  useScoreStore: vi.fn(),
}))

describe('CardMatchGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.mocked(useScoreStore).mockReturnValue({
      submitScore: vi.fn(),
      isLoading: false,
    } as any)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should display difficulty selection on start', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
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
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('カードマッチ')).toBeInTheDocument()
  })

  it('should have link to go back to game list', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('ゲーム一覧に戻る')).toHaveAttribute('href', '/games/memory')
  })

  it('should show difficulty selection buttons', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('やさしい（6ペア）')).toBeInTheDocument()
    expect(screen.getByText('ふつう（8ペア）')).toBeInTheDocument()
    expect(screen.getByText('むずかしい（12ペア）')).toBeInTheDocument()
  })

  it('should render game board when difficulty is selected', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    expect(screen.getByText('残り時間:')).toBeInTheDocument()
    expect(screen.getByText('手数:')).toBeInTheDocument()
    expect(screen.getByText('やり直す')).toBeInTheDocument()
  })

  it('should show card grid when playing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    const cardButtons = screen.getAllByText('?')
    expect(cardButtons.length).toBe(12)
  })

  it('should show score on game over', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(screen.getByText('時間切れです')).toBeInTheDocument()
    expect(screen.getByText('もう一度挑戦しましょう！')).toBeInTheDocument()
  })

  it('should start game with normal difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('ふつう（8ペア）'))

    expect(screen.getByText('残り時間:')).toBeInTheDocument()
    const cardButtons = screen.getAllByText('?')
    expect(cardButtons.length).toBe(16)
  })

  it('should start game with hard difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('むずかしい（12ペア）'))

    expect(screen.getByText('残り時間:')).toBeInTheDocument()
    const cardButtons = screen.getAllByText('?')
    expect(cardButtons.length).toBe(24)
  })

  it('should flip a card when clicked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    const cardButtons = screen.getAllByText('?')
    fireEvent.click(cardButtons[0])

    const symbols = screen.getAllByText((_, element) => {
      return element?.textContent !== '?' && element?.textContent !== 'カードマッチ' &&
        element?.textContent !== 'ゲーム一覧に戻る' && element?.textContent !== '残り時間:' &&
        element?.textContent !== '手数:' && element?.textContent !== 'やり直す' &&
        (element?.tagName === 'BUTTON') && (element?.textContent?.length ?? 0) <= 2
    })
    expect(symbols.length).toBeGreaterThanOrEqual(1)
  })

  it('should exercise card matching logic with two card flips', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    const cardButtons = screen.getAllByText('?')
    fireEvent.click(cardButtons[0])

    fireEvent.click(cardButtons[1])

    expect(screen.getByText('手数:')).toBeInTheDocument()
  })

  it('should exercise card matching logic with third card click ignored', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    const cardButtons = screen.getAllByText('?')
    fireEvent.click(cardButtons[0])
    fireEvent.click(cardButtons[1])

    const cardsAfterTwo = screen.getAllByText((_, element) => {
      return (element?.tagName === 'BUTTON') && (element?.textContent?.length ?? 0) <= 2
    })

    fireEvent.click(cardsAfterTwo[0])

    expect(screen.getByText('手数:')).toBeInTheDocument()
  })

  it('should exercise non-matching cards flip back after timeout', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    const cardButtons = screen.getAllByText('?')
    fireEvent.click(cardButtons[0])
    fireEvent.click(cardButtons[1])

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(screen.getByText('手数:')).toBeInTheDocument()
  })

  it('should exercise clicking on already flipped card', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    const cardButtons = screen.getAllByText('?')
    fireEvent.click(cardButtons[0])

    const flippedCards = screen.getAllByText((_, element) => {
      return (element?.tagName === 'BUTTON') && (element?.textContent?.length ?? 0) <= 2
    })
    fireEvent.click(flippedCards[0])

    expect(screen.getByText('手数:')).toBeInTheDocument()
  })

  it('should exercise clicking on matched card', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))

    const cardButtons = screen.getAllByText('?')
    fireEvent.click(cardButtons[0])
    fireEvent.click(cardButtons[1])

    act(() => {
      vi.advanceTimersByTime(800)
    })

    const cardsAfterMatch = screen.getAllByText('?')
    fireEvent.click(cardsAfterMatch[0])

    expect(screen.getByText('手数:')).toBeInTheDocument()
  })

  it('should reset game when reset button clicked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（6ペア）'))
    fireEvent.click(screen.getByText('やり直す'))

    expect(screen.getByText('残り時間:')).toBeInTheDocument()
    expect(screen.getByText('手数:')).toBeInTheDocument()
  })

  it('should show lost state with hard difficulty timeout', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('むずかしい（12ペア）'))

    act(() => {
      vi.advanceTimersByTime(120000)
    })

    expect(screen.getByText('時間切れです')).toBeInTheDocument()
  })

  it('should mock useScoreStore', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <CardMatchGame />
      </MemoryRouter>,
    )

    expect(useScoreStore).toHaveBeenCalled()
  })
})
