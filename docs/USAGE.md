# USAGE.md

## Guia de Uso do Tab Domain Executor

---

## 📋 Visão Geral

Este documento descreve **como usar** a extensão Tab Domain Executor do ponto de vista do usuário final. Cada fluxo de interação é documentado passo a passo com exemplos visuais e cenários práticos.

---

## 🎯 Objetivo da Extensão

O Tab Domain Executor permite que você:
1. Visualize suas abas agrupadas por domínio
2. Selecione um domínio específico
3. Escolha quais janelas serão afetadas
4. Feche abas de forma controlada e deliberada
5. Recupere a última exclusão em até 15 minutos

---

## 🚀 Início Rápido

### Abrir a Extensão

**Método 1**: Clicar no ícone
- Localize o ícone do Tab Domain Executor na barra de ferramentas do Chrome
- Clique uma vez

**Método 2**: Atalho de teclado (se configurado)
- Pressione o atalho definido em `chrome://extensions/shortcuts`

---

## 📖 Fluxos de Uso Completos

---

## FLUXO 1: Primeira Utilização

### Cenário
Você instalou a extensão e quer ver como ela funciona.

### Passo a Passo

#### 1. Prepare Abas de Teste

Abra algumas abas em diferentes domínios:
- 3-4 vídeos do YouTube em diferentes janelas
- 2-3 repositórios do GitHub
- 1-2 documentos do Google Docs
- Alguns sites diversos

**Exemplo**:
```
Janela 1:
- https://www.youtube.com/watch?v=abc
- https://github.com/user/repo1
- https://docs.google.com/document/123

Janela 2:
- https://www.youtube.com/watch?v=def
- https://www.youtube.com/watch?v=ghi
- https://github.com/user/repo2
```

---

#### 2. Abrir a Extensão

Clique no ícone do Tab Domain Executor.

**Tela Inicial**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│                                     │
│  Nenhuma análise foi executada      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Analisar Abas             │ │
│  └───────────────────────────────┘ │
│                                     │
│  (Botão de recuperação aparecerá   │
│   aqui se houver ação recuperável) │
│                                     │
└─────────────────────────────────────┘
```

**Estado**: `INITIAL`

---

#### 3. Analisar Abas

Clique no botão **"Analisar Abas"**.

**Loading**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│                                     │
│  ⏳ Analisando abas...              │
│                                     │
└─────────────────────────────────────┘
```

**Estado**: `LOADING_ANALYSIS`

---

#### 4. Visualizar Domínios

Após 1-2 segundos, a lista de domínios aparece.

**Tela de Domínios**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│  ← Voltar                           │
│                                     │
│  Domínios Encontrados:              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ youtube.com                 │   │
│  │ 3 abas em 2 janelas         │   │
│  │          [Ver detalhes >]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ github.com                  │   │
│  │ 2 abas em 2 janelas         │   │
│  │          [Ver detalhes >]   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ docs.google.com             │   │
│  │ 1 aba em 1 janela           │   │
│  │          [Ver detalhes >]   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Estado**: `DOMAIN_VIEW`

**Nota**: Nesta tela, nenhuma ação destrutiva está disponível.

---

## FLUXO 2: Fechar Abas de Um Domínio (Todas as Janelas)

### Cenário
Você quer fechar TODAS as abas do YouTube, em todas as janelas.

### Passo a Passo

#### 1. Selecionar Domínio

Na tela de domínios, clique em **"Ver detalhes >"** no card `youtube.com`.

**Tela de Seleção de Escopo**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│  ← Voltar                           │
│                                     │
│  Domínio: youtube.com               │
│  3 abas em 2 janelas                │
│                                     │
│  Escolha o escopo:                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   Todas as janelas          │   │
│  │                             │   │
│  │   Fechar 3 abas em 2 janelas│   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   Escolher janelas          │   │
│  │                             │   │
│  │   Selecionar manualmente    │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Estado**: `SCOPE_SELECTION`

---

#### 2. Escolher "Todas as Janelas"

Clique no botão **"Todas as janelas"**.

**Tela de Lista de Abas**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│  ← Voltar                           │
│                                     │
│  youtube.com - Todas as janelas     │
│  3 abas serão afetadas              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎬 Video 1 - YouTube        │   │
│  │ youtube.com/watch?v=abc     │   │
│  │ Janela 1              [Fechar]  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎬 Video 2 - YouTube        │   │
│  │ youtube.com/watch?v=def     │   │
│  │ Janela 2              [Fechar]  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎬 Video 3 - YouTube        │   │
│  │ youtube.com/watch?v=ghi     │   │
│  │ Janela 2              [Fechar]  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Fechar todas as abas      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Estado**: `TAB_ACTION_VIEW`

