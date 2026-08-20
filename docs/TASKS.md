# Tasks

## Backlog

### Sprint 1 — Telas do Aluno (/pbl-screens)
- [ ] Tela 1a: Login com Firebase Auth
- [ ] Tela 1b: Completar Perfil + lógica de sorteio do `assignedRepoId`
- [ ] Tela 2: Onboarding com conteúdo estático (Story Points, UML, Code Smells, SRP, MoSCoW)
- [ ] Tela 3: História do Cliente + tabela interativa de Story Points iniciais
- [ ] Tela 4: Diagrama UML para análise
- [ ] Tela 5: Tela do Repositório GitHub (lê `assignedRepoId` e exibe link)
- [ ] Tela 6: Matriz MoSCoW com campo de justificativa
- [ ] Tela 8: Entrega + comparativo de Story Points + upload de PDF
- [ ] Navegação sequencial entre fases com validação de etapas

### Sprint 2 — Fator Surpresa e Admin (/pbl-surprise)
- [ ] Hook `useSurprise` com `onSnapshot` em `admin_triggers/surprise`
- [ ] Integrar listener no layout `/(student)/layout.tsx`
- [ ] Modal bloqueante do Fator Surpresa (z-index máximo, cores piscantes)
- [ ] Input "CIENTE" com validação para fechar o modal
- [ ] Gravar `surpriseAcknowledged` no Firestore ao confirmar
- [ ] Tela 9: Painel Admin com lista de alunos em tempo real
- [ ] Botão "Disparar Fator Surpresa" no painel admin
- [ ] Visualização de PDF e links de cada aluno no admin

### Sprint 3 — Repositórios Java (/pbl-java)
- [ ] Gerar arquivos `.java` para Repo 1: Ligas Esportivas
- [ ] Gerar arquivos `.java` para Repo 2: Obras e Empreendimentos
- [ ] Gerar arquivos `.java` para Repo 3: Logística e Roteamento
- [ ] Validar bugs intencionais: God Class, Feature Envy, Long Method, Data Class, Long Parameter List, erro de Associação/Agregação

### Sprint 4 — Testes E2E
- [ ] Teste E2E: fluxo completo do aluno (login → perfil → todas as fases → entrega)
- [ ] Teste E2E: fluxo do professor (login admin → painel → disparar surpresa)
- [ ] Teste E2E: Fator Surpresa aparece e bloqueia corretamente
- [ ] Teste E2E: sorteio de repositório persiste após refresh

## Em andamento

- [ ]

## Concluído

### Sprint 0 — Setup (/pbl-init) ✅
- [x] Inicializar projeto Next.js com App Router e TypeScript
- [x] Configurar Tailwind CSS
- [x] Configurar Firebase SDK (Auth, Firestore, Storage) em `/src/lib/firebase.ts`
- [x] Criar `.env.local` com credenciais do projeto `pooessentialacademy`
- [x] Criar middleware de proteção de rotas
- [x] Criar estrutura de route groups `(student)` e `admin`
- [x] Criar services: `users`, `submissions`, `admin`, `storage`
- [x] Criar stores Zustand: `auth.store`, `surprise.store`
- [x] Criar hooks: `useAuth`, `useSurprise`, `useSubmission`
- [x] Configurar Playwright para E2E
- [x] Todas as 9 telas implementadas (Login, Perfil, Onboarding, Fases 1-5, Admin)
- [x] SurpriseModal com input "CIENTE"
- [x] Build ✓ | Lint ✓
