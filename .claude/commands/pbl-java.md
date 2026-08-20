---
name: pbl-java
description: Gera os 3 repositórios Java legados com falhas arquiteturais propositais (God Class, Feature Envy, Long Method, Data Class, Long Parameter List, erros de Associação/Agregação) para os alunos auditarem. Respeita a ementa: sem extends, sem implements, sem polimorfismo.
---

# /pbl-java — Repositórios Java Legados

Leia `CLAUDE.md` antes de começar. As restrições de ementa são absolutas.

## Restrições de ementa (PROIBIDO em todo código gerado)

- `extends` (herança)
- `implements` (interfaces)
- Padrões de Projeto: Strategy, State, Observer, etc.
- Menção a polimorfismo, Liskov, classes abstratas, override

**Regra de Ouro:** Toda refatoração correta usa apenas extração de classes, delegação de métodos e ajuste de Associações/Agregações.

---

## Bugs intencionais obrigatórios em cada repositório

| Code Smell | Obrigação |
|---|---|
| God Class | 1 classe central que faz tudo, viola SRP |
| Feature Envy | 1 método que acessa atributos de outra classe repetidamente |
| Long Parameter List | 1 construtor ou método com 8+ parâmetros primitivos |
| Data Class (Classe Anêmica) | 1 entidade só com atributos, lógica vazou para o gerenciador |
| Erro de Associação/Agregação | 1 bug lógico grave envolvendo vínculo entre objetos |
| Long Method | 1 método longo com loops `for` aninhados para busca |
| Força bruta if/else | Cadeias de if/else onde deveria haver delegação para classes |

**Comentários sutis de dev júnior** obrigatórios (ex: `// TODO: o chefe pediu pra ver isso, acho que tá certo`).

---

## Repositório 1 — Gestão de Ligas Esportivas

**GitHub:** https://github.com/emanoelsp/lab1_poo1.git
**Foco de POO:** Associação de Jogadores e Times (1:1, 1:N)

### Estrutura de classes

```
Jogador.java         → Data Class anêmica (só atributos: nome, idade, salario, timeAtual)
Time.java            → classe com lista de Jogador, métodos básicos
LigaGerenciadora.java → GOD CLASS — faz tudo
Main.java            → ponto de entrada com casos de teste
```

### Bug lógico grave (Associação)
Método `transferirJogador(Jogador j, Time destino)` em `LigaGerenciadora`:
- Adiciona o jogador em `destino.jogadores`
- **ESQUECE** de remover de `timeAtual` (jogador fica em dois times)
- Comentário: `// TODO: verificar se precisa tirar do time antigo, acho que não`

### God Class — `LigaGerenciadora`
Métodos que devem existir nela (viola SRP):
- `calcularSaldoFinanceiro(Time t)` → acessa `j.salario` de cada Jogador diretamente (Feature Envy)
- `sortearPartida(Time a, Time b)` → lógica de sorteio misturada com log
- `calcularEstatisticasTemporada()` → loop aninhado sobre todos os times e jogadores
- `gerarRelatorioFinal()` → formata strings, calcula médias, imprime tudo
- `verificarElegibilidade(Jogador j)` → acessa 5+ atributos de `Jogador` diretamente

### Feature Envy
`calcularSaldoFinanceiro(Time t)` em `LigaGerenciadora` acessa `j.nome`, `j.salario`, `j.posicao`, `j.idade` diretamente em vez de delegar para `Time.calcularFolha()`.

### Long Parameter List
Construtor de `Jogador`: `new Jogador(String nome, int idade, double salario, String posicao, String nacionalidade, int numeroCamisa, boolean titular, double alturaMetros)`

### Long Method
`calcularEstatisticasTemporada()` com `for` aninhado: para cada time → para cada jogador → verificar condições com if/else em cascata.

### Força bruta if/else
`gerarRelatorioFinal()` com cadeia de if/else para determinar classificação em vez de delegar para uma classe `Classificador`.

---

## Repositório 2 — Gestão de Obras e Empreendimentos

**GitHub:** https://github.com/emanoelsp/lab1_poo2
**Foco de POO:** Agregação de Materiais em Obras

### Estrutura de classes

```
Material.java        → Data Class anêmica (nome, quantidade, precoPorUnidade)
Obra.java            → agrega lista de Material, tem Sobrado
Sobrado.java         → entidade simples
GerenciadorObra.java → GOD CLASS
Main.java
```

