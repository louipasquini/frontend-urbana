import { useState, useEffect, useCallback } from "react";
import { ordersApi, drinksApi } from "../api";
import { ApiError } from "../api/client";
import OrderCard from "./OrderCard";
import Modal from "./ui/Modal";
import Alert from "./ui/Alert";
import { formatCurrency } from "../utils/format";

export default function Orders() {
  const [aba, setAba] = useState("abertas");
  const [comandas, setComandas] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [abrindo, setAbrindo] = useState(false);

  const [modalDrink, setModalDrink] = useState(null);
  const [drinkId, setDrinkId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [shortages, setShortages] = useState(null);

  const [detalhe, setDetalhe] = useState(null);
  const [fechandoId, setFechandoId] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const [lista, listaDrinks] = await Promise.all([
        aba === "abertas" ? ordersApi.open() : ordersApi.history(),
        drinksApi.list(),
      ]);
      setComandas(Array.isArray(lista) ? lista : []);
      setDrinks(Array.isArray(listaDrinks) ? listaDrinks : []);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao carregar comandas");
    } finally {
      setCarregando(false);
    }
  }, [aba]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function abrirComanda(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    setAbrindo(true);
    setErro("");
    try {
      await ordersApi.openOrder({
        name: nome.trim(),
        cpf: cpf.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setNome("");
      setCpf("");
      setPhone("");
      setAba("abertas");
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao abrir comanda");
    } finally {
      setAbrindo(false);
    }
  }

  async function adicionarDrink(e) {
    e.preventDefault();
    if (!modalDrink || !drinkId) return;
    setShortages(null);
    setErro("");
    try {
      await ordersApi.addDrink(modalDrink.id, Number(drinkId), Number(quantidade));
      setModalDrink(null);
      setDrinkId("");
      setQuantidade(1);
      await carregar();
    } catch (err) {
      if (err instanceof ApiError && err.shortages) {
        setShortages(err.shortages);
      }
      setErro(err instanceof ApiError ? err.message : "Erro ao adicionar drink");
    }
  }

  async function fecharComanda(id) {
    setFechandoId(id);
    setErro("");
    try {
      await ordersApi.close(id);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao fechar comanda");
    } finally {
      setFechandoId(null);
    }
  }

  async function verDetalhe(id) {
    try {
      const data = await ordersApi.get(id);
      setDetalhe(data);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao carregar detalhes");
    }
  }

  return (
    <div className="relative pb-48 lg:pb-80">
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() => setAba("abertas")}
          className={`px-6 py-2 rounded-full font-bold text-lg ${
            aba === "abertas" ? "bg-purple-600 text-white" : "bg-white text-gray-500"
          }`}
        >
          Abertas
        </button>
        <button
          type="button"
          onClick={() => setAba("historico")}
          className={`px-6 py-2 rounded-full font-bold text-lg ${
            aba === "historico" ? "bg-purple-600 text-white" : "bg-white text-gray-500"
          }`}
        >
          Histórico
        </button>
        <button
          type="button"
          onClick={carregar}
          className="px-6 py-2 rounded-full font-bold text-lg border border-gray-300 text-gray-500"
        >
          Atualizar
        </button>
      </div>

      {erro && <Alert>{erro}</Alert>}

      {carregando ? (
        <p className="text-gray-500 text-xl">Carregando comandas…</p>
      ) : comandas.length === 0 ? (
        <p className="text-gray-500 text-xl">
          {aba === "abertas" ? "Nenhuma comanda aberta." : "Nenhuma comanda no histórico."}
        </p>
      ) : (
        comandas.map((pedido) => (
          <OrderCard
            key={pedido.id}
            pedido={pedido}
            onAddDrink={setModalDrink}
            onClose={fecharComanda}
            onDetails={verDetalhe}
            fechando={fechandoId === pedido.id}
          />
        ))
      )}

      {aba === "abertas" && (
        <div className="fixed bottom-4 right-4 left-4 lg:left-auto lg:w-[350px] z-10">
          <form
            onSubmit={abrirComanda}
            className="bg-[#ececec] p-5 md:p-8 rounded-[32px] md:rounded-[40px] shadow-lg"
          >
            <h3 className="text-xl font-bold text-purple-700 mb-4">Nova comanda</h3>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full mb-3 p-3 md:p-4 rounded-xl border text-lg outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="text"
              placeholder="CPF (opcional)"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full mb-3 p-3 md:p-4 rounded-xl border text-lg outline-none"
            />
            <input
              type="tel"
              placeholder="Telefone (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mb-4 p-3 md:p-4 rounded-xl border text-lg outline-none"
            />
            <button
              type="submit"
              disabled={abrindo}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xl md:text-2xl font-bold py-3 md:py-4 rounded-full disabled:opacity-60"
            >
              {abrindo ? "Abrindo…" : "Abrir comanda"}
            </button>
          </form>
        </div>
      )}

      <Modal
        open={!!modalDrink}
        onClose={() => { setModalDrink(null); setShortages(null); }}
        title={`Adicionar drink — #${modalDrink?.id}`}
      >
        <form onSubmit={adicionarDrink} className="flex flex-col gap-4">
          <select
            value={drinkId}
            onChange={(e) => setDrinkId(e.target.value)}
            required
            className="p-4 rounded-xl border text-lg bg-white"
          >
            <option value="">Selecione o drink</option>
            {drinks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {formatCurrency(d.price)}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            className="p-4 rounded-xl border text-lg"
            placeholder="Quantidade"
          />
          {shortages?.length > 0 && (
            <div className="text-red-600 text-sm space-y-1">
              <p className="font-bold">Estoque insuficiente:</p>
              {shortages.map((s) => (
                <p key={s.product_id}>
                  {s.product_name}: precisa {s.required}, disponível {s.available}
                </p>
              ))}
            </div>
          )}
          <button
            type="submit"
            className="bg-purple-600 text-white font-bold py-3 rounded-full"
          >
            Adicionar
          </button>
        </form>
      </Modal>

      <Modal open={!!detalhe} onClose={() => setDetalhe(null)} title={`Comanda #${detalhe?.id}`} wide>
        {detalhe && (
          <div className="space-y-4 text-gray-600">
            <p>
              <span className="font-bold">Total:</span> {formatCurrency(detalhe.total_price)}
            </p>
            <p>
              <span className="font-bold">Status:</span>{" "}
              {detalhe.status === "open" ? "Aberta" : "Fechada"}
            </p>
            <div>
              <p className="font-bold mb-2">Itens:</p>
              {detalhe.items?.length ? (
                <ul className="space-y-2">
                  {detalhe.items.map((item, i) => (
                    <li key={item.id ?? i} className="bg-white/50 rounded-xl p-3">
                      {item.drink_name ?? item.name ?? `Drink #${item.drink_id}`} ×{" "}
                      {item.quantity} — {formatCurrency(item.subtotal ?? item.price)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Sem itens ainda.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
