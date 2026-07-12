import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PatternGame from './PatternGame'
import { useScoreStore } from '../stores/scoreStore'

vi.mock('../stores/scoreStore', () => ({
  useScoreStore: vi.fn(),
}))

describe('PatternGame', () => {
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
        <PatternGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
    expect(screen.getByText('やさしい（5問）')).toBeInTheDocument()
    expect(screen.getByText('ふつう（7問）')).toBeInTheDocument()
    expect(screen.getByText('むずかしい（10問）')).toBeInTheDocument()
  })

  it('should display game title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('パターン認識')).toBeInTheDocument()
  })

  it('should have link to go back to game list', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('ゲーム一覧に戻る')).toHaveAttribute('href', '/games/logic')
  })

  it('should display description text', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('数列のパターンを理解して次の数字を当てましょう')).toBeInTheDocument()
  })

  it('should show pattern sequence when playing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（5問）'))

    expect(screen.getByText('次の数字は？')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('should show choice buttons when playing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（5問）'))

    const choiceButtons = screen.getAllByRole('button').filter(
      (btn) => !['ゲーム一覧に戻る', 'もう一度プレイ'].includes(btn.textContent || ''),
    )
    expect(choiceButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('should show score on game over', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（5問）'))

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(screen.getByText('ゲーム終了！')).toBeInTheDocument()
    expect(screen.getByText('もう一度プレイ')).toBeInTheDocument()
  })

  it('should start game with normal difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('ふつう（7問）'))

    expect(screen.getByText('次の数字は？')).toBeInTheDocument()
  })

  it('should start game with hard difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('むずかしい（10問）'))

    expect(screen.getByText('次の数字は？')).toBeInTheDocument()
  })

  it('should answer a question and show feedback', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（5問）'))

    const choiceButtons = screen.getAllByRole('button').filter(
      (btn) => {
        const text = btn.textContent || ''
        return !['ゲーム一覧に戻る', 'もう一度プレイ'].includes(text) && /^\d+$/.test(text)
      },
    )
    expect(choiceButtons.length).toBeGreaterThanOrEqual(4)

    fireEvent.click(choiceButtons[0])

    const feedback = screen.queryByText('正解！') || screen.queryByText('不正解...')
    expect(feedback).toBeTruthy()
  })

  it('should show game finished and play again button', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（5問）'))

    act(() => {
      vi.advanceTimersByTime(60000)
    })

    expect(screen.getByText('ゲーム終了！')).toBeInTheDocument()

    fireEvent.click(screen.getByText('もう一度プレイ'))

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
  })

  it('should mock useScoreStore', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <PatternGame />
      </MemoryRouter>,
    )

    expect(useScoreStore).toHaveBeenCalled()
  })
})
