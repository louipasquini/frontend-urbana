import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { menuApi } from "../api";
import { ApiError } from "../api/client";
import Alert from "./ui/Alert";
import { formatCurrency } from "../utils/format";

export default function Login({ onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [cardapio, setCardapio] = useState(null);

  async function carregarCardapio() {
    try {
      const data = await menuApi.list();
      setCardapio(data);
    } catch {
      setCardapio([]);
    }
  }

  useEffect(() => {
    carregarCardapio();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Falha no login");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f4f4f4]">
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="bg-[#ececec] p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-lg w-full max-w-[500px]">
          <h1 className="text-3xl md:text-5xl font-bold text-purple-700 text-center mb-6 md:mb-10">
            Urbana Base
          </h1>

          {erro && <Alert>{erro}</Alert>}

          <form onSubmit={handleLogin} className="flex flex-col gap-4 md:gap-5">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-4 md:p-5 rounded-full border text-lg md:text-2xl outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-4 md:p-5 rounded-full border text-lg md:text-2xl outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              disabled={carregando}
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xl md:text-3xl font-bold py-3 md:py-4 rounded-full disabled:opacity-60"
            >
              {carregando ? "Entrando…" : "LOGIN"}
            </button>
            <p className="text-center text-sm text-gray-500">
              Demo: admin@urbana.com / admin123
            </p>
          </form>
        </div>
      </div>

      <aside className="lg:w-[380px] bg-[#e9e9e9] p-6 md:p-8 overflow-y-auto max-h-[40vh] lg:max-h-screen">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Cardápio público</h2>
        <MenuPreview cardapio={cardapio} onLoad={carregarCardapio} />
      </aside>
    </div>
  );
}

function MenuPreview({ cardapio, onLoad }) {
  if (cardapio === null) {
    return (
      <button type="button" onClick={onLoad} className="text-purple-600 underline">
        Carregar cardápio
      </button>
    );
  }

  if (!cardapio?.length) {
    return <p className="text-gray-500">Nenhum drink no cardápio.</p>;
  }

  return (
    <ul className="space-y-3">
      {cardapio.map((item) => (
        <li key={item.id ?? item.name} className="bg-white/60 rounded-2xl p-4">
          <p className="font-bold text-gray-700">{item.name}</p>
          <p className="text-sm text-gray-500">{item.category}</p>
          <p className="text-purple-700 font-bold">{formatCurrency(item.price)}</p>
        </li>
      ))}
    </ul>
  );
}
