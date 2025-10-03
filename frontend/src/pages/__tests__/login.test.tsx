import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

// Mocks
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('@/lib/api', () => ({
  default: {
    post: vi.fn(),
  },
  setAuthToken: vi.fn(),
  endpoints: {
    login: '/auth/login',
  },
}));

vi.mock('@/contexts/UserContext', () => ({
  useUser: vi.fn(),
}));

// Import component after mocks
import LoginPage from '../login';
import api, { setAuthToken } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';

describe('LoginPage', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();
  const mockRefreshUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useRouter as any).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    (useUser as any).mockReturnValue({
      user: null,
      refreshUser: mockRefreshUser,
    });
  });

  it('should render login form elements', () => {
    render(<LoginPage />);

    expect(screen.getByText('Bem-vindo(a) à BeUni! 👋')).toBeInTheDocument();
    expect(screen.getByText('Faça login para continuar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('should render demo account information', () => {
    render(<LoginPage />);

    expect(screen.getByText('🎯 Conta de Demonstração')).toBeInTheDocument();
    expect(screen.getByText('ana.rh@beunidemo.com')).toBeInTheDocument();
    expect(screen.getByText('123456')).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('E-mail é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Senha é obrigatória')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText('••••••');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    // Initially password type
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should navigate to register page when clicking "Crie uma conta"', () => {
    render(<LoginPage />);

    const registerLink = screen.getByText('Crie uma conta');
    fireEvent.click(registerLink);

    expect(mockPush).toHaveBeenCalledWith('/register');
  });

  it('should submit form with valid credentials', async () => {
    const mockUser = {
      id: '1',
      nome: 'Ana Silva',
      email: 'ana.rh@beunidemo.com',
    };

    (api.post as any).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    render(<LoginPage />);

    // Fill form
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••');
    
    fireEvent.change(emailInput, { target: { value: 'ana.rh@beunidemo.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'ana.rh@beunidemo.com',
        password: '123456',
      });
      expect(setAuthToken).toHaveBeenCalledWith(mockUser);
      expect(mockRefreshUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Bem-vindo, Ana Silva!');
    });
  });

  it('should show loading state during submission', async () => {
    (api.post as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<LoginPage />);

    // Fill form
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    // Check loading state
    expect(screen.getByText('Entrando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should redirect to dashboard if user is already logged in', () => {
    (useUser as any).mockReturnValue({
      user: { id: '1', nome: 'Test User' },
      refreshUser: mockRefreshUser,
    });

    render(<LoginPage />);

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('should redirect to dashboard after successful login', async () => {
    const mockUser = {
      id: '1',
      nome: 'Ana Silva',
      email: 'ana.rh@beunidemo.com',
    };

    // First render without user
    const { rerender } = render(<LoginPage />);

    // Simulate successful login
    (api.post as any).mockResolvedValueOnce({
      data: { user: mockUser },
    });

    // Fill and submit form
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••');
    
    fireEvent.change(emailInput, { target: { value: 'ana.rh@beunidemo.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(setAuthToken).toHaveBeenCalledWith(mockUser);
    });

    // Simulate UserContext update after login
    (useUser as any).mockReturnValue({
      user: mockUser,
      refreshUser: mockRefreshUser,
    });

    rerender(<LoginPage />);

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle login error gracefully', async () => {
    const mockError = new Error('Invalid credentials');
    (api.post as any).mockRejectedValueOnce(mockError);

    render(<LoginPage />);

    // Fill form
    const emailInput = screen.getByPlaceholderText('john@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••');
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      // Error handling is done by axios interceptor, so no direct toast call here
    });

    // Loading should be disabled after error
    expect(submitButton).not.toBeDisabled();
  });

  it('should render product images in the left panel', () => {
    render(<LoginPage />);

    expect(screen.getByAltText('Garrafa personalizada')).toBeInTheDocument();
    expect(screen.getByAltText('Camiseta personalizada')).toBeInTheDocument();
    expect(screen.getByAltText('Mochila personalizada')).toBeInTheDocument();
    expect(screen.getByAltText('Ecobag personalizada')).toBeInTheDocument();
  });

  it('should render logo correctly', () => {
    render(<LoginPage />);

    const logos = screen.getAllByAltText('Beuni Logo');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('should have accessible form elements', () => {
    render(<LoginPage />);

    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: 'Login' });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should handle forgot password link', () => {
    render(<LoginPage />);

    const forgotPasswordLink = screen.getByText('Esqueceu a senha?');
    expect(forgotPasswordLink).toBeInTheDocument();
    
    // Note: Currently it's just a button without functionality
    fireEvent.click(forgotPasswordLink);
    // No navigation expected as it's not implemented
  });
});