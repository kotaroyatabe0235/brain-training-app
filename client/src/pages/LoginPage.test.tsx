import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { useAuthStore } from '../stores/authStore'

vi.mock('../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLoginPage() {
  const defaultProps = {
    login: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
  }

  vi.mocked(useAuthStore).mockReturnValue(defaultProps as any)

  return {
    ...render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    ),
    props: defaultProps,
  }
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render email and password inputs', () => {
    renderLoginPage()

    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('パスワード')).toBeInTheDocument()
  })

  it('should render login button', () => {
    renderLoginPage()

    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
  })

  it('should render link to register page', () => {
    renderLoginPage()

    expect(screen.getByText('新規アカウント登録')).toHaveAttribute('href', '/register')
  })

  it('should display error message from store', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: 'ログインに失敗しました',
      clearError: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('ログインに失敗しました')).toBeInTheDocument()
  })

  it('should call login on form submit', async () => {
    const user = userEvent.setup()
    const { props } = renderLoginPage()

    await user.type(screen.getByPlaceholderText('メールアドレス'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(props.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('should show loading state when isLoading is true', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: vi.fn(),
      isLoading: true,
      error: null,
      clearError: vi.fn(),
    } as any)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'ログイン中...' })).toBeDisabled()
  })
})
