---
name: pbl-init
description: Inicializa a base do sistema PBL — Next.js (App Router) + Tailwind CSS + Firebase (Auth, Firestore, Storage), middleware de rotas, services, stores e Playwright. Execute esta skill uma única vez no início do projeto.
---

# /pbl-init — Inicialização da Stack

Leia `CLAUDE.md`, `docs/ARCHITECTURE.md` e `docs/TASKS.md` antes de começar.

## Passos

### 1. Projeto Next.js

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 2. Dependências

```bash
npm install firebase zod react-hook-form @hookform/resolvers zustand lucide-react
npm install -D playwright @playwright/test
npx shadcn@latest init
```

### 3. Firebase SDK — `/src/lib/firebase.ts`

Criar o arquivo lendo as variáveis de ambiente `NEXT_PUBLIC_FIREBASE_*` do `.env.local`.
Exportar: `app`, `auth`, `db` (Firestore), `storage`.

### 4. Variáveis de ambiente

Criar `.env.local` a partir de `.env.example` com os valores do projeto `pooessentialacademy`:
- apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId

### 5. Middleware de proteção — `/middleware.ts`

Regras:
- `/login` → redireciona para `/onboarding` se já autenticado com role `student`
- `/(student)/*` → exige auth + role `student`; sem perfil → redireciona para `/profile`
- `/admin/*` → exige auth + role `admin`

### 6. Estrutura de route groups

```
/src/app
  /login/page.tsx
  /(student)/layout.tsx         ← listener onSnapshot do Fator Surpresa aqui
  /(student)/profile/page.tsx
  /(student)/onboarding/page.tsx
  /(student)/phase1-estimation/page.tsx
  /(student)/phase2-uml/page.tsx
  /(student)/phase3-repository/page.tsx
  /(student)/phase4-moscow/page.tsx
  /(student)/phase5-delivery/page.tsx
  /admin/dashboard/page.tsx
```

### 7. Services — `/src/services/`

Criar 4 services (nunca acessar Firestore em componentes):

**`users.service.ts`**
- `getUserById(uid)` → lê `users/{uid}`
- `createProfile(uid, data)` → cria perfil + sorteia `assignedRepoId` (1-3) apenas se `profileCompleted === false`
- `updateProfile(uid, data)` → atualiza campos

**`submissions.service.ts`**
- `getSubmission(uid)` → lê `submissions/{uid}`
- `saveInitialStoryPoints(uid, points)` → grava `initialStoryPoints`
- `saveFinalStoryPoints(uid, points)` → grava `finalStoryPoints`
- `saveMoscow(uid, matrix, justification)` → grava `moscowMatrix`
- `finalizeSubmission(uid, data)` → grava `githubLink`, `pdfUrl`, `submittedAt`
- `acknowledgeSuprise(uid)` → grava `surpriseAcknowledged: true`

**`admin.service.ts`**
- `getAllStudents()` → lista todos os `users` com role `student`
- `triggerSurprise(message)` → atualiza `admin_triggers/surprise` com `isActive: true`
- `getSubmissionByUid(uid)` → lê `submissions/{uid}` para o admin

**`storage.service.ts`**
- `uploadPdf(uid, file)` → faz upload em `submissions/{uid}/proof.pdf`, retorna URL

### 8. Hooks — `/src/hooks/`

**`useAuth.ts`** — onAuthStateChanged, retorna `{ user, role, loading }`
**`useSurprise.ts`** — onSnapshot em `admin_triggers/surprise`, retorna `{ isActive, message }`
**`useSubmission.ts`** — lê e atualiza `submissions/{uid}`

### 9. Stores Zustand — `/src/stores/`

**`auth.store.ts`** — `{ user, role, setUser, clearUser }`
**`surprise.store.ts`** — `{ isActive, message, setSuprise, dismiss }`

### 10. Playwright — configuração inicial

```bash
npx playwright install --with-deps chromium
```

Criar `playwright.config.ts` com `baseURL: http://localhost:3000`.

### 11. Verificação

```bash
npm run dev          # deve subir sem erros
npm run build        # deve compilar sem erros de TypeScript
npm run lint         # deve passar sem warnings
```

### 12. Atualizar TASKS.md

Marcar todas as tarefas do Sprint 0 como concluídas.
