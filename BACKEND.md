# API Coquetelaria Urbana

API REST para gerenciamento de coquetelaria — projeto didático de faculdade.

**Stack:** Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, SQLite (dev) / PostgreSQL (produção opcional).

## Estrutura do projeto

```text
backend-urbana/
├── app.py              # Entrada da aplicação
├── config.py           # Configurações e variáveis de ambiente
├── requirements.txt
├── models/             # Modelos SQLAlchemy (ORM)
├── routes/             # Blueprints e endpoints HTTP
├── services/           # Regras de negócio
└── database/           # Conexão DB + seed de exemplo
```

## Instalação

```bash
cd backend-urbana
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # opcional
```

## Rodar localmente

```bash
# Popular banco + 6 meses de vendas simuladas (dashboard)
python -m database.seed

# Iniciar servidor
python app.py
```

**Produção:** [https://backend-urbana-02588e976dd6.herokuapp.com/](https://backend-urbana-02588e976dd6.herokuapp.com/)

**Local:** `http://localhost:5000`

### PostgreSQL (produção)

Defina no `.env`:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/coquetelaria
```

## Autenticação

Rotas protegidas exigem header:

```http
Authorization: Bearer <access_token>
```

### Login

**POST** `/login`

```json
{
  "email": "admin@urbana.com",
  "password": "admin123"
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "access_token": "eyJ...",
    "user": {
      "id": 1,
      "name": "Admin Urbana",
      "email": "admin@urbana.com",
      "role": "admin",
      "created_at": "2026-05-20T12:00:00+00:00"
    }
  }
}
```

### Cadastro (somente admin)

**POST** `/register` — requer JWT de usuário com role `admin`.

```http
Authorization: Bearer <token_do_admin>
```

```json
{
  "name": "Novo Bartender",
  "email": "novo@urbana.com",
  "password": "senha123",
  "role": "bartender"
}
```

Roles: `admin`, `bartender`, `estoque`.

Fluxo: faça login com `admin@urbana.com`, use o `access_token` no header e então chame `/register`.

## Dados simulados para o dashboard (após seed)

O seed gera automaticamente **6 meses** de histórico (dez/2025 a mai/2026), com:

- ~**265 comandas fechadas** + algumas canceladas (não entram nas métricas)
- **6 drinks** no cardápio (Vodka, Gin, Rum, Tequila como bases)
- **45 clientes** fictícios
- Vendas concentradas em horários de bar (noite; mais movimento qui–sáb)
- Movimentações de estoque (`sale`) alinhadas aos itens vendidos

Endpoints úteis na apresentação:

- `GET /analytics/top-drinks`
- `GET /analytics/top-bases`
- `GET /analytics/sales`
- `GET /analytics/top-products`

Para repopular: `python -m database.seed` (recria o banco do zero).

## Usuários de exemplo (após seed)

| E-mail | Senha | Role |
|--------|-------|------|
| admin@urbana.com | admin123 | admin |
| bartender@urbana.com | bar123 | bartender |
| estoque@urbana.com | est123 | estoque |

## Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/login` | Não | Login JWT |
| POST | `/register` | Admin | Cadastro de usuário |
| GET | `/users` | Sim | Lista usuários |
| POST | `/customers` | Sim | Cadastra cliente |
| GET | `/customers` | Sim | Lista clientes |
| GET | `/products` | Sim | Lista estoque |
| POST | `/products` | Sim | Cria produto |
| PUT | `/products/<id>` | Sim | Atualiza produto |
| DELETE | `/products/<id>` | Sim | Remove produto |
| GET | `/drinks` | Sim | Lista drinks (com ingredientes) |
| POST | `/drinks` | Sim | Cria drink |
| PUT | `/drinks/<id>` | Sim | Atualiza drink |
| DELETE | `/drinks/<id>` | Sim | Remove drink |
| GET | `/menu` | Não | Cardápio resumido |
| POST | `/orders/open` | Sim | Abre comanda |
| POST | `/orders/<id>/add-drink` | Sim | Adiciona drink (desconta estoque) |
| POST | `/orders/<id>/close` | Sim | Fecha comanda |
| GET | `/orders/open` | Sim | Comandas abertas |
| GET | `/orders/history` | Sim | Histórico |
| GET | `/orders/<id>` | Sim | Detalhe da comanda |
| GET | `/analytics/top-drinks` | Sim | Drinks mais vendidos |
| GET | `/analytics/top-bases` | Sim | Bases mais usadas |
| GET | `/analytics/sales` | Sim | Vendas por período |
| GET | `/analytics/top-products` | Sim | Produtos mais consumidos |

