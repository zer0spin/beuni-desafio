import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import Cookies from 'js-cookie';
import { setAuthToken, removeAuthToken, getUser } from '../api';

// Mock axios and js-cookie
vi.mock('axios');
vi.mock('js-cookie');

describe('API Library - Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setAuthToken', () => {
    it('should store only user data (not token) with secure options', () => {
      // Arrange
      const user = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@example.com',
        organizationId: 'org-123',
      };

      const mockSet = vi.fn();
      vi.mocked(Cookies.set).mockImplementation(mockSet);

      // Act
      setAuthToken(user);

      // Assert
      expect(mockSet).toHaveBeenCalledWith(
        'beuni_user',
        JSON.stringify(user),
        expect.objectContaining({
          expires: 7,
          sameSite: 'strict',
          path: '/',
          secure: false, // false in test environment (NODE_ENV !== 'production')
        })
      );

      // SECURITY: Ensure token is NOT stored client-side (httpOnly from backend)
      expect(mockSet).toHaveBeenCalledTimes(1); // Only user cookie
    });

    it('should use secure flag in production environment', () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const user = { id: '1', nome: 'User' };

      const mockSet = vi.fn();
      vi.mocked(Cookies.set).mockImplementation(mockSet);

      // Act
      setAuthToken(user);

      // Assert
      expect(mockSet).toHaveBeenCalledWith(
        'beuni_user',
        expect.any(String),
        expect.objectContaining({
          secure: true, // true in production
        })
      );

      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('removeAuthToken', () => {
    it('should remove user cookie', () => {
      // Arrange
      const mockRemove = vi.fn();
      vi.mocked(Cookies.remove).mockImplementation(mockRemove);

      // Act
      removeAuthToken();

      // Assert
      expect(mockRemove).toHaveBeenCalledWith('beuni_user', { path: '/' });
    });

    it('should also try to remove token cookie for backward compatibility', () => {
      // Arrange
      const mockRemove = vi.fn();
      vi.mocked(Cookies.remove).mockImplementation(mockRemove);

      // Act
      removeAuthToken();

      // Assert
      expect(mockRemove).toHaveBeenCalledWith('beuni_token', { path: '/' });
      expect(mockRemove).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUser', () => {
    it('should parse and return user data from cookie', () => {
      // Arrange
      const user = {
        id: 'user-123',
        nome: 'Test User',
        email: 'test@example.com',
      };

      vi.mocked(Cookies.get).mockReturnValue(JSON.stringify(user));

      // Act
      const result = getUser();

      // Assert
      expect(result).toEqual(user);
      expect(Cookies.get).toHaveBeenCalledWith('beuni_user');
    });

    it('should return null if user cookie does not exist', () => {
      // Arrange
      vi.mocked(Cookies.get).mockReturnValue(undefined);

      // Act
      const result = getUser();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null and not throw error if cookie has invalid JSON', () => {
      // Arrange
      vi.mocked(Cookies.get).mockReturnValue('invalid-json{');

      // Act
      const result = getUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Security - Input Validation', () => {
    it('should handle XSS attempts in user data', () => {
      // Arrange
      const maliciousUser = {
        id: '1',
        nome: '<script>alert("XSS")</script>',
        email: 'test@example.com',
      };

      const mockSet = vi.fn();
      vi.mocked(Cookies.set).mockImplementation(mockSet);

      // Act
      setAuthToken(maliciousUser);

      // Assert - Data is stored as-is (sanitization should happen on render)
      const storedData = mockSet.mock.calls[0][1];
      expect(storedData).toContain('<script>');

      // This is OK because React automatically escapes content
      // The actual protection happens at render time, not storage time
    });
  });

  describe('Security - CSRF Protection', () => {
    it('should use strict sameSite cookie attribute', () => {
      // Arrange
      const user = { id: '1', nome: 'User' };
      const mockSet = vi.fn();
      vi.mocked(Cookies.set).mockImplementation(mockSet);

      // Act
      setAuthToken(user);

      // Assert
      expect(mockSet).toHaveBeenCalledWith(
        'beuni_user',
        expect.any(String),
        expect.objectContaining({
          sameSite: 'strict', // CSRF protection
        })
      );
    });
  });
});
