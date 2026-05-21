export default function Sidebar({
  tela,
  setTela,
  onLogout,
  user,
  isAdmin,
  isBartender,
  isEstoque,
  mobileOpen,
  onCloseMobile,
}) {
  const nav = [
    { id: "pedidos", label: "Comandas", show: isBartender },
    { id: "cardapio", label: "Drinks", show: isBartender },
    { id: "estoque", label: "Estoque", show: isEstoque },
    { id: "dashboard", label: "Tendências", show: isBartender || isEstoque },
    { id: "usuarios", label: "Usuários", show: isAdmin },
  ].filter((item) => item.show);

  const content = (
    <>
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-purple-700 text-center mb-6 md:mb-10">
          Urbana Base
        </h1>
        {user && (
          <p className="text-center text-sm text-gray-500 mb-6 px-2 truncate">
            {user.name}
            <span className="block text-xs text-purple-600">{user.role}</span>
          </p>
        )}

        <nav className="flex flex-col gap-4 md:gap-8">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTela(item.id);
                onCloseMobile?.();
              }}
              className={`text-left text-xl md:text-3xl font-bold transition-colors ${
                tela === item.id ? "text-purple-700" : "text-gray-400 hover:text-purple-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="px-2 md:px-5 mt-8">
        <button
          type="button"
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xl md:text-3xl font-bold py-3 md:py-4 rounded-full"
        >
          SAIR
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-[280px] xl:w-[320px] shrink-0 bg-[#e9e9e9] rounded-r-[40px] flex-col justify-between py-8 shadow-md">
        <div className="px-4">{content}</div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <button
            type="button"
            className="flex-1 bg-black/30"
            aria-label="Fechar menu"
            onClick={onCloseMobile}
          />
          <aside className="w-[min(280px,85vw)] bg-[#e9e9e9] shadow-xl flex flex-col justify-between py-8 px-4">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
