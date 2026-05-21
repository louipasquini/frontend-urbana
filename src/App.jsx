import { useState, useEffect } from "react";

import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Orders from "./components/Orders";
import Stock from "./components/Stock";
import Dashboard from "./components/Dashboard";
import Drinks from "./components/Drinks";
import Users from "./components/Users";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppShell() {
  const { user, logout, isAdmin, isBartender, isEstoque } = useAuth();
  const [tela, setTela] = useState("pedidos");
  const [menuMobile, setMenuMobile] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (isBartender) setTela("pedidos");
    else if (isEstoque) setTela("estoque");
    else if (isAdmin) setTela("pedidos");
  }, [user, isBartender, isEstoque, isAdmin]);

  if (!user) {
    return <Login onSuccess={() => setTela("pedidos")} />;
  }

  const titulos = {
    pedidos: "Comandas",
    cardapio: "Drinks",
    estoque: "Estoque",
    dashboard: "Tendências",
    usuarios: "Usuários",
  };

  return (
    <div className="flex min-h-screen bg-[#f4f4f4]">
      <Sidebar
        tela={tela}
        setTela={setTela}
        user={user}
        isAdmin={isAdmin}
        isBartender={isBartender}
        isEstoque={isEstoque}
        onLogout={logout}
        mobileOpen={menuMobile}
        onCloseMobile={() => setMenuMobile(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-[#e9e9e9] shadow-sm">
          <button
            type="button"
            onClick={() => setMenuMobile(true)}
            className="p-2 text-purple-700 font-bold text-2xl"
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <h1 className="text-xl font-bold text-purple-700 truncate">
            {titulos[tela] ?? "Urbana"}
          </h1>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-auto">
          {tela === "pedidos" && isBartender && <Orders />}
          {tela === "cardapio" && isBartender && <Drinks />}
          {tela === "estoque" && isEstoque && <Stock />}
          {tela === "dashboard" && (isBartender || isEstoque) && <Dashboard />}
          {tela === "usuarios" && isAdmin && <Users />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