**Importante**: Agora você pode ver exatamente quais abas serão fechadas.

---

#### 3. Fechar Individualmente (Opcional)

Se quiser fechar apenas uma aba específica:
- Clique no botão **"Fechar"** ao lado da aba desejada
- A aba é fechada imediatamente
- A lista é atualizada (aba removida visualmente)

**Nota**: Fechamento individual NÃO é recuperável.

---

#### 4. Fechar Todas

Para fechar todas as abas de uma vez:
- Clique no botão **"Fechar todas as abas"** no final da lista

**Loading**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│                                     │
│  ⏳ Fechando 3 abas...              │
│                                     │
└─────────────────────────────────────┘
```

**Estado**: `EXECUTING_ACTION`

---

#### 5. Feedback de Sucesso

Após fechamento bem-sucedido:

```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│                                     │
│  ✅ 3 abas fechadas com sucesso!    │
│                                     │
│  Você pode recuperar esta ação      │
│  nos próximos 15 minutos.           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Voltar ao início          │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Estado**: `ACTION_FEEDBACK`

**Resultado**: As 3 abas do YouTube foram fechadas em ambas as janelas.

---

## FLUXO 3: Fechar Abas de Janelas Específicas

### Cenário
Você tem 5 abas do GitHub em 3 janelas diferentes, mas quer fechar apenas as da Janela 1 e Janela 3.

### Passo a Passo

#### 1. Selecionar Domínio

Clique em **"Ver detalhes >"** no card `github.com`.

---

#### 2. Escolher "Escolher Janelas"

Na tela de seleção de escopo, clique em **"Escolher janelas"**.

**Tela de Seleção de Janelas**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│  ← Voltar                           │
│                                     │
│  github.com - Escolher janelas      │
│  Selecione as janelas:              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☐ Janela 1                  │   │
│  │   2 abas de github.com      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☐ Janela 2                  │   │
│  │   1 aba de github.com       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☐ Janela 3                  │   │
│  │   2 abas de github.com      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Continuar              │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Estado**: `WINDOW_SELECTION`

---

#### 3. Selecionar Janelas

Clique nas checkboxes das Janelas 1 e 3:

```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│  ← Voltar                           │
│                                     │
│  github.com - Escolher janelas      │
│  Selecione as janelas:              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☑ Janela 1                  │   │ ← SELECIONADA
│  │   2 abas de github.com      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☐ Janela 2                  │   │
│  │   1 aba de github.com       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ☑ Janela 3                  │   │ ← SELECIONADA
│  │   2 abas de github.com      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Continuar (4 abas)     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Nota**: O botão "Continuar" agora mostra quantas abas serão afetadas (4 abas).

---

#### 4. Continuar

Clique em **"Continuar"**.

**Tela de Lista de Abas (Filtrada)**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│  ← Voltar                           │
│                                     │
│  github.com - Janelas 1, 3          │
│  4 abas serão afetadas              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📁 Repository A - GitHub    │   │
│  │ github.com/user/repo-a      │   │
│  │ Janela 1              [Fechar]  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📁 Repository B - GitHub    │   │
│  │ github.com/user/repo-b      │   │
│  │ Janela 1              [Fechar]  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📁 Repository C - GitHub    │   │
│  │ github.com/user/repo-c      │   │
│  │ Janela 3              [Fechar]  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 📁 Repository D - GitHub    │   │
│  │ github.com/user/repo-d      │   │
│  │ Janela 3              [Fechar]  │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Fechar todas as abas      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Importante**: Apenas as abas das Janelas 1 e 3 são exibidas. A aba da Janela 2 NÃO aparece.

---

#### 5. Fechar Todas

Clique em **"Fechar todas as abas"**.

**Resultado**: 
- 4 abas do GitHub são fechadas (Janelas 1 e 3)
- A aba da Janela 2 permanece aberta
- Feedback de sucesso é exibido

---

## FLUXO 4: Recuperar Última Exclusão

### Cenário
Você fechou 10 abas do YouTube por engano e quer recuperá-las.

### Passo a Passo

#### 1. Realizar Fechamento em Lote

Siga os passos do **FLUXO 2** para fechar abas em lote.

**Feedback**:
```
✅ 10 abas fechadas com sucesso!
Você pode recuperar esta ação nos próximos 15 minutos.
```

---

#### 2. Reabrir a Extensão

Feche o popup e abra novamente clicando no ícone.

**Tela Inicial com Botão de Recuperação**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ⚠️  Recuperação Disponível  │ │
│  │                               │ │
│  │  10 abas podem ser recuperadas│ │
│  │  Tempo restante: 14 min       │ │
│  │                               │ │
│  │  [Recuperar última exclusão]  │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Analisar Abas             │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Nota**: O botão de recuperação só aparece se:
- Há uma ação de fechamento em lote nos últimos 15 minutos
- O TTL ainda não expirou

---

#### 3. Clicar em "Recuperar"

Clique no botão **"Recuperar última exclusão"**.

**Loading**:
```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│                                     │
│  ⏳ Restaurando 10 abas...          │
│                                     │
└─────────────────────────────────────┘
```

---

#### 4. Feedback de Recuperação

```
┌─────────────────────────────────────┐
│  Tab Domain Executor                │
├─────────────────────────────────────┤
│                                     │
│  ✅ 10 abas restauradas com sucesso!│
│                                     │
│  As abas foram recriadas nas        │
│  janelas originais.                 │
│                                     │
│  ┌───────────────────────────────┐ │
│  │     Voltar ao início          │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Resultado**:
- Todas as 10 abas são recriadas
- Cada aba é aberta na janela original
- As abas NÃO são ativadas automaticamente (permanecem em background)
- O log de recuperação é apagado (não pode ser recuperado novamente)

