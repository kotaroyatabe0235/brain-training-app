import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
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

function renderRegisterPage(props = {}) {
  const defaultProps = {
    register: vi.fn(),
    isLoading: false,
    error: null,
    clearError: vi.fn(),
    ...props,
  }

  vi.mocked(useAuthStore).mockReturnValue(defaultProps as any)

  return {
    ...render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    ),
    props: defaultProps,
  }
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form fields', () => {
    renderRegisterPage()

    expect(screen.getByPlaceholderText('表示名')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('パスワード（8文字以上）')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('パスワード確認')).toBeInTheDocument()
  })

  it('should render register button', () => {
    renderRegisterPage()

    expect(screen.getByRole('button', { name: '登録' })).toBeInTheDocument()
  })

  it('should render link to login page', () => {
    renderRegisterPage()

    expect(screen.getByText('ログイン')).toHaveAttribute('href', '/login')
  })

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByPlaceholderText('表示名'), 'Test User')
    await user.type(screen.getByPlaceholderText('メールアドレス'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('パスワード（8文字以上）'), 'password123')
    await user.type(screen.getByPlaceholderText('パスワード確認'), 'differentpassword')
    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument()
  })

  it('should show error when password is less than 8 characters', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByPlaceholderText('表示名'), 'Test User')
    await user.type(screen.getByPlaceholderText('メールアドレス'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('パスワード（8文字以上）'), 'short')
    await user.type(screen.getByPlaceholderText('パスワード確認'), 'short')
    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(screen.getByText('パスワードは8文字以上で入力してください')).toBeInTheDocument()
  })

  it('should call register on valid form submit', async () => {
    const user = userEvent.setup()
    const { props } = renderRegisterPage()

    await user.type(screen.getByPlaceholderText('表示名'), 'Test User')
    await user.type(screen.getByPlaceholderText('メールアドレス'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('パスワード（8文字以上）'), 'password123')
    await user.type(screen.getByPlaceholderText('パスワード確認'), 'password123')
    await user.click(screen.getByRole('button', { name: '登録' }))

    expect(props.register).toHaveBeenCalledWith({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('should display error from store', () => {
    renderRegisterPage({ error: 'このメールアドレスは既に使用されています' })

    expect(screen.getByText('このメールアドレスは既に使用されています')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    renderRegisterPage({ isLoading: true })

    expect(screen.getByRole('button', { name: '登録中...' })).toBeDisabled()
  })
})
