# SCOPE.md

## Definição de Escopo do Projeto

---

## 📋 Propósito Deste Documento

Este documento define **explicitamente** o que está dentro e fora do escopo do Tab Domain Executor. Ele serve como referência definitiva para decisões de desenvolvimento, evitando scope creep e mantendo o foco do projeto.

---

## ✅ O Que o Projeto FAZ

### 1. Análise de Abas sob Demanda

**O sistema:**
- ✅ Coleta todas as abas abertas quando o usuário clica em "Analisar Abas"
- ✅ Associa cada aba à sua janela de origem
- ✅ Normaliza URLs para extrair o domínio base (ex: `https://www.youtube.com/watch?v=123` → `youtube.com`)
- ✅ Agrupa abas exclusivamente por domínio base

**O sistema NÃO:**
- ❌ Analisa abas automaticamente ao abrir a extensão
- ❌ Monitora abas em tempo real
- ❌ Mantém cache persistente de abas

---

### 2. Visualização de Domínios

**O sistema:**
- ✅ Exibe cards de domínios com:
  - Nome do domínio base
  - Quantidade total de abas daquele domínio
  - Número de janelas que contêm abas daquele domínio
- ✅ Permite navegação para o detalhamento de um domínio específico
- ✅ Mostra apenas informações de leitura neste nível

**O sistema NÃO:**
- ❌ Permite ações destrutivas na visualização de domínios
- ❌ Agrupa por subdomínios (ex: `docs.google.com` vs `drive.google.com` são tratados como domínios diferentes)
- ❌ Agrupa por caminhos de URL (ex: `/admin/` vs `/user/`)
- ❌ Fornece filtros ou buscas neste nível

---

### 3. Seleção de Escopo por Janelas

**O sistema:**
- ✅ Oferece duas opções explícitas após selecionar um domínio:
  - "Todas as janelas"
  - "Escolher janelas"
- ✅ Se "Todas as janelas": avança direto para a lista de abas
- ✅ Se "Escolher janelas": exibe cards de janelas mostrando:
  - Identificador ou título da janela
  - Quantidade de abas daquele domínio naquela janela
- ✅ Permite seleção múltipla de janelas
- ✅ Permite navegação de volta para refazer a escolha

**O sistema NÃO:**
- ❌ Seleciona janelas automaticamente baseado em heurísticas
- ❌ Sugere quais janelas selecionar
- ❌ Permite seleção de abas individuais neste estágio
- ❌ Permite edição de janelas ou abas

---

### 4. Listagem Final de Abas

**O sistema:**
- ✅ Exibe todas as abas dentro do escopo definido (domínio + janelas selecionadas)
- ✅ Mostra para cada aba:
  - Título da aba
  - URL completa
  - Ícone/favicon (se disponível)
  - Botão individual "Fechar aba"
- ✅ Exibe no final da lista um botão "Fechar todas as abas"
- ✅ Executa fechamento individual quando o usuário clica em "Fechar aba"
- ✅ Executa fechamento em lote quando o usuário clica em "Fechar todas as abas"

**O sistema NÃO:**
- ❌ Permite edição de URLs
- ❌ Permite reordenação de abas
- ❌ Mostra preview de conteúdo das abas
- ❌ Permite exportação de lista de abas
- ❌ Salva listas de abas para uso futuro

---

### 5. Execução de Ações Destrutivas

**O sistema:**
- ✅ Fecha abas individuais imediatamente ao clicar no botão individual
- ✅ Fecha todas as abas do escopo ao clicar em "Fechar todas as abas"
- ✅ Armazena em memória (não persistente) os dados da última ação em lote:
  - URLs das abas fechadas
  - windowId original de cada aba
  - Timestamp da ação
- ✅ Define um TTL de 15 minutos para o log de recuperação
- ✅ Exibe feedback visual após a execução
- ✅ Informa ao usuário sobre a possibilidade de recuperação

