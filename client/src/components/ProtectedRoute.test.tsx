import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore } from '../stores/authStore'

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading state', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: true,
      loadUser: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Child Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    expect(screen.queryByText('Child Content')).not.toBeInTheDocument()
  })

  it('should redirect to /login when user is null', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: false,
      loadUser: vi.fn(),
    } as any)

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <ProtectedRoute>
          <div>Child Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.queryByText('Child Content')).not.toBeInTheDocument()
  })

  it('should render children when user is authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'test@example.com', displayName: 'Test' },
      isLoading: false,
      loadUser: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should call loadUser on mount', () => {
    const loadUser = vi.fn()
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isLoading: false,
      loadUser,
    } as any)

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(loadUser).toHaveBeenCalled()
  })
})
