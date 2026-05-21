import { useState, useEffect } from "react";
import { analyticsApi, drinksApi, ordersApi } from "../api";
import { ApiError } from "../api/client";
import DashboardChart from "./DashboardChart";
import Alert from "./ui/Alert";
import { formatCurrency, formatQuantity } from "../utils/format";

function itemLabel(item) {
  return item.name ?? item.base_drink ?? item.base ?? "—";
}

function RankingList({ titulo, itens, formatValor = formatCurrency, valorKey, subtextKey }) {
  return (
    <div className="bg-[#ececec] rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-lg">
      <h2 className="text-2xl md:text-4xl font-bold text-gray-700 mb-4">{titulo}</h2>
      {!itens?.length ? (
        <p className="text-gray-400">Sem dados ainda.</p>
      ) : (
        <ul className="space-y-3">
          {itens.map((item, i) => {
            const valor =
              item[valorKey] ??
              item.total_consumed ??
              item.quantity_used ??
              item.revenue ??
              item.total_sold ??
              0;
            const subtext =
              subtextKey != null && item[subtextKey] != null
                ? item[subtextKey]
                : item.total_sold;

            return (
              <li
                key={item.drink_id ?? item.product_id ?? item.base_drink ?? item.base ?? i}
                className="flex justify-between items-center gap-2 text-lg md:text-2xl"
              >
                <span className="text-gray-600 font-medium truncate">
                  {i + 1}. {itemLabel(item)}
                  {subtext != null && subtextKey !== "total_consumed" && (
                    <span className="text-gray-400 text-sm ml-2">({subtext} vendas)</span>
                  )}
                </span>
                <span className="text-purple-700 font-bold shrink-0">{formatValor(valor)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function toISODateLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const ATALHOS_PERIODO = [
  {
    id: "quinzenal",
    label: "Quinzenal",
    descricao: "Últimos 15 dias",
    range: (hoje) => {
      const inicio = new Date(hoje);
      inicio.setDate(inicio.getDate() - 14);
      return { inicio, fim: hoje };
    },
  },
  {
    id: "mensal",
    label: "Mensal",
    descricao: "Mês atual",
    range: (hoje) => ({
      inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
      fim: hoje,
    }),
  },
  {
    id: "trimestre",
    label: "Trimestre",
    descricao: "Trimestre atual",
    range: (hoje) => {
      const trimestre = Math.floor(hoje.getMonth() / 3);
      return {
        inicio: new Date(hoje.getFullYear(), trimestre * 3, 1),
        fim: hoje,
      };
    },
  },
  {
    id: "semestre",
    label: "Semestre",
    descricao: "Semestre atual",
    range: (hoje) => {
      const mesInicio = hoje.getMonth() < 6 ? 0 : 6;
      return {
        inicio: new Date(hoje.getFullYear(), mesInicio, 1),
        fim: hoje,
      };
    },
  },
];

function periodoPadrao() {
  const hoje = new Date();
  const atalho = ATALHOS_PERIODO.find((a) => a.id === "semestre");
  const { inicio, fim } = atalho.range(hoje);
  return {
    start: toISODateLocal(inicio),
    end: toISODateLocal(fim),
  };
}

export default function Dashboard() {
  const padrao = periodoPadrao();
  const [topDrinks, setTopDrinks] = useState([]);
  const [topBases, setTopBases] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [startDate, setStartDate] = useState(padrao.start);
  const [endDate, setEndDate] = useState(padrao.end);
  const [atalhoAtivo, setAtalhoAtivo] = useState("semestre");

  const [allDrinks, setAllDrinks] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [dadosCarregados, setDadosCarregados] = useState(false);

  function aplicarAtalho(id) {
    const atalho = ATALHOS_PERIODO.find((a) => a.id === id);
    if (!atalho) return;
    const hoje = new Date();
    const { inicio, fim } = atalho.range(hoje);
    setStartDate(toISODateLocal(inicio));
    setEndDate(toISODateLocal(fim));
    setAtalhoAtivo(id);
  }

  // Efeito para carregar o catálogo de drinks e histórico de comandas (uma única vez ao montar)
  useEffect(() => {
    async function carregarDadosIniciais() {
      try {
        const [resDrinks, resOrders] = await Promise.all([
          drinksApi.list(),
          ordersApi.history(),
        ]);
        setAllDrinks(Array.isArray(resDrinks) ? resDrinks : []);
        setAllOrders(Array.isArray(resOrders) ? resOrders : []);
        setDadosCarregados(true);
      } catch (err) {
        setErro(err instanceof ApiError ? err.message : "Erro ao carregar dados do dashboard");
        setCarregando(false);
      }
    }
    carregarDadosIniciais();
  }, []);

  // Efeito para buscar as vendas do período e calcular os rankings no frontend
  useEffect(() => {
    if (!dadosCarregados) return;

    async function carregarVendasEFiltrar() {
      setCarregando(true);
      setErro("");
      try {
        const sales = await analyticsApi.sales(startDate, endDate);
        setVendas(Array.isArray(sales) ? sales : []);

        // Filtrar comandas fechadas que estão no período selecionado
        const closedOrdersInPeriod = allOrders.filter((order) => {
          if (order.status !== "closed" || !order.closed_at) return false;
          const orderDateStr = order.closed_at.substring(0, 10);
          return orderDateStr >= startDate && orderDateStr <= endDate;
        });

        // 1. Calcular Top Drinks no período
        const drinksMap = {};
        closedOrdersInPeriod.forEach((order) => {
          (order.items || []).forEach((item) => {
            const { drink_id, drink_name, quantity, total_price } = item;
            if (!drinksMap[drink_id]) {
              drinksMap[drink_id] = {
                drink_id,
                name: drink_name || "—",
                total_sold: 0,
                revenue: 0,
              };
            }
            drinksMap[drink_id].total_sold += quantity;
            drinksMap[drink_id].revenue += total_price;
          });
        });
        const computedTopDrinks = Object.values(drinksMap)
          .sort((a, b) => b.total_sold - a.total_sold)
          .slice(0, 5);
        setTopDrinks(computedTopDrinks);

        // 2. Calcular Top Bases no período
        const drinkToBaseMap = {};
        allDrinks.forEach((d) => {
          drinkToBaseMap[d.id] = d.base_drink;
        });

        const basesMap = {};
        closedOrdersInPeriod.forEach((order) => {
          (order.items || []).forEach((item) => {
            const { drink_id, quantity } = item;
            const base_drink = drinkToBaseMap[drink_id] || "Outros";
            if (!basesMap[base_drink]) {
              basesMap[base_drink] = {
                base_drink,
                total_sold: 0,
              };
            }
            basesMap[base_drink].total_sold += quantity;
          });
        });
        const computedTopBases = Object.values(basesMap)
          .sort((a, b) => b.total_sold - a.total_sold)
          .slice(0, 5)
          .map((item) => ({
            base_drink: item.base_drink,
            total_sold: item.total_sold,
          }));
        setTopBases(computedTopBases);

        // 3. Calcular Produtos Consumidos no período
        const drinkIngredientsMap = {};
        allDrinks.forEach((d) => {
          drinkIngredientsMap[d.id] = d.ingredients || [];
        });

        const productsMap = {};
        closedOrdersInPeriod.forEach((order) => {
          (order.items || []).forEach((item) => {
            const { drink_id, quantity } = item;
            const ingredients = drinkIngredientsMap[drink_id] || [];
            ingredients.forEach((ing) => {
              const { product_id, product_name, quantity_used } = ing;
              if (!productsMap[product_id]) {
                productsMap[product_id] = {
                  product_id,
                  name: product_name || "—",
                  total_consumed: 0,
                };
              }
              productsMap[product_id].total_consumed += quantity * quantity_used;
            });
          });
        });
        const computedTopProducts = Object.values(productsMap)
          .sort((a, b) => b.total_consumed - a.total_consumed)
          .slice(0, 5);
        setTopProducts(computedTopProducts);

      } catch (err) {
        setErro(err instanceof ApiError ? err.message : "Erro ao carregar tendências");
      } finally {
        setCarregando(false);
      }
    }

    carregarVendasEFiltrar();
  }, [startDate, endDate, dadosCarregados, allDrinks, allOrders]);

  const destaqueDrink = topDrinks[0];
  const destaqueBase = topBases[0];

  return (
    <div>
      <h1 className="text-4xl md:text-7xl font-bold text-purple-700 mb-6 md:mb-10">
        Dashboard
      </h1>

      {erro && <Alert>{erro}</Alert>}

      <div className="bg-[#ececec] rounded-[24px] p-4 md:p-6 mb-6 shadow-sm">
        <p className="text-sm font-bold text-gray-600 mb-3">Período de análise</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {ATALHOS_PERIODO.map((atalho) => (
            <button
              key={atalho.id}
              type="button"
              onClick={() => aplicarAtalho(atalho.id)}
              title={atalho.descricao}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                atalhoAtivo === atalho.id
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-purple-100"
              }`}
            >
              {atalho.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-sm text-gray-500 block">De</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setAtalhoAtivo(null);
              }}
              className="p-2 rounded-xl border bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block">Até</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setAtalhoAtivo(null);
              }}
              className="p-2 rounded-xl border bg-white"
            />
          </div>
          {atalhoAtivo && (
            <p className="text-sm text-gray-400 pb-2">
              {ATALHOS_PERIODO.find((a) => a.id === atalhoAtivo)?.descricao}
            </p>
          )}
        </div>
      </div>

      {carregando ? (
        <p className="text-gray-500">Carregando tendências…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#ececec] rounded-[32px] p-6 md:p-10 shadow-lg">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-700 mb-2">
                Drink mais vendido
              </h2>
              <p className="text-xl md:text-3xl text-gray-500">
                {destaqueDrink?.name ?? "—"}
              </p>
              {destaqueDrink && (
                <>
                  <p className="text-purple-700 font-bold mt-2">
                    {formatCurrency(destaqueDrink.revenue)}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {destaqueDrink.total_sold} unidades vendidas
                  </p>
                </>
              )}
            </div>
            <div className="bg-[#ececec] rounded-[32px] p-6 md:p-10 shadow-lg">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-700 mb-2">
                Base mais usada
              </h2>
              <p className="text-xl md:text-3xl text-gray-500">
                {destaqueBase ? itemLabel(destaqueBase) : "—"}
              </p>
              {destaqueBase && (
                <p className="text-purple-700 font-bold mt-2">
                  {destaqueBase.total_sold} drinks com esta base
                </p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <DashboardChart dados={vendas} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RankingList titulo="Top drinks" itens={topDrinks} valorKey="revenue" subtextKey="total_sold" />
            <RankingList
              titulo="Top bases"
              itens={topBases}
              valorKey="total_sold"
              formatValor={(v) => `${v} drinks`}
            />
            <RankingList
              titulo="Produtos mais consumidos"
              itens={topProducts}
              valorKey="total_consumed"
              formatValor={formatQuantity}
            />
          </div>
        </>
      )}
    </div>
  );
}