---

#### 5. Verificar Abas Restauradas

Navegue até as janelas originais e verifique que as abas foram recriadas.

**Importante**: 
- As URLs são restauradas
- Os títulos podem demorar a carregar (depende do carregamento da página)
- As abas não mantêm estado de navegação (ex: vídeo pausado em 3:45 volta para 0:00)

---

## FLUXO 5: Expiração de Recuperação

### Cenário
Você fechou abas, mas passaram mais de 15 minutos.

### Comportamento

#### Antes de Expirar (0-15 minutos)

Ao abrir a extensão:
```
┌─────────────────────────────────────┐
│  Recuperação Disponível             │
│  10 abas - 12 min restantes         │
│  [Recuperar]                        │
└─────────────────────────────────────┘
```

---

#### Depois de Expirar (>15 minutos)

Ao abrir a extensão:
```
┌─────────────────────────────────────┐
│  Nenhuma análise foi executada      │
│  [Analisar Abas]                    │
└─────────────────────────────────────┘
```

**Nota**: O botão de recuperação não aparece. O log foi descartado automaticamente.

---

## 🎨 Navegação e Controles

### Botão "Voltar"

Presente em todas as telas exceto a inicial.

**Comportamento**:
- **Na tela de domínios**: Volta para tela inicial
- **Na tela de seleção de escopo**: Volta para tela de domínios
- **Na tela de seleção de janelas**: Volta para tela de seleção de escopo
- **Na tela de lista de abas**: Volta para tela de seleção de escopo (ou janelas)

**Importante**: Clicar em "Voltar" NÃO executa nenhuma ação destrutiva. É sempre seguro.

---

### Fechar o Popup

Você pode fechar o popup a qualquer momento:
- Clicando fora do popup
- Pressionando `Esc`
- Clicando no ícone da extensão novamente

**Comportamento**: 
- Nenhuma ação é executada ao fechar o popup
- Estado é resetado (próxima abertura volta para tela inicial)
- Log de recuperação é mantido em memória no background

---

## ⚠️ Avisos Importantes

### Fechamento Individual vs Em Lote

| Característica | Individual | Em Lote |
|----------------|-----------|---------|
| Botão | "Fechar" ao lado da aba | "Fechar todas as abas" |
| Confirmação | Nenhuma | Nenhuma (fluxo multi-etapas é a confirmação) |
| Recuperável | ❌ NÃO | ✅ SIM (15 minutos) |
| Uso | Remover aba específica | Limpar múltiplas abas |

**Regra de Ouro**: Se você quer poder desfazer, use sempre "Fechar todas as abas", nunca "Fechar" individual.

---

### Limitações da Recuperação

A recuperação **NÃO mantém**:
- Estado de navegação (posição em vídeos, scroll, formulários preenchidos)
- Histórico de navegação da aba
- Sessões de login (pode ser necessário fazer login novamente)

A recuperação **mantém apenas**:
- URL da aba
- Janela original

---

### Recarregar a Extensão

Se você recarregar a extensão em `chrome://extensions`:
- ❌ O log de recuperação é **perdido**
- ❌ Não é possível recuperar abas fechadas antes do reload

**Evite recarregar a extensão se houver ação recuperável pendente**.

---

## 📊 Cenários de Uso Práticos

### Cenário 1: Pesquisa Finalizada

