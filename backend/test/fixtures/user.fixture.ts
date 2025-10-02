/**
 * Fixtures de dados de teste para usuários
 */

export const mockUser = {
  id: 'user-123',
  nome: 'João Silva',
  email: 'joao.silva@test.com',
  senhaHash: '$2a$10$MOCK.HASH.FOR.TESTING.PURPOSES.ONLY',
  imagemPerfil: 'https://example.com/avatar.jpg',
  organizationId: 'org-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockOrganizacao = {
  id: 'org-123',
  nome: 'Empresa Teste LTDA',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockUserWithOrganizacao = {
  ...mockUser,
  organizacao: mockOrganizacao,
};

export const mockUserWithoutPassword = {
  id: mockUser.id,
  nome: mockUser.nome,
  email: mockUser.email,
  imagemPerfil: mockUser.imagemPerfil,
  organizationId: mockUser.organizationId,
  organizacao: mockOrganizacao,
};

export const mockJwtPayload = {
  sub: mockUser.id,
  email: mockUser.email,
  organizationId: mockUser.organizationId,
};

export const mockAuthResponse = {
  access_token: 'mock.jwt.token.user-123',
  user: mockUserWithoutPassword,
};

export const mockLoginDto = {
  email: 'joao.silva@test.com',
  password: 'Password123!',
};

export const mockRegisterDto = {
  name: 'João Silva',
  email: 'joao.silva@test.com',
  password: 'Password123!',
};

export const mockUpdateProfileDto = {
  name: 'João Silva Updated',
  email: 'joao.updated@test.com',
  organizationName: 'Empresa Atualizada LTDA',
  imagemPerfil: 'https://example.com/new-avatar.jpg',
};
