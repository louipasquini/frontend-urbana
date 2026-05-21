import { useState, useEffect, useCallback } from "react";
import { productsApi } from "../api";
import { ApiError } from "../api/client";
import StockCard from "./StockCard";
import Modal from "./ui/Modal";
import Alert from "./ui/Alert";

const formVazio = {
  name: "",
  category: "destilados",
  unit_type: "ml",
  current_quantity: 0,
  minimum_quantity: 0,
};

export default function Stock() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVazio);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const data = await productsApi.list();
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao carregar estoque");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setForm(formVazio);
    setModalAberto(true);
  }

  function abrirEditar(produto) {
    setEditando(produto);
    setForm({
      name: produto.name,
      category: produto.category ?? "",
      unit_type: produto.unit_type ?? "ml",
      current_quantity: produto.current_quantity ?? 0,
      minimum_quantity: produto.minimum_quantity ?? 0,
    });
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const payload = {
        ...form,
        current_quantity: Number(form.current_quantity),
        minimum_quantity: Number(form.minimum_quantity),
      };
      if (editando) {
        await productsApi.update(editando.id, payload);
      } else {
        await productsApi.create(payload);
      }
      setModalAberto(false);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao salvar produto");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id) {
    if (!confirm("Remover este produto?")) return;
    setErro("");
    try {
      await productsApi.remove(id);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao excluir");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-purple-700">Estoque</h1>
        <button
          type="button"
          onClick={abrirNovo}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold px-6 py-3 rounded-full"
        >
          + Produto
        </button>
      </div>

      {erro && <Alert>{erro}</Alert>}

      {carregando ? (
        <p className="text-gray-500">Carregando…</p>
      ) : produtos.length === 0 ? (
        <p className="text-gray-500">Nenhum produto cadastrado.</p>
      ) : (
        produtos.map((produto) => (
          <StockCard
            key={produto.id}
            produto={produto}
            onEdit={abrirEditar}
            onDelete={excluir}
          />
        ))
      )}

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={editando ? "Editar produto" : "Novo produto"}
      >
        <form onSubmit={salvar} className="flex flex-col gap-3">
          {[
            ["name", "Nome", "text"],
            ["category", "Categoria", "text"],
            ["unit_type", "Unidade (ml, un…)", "text"],
            ["current_quantity", "Quantidade atual", "number"],
            ["minimum_quantity", "Quantidade mínima", "number"],
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="text-sm text-gray-500">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={key === "name"}
                min={type === "number" ? 0 : undefined}
                className="w-full p-3 rounded-xl border mt-1"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={salvando}
            className="mt-2 bg-purple-600 text-white font-bold py-3 rounded-full disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
