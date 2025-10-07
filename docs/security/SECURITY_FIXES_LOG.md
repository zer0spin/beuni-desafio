## 2025-10-07 – Endurecimento de segurança backend

- CSRF token agora gerado com `crypto.randomBytes(32)` (substitui `Math.random`).
- Helmet/CSP mais restrito em produção (sem `unsafe-inline`/`unsafe-eval`).
- HSTS habilitado em produção.
- Swagger desabilitado em produção para reduzir superfície de ataque.
- Removido fallback de `JWT_SECRET` no `AuthModule`; segredo é obrigatório via `env`.
- Removido `backend/src/middleware/security.js` legado para evitar conflitos de configuração.

Impacto
- Reduz risco de XSS e session hijacking.
- Força HTTPS e melhora postura de cabeçalhos de segurança.
- Melhora a gestão de segredos e consistência de políticas.