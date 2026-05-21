import { useState, useEffect, useCallback } from "react";
import { drinksApi, productsApi } from "../api";
import { ApiError } from "../api/client";
import Modal from "./ui/Modal";
import Alert from "./ui/Alert";
import { formatCurrency } from "../utils/format";

const drinkVazio = {
  name: "",
  category: "Clássicos",
  base_drink: "",
  price: "",
  description: "",
  ingredients: [{ product: "", quantity_used: "" }],
};

export default function Drinks() {
  const [drinks, setDrinks] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(drinkVazio);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [listaDrinks, listaProdutos] = await Promise.all([
        drinksApi.list(),
        productsApi.list(),
      ]);
      setDrinks(Array.isArray(listaDrinks) ? listaDrinks : []);
      setProdutos(Array.isArray(listaProdutos) ? listaProdutos : []);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao carregar drinks");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setForm(drinkVazio);
    setModalAberto(true);
  }

  function abrirEditar(drink) {
    setEditando(drink);
    setForm({
      name: drink.name,
      category: drink.category ?? "",
      base_drink: drink.base_drink ?? "",
      price: drink.price ?? "",
      description: drink.description ?? "",
      ingredients:
        drink.ingredients?.length > 0
          ? drink.ingredients.map((ing) => ({
              product: ing.product_name ?? ing.product ?? "",
              product_id: ing.product_id,
              quantity_used: ing.quantity_used ?? "",
            }))
          : [{ product: "", quantity_used: "" }],
    });
    setModalAberto(true);
  }

  function atualizarIngrediente(i, campo, valor) {
    const ings = [...form.ingredients];
    ings[i] = { ...ings[i], [campo]: valor };
    if (campo === "product_id") {
      const p = produtos.find((x) => x.id === Number(valor));
      if (p) ings[i].product = p.name;
    }
    setForm({ ...form, ingredients: ings });
  }

  function adicionarIngrediente() {
    setForm({
      ...form,
      ingredients: [...form.ingredients, { product: "", quantity_used: "" }],
    });
  }

  function removerIngrediente(i) {
    setForm({
      ...form,
      ingredients: form.ingredients.filter((_, idx) => idx !== i),
    });
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const ingredients = form.ingredients
        .filter((ing) => ing.product || ing.product_id)
        .map((ing) => ({
          ...(ing.product_id
            ? { product_id: Number(ing.product_id) }
            : { product: ing.product }),
          quantity_used: Number(ing.quantity_used),
        }));

      const payload = {
        name: form.name,
        category: form.category,
        base_drink: form.base_drink,
        price: Number(form.price),
        description: form.description,
        ingredients,
      };

      if (editando) {
        await drinksApi.update(editando.id, payload);
      } else {
        await drinksApi.create(payload);
      }
      setModalAberto(false);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao salvar drink");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id) {
    if (!confirm("Remover este drink?")) return;
    try {
      await drinksApi.remove(id);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao excluir");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-purple-700">Drinks</h1>
        <button
          type="button"
          onClick={abrirNovo}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold px-6 py-3 rounded-full"
        >
          + Drink
        </button>
      </div>

      {erro && <Alert>{erro}</Alert>}

      {carregando ? (
        <p className="text-gray-500">Carregando…</p>
      ) : drinks.length === 0 ? (
        <p className="text-gray-500">Nenhum drink cadastrado.</p>
      ) : (
        <div className="space-y-6">
          {drinks.map((drink) => (
            <div
              key={drink.id}
              className="bg-[#ececec] rounded-[32px] p-5 md:p-8 shadow-lg flex flex-col md:flex-row md:justify-between gap-4"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-600">{drink.name}</h2>
                <p className="text-gray-400">{drink.category} · {drink.base_drink}</p>
                <p className="text-purple-700 font-bold text-xl">
                  {formatCurrency(drink.price)}
                </p>
                {drink.description && (
                  <p className="text-gray-500 mt-2">{drink.description}</p>
                )}
                {drink.ingredients?.length > 0 && (
                  <ul className="mt-3 text-sm text-gray-500 space-y-1">
                    {drink.ingredients.map((ing, i) => (
                      <li key={i}>
                        {ing.product_name ?? ing.product}: {ing.quantity_used}{" "}
                        {ing.unit_type ?? "ml"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => abrirEditar(drink)}
                  className="px-5 py-2 rounded-full font-bold text-white bg-purple-600"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => excluir(drink.id)}
                  className="px-5 py-2 rounded-full font-bold text-white bg-red-500"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? "Editar drink" : "Novo drink"}
        wide
      >
        <form onSubmit={salvar} className="flex flex-col gap-3">
          {[
            ["name", "Nome"],
            ["category", "Categoria"],
            ["base_drink", "Base"],
            ["price", "Preço (R$)"],
            ["description", "Descrição"],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-sm text-gray-500">{label}</label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key === "name" || key === "price"}
                className="w-full p-3 rounded-xl border mt-1"
              />
            </div>
          ))}

          <p className="font-bold text-purple-700 mt-2">Ingredientes</p>
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex-1 w-full">
                <label className="text-xs text-gray-500">Produto</label>
                <select
                  value={ing.product_id ?? ""}
                  onChange={(e) => atualizarIngrediente(i, "product_id", e.target.value)}
                  className="w-full p-3 rounded-xl border bg-white mt-1"
                >
                  <option value="">Ou digite o nome</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {!ing.product_id && (
                  <input
                    placeholder="Nome do produto"
                    value={ing.product}
                    onChange={(e) => atualizarIngrediente(i, "product", e.target.value)}
                    className="w-full p-3 rounded-xl border mt-2"
                  />
                )}
              </div>
              <input
                type="number"
                min={1}
                placeholder="Qtd"
                value={ing.quantity_used}
                onChange={(e) => atualizarIngrediente(i, "quantity_used", e.target.value)}
                className="w-full sm:w-24 p-3 rounded-xl border"
                required
              />
              {form.ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removerIngrediente(i)}
                  className="text-red-500 font-bold px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={adicionarIngrediente}
            className="text-purple-600 text-sm font-bold text-left"
          >
            + Ingrediente
          </button>

          <button
            type="submit"
            disabled={salvando}
            className="bg-purple-600 text-white font-bold py-3 rounded-full disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