### Bug lógico grave (Agregação)
Método `cancelarObra(Obra o)` em `GerenciadorObra`:
- Remove a Obra da lista de obras ativas
- **Deleta em cascata os objetos Material** (chama `material = null` na lista)
- Bug: materiais deveriam retornar ao almoxarifado — são Agregação, não Composição
- Comentário: `// TODO: o material some junto né? acho que sim`

### God Class — `GerenciadorObra`
- `calcularCustoTotal(Obra o)` → acessa `m.precoPorUnidade * m.quantidade` direto em `Material` (Feature Envy)
- `gerarOrcamento(String nome, double area, int andares, int comodos, String tipo, String endereco, double prazo, double orcamentoMaximo)` → Long Parameter List (8 params)
- `verificarEstoqueMinimo()` → loop aninhado sobre obras e materiais
- `emitirRelatorioGeral()` → formata e imprime tudo

### Long Method
`verificarEstoqueMinimo()` com loops aninhados e if/else para cada tipo de material.

### Força bruta if/else
Verificação de tipo de obra: `if (tipo.equals("residencial")) ... else if (tipo.equals("comercial")) ... else if (tipo.equals("industrial"))...` com dezenas de linhas em cada bloco.

---

## Repositório 3 — Logística e Roteamento

**GitHub:** https://github.com/emanoelsp/lab1_poo3
**Foco de POO:** SRP e delegação de cálculos de carga

### Estrutura de classes

```
Carga.java           → Data Class anêmica (tipo, peso, volume, destino, status)
Caminhao.java        → tem lista de Carga, atributos básicos
GerenciadorLogistica.java → GOD CLASS
Main.java
```

### Bug lógico grave (Transição de estados inválida)
Método `finalizarEntrega(Carga c)` em `GerenciadorLogistica`:
- Marca `c.status = "Concluída"` sem verificar se o status atual é "Em Trânsito"
- Permite transições inválidas: de "Aguardando" ou "Cancelada" direto para "Concluída"
- Comentário: `// TODO: checar o status antes? acho que dá pra fazer direto`

Estados válidos (que os alunos devem identificar):
```
Aguardando → Carregando → Em Trânsito → Concluída
                                      ↘ Cancelada (só de "Aguardando" ou "Em Trânsito")
```

### God Class — `GerenciadorLogistica`
- `calcularRotaOtima()` → Long Method com loops aninhados `for` sobre caminhões e cargas
- `calcularCapacidadeDisponivel(Caminhao c)` → acessa `c.capacidadeMaxima`, `carga.peso`, `carga.volume` diretamente (Feature Envy)
- `alocarCarga(String tipo, double peso, double volume, String destino, int prioridade, String cliente, double valorDeclarado, String dataLimite)` → Long Parameter List (8 params)
- `emitirManifesto()` → formata e imprime tudo

### Long Method
`calcularRotaOtima()` com dois `for` aninhados, `if/else` para prioridade e condições de capacidade — método com mais de 60 linhas.

### Força bruta if/else
Verificação de prioridade de carga: `if (prioridade == 1) ... else if (prioridade == 2) ... else if (prioridade == 3)...` em vez de delegação a uma classe `PriorizadorCarga`.

---

## Como gerar os arquivos

Para cada repositório:
1. Criar pasta local com o nome do domínio
2. Gerar todos os arquivos `.java` com os bugs acima
3. Garantir que o código **compila** (`javac *.java` sem erros)
4. Garantir que o **Main.java** demonstra os bugs em execução
5. Adicionar `README.md` com: descrição do sistema, como compilar e executar

### Compilação e teste local

```bash
# Compilar
javac -d bin src/*.java

# Executar
java -cp bin Main
```

O código deve compilar sem erros mas falhar nas regras de negócio quando executado.

---

## Verificação

- [ ] Repositório 1 compila sem erros
- [ ] Repositório 2 compila sem erros
- [ ] Repositório 3 compila sem erros
- [ ] Cada repo tem: God Class, Feature Envy, Long Parameter List, Data Class, bug de Associação/Agregação, Long Method, força bruta
- [ ] Nenhum arquivo usa `extends` ou `implements`
- [ ] Comentários de dev júnior presentes em cada bug principal

Atualizar TASKS.md marcando Sprint 3 como concluído.