**O sistema NÃO:**
- ❌ Pede confirmação adicional ("Tem certeza?") - o fluxo multi-etapas já é a confirmação
- ❌ Permite desfazer fechamentos individuais (apenas lote)
- ❌ Mantém histórico de múltiplas ações
- ❌ Persiste o log de recuperação em disco/storage
- ❌ Permite exportar log de ações

---

### 6. Mecanismo de Recuperação

**O sistema:**
- ✅ Exibe botão "Recuperar última exclusão" na tela inicial quando há ação recuperável
- ✅ Mostra tempo restante para recuperação
- ✅ Ao clicar, recria todas as abas nas janelas originais
- ✅ Apaga o log imediatamente após recuperação bem-sucedida
- ✅ Descarta o log automaticamente após 15 minutos
- ✅ Mantém apenas a última ação em lote

**O sistema NÃO:**
- ❌ Permite escolher quais abas recuperar individualmente
- ❌ Mantém histórico de recuperações
- ❌ Persiste dados de recuperação além de 15 minutos
- ❌ Permite configurar o tempo de TTL
- ❌ Notifica quando o TTL está expirando

---

## ❌ O Que o Projeto NÃO FAZ

### 1. Gerenciamento Automático

**Explicitamente NÃO inclui:**
- ❌ Fechamento automático de abas baseado em tempo
- ❌ Fechamento automático baseado em uso de memória
- ❌ Regras ou triggers automáticos
- ❌ Sugestões de abas para fechar
- ❌ Machine learning ou análise de padrões
- ❌ Suspensão automática de abas inativas

**Justificativa**: O projeto é focado em execução manual e deliberada, não automação.

---

### 2. Monitoramento e Análise

**Explicitamente NÃO inclui:**
- ❌ Rastreamento de histórico de navegação
- ❌ Estatísticas de uso de abas
- ❌ Relatórios de produtividade
- ❌ Análise de tempo gasto em sites
- ❌ Detecção de abas duplicadas
- ❌ Identificação de abas "inúteis"

**Justificativa**: O projeto não é uma ferramenta de monitoramento ou produtividade.

---

### 3. Organização e Gestão de Abas

**Explicitamente NÃO inclui:**
- ❌ Criação de grupos de abas
- ❌ Renomeação de abas
- ❌ Anotações em abas
- ❌ Tags ou labels
- ❌ Favoritos ou marcadores
- ❌ Sessões salvas
- ❌ Sincronização entre dispositivos

**Justificativa**: O projeto é focado exclusivamente em execução de fechamento, não organização.

---

### 4. Exportação e Compartilhamento

**Explicitamente NÃO inclui:**
- ❌ Exportação de listas de abas (CSV, JSON, etc.)
- ❌ Compartilhamento de listas
- ❌ Impressão de relatórios
- ❌ Integração com ferramentas externas
- ❌ APIs públicas

**Justificativa**: O projeto é de uso pessoal, não colaborativo ou integrável.

---

### 5. Customização Avançada

**Explicitamente NÃO inclui:**
- ❌ Configuração de regras personalizadas
- ❌ Temas personalizados (além do básico)
- ❌ Atalhos de teclado customizáveis
- ❌ Plugins ou extensões do sistema
- ❌ Configuração de TTL de recuperação

**Justificativa**: O MVP foca em uma experiência única e bem definida, não customização.

---

### 6. Funcionalidades de Navegador Nativo

**Explicitamente NÃO inclui:**
- ❌ Gerenciamento de janelas (criar, mover, redimensionar)
- ❌ Manipulação de favoritos
- ❌ Gerenciamento de histórico do navegador
- ❌ Controle de downloads
- ❌ Gerenciamento de extensões

**Justificativa**: O projeto não duplica funcionalidades nativas do navegador.

---

## 🎯 Resumo Executivo de Escopo

### Em Uma Frase

**Tab Domain Executor permite ao usuário visualizar abas agrupadas por domínio, selecionar um escopo específico por janelas, e executar deliberadamente o fechamento dessas abas com possibilidade de recuperação em 15 minutos.**

