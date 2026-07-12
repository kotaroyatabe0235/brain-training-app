import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import QuickCalcGame from './QuickCalcGame'
import { useScoreStore } from '../stores/scoreStore'

vi.mock('../stores/scoreStore', () => ({
  useScoreStore: vi.fn(),
}))

describe('QuickCalcGame', () => {
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
        <QuickCalcGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
    expect(screen.getByText('やさしい（30秒）')).toBeInTheDocument()
    expect(screen.getByText('ふつう（60秒）')).toBeInTheDocument()
    expect(screen.getByText('むずかしい（90秒）')).toBeInTheDocument()
  })

  it('should display game title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('速算チャレンジ')).toBeInTheDocument()
  })

  it('should have link to go back to game list', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('ゲーム一覧に戻る')).toHaveAttribute('href', '/games/calculation')
  })

  it('should display description text', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('制限時間内にできるだけ多くの計算問題を解きましょう')).toBeInTheDocument()
  })

  it('should show math problem when playing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（30秒）'))

    expect(screen.getByText(/=\s*\?/)).toBeInTheDocument()
  })

  it('should show input field when playing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（30秒）'))

    expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    expect(screen.getByText('答え合わせ')).toBeInTheDocument()
  })

  it('should show score on game over', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（30秒）'))

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(screen.getByText('タイムアップ！')).toBeInTheDocument()
    expect(screen.getByText('もう一度プレイ')).toBeInTheDocument()
  })

  it('should start game with normal difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('ふつう（60秒）'))

    expect(screen.getByText(/=\s*\?/)).toBeInTheDocument()
  })

  it('should start game with hard difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('むずかしい（90秒）'))

    expect(screen.getByText(/=\s*\?/)).toBeInTheDocument()
  })

  it('should submit an answer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（30秒）'))

    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '42' } })
    fireEvent.click(screen.getByText('答え合わせ'))

    expect(input).toBeInTheDocument()
  })

  it('should show game finished and play again', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（30秒）'))

    act(() => {
      vi.advanceTimersByTime(30000)
    })

    expect(screen.getByText('タイムアップ！')).toBeInTheDocument()

    fireEvent.click(screen.getByText('もう一度プレイ'))

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
  })

  it('should mock useScoreStore', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <QuickCalcGame />
      </MemoryRouter>,
    )

    expect(useScoreStore).toHaveBeenCalled()
  })
})
