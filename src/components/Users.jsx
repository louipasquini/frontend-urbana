import { useState, useEffect } from "react";
import { authApi, usersApi, customersApi } from "../api";
import { ApiError } from "../api/client";
import Alert from "./ui/Alert";
import { formatDate } from "../utils/format";

export default function Users() {
  const [usuarios, setUsuarios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [aba, setAba] = useState("usuarios");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("bartender");

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const [u, c] = await Promise.all([usersApi.list(), customersApi.list()]);
        setUsuarios(Array.isArray(u) ? u : []);
        setClientes(Array.isArray(c) ? c : []);
      } catch (err) {
        setErro(err instanceof ApiError ? err.message : "Erro ao carregar");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function cadastrarCliente(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    try {
      await customersApi.create({
        name: nome.trim(),
        cpf: cpf.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setNome("");
      setCpf("");
      setPhone("");
      const c = await customersApi.list();
      setClientes(Array.isArray(c) ? c : []);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao cadastrar cliente");
    }
  }

  async function cadastrarUsuario(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    try {
      await authApi.register({
        name: userName.trim(),
        email: userEmail.trim(),
        password: userPassword,
        role: userRole,
      });
      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setUserRole("bartender");
      const u = await usersApi.list();
      setUsuarios(Array.isArray(u) ? u : []);
      setSucesso("Conta criada com sucesso.");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Erro ao cadastrar usuário");
    }
  }

  return (
    <div>
      <h1 className="text-4xl md:text-6xl font-bold text-purple-700 mb-6">Administração</h1>

      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setAba("usuarios")}
          className={`px-6 py-2 rounded-full font-bold ${
            aba === "usuarios" ? "bg-purple-600 text-white" : "bg-white text-gray-500"
          }`}
        >
          Usuários
        </button>
        <button
          type="button"
          onClick={() => setAba("clientes")}
          className={`px-6 py-2 rounded-full font-bold ${
            aba === "clientes" ? "bg-purple-600 text-white" : "bg-white text-gray-500"
          }`}
        >
          Clientes
        </button>
      </div>

      {erro && <Alert>{erro}</Alert>}
      {sucesso && <Alert type="success">{sucesso}</Alert>}

      {carregando ? (
        <p className="text-gray-500">Carregando…</p>
      ) : aba === "usuarios" ? (
        <>
          <form
            onSubmit={cadastrarUsuario}
            className="bg-[#ececec] rounded-[32px] p-6 mb-6 max-w-md flex flex-col gap-3"
          >
            <h3 className="font-bold text-purple-700">Nova conta</h3>
            <input
              placeholder="Nome"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="p-3 rounded-xl border"
            />
            <input
              type="email"
              placeholder="E-mail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              className="p-3 rounded-xl border"
            />
            <input
              type="password"
              placeholder="Senha"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
              className="p-3 rounded-xl border"
            />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="p-3 rounded-xl border bg-white"
            >
              <option value="bartender">Bartender</option>
              <option value="estoque">Estoque</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              className="bg-purple-600 text-white font-bold py-2 rounded-full"
            >
              Criar conta
            </button>
          </form>
          <div className="space-y-4">
          {usuarios.map((u) => (
            <div
              key={u.id}
              className="bg-[#ececec] rounded-2xl p-5 flex flex-wrap justify-between gap-2"
            >
              <div>
                <p className="font-bold text-lg text-gray-700">{u.name}</p>
                <p className="text-gray-500">{u.email}</p>
              </div>
              <div className="text-right">
                <span className="text-purple-700 font-bold">{u.role}</span>
                <p className="text-sm text-gray-400">{formatDate(u.created_at)}</p>
              </div>
            </div>
          ))}
          </div>
        </>
      ) : (
        <>
          <form
            onSubmit={cadastrarCliente}
            className="bg-[#ececec] rounded-[32px] p-6 mb-6 max-w-md flex flex-col gap-3"
          >
            <h3 className="font-bold text-purple-700">Novo cliente</h3>
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="p-3 rounded-xl border"
            />
            <input
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="p-3 rounded-xl border"
            />
            <input
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="p-3 rounded-xl border"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white font-bold py-2 rounded-full"
            >
              Cadastrar
            </button>
          </form>
          <div className="space-y-4">
            {clientes.map((c) => (
              <div key={c.id} className="bg-[#ececec] rounded-2xl p-5">
                <p className="font-bold text-gray-700">{c.name}</p>
                {c.cpf && <p className="text-gray-500 text-sm">CPF: {c.cpf}</p>}
                {c.phone && <p className="text-gray-500 text-sm">Tel: {c.phone}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