### O Que É (Em Três Pontos)

1. **Visualizador** de abas agrupadas por domínio
2. **Executor** de fechamento de abas com escopo definido
3. **Ferramenta de recuperação** temporária de última ação

### O Que NÃO É (Em Três Pontos)

1. **NÃO é** um gerenciador automático de abas
2. **NÃO é** uma ferramenta de produtividade ou monitoramento
3. **NÃO é** um organizador ou sistema de sessões

---

## 🔒 Regras de Escopo Imutáveis

As seguintes regras definem os limites rígidos do projeto:

### Regra 1: Nenhuma Ação Automática
> Toda ação destrutiva deve ser iniciada explicitamente pelo usuário.

### Regra 2: Apenas Domínio Base
> Agrupamento ocorre exclusivamente por domínio base, não por subdomínio, caminho ou parâmetros.

### Regra 3: Apenas Fechamento
> A única ação destrutiva disponível é o fechamento de abas.

### Regra 4: Apenas Última Ação
> O mecanismo de recuperação mantém apenas a última ação em lote.

### Regra 5: TTL Fixo
> O tempo de recuperação é fixo em 15 minutos, não configurável.

### Regra 6: Sem Persistência Além do TTL
> Nenhum dado é armazenado além dos 15 minutos do log de recuperação.

---

## 📊 Matriz de Decisão

Quando uma nova funcionalidade for proposta, use esta matriz:

| Pergunta | Se SIM | Se NÃO |
|----------|--------|--------|
| A funcionalidade requer ação automática? | ❌ REJEITAR | ✅ CONTINUAR |
| A funcionalidade monitora comportamento do usuário? | ❌ REJEITAR | ✅ CONTINUAR |
| A funcionalidade adiciona complexidade ao fluxo linear? | ❌ REJEITAR | ✅ CONTINUAR |
| A funcionalidade compromete a segurança de ações destrutivas? | ❌ REJEITAR | ✅ CONTINUAR |
| A funcionalidade requer persistência além de 15 minutos? | ❌ REJEITAR | ✅ CONTINUAR |
| A funcionalidade está alinhada com os três pilares (controle, segurança, transparência)? | ✅ CONSIDERAR | ❌ REJEITAR |

---

## 🚧 Escopo de Trabalho Técnico

### Incluído no Desenvolvimento

- ✅ Manifest V3 configuration
- ✅ Background Service Worker
- ✅ Popup UI (React ou Vanilla JS/TS)
- ✅ Módulo de leitura de abas
- ✅ Módulo de normalização de URLs
- ✅ Módulo de agrupamento
- ✅ Módulo de execução de ações
- ✅ Módulo de recuperação
- ✅ Sistema de mensagens entre popup e background
- ✅ Modelos de dados TypeScript
- ✅ Testes conceituais
- ✅ Build system (Webpack ou similar)
- ✅ Documentação técnica completa

### Não Incluído no Desenvolvimento

- ❌ Backend server
- ❌ Banco de dados
- ❌ Autenticação/Login
- ❌ Sincronização em nuvem
- ❌ API REST
- ❌ Integração com serviços externos
- ❌ Analytics ou telemetria
- ❌ Sistema de notificações push

---

## ✋ Quando Dizer "NÃO"

Este projeto deve dizer **NÃO** a:

1. **Feature creep**: "Que tal adicionar também...?"
2. **Automação**: "Poderia fechar abas automaticamente quando...?"
3. **Complexidade desnecessária**: "E se tivesse um painel de configurações avançadas...?"
4. **Duplicação de funcionalidades nativas**: "Poderia gerenciar favoritos também?"
5. **Monitoramento**: "Seria legal ver estatísticas de uso..."

Dizer "NÃO" protege a visão, mantém o foco e garante excelência no escopo definido.

---

**Próximo**: Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a visão arquitetural do sistema.
