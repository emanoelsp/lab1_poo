# Design System

## Estilo visual

- Interface moderna, limpa, responsiva e minimalista
- Boa hierarquia visual e espaçamento consistente

## UI stack

- Tailwind CSS
- shadcn/ui
- lucide-react para ícones

## Regras de UI

- Usar shadcn/ui como base. Não criar componentes do zero se existir equivalente.
- Componentes devem ser acessíveis.
- Layout mobile-first.
- Usar cards, tabs, dialogs e forms de forma consistente.

## Estados obrigatórios

Todo componente que faz requisição deve ter:

| Estado | Implementação |
|--------|---------------|
| `loading` | Skeleton UI — nunca spinner genérico |
| `empty` | Mensagem clara com ação sugerida |
| `error` | Mensagem específica e acionável |
| `success` | Feedback positivo visível |

## Padrão visual

- Bordas arredondadas, sombras leves, espaçamento generoso
- Tipografia clara com hierarquia definida
- Botões com feedback visual (hover, active, disabled)
- Formulários simples e sem fricção

---

## Mobile UX (obrigatório para qualquer tela mobile)

### Thumb Zone

- CTAs e ações primárias ficam nos **dois terços inferiores** da tela.
- Cantos superiores: navegação secundária, cabeçalhos ou ações destrutivas/raras.

### Touch Targets

- Mínimo de **44×44pt (iOS)** / **48×48dp (Android)** para qualquer elemento clicável.
- Espaçamento mínimo entre botões adjacentes para evitar toques acidentais.

### Interações

- Usar **toast com "Desfazer"** para ações não destrutivas — não interromper o fluxo com dialogs de confirmação.
- Nunca empilhar modais. Apenas um contexto modal por vez.

### Formulários

- `type="tel"` para telefone, `type="email"` para e-mail, `inputMode="numeric"` para valores monetários/numéricos.
- Validação no evento `blur` ou no submit — nunca a cada tecla.
- Mensagens de erro específicas: diga exatamente o que o usuário deve corrigir.

---

## Acessibilidade (WCAG 2.2 mínimos)

- Contraste mínimo de **4.5:1** para textos normais.
- Fonte mínima de **14px** em mobile.
- `aria-label` ou `alt` em todos os ícones e imagens interativas.
- Suporte a redimensionamento de fonte do sistema operacional.
