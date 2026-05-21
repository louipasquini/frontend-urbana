import { formatCurrency, formatDate } from "../utils/format";

export default function OrderCard({
  pedido,
  onAddDrink,
  onClose,
  onDetails,
  fechando,
}) {
  const aberta = pedido.status === "open";
  const nomeCliente =
    pedido.customer_name ?? pedido.customer?.name ?? `Cliente #${pedido.customer_id}`;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 mb-6">
      <div className="flex items-center gap-4 md:gap-5 min-w-0">
        <div
          className={`shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-2xl ${
            aberta
              ? "bg-gradient-to-r from-purple-500 to-purple-700"
              : "bg-green-500"
          }`}
        />

        <div className="min-w-0">
          <h2
            className={`text-2xl md:text-4xl font-bold truncate ${
              aberta ? "text-gray-500" : "text-green-600"
            }`}
          >
            Comanda #{pedido.id}
          </h2>
          <p className="text-lg md:text-3xl text-gray-400 truncate">{nomeCliente}</p>
          <p className="text-lg md:text-2xl text-purple-700 font-bold">
            {formatCurrency(pedido.total_price)}
          </p>
          <p className="text-sm text-gray-400">{formatDate(pedido.opened_at)}</p>
          {!aberta && pedido.closed_at && (
            <p className="text-sm text-green-600">Fechada em {formatDate(pedido.closed_at)}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-4">
        <button
          type="button"
          onClick={() => onDetails(pedido.id)}
          className="border border-gray-300 px-4 md:px-8 py-2 md:py-3 rounded-full text-base md:text-2xl font-bold text-gray-500 hover:bg-white"
        >
          Detalhes
        </button>

        {aberta && (
          <>
            <button
              type="button"
              onClick={() => onAddDrink(pedido)}
              className="px-4 md:px-8 py-2 md:py-3 rounded-full text-base md:text-2xl font-bold text-white bg-purple-600"
            >
              + Drink
            </button>
            <button
              type="button"
              onClick={() => onClose(pedido.id)}
              disabled={fechando}
              className="px-4 md:px-8 py-2 md:py-3 rounded-full text-base md:text-2xl font-bold text-white bg-green-600 disabled:opacity-50"
            >
              {fechando ? "Fechando…" : "Fechar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
