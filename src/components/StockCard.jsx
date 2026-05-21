export default function StockCard({
  produto,
  onEdit,
  onDelete,
  ajustando,
}) {
  const qtd = produto.current_quantity ?? 0;
  const minimo = produto.minimum_quantity ?? 0;
  const baixo = qtd <= minimo;

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-6 md:pb-8 mb-6 md:mb-8">
      <div className="flex gap-4 items-center min-w-0">
        <div
          className={`shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-2xl ${
            baixo
              ? "bg-red-500"
              : "bg-gradient-to-r from-purple-500 to-purple-700"
          }`}
        />

        <div className="min-w-0">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-500 truncate">
            {produto.name}
          </h2>
          <p className="text-sm text-gray-400">
            {produto.category} · {produto.unit_type}
          </p>
          <p
            className={`text-xl md:text-3xl font-bold ${
              baixo ? "text-red-500" : "text-gray-400"
            }`}
          >
            {qtd} {produto.unit_type}
          </p>
          <p className="text-sm text-gray-400">Mínimo: {minimo}</p>
          {baixo && (
            <p className="text-red-500 text-lg font-bold mt-1">Estoque baixo</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(produto)}
          disabled={ajustando}
          className="px-5 py-2 rounded-full text-lg font-bold text-white bg-purple-600 disabled:opacity-50"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(produto.id)}
          className="px-5 py-2 rounded-full text-lg font-bold text-white bg-red-500"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