## Exemplos de uso

### Criar produto (estoque)

**POST** `/products`

```json
{
  "name": "Tequila",
  "category": "destilados",
  "unit_type": "ml",
  "current_quantity": 1000,
  "minimum_quantity": 100
}
```

### Criar drink com ingredientes

**POST** `/drinks`

```json
{
  "name": "Moscow Mule",
  "category": "Clássicos",
  "base_drink": "Vodka",
  "price": 32.0,
  "description": "Drink refrescante",
  "ingredients": [
    { "product": "Vodka", "quantity_used": 50 },
    { "product": "Espuma de gengibre", "quantity_used": 100 }
  ]
}
```

Também é possível usar `product_id` em vez de `product`.

### Abrir comanda

**POST** `/orders/open`

```json
{
  "name": "Ana Silva",
  "cpf": "123.456.789-00",
  "phone": "11999998888"
}
```

**Resposta:**

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "id": 1,
    "customer_id": 1,
    "status": "open",
    "total_price": 0,
    "items": [],
    "opened_at": "2026-05-20T14:00:00+00:00",
    "closed_at": null
  }
}
```

### Adicionar drink à comanda

**POST** `/orders/1/add-drink`

```json
{
  "drink_id": 1,
  "quantity": 2
}
```

A API verifica estoque, desconta ingredientes automaticamente e atualiza o total. Se faltar estoque:

```json
{
  "success": false,
  "message": "Estoque insuficiente.",
  "shortages": [
    {
      "product_id": 1,
      "product_name": "Vodka",
      "required": 100,
      "available": 50
    }
  ]
}
```

### Fechar comanda

**POST** `/orders/1/close`

A comanda **não** fecha sozinha — é necessário chamar este endpoint.

### Analytics

**GET** `/analytics/top-drinks?limit=5`

```json
{
  "success": true,
  "message": "ok",
  "data": [
    {
      "drink_id": 1,
      "name": "Moscow Mule",
      "total_sold": 2,
      "revenue": 64.0
    }
  ]
}
```

**GET** `/analytics/top-bases?limit=5`

```json
{
  "success": true,
  "data": [
    { "base_drink": "Vodka", "total_sold": 307 },
    { "base_drink": "Rum", "total_sold": 240 }
  ]
}
```

**GET** `/analytics/top-products?limit=5`

```json
{
  "success": true,
  "data": [
    {
      "product_id": 8,
      "name": "Água com gás",
      "total_consumed": 36760.0
    }
  ]
}
```

`total_consumed` está na unidade do produto (ex.: `ml`).

**GET** `/analytics/sales?start_date=2025-12-01&end_date=2026-05-31`

```json
{
  "success": true,
  "data": [
    {
      "period": "2026-05-02",
      "total_revenue": 374.0,
      "orders_count": 6
    }
  ]
}
```

Parâmetros opcionais: `start_date`, `end_date` (formato `YYYY-MM-DD`). Sem filtro, retorna todo o histórico disponível.

## Formato padrão de resposta

Sucesso:

```json
{
  "success": true,
  "message": "ok",
  "data": { }
}
```

Erro:

```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

## Regras de negócio principais

1. **Comandas:** permanecem abertas até `POST /orders/<id>/close`.
2. **Estoque:** ao adicionar drink, ingredientes são descontados em `ml` (ou unidade do produto).
3. **Estoque negativo:** bloqueado na venda.
4. **Movimentações:** `entry` (entrada), `sale` (venda), `adjustment` (ajuste manual).

## Fluxo sugerido para apresentação

1. `GET /menu` — cardápio sem login.
2. `POST /login` — obter token.
3. `GET /products` — ver estoque.
4. `POST /orders/open` — abrir comanda.
5. `POST /orders/1/add-drink` — vender e ver estoque baixar.
6. `POST /orders/1/close` — finalizar.
7. `GET /analytics/top-drinks` — tendências.

## Licença

Projeto acadêmico — uso livre para estudo.
