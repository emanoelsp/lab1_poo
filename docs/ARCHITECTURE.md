# Arquitetura

## Stack principal

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14+ (App Router) + TypeScript |
| Estilo | Tailwind CSS + shadcn/ui |
| Auth | Firebase Auth |
| Banco | Firestore |
| Storage | Firebase Storage |
| Deploy | Vercel |
| Testes E2E | Playwright |

**Projeto Firebase:** `pooessentialacademy`
**Auth Domain:** `pooessentialacademy.firebaseapp.com`

## Estrutura de pastas

```
/src
  /app
    /login                    → página de login
    /(student)                → route group protegido (role: student)
      layout.tsx              → layout com listener onSnapshot do Fator Surpresa
      /profile
      /onboarding
      /phase1-estimation
      /phase2-uml
      /phase3-repository
      /phase4-moscow
      /phase5-delivery
    /admin                    → route group protegido (role: admin)
      /dashboard
  /components
    /ui                       → shadcn/ui
    /shared                   → componentes reutilizáveis
    /surprise-modal           → modal do Fator Surpresa (isolado)
  /lib
    firebase.ts               → inicialização do Firebase SDK
    auth.ts                   → helpers de autenticação
  /services
    users.service.ts          → CRUD de users no Firestore
    submissions.service.ts    → CRUD de submissions no Firestore
    admin.service.ts          → controle de admin_triggers
    storage.service.ts        → upload de PDFs no Firebase Storage
  /hooks
    useAuth.ts                → hook de autenticação e role
    useSurprise.ts            → hook do onSnapshot do Fator Surpresa
    useSubmission.ts          → hook de leitura/escrita de submissions
  /schemas
    profile.schema.ts         → Zod: perfil do aluno
    submission.schema.ts      → Zod: dados de entrega
    moscow.schema.ts          → Zod: matriz MoSCoW
  /types
    user.types.ts
    submission.types.ts
  /stores
    auth.store.ts             → Zustand: usuário autenticado
    surprise.store.ts         → Zustand: estado do modal Fator Surpresa
/playwright
  /tests
    student.spec.ts           → fluxo completo do aluno (E2E)
    admin.spec.ts             → fluxo do professor (E2E)
/docs
```

## Modelos Firestore

### `users/{uid}`
```typescript
{
  uid: string
  email: string
  displayName: string
  role: 'student' | 'admin'
  groupMembers: string[]       // nomes dos integrantes
  assignedRepoId: 1 | 2 | 3   // sorteado na criação do perfil
  profileCompleted: boolean
  createdAt: Timestamp
}
```

### `submissions/{uid}`
```typescript
{
  initialStoryPoints: Record<string, number>  // { featureId: points }
  finalStoryPoints:   Record<string, number>
  moscowMatrix: {
    must:   string[]
    should: string[]
    could:  string[]
    wont:   string[]
  }
  moscowJustification: string
  githubLink: string
  pdfUrl: string
  surpriseAcknowledged: boolean
  submittedAt: Timestamp
}
```

### `admin_triggers/surprise`
```typescript
{
  isActive: boolean
  message: string
  activatedAt: Timestamp
}
```

## Proteção de rotas

Usar middleware do Next.js (`middleware.ts`) verificando o token Firebase:
- `/login` → redireciona para `/onboarding` se já autenticado
- `/(student)/*` → exige autenticação + `role === 'student'`
- `/admin/*` → exige autenticação + `role === 'admin'`
- Redirecionar `student` sem perfil para `/profile`

## Regras técnicas

- Nunca acessar Firestore diretamente em componentes — usar `/src/services/`
- Centralizar SDK Firebase em `/src/lib/firebase.ts`
- Server Components para páginas estáticas (onboarding, UML)
- Client Components apenas onde houver estado interativo
- Validar dados com Zod antes de qualquer escrita no Firestore
- Variáveis de ambiente: todas as chaves Firebase via `NEXT_PUBLIC_*` no `.env.local`
