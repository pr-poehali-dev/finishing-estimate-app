import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge, Av, PageTitle } from "@/pages/DashboardObjects";
import { type ObjStatus, CLIENTS, PROJECTS, ESTIMATE_SECTIONS, FIN_OPS, MATERIALS, fmt, dateRu, OBJ_STATUS } from "@/pages/shared";

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const filtered = CLIENTS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-up">
      <PageTitle title="Клиенты" action="Новый клиент" />
      <div className="flex gap-3 mb-4">
        <input className="inp" style={{ maxWidth: 280 }} placeholder="Поиск клиентов..." value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-ghost"><Icon name="Filter" size={14} />Фильтр</button>
      </div>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl w-full">
            <thead><tr><th>Клиент</th><th>Тип</th><th>Телефон</th><th>Email</th><th className="text-right">Объектов</th><th className="text-right">Выручка</th><th>Контакт</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="cursor-pointer">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Av name={c.name} size={28} />
                      <span className="font-medium text-sm text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td><Badge cls={c.type==="company"?"badge-blue":"badge-gray"} label={c.type==="company"?"Юрлицо":"Физлицо"} /></td>
                  <td className="text-sm text-gray-600">{c.phone}</td>
                  <td className="text-sm text-gray-400">{c.email}</td>
                  <td className="text-right font-semibold text-sm">{c.projects}</td>
                  <td className="text-right font-bold text-sm text-amber-600">{fmt(c.revenue)}</td>
                  <td className="text-sm text-gray-400">{dateRu(c.lastContact)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function EstimatesPage() {
  const [sel, setSel] = useState(PROJECTS[0]);
  const totalPrice = ESTIMATE_SECTIONS.flatMap(s => s.items).reduce((a, i) => a + i.qty * i.price, 0);
  const totalCost  = ESTIMATE_SECTIONS.flatMap(s => s.items).reduce((a, i) => a + i.qty * i.cost, 0);

  return (
    <div className="fade-up">
      <PageTitle title="Сметы" action="Создать смету" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="panel p-3">
          <p className="label-sm mb-2">Объекты</p>
          <div className="space-y-0.5">
            {PROJECTS.map(p => (
              <div key={p.id} onClick={() => setSel(p)}
                className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${sel.id===p.id ? "bg-amber-50 text-amber-800 font-semibold border border-amber-200" : "text-gray-700 hover:bg-gray-50"}`}>
                <p className="font-medium truncate text-xs">{p.name}</p>
                <div className="mt-1"><Badge {...OBJ_STATUS[p.status]} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{sel.name}</p>
                <p className="text-xs text-gray-400">{sel.address}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" style={{ padding: "6px 12px" }}><Icon name="Download" size={13} />PDF</button>
                <button className="btn-ghost" style={{ padding: "6px 12px" }}><Icon name="FileDown" size={13} />Excel</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {ESTIMATE_SECTIONS.map(sec => (
                <div key={sec.id}>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{sec.title}</p>
                  </div>
                  <table className="tbl w-full">
                    <thead><tr><th>Наименование</th><th>Ед.</th><th className="text-right">Кол-во</th><th className="text-right">Цена</th><th className="text-right">Сумма</th><th className="text-right">Себест.</th><th className="text-right">Прибыль</th></tr></thead>
                    <tbody>
                      {sec.items.map(item => (
                        <tr key={item.id}>
                          <td className="font-medium text-gray-800">{item.name}</td>
                          <td className="text-gray-400 text-xs">{item.unit}</td>
                          <td className="text-right">{item.qty}</td>
                          <td className="text-right">{fmt(item.price)}</td>
                          <td className="text-right font-semibold">{fmt(item.qty * item.price)}</td>
                          <td className="text-right text-gray-400">{fmt(item.qty * item.cost)}</td>
                          <td className="text-right text-emerald-600 font-semibold">{fmt(item.qty * (item.price - item.cost))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div><p className="text-xs text-gray-400">Себестоимость</p><p className="font-bold text-gray-700">{fmt(totalCost)}</p></div>
              <div><p className="text-xs text-gray-400">Стоимость продажи</p><p className="font-bold text-gray-900">{fmt(totalPrice)}</p></div>
              <div><p className="text-xs text-gray-400">Прибыль</p><p className="font-bold text-emerald-600">{fmt(totalPrice-totalCost)} ({Math.round((totalPrice-totalCost)/totalPrice*100)}%)</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FinancePage() {
  const income  = FIN_OPS.filter(o => o.type==="income").reduce((s,o) => s+o.amount, 0);
  const expense = FIN_OPS.filter(o => o.type==="expense").reduce((s,o) => s+o.amount, 0);
  const profit  = income - expense;

  const byCat: Record<string, number> = {};
  FIN_OPS.filter(o => o.type==="expense").forEach(o => { byCat[o.category] = (byCat[o.category]||0) + o.amount; });

  return (
    <div className="fade-up">
      <PageTitle title="Бухгалтерия" action="Добавить операцию" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label:"Доходы",  val:fmt(income),  icon:"TrendingUp",   cls:"text-emerald-600", bg:"#d1fae5" },
          { label:"Расходы", val:fmt(expense), icon:"TrendingDown",  cls:"text-red-500",     bg:"#fee2e2" },
          { label:"Прибыль", val:fmt(profit),  icon:"DollarSign",   cls:"text-amber-600",   bg:"#fef3c7" },
        ].map((k,i) => (
          <div key={i} className="kpi">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: k.bg }}>
                <Icon name={k.icon} size={16} className={k.cls} />
              </div>
              <p className="text-sm text-gray-500">{k.label}</p>
            </div>
            <p className={`text-2xl font-bold ${k.cls}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel p-4">
          <p className="label-sm mb-3">Расходы по категориям</p>
          <div className="space-y-2.5">
            {Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([cat, sum]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{cat}</span>
                  <span className="text-gray-700 font-semibold">{fmt(sum)}</span>
                </div>
                <div className="pbar">
                  <div className="pbar-fill red" style={{ width:`${(sum/expense)*100}%`, background:"#ef4444" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden lg:col-span-2">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-semibold text-sm text-gray-800">Все операции</p>
            <button className="btn-ghost" style={{ padding:"5px 10px" }}><Icon name="Filter" size={13} />Фильтр</button>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl w-full">
              <thead><tr><th>Дата</th><th>Тип</th><th>Категория</th><th>Объект</th><th>Контрагент</th><th className="text-right">Сумма</th></tr></thead>
              <tbody>
                {FIN_OPS.map(op => (
                  <tr key={op.id}>
                    <td className="text-gray-400 text-xs">{dateRu(op.date)}</td>
                    <td><Badge cls={op.type==="income"?"badge-green":"badge-red"} label={op.type==="income"?"Приход":"Расход"} /></td>
                    <td className="text-sm">{op.category}</td>
                    <td className="text-xs text-gray-400 max-w-xs truncate">{op.project}</td>
                    <td className="text-sm text-gray-600">{op.counterparty}</td>
                    <td className={`text-right font-bold text-sm ${op.type==="income"?"text-emerald-600":"text-red-500"}`}>
                      {op.type==="income"?"+":"−"}{fmt(op.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WarehousePage() {
  const low = MATERIALS.filter(m => m.qty < m.minQty);
  return (
    <div className="fade-up">
      <PageTitle title="Склад и материалы" action="Добавить материал" />
      {low.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-sm text-amber-800">
          <Icon name="AlertTriangle" size={16} className="text-amber-500 flex-shrink-0" />
          <strong>{low.length} позиции</strong>&nbsp;ниже минимума:&nbsp;{low.map(m=>m.name).join(", ")}
        </div>
      )}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl w-full">
            <thead><tr><th>Наименование</th><th>Категория</th><th>Поставщик</th><th className="text-right">Остаток</th><th className="text-right">Мин.</th><th className="text-right">Цена</th><th className="text-right">Сумма</th><th></th></tr></thead>
            <tbody>
              {MATERIALS.map(m => (
                <tr key={m.id} className={m.qty < m.minQty ? "bg-red-50/40" : ""}>
                  <td className="font-medium text-gray-800 text-sm">
                    <div className="flex items-center gap-2">
                      {m.qty < m.minQty && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                      {m.qty === 0 && <Badge cls="badge-red" label="Нет" />}
                      {m.name}
                    </div>
                  </td>
                  <td className="text-sm text-gray-500">{m.category}</td>
                  <td className="text-xs text-gray-400">{m.supplier}</td>
                  <td className={`text-right font-semibold text-sm ${m.qty<m.minQty?"text-red-500":"text-gray-800"}`}>{m.qty} {m.unit}</td>
                  <td className="text-right text-sm text-gray-400">{m.minQty} {m.unit}</td>
                  <td className="text-right text-sm">{fmt(m.price)}</td>
                  <td className="text-right font-semibold text-sm">{fmt(m.qty * m.price)}</td>
                  <td className="text-right"><button className="text-xs text-amber-600 hover:underline">Пополнить</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-4 py-2.5 bg-gray-50 border-t border-gray-100">
          <span className="text-xs text-gray-400">{MATERIALS.length} позиций</span>
          <span className="text-sm font-bold text-gray-800">Итого: {fmt(MATERIALS.reduce((s,m)=>s+m.qty*m.price,0))}</span>
        </div>
      </div>
    </div>
  );
}
