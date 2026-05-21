# 🍸 UrbanaBase — Front-end Coquetelaria Urbana

Interface web moderna para gerenciamento e operação de coquetelaria, integrada ao ecossistema **UrbanaBase**. Desenvolvida em React, Vite, Tailwind CSS e Recharts para oferecer uma experiência fluida, rápida e responsiva para administradores, bartenders e gestores de estoque.

---

## 🚀 Funcionalidades Principais

* **📊 Dashboard & Analytics (Tendências):**
  * Gráficos dinâmicos de faturamento e vendas por período.
  * Visualização rápida de indicadores principais (drink mais vendido, base mais consumida).
  * Rankings integrados de drinks populares e consumo de estoque.
  * Filtros ágeis de data (Quinzenal, Mensal, Trimestral, Semestral).

* **🧾 Gestão de Comandas (Operação de Balcão):**
  * Abertura e acompanhamento de comandas ativas em tempo real.
  * Adição rápida de bebidas e drinks com controle de quantidade.
  * Histórico de comandas fechadas com resumo de itens e totalizadores.

* **📦 Controle de Estoque (Inteligente):**
  * Monitoramento de insumos com alertas visuais automáticos de **estoque baixo**.
  * Controle por unidades de medida personalizadas (ml, un, etc.).
  * Cadastro, edição e exclusão (CRUD) simplificada de insumos.

* **🍸 Catálogo de Drinks (Cardápio):**
  * Gerenciamento de receitas, preços e categorias de drinks.
  * Associação de ingredientes base para cruzamento analítico com o estoque.

* **🔑 Controle de Acessos & Perfis:**
  * Login seguro integrado com JWT.
  * Visualização e permissões adaptadas para cada perfil de usuário (`admin`, `bartender`, `estoque`).

---

## 🛠️ Tecnologias Utilizadas

* **Core:** React 19 + JavaScript (ES6+)
* **Build tool:** Vite 8 (Ultra rápido, com HMR instantâneo)
* **Estilização:** Tailwind CSS v4 (Aesthetics premium, responsividade nativa e transições suaves)
* **Gráficos:** Recharts 3 (Gráficos interativos elegantes)
* **Linter:** ESLint 10 + Flat Configs

---

## 💻 Desenvolvimento Local

### 1. Pré-requisitos
Certifique-se de possuir o **Node.js** (versão 18 ou superior) instalado em sua máquina.

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto seguindo a estrutura abaixo:

```env
# URL base para chamadas de API no ambiente local
VITE_API_URL=/api

# Alvo do proxy (evita erros de CORS durante o desenvolvimento)
# Para apontar ao Heroku:
VITE_PROXY_TARGET=https://backend-urbana-02588e976dd6.herokuapp.com

# Para apontar ao backend local:
# VITE_PROXY_TARGET=http://localhost:5000
```

### 4. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173`.

### 5. Executar Linter e Build
Para garantir a qualidade do código e gerar os arquivos de produção:
```bash
# Validar linter
npm run lint

# Compilar para produção (pasta dist/)
npm run build
```

---

## ☁️ Implantação na Vercel

O projeto está totalmente preparado para ser hospedado na **Vercel** de forma integrada com o repositório do GitHub.

### Configuração de Variáveis de Ambiente na Vercel
Ao importar o projeto na Vercel, acesse as **Environment Variables** nas configurações do projeto e configure a seguinte variável para apontar ao Heroku:

* **Key:** `VITE_API_URL`
* **Value:** `https://backend-urbana-02588e976dd6.herokuapp.com`

> 💡 **Nota:** Como na Vercel o build de produção é feito de forma estática e as requisições ocorrem diretamente do navegador do usuário final para a API do Heroku, o linter e o build funcionarão normalmente. Certifique-se de que o backend do Heroku possua as origens de produção configuradas no CORS para aceitar requisições vindas do seu domínio da Vercel.

---

Desenvolvido para **Coquetelaria Urbana** — Design & Operações Premium. 🥂