**Situação**: Você estava pesquisando sobre "React Hooks" e abriu 15 artigos diferentes, agora terminou.

**Solução**:
1. Analisar abas
2. Não há domínio comum (vários sites diferentes)
3. Fechar abas manualmente ou usar outra extensão para gerenciar

**Limitação**: Esta extensão agrupa por domínio, não por tema ou busca.

---

### Cenário 2: Limpeza de Vídeos Assistidos

**Situação**: Você assistiu 20 vídeos do YouTube e quer fechar todos.

**Solução**:
1. Analisar abas
2. Selecionar `youtube.com` (20 abas)
3. Escolher "Todas as janelas"
4. Fechar todas as abas
5. **Resultado**: Todas as abas do YouTube fechadas, outros domínios intactos

---

### Cenário 3: Trabalho vs Pessoal

**Situação**: Você tem 10 abas do GitHub em duas janelas: Janela de Trabalho e Janela Pessoal. Quer fechar apenas as de trabalho.

**Solução**:
1. Analisar abas
2. Selecionar `github.com`
3. Escolher "Escolher janelas"
4. Selecionar apenas "Janela de Trabalho"
5. Fechar todas as abas
6. **Resultado**: Abas de trabalho fechadas, abas pessoais intactas

---

### Cenário 4: Erro Acidental

**Situação**: Você fechou 30 abas de documentação por engano.

**Solução**:
1. **Imediatamente** reabrir a extensão
2. Clicar em "Recuperar última exclusão"
3. **Resultado**: Todas as 30 abas restauradas

**Importante**: Fazer isso nos primeiros 15 minutos.

---

## 🔄 Workflow Recomendado

### Para Limpeza Regular

1. **Semanal**: Analisar abas e identificar domínios com muitas abas
2. **Avaliar**: Verificar se ainda precisa das abas
3. **Fechar**: Usar "Todas as janelas" para domínios não essenciais
4. **Manter**: Deixar abas importantes abertas

---

### Para Projetos Específicos

1. **Início do Projeto**: Abrir janela dedicada
2. **Durante**: Acumular abas relacionadas ao projeto
3. **Fim do Projeto**: Fechar todas as abas daquela janela específica usando "Escolher janelas"

---

## ❓ Perguntas Frequentes

### P: Posso recuperar múltiplas ações?

**R**: Não. Apenas a última ação em lote é recuperável. Se você fechar abas do YouTube, depois fechar abas do GitHub, só poderá recuperar as do GitHub (a última).

---

### P: E se eu fechar abas individuais e depois em lote?

**R**: Apenas o fechamento em lote será recuperável. Fechamentos individuais são imediatos e não recuperáveis.

---

### P: Posso aumentar o tempo de recuperação?

**R**: Não. O TTL de 15 minutos é fixo e não configurável (por design).

---

### P: A extensão fecha abas automaticamente?

**R**: **Nunca**. Toda ação requer clique explícito do usuário.

---

### P: Posso exportar a lista de abas antes de fechar?

**R**: Não. Esta funcionalidade está fora do escopo da extensão (veja SCOPE.md).

---

### P: A extensão funciona em modo anônimo?

**R**: Depende das permissões concedidas. Por padrão, extensões não funcionam em janelas anônimas a menos que explicitamente permitido em `chrome://extensions`.

---

## ✅ Checklist de Uso Correto

Antes de fechar abas em lote:

- [ ] Analisei as abas e vi os domínios
- [ ] Selecionei o domínio correto
- [ ] Escolhi o escopo apropriado (todas janelas ou específicas)
- [ ] Revisei a lista final de abas
- [ ] Confirmei que quero fechar TODAS as abas listadas
- [ ] Estou ciente que tenho 15 minutos para recuperar
- [ ] Cliquei em "Fechar todas as abas"

---

## 🎓 Dicas de Uso Avançado

### Dica 1: Verificação Antes de Fechar

Antes de clicar em "Fechar todas", role a lista completa de abas para ter certeza de que não há abas importantes.

---

### Dica 2: Fechar Gradualmente

Se você tem dúvidas, feche abas individualmente primeiro. Depois, use "Fechar todas" apenas para as que sobraram.

---

### Dica 3: Recuperação Preventiva

Se você fechou abas e tem dúvida, teste a recuperação imediatamente. Depois, feche novamente se não precisar mais.

---

### Dica 4: Organização por Janelas

Mantenha projetos/contextos em janelas separadas. Isso facilita usar "Escolher janelas" para limpar contextos específicos.

---

**Próximo**: Leia [TEST_EXAMPLES.md](./TEST_EXAMPLES.md) para ver exemplos conceituais de testes e cenários críticos.
