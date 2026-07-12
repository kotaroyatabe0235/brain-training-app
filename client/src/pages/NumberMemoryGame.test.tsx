import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NumberMemoryGame from './NumberMemoryGame'
import { useScoreStore } from '../stores/scoreStore'

vi.mock('../stores/scoreStore', () => ({
  useScoreStore: vi.fn(),
}))

describe('NumberMemoryGame', () => {
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
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
    expect(screen.getByText('やさしい（3桁）')).toBeInTheDocument()
    expect(screen.getByText('ふつう（5桁）')).toBeInTheDocument()
    expect(screen.getByText('むずかしい（7桁）')).toBeInTheDocument()
  })

  it('should display game title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('数字記憶')).toBeInTheDocument()
  })

  it('should have link to go back to game list', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('ゲーム一覧に戻る')).toHaveAttribute('href', '/games/memory')
  })

  it('should display description text', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('表示された数字を覚えて入力しましょう')).toBeInTheDocument()
  })

  it('should show number display when in memorizing state', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（3桁）'))

    expect(screen.getByText('この数字を覚えてください')).toBeInTheDocument()
  })

  it('should show input field when in input state', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（3桁）'))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByText('答え合わせ')).toBeInTheDocument()
  })

  it('should show score on game over', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（3桁）'))

    for (let round = 0; round < 5; round++) {
      act(() => {
        vi.advanceTimersByTime(3000)
      })

      fireEvent.click(screen.getByText('答え合わせ'))

      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }

    expect(screen.getByText('ゲーム終了！')).toBeInTheDocument()
    expect(screen.getByText('もう一度プレイ')).toBeInTheDocument()
  })

  it('should start game with normal difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('ふつう（5桁）'))

    expect(screen.getByText('この数字を覚えてください')).toBeInTheDocument()
  })

  it('should start game with hard difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('むずかしい（7桁）'))

    expect(screen.getByText('この数字を覚えてください')).toBeInTheDocument()
  })

  it('should play again after game over', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（3桁）'))

    for (let round = 0; round < 5; round++) {
      act(() => {
        vi.advanceTimersByTime(3000)
      })
      fireEvent.click(screen.getByText('答え合わせ'))
      act(() => {
        vi.advanceTimersByTime(1000)
      })
    }

    expect(screen.getByText('ゲーム終了！')).toBeInTheDocument()

    fireEvent.click(screen.getByText('もう一度プレイ'))

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
  })

  it('should mock useScoreStore', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NumberMemoryGame />
      </MemoryRouter>,
    )

    expect(useScoreStore).toHaveBeenCalled()
  })
})
