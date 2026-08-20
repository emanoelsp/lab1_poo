---
name: pbl-surprise
description: Implementa o Fator Surpresa em tempo real (onSnapshot Firestore) com modal bloqueante, e o Painel Administrativo do professor (Tela 9). Execute após /pbl-screens.
---

# /pbl-surprise — Fator Surpresa e Painel Admin

Leia `CLAUDE.md` e `docs/ARCHITECTURE.md` antes de começar.

---

## 1. Hook `useSurprise` — `/src/hooks/useSurprise.ts`

```typescript
// Escuta admin_triggers/surprise em tempo real
// Retorna: { isActive: boolean, message: string }
// Ao montar: onSnapshot(doc(db, 'admin_triggers', 'surprise'), ...)
// Ao desmontar: unsubscribe()
```

- Usar `onSnapshot` do Firebase Firestore
- Atualizar `surprise.store` do Zustand ao receber mudança
- Não fazer nenhuma chamada de rede adicional — apenas ouvir

---

## 2. Integração no layout do aluno — `/(student)/layout.tsx`

```typescript
'use client'

// Montar useSurprise aqui — layout persiste entre navegações
// Renderizar <SurpriseModal /> condicionalmente baseado em isActive
// O modal deve ficar acima de QUALQUER conteúdo da página
```

---

## 3. Componente `SurpriseModal` — `/src/components/surprise-modal/index.tsx`

**Comportamento:**
- Renderizar quando `isActive === true` no store
- `position: fixed`, `inset: 0`, `z-index: 9999`
- SEM botão de fechar "X"
- SEM clique fora para fechar

**Visual (escandaloso e urgente):**
```
Fundo: vermelho escuro (#7f1d1d) com borda amarela piscante (animate-pulse)
Header: ⚠️ ATENÇÃO — FATOR SURPRESA ⚠️ (texto amarelo, font-bold, text-2xl)
Ícone de alerta piscando (lucide: AlertTriangle com animate-bounce)
Mensagem do cliente: texto branco em destaque
Cronômetro visual: tempo desde o disparo (opcional, aumenta urgência)
```

**Input de confirmação:**
```
Label: 'Digite "CIENTE" para confirmar que você leu e entendeu'
Input controlado: validação case-sensitive ("CIENTE" exato)
Botão "Confirmar": desabilitado até input === "CIENTE"
```

**Ao confirmar:**
1. Chamar `submissions.service.acknowledgeSuprise(uid)`
2. Gravar `surpriseAcknowledged: true` e `acknowledgedAt: Timestamp` em `submissions/{uid}`
3. Fechar modal: `surprise.store.dismiss()`
4. Toast: "Confirmação registrada. Adapte seu plano agora!"

---

## 4. Store `surprise.store.ts` — `/src/stores/surprise.store.ts`

```typescript
{
  isActive: boolean
  message: string
  setSurprise: (isActive: boolean, message: string) => void
  dismiss: () => void   // só fecha localmente, não altera Firestore
}
```

---

## 5. Painel Administrativo — `/admin/dashboard/page.tsx`

Client Component protegido (role: `admin`).

### Seção A — Disparar Fator Surpresa

```
Botão vermelho gigante: "🚨 DISPARAR FATOR SURPRESA"
Textarea: mensagem da nova regra/feature do "cliente"
Ao clicar: admin.service.triggerSurprise(message)
  → atualiza admin_triggers/surprise { isActive: true, message, activatedAt: now() }
Feedback: "Surpresa disparada! Todos os alunos receberão o alerta."
```

### Seção B — Lista de Alunos em Tempo Real

Usar `onSnapshot` em `users` (onde `role === 'student'`).

**Tabela de alunos:**

| Grupo / Integrantes | Repo | Story Points | MoSCoW | GitHub | PDF | Surpresa |
|---|---|---|---|---|---|---|
| João, Maria | 2 — Obras | 34 → 55 | Preenchido | 🔗 Link | 📄 Ver | ✅ Ciente |

- Clicar em "📄 Ver" → abrir PDF do Firebase Storage em nova aba
- Clicar em "🔗 Link" → abrir repositório GitHub em nova aba
- Status de surpresa: ✅ Ciente / ⏳ Pendente / — (não disparada)
- Ordenar por: nome do grupo, status de entrega

### Seção C — Resumo da Turma

- Total de alunos: X
- Entregas completas: Y
- Surpresa confirmada: Z / X

---

## 6. `admin.service.ts` — funções necessárias

```typescript
// triggerSurprise(message: string): Promise<void>
//   → setDoc(doc(db, 'admin_triggers', 'surprise'), { isActive: true, message, activatedAt: serverTimestamp() })

// getAllStudents(): Promise<User[]>
//   → query(collection(db, 'users'), where('role', '==', 'student'))

// getSubmissionByUid(uid: string): Promise<Submission | null>
//   → getDoc(doc(db, 'submissions', uid))
```

---

## 7. Testes E2E — `playwright/tests/`

### `student.spec.ts` — fluxo do aluno
```
1. Login com credencial de aluno
2. Completar perfil (verificar que assignedRepoId é gravado)
3. Navegar por todas as fases em ordem
4. Verificar que repositório sorteado não muda ao recarregar página
5. Preencher Story Points e MoSCoW
6. Upload de PDF de teste
7. Finalizar entrega
8. Verificar que submissão aparece no Firestore
```

### `admin.spec.ts` — fluxo do professor
```
1. Login com credencial de admin
2. Verificar que painel lista alunos
3. Disparar Fator Surpresa com mensagem de teste
4. Verificar que admin_triggers/surprise.isActive === true no Firestore
5. (Opcional) Abrir sessão paralela como aluno e verificar que modal aparece
```

### `surprise.spec.ts` — Fator Surpresa
```
1. Login como aluno
2. (Simular) Alterar admin_triggers/surprise.isActive para true
3. Verificar que modal aparece em menos de 2 segundos
4. Verificar que modal não fecha sem digitar "CIENTE"
5. Digitar "CIENTE" e confirmar
6. Verificar que submissions/{uid}.surpriseAcknowledged === true
```

---

## Verificação

```bash
npm run build
npm run test:e2e
```

Atualizar TASKS.md marcando Sprint 2 como concluído.
