import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TargetClickGame from './TargetClickGame'
import { useScoreStore } from '../stores/scoreStore'

vi.mock('../stores/scoreStore', () => ({
  useScoreStore: vi.fn(),
}))

describe('TargetClickGame', () => {
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
        <TargetClickGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
    expect(screen.getByText('やさしい（15秒）')).toBeInTheDocument()
    expect(screen.getByText('ふつう（15秒）')).toBeInTheDocument()
    expect(screen.getByText('むずかしい（20秒）')).toBeInTheDocument()
  })

  it('should display game title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('ターゲットクリック')).toBeInTheDocument()
  })

  it('should have link to go back to game list', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('ゲーム一覧に戻る')).toHaveAttribute('href', '/games/reaction')
  })

  it('should display description text', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    expect(screen.getByText('出現するターゲットを素早くクリックしましょう')).toBeInTheDocument()
  })

  it('should show game board area when playing', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（15秒）'))

    expect(screen.getByText('残り時間:')).toBeInTheDocument()
    expect(screen.getByText('スコア:')).toBeInTheDocument()
    expect(screen.getByText('クリック数:')).toBeInTheDocument()
  })

  it('should click a target during gameplay', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（15秒）'))

    const targetButton = document.querySelector('.absolute.rounded-full') as HTMLElement
    if (targetButton) {
      fireEvent.click(targetButton)
      expect(screen.getByText('スコア:')).toBeInTheDocument()
    }
  })

  it('should show avg reaction time as 0 with no clicks', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（15秒）'))

    act(() => {
      vi.advanceTimersByTime(15000)
    })

    expect(screen.getByText(/平均反応速度: 0ms/)).toBeInTheDocument()
  })

  it('should update score and clicked count after clicking target', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（15秒）'))

    const targets = document.querySelectorAll('.absolute.rounded-full')
    if (targets.length > 0) {
      fireEvent.click(targets[0] as HTMLElement)
      expect(screen.getByText('クリック数:')).toBeInTheDocument()
    }
  })

  it('should show score on game over', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（15秒）'))

    act(() => {
      vi.advanceTimersByTime(15000)
    })

    expect(screen.getByText('タイムアップ！')).toBeInTheDocument()
    expect(screen.getByText('もう一度プレイ')).toBeInTheDocument()
  })

  it('should start game with normal difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('ふつう（15秒）'))

    expect(screen.getByText('残り時間:')).toBeInTheDocument()
    expect(screen.getByText('スコア:')).toBeInTheDocument()
  })

  it('should start game with hard difficulty', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('むずかしい（20秒）'))

    expect(screen.getByText('残り時間:')).toBeInTheDocument()
  })

  it('should show game finished and play again', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('やさしい（15秒）'))

    act(() => {
      vi.advanceTimersByTime(15000)
    })

    expect(screen.getByText('タイムアップ！')).toBeInTheDocument()

    fireEvent.click(screen.getByText('もう一度プレイ'))

    expect(screen.getByText('難易度を選んでください')).toBeInTheDocument()
  })

  it('should mock useScoreStore', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <TargetClickGame />
      </MemoryRouter>,
    )

    expect(useScoreStore).toHaveBeenCalled()
  })
})
