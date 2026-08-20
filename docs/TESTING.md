# Estratégia de Testes

## Stack de testes

| Camada | Ferramenta | Uso |
|--------|-----------|-----|
| Unitário | Jest | Funções, hooks, schemas, services, regras de negócio |
| Componente | React Testing Library | Renderização, interações, estados de UI |
| E2E | Playwright | Fluxos críticos completos em múltiplos browsers |

## Por que Playwright (e não Cypress)

- Suporte nativo a **Chromium, Firefox e WebKit (Safari)** — um único teste cobre os três.
- Execução **paralela** por padrão: suite completa em fração do tempo.
- **TypeScript first** com autocompletion nativo.
- Aguarda seletores e respostas de rede de forma inteligente — sem `wait()` arbitrários.
- Mantido pela Microsoft com atualizações alinhadas aos browsers modernos.

## Testes unitários com Jest

Usar para:
- Funções utilitárias
- Custom hooks
- Schemas Zod
- Services (com mock de dependências externas)
- Regras de negócio isoladas

## Testes de componente com React Testing Library

Usar para:
- Componentes reutilizáveis
- Formulários (validação, submissão, erros)
- Estados de loading, empty, error e success
- Interações do usuário (click, input, submit)

## Testes E2E com Playwright

Usar para fluxos críticos de ponta a ponta:
- Login / Cadastro / Logout
- Dashboard
- CRUD principal
- Fluxos de pagamento (se existir)
- Redirecionamentos e permissões (rotas protegidas)

## Regras obrigatórias

- Toda feature nova deve ter ao menos 1 teste unitário e 1 teste de componente.
- Todo bug corrigido deve ter teste cobrindo o caso exato.
- Não criar testes frágeis que dependem de seletores instáveis — preferir `role`, `label` e `text`.
- Priorizar comportamento do usuário, nunca detalhes internos de implementação.
- Rodar testes antes de finalizar qualquer tarefa.

## Scripts esperados

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:ci": "jest --ci && playwright test",
    "lint": "next lint",
    "build": "next build"
  }
}
```

## Setup inicial do Playwright

```bash
npm init playwright@latest
```

Configura automaticamente `playwright.config.ts`, pasta `/tests` e workflow para CI.
