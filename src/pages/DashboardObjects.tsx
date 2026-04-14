import { useState } from "react";
import Icon from "@/components/ui/icon";
import { type View, type ObjStatus, CLIENTS, PROJECTS, ESTIMATE_SECTIONS, FIN_OPS, TASKS, MATERIALS, fmt, dateRu, OBJ_STATUS, TASK_STATUS, TASK_PRIORITY } from "@/pages/shared";

export function Badge({ cls, label }: { cls: string; label: string }) {
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function Av({ name, size = 32, bg = "hsl(220 28% 20%)" }: { name: string; size?: number; bg?: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35, background: bg, color: "#fff" }}>
      {initials}
    </div>
  );
}

export function PageTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      {action && (
        <button className="btn-accent" onClick={onAction}>
          <Icon name="Plus" size={15} />{action}
        </button>
      )}
    </div>
  );
}

export function Dashboard({ onNav }: { onNav: (v: View) => void }) {
  const active  = PROJECTS.filter(p => p.status === "working");
  const income  = FIN_OPS.filter(o => o.type === "income").reduce((s, o) => s + o.amount, 0);
  const expense = FIN_OPS.filter(o => o.type === "expense").reduce((s, o) => s + o.amount, 0);
  const profit  = income - expense;
  const overdue = TASKS.filter(t => t.status !== "done" && t.status !== "cancelled" && new Date(t.due) < new Date());
  const lowStock = MATERIALS.filter(m => m.qty < m.minQty);

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Дашборд</h1>
          <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => onNav("clients")}><Icon name="UserPlus" size={14} />Клиент</button>
          <button className="btn-accent" onClick={() => onNav("objects")}><Icon name="Plus" size={14} />Объект</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Объектов в работе", val: active.length, sub: `из ${PROJECTS.length} всего`, icon: "Building2", color: "#1d4ed8", bg: "#dbeafe" },
          { label: "Доходы (апрель)",   val: fmt(income),   sub: "поступило", icon: "TrendingUp", color: "#065f46", bg: "#d1fae5" },
          { label: "Расходы (апрель)",  val: fmt(expense),  sub: "потрачено", icon: "TrendingDown", color: "#b91c1c", bg: "#fee2e2" },
          { label: "Прибыль (апрель)",  val: fmt(profit),   sub: `маржа ${Math.round(profit/income*100)}%`, icon: "DollarSign", color: "#92400e", bg: "#fef3c7" },
        ].map((k, i) => (
          <div key={i} className="kpi">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-gray-500 leading-tight">{k.label}</p>
              <span className="p-1.5 rounded-lg flex-shrink-0" style={{ background: k.bg, color: k.color }}>
                <Icon name={k.icon} size={14} />
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{k.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="panel p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-gray-800 text-sm">Активные объекты</p>
            <button className="text-xs text-amber-600 hover:underline" onClick={() => onNav("objects")}>Все →</button>
          </div>
          <div className="space-y-3">
            {active.slice(0, 4).map(p => {
              const margin = p.agreed > 0 ? Math.round((p.agreed - p.costs) / p.agreed * 100) : 0;
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <Badge {...OBJ_STATUS[p.status]} />
                    </div>
                    <div className="pbar">
                      <div className="pbar-fill" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-800">{p.progress}%</p>
                    <p className={`text-xs font-medium ${margin >= 15 ? "text-emerald-600" : margin >= 0 ? "text-amber-600" : "text-red-500"}`}>{margin}% мар.</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel p-4">
          <p className="font-semibold text-gray-800 text-sm mb-3">Требуют внимания</p>
          <div className="space-y-2">
            {overdue.length > 0 && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50 border border-red-100 cursor-pointer" onClick={() => onNav("tasks")}>
                <Icon name="AlertCircle" size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-700">{overdue.length} просроченных задач</p>
                  <p className="text-xs text-red-400 mt-0.5">{overdue[0]?.title}</p>
                </div>
              </div>
            )}
            {lowStock.length > 0 && (
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-100 cursor-pointer" onClick={() => onNav("warehouse")}>
                <Icon name="AlertTriangle" size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700">{lowStock.length} позиции мало на складе</p>
                  <p className="text-xs text-amber-500 mt-0.5">{lowStock[0]?.name}</p>
                </div>
              </div>
            )}
            {PROJECTS.filter(p => p.status === "paused").map(p => (
              <div key={p.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-orange-50 border border-orange-100">
                <Icon name="PauseCircle" size={15} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-orange-700">На паузе</p>
                  <p className="text-xs text-orange-500 mt-0.5">{p.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-4">
          <p className="font-semibold text-gray-800 text-sm mb-3">Воронка объектов</p>
          <div className="space-y-2">
            {(["lead","measure","estimate","contract","working","paused","done"] as ObjStatus[]).map(s => {
              const cnt = PROJECTS.filter(p => p.status === s).length;
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-20 text-right"><Badge {...OBJ_STATUS[s]} /></div>
                  <div className="flex-1 pbar" style={{ height: 10, borderRadius: 5 }}>
                    <div className="pbar-fill" style={{ width: `${(cnt/PROJECTS.length)*100}%`, borderRadius: 5 }} />
                  </div>
                  <span className="w-5 text-xs font-semibold text-gray-700">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">Последние операции</p>
          </div>
          <div className="divide-y divide-gray-50">
            {FIN_OPS.slice(0, 5).map(op => (
              <div key={op.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${op.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                  <Icon name={op.type === "income" ? "ArrowDownLeft" : "ArrowUpRight"} size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{op.category}</p>
                  <p className="text-xs text-gray-400">{op.project}</p>
                </div>
                <p className={`text-sm font-bold ${op.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                  {op.type === "income" ? "+" : "−"}{fmt(op.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ObjectsList({ onSelect }: { onSelect: (id: number) => void }) {
  const [filter, setFilter] = useState<ObjStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = PROJECTS.filter(p =>
    (filter === "all" || p.status === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-up">
      <PageTitle title="Объекты" action="Новый объект" />
      <div className="flex flex-wrap gap-2 mb-4">
        <input className="inp" style={{ width: 220 }} placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-1 flex-wrap">
          {(["all","lead","measure","estimate","contract","working","paused","done"] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${filter === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"}`}>
              {s === "all" ? "Все" : OBJ_STATUS[s].label}
            </button>
          ))}
        </div>
      </div>
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl w-full">
            <thead>
              <tr><th>Объект</th><th>Статус</th><th>Прогресс</th><th>Бюджет</th><th>Оплачено</th><th>Маржа</th><th>Дедлайн</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const client = CLIENTS.find(c => c.id === p.clientId);
                const margin = p.agreed > 0 ? Math.round((p.agreed - p.costs) / p.agreed * 100) : 0;
                return (
                  <tr key={p.id} className="cursor-pointer" onClick={() => onSelect(p.id)}>
                    <td>
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{client?.name.split(" ").slice(0,2).join(" ")} · {p.address}</p>
                    </td>
                    <td><Badge {...OBJ_STATUS[p.status]} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="pbar" style={{ width: 60 }}>
                          <div className="pbar-fill" style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="font-semibold text-sm">{fmt(p.budget)}</td>
                    <td className="text-sm text-gray-700">{fmt(p.paid)}</td>
                    <td><span className={`text-sm font-bold ${margin >= 15 ? "text-emerald-600" : margin >= 0 ? "text-amber-600" : "text-red-500"}`}>{margin}%</span></td>
                    <td className="text-sm text-gray-500">{dateRu(p.planEnd)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">{filtered.length} из {PROJECTS.length} объектов</p>
    </div>
  );
}

export function ObjectDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const [tab, setTab] = useState("info");
  const p = PROJECTS.find(pr => pr.id === id)!;
  const client = CLIENTS.find(c => c.id === p.clientId)!;

  const totalEst  = ESTIMATE_SECTIONS.flatMap(s => s.items).reduce((a, i) => a + i.qty * i.price, 0);
  const totalCost = ESTIMATE_SECTIONS.flatMap(s => s.items).reduce((a, i) => a + i.qty * i.cost, 0);

  const TABS = ["info","estimate","progress","finance","docs","tasks","log"];
  const TAB_LABELS: Record<string, string> = { info:"Информация", estimate:"Смета", progress:"Ход работ", finance:"Финансы", docs:"Документы", tasks:"Задачи", log:"Журнал" };

  return (
    <div className="fade-up">
      <div className="flex items-start gap-3 mb-4 flex-wrap">
        <button className="btn-ghost mt-0.5" onClick={onBack}><Icon name="ArrowLeft" size={14} />Назад</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-gray-900">{p.name}</h1>
            <Badge {...OBJ_STATUS[p.status]} />
            {p.tags.map(t => <span key={t} className="badge badge-gray">{t}</span>)}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{p.address}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost"><Icon name="Download" size={14} />Отчёт</button>
          <button className="btn-primary"><Icon name="Edit" size={14} />Редактировать</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Бюджет",  val: fmt(p.budget), sub: "договор" },
          { label: "Оплачено", val: fmt(p.paid), sub: `${p.agreed>0?Math.round(p.paid/p.agreed*100):0}% от сметы` },
          { label: "Расходы", val: fmt(p.costs), sub: `${p.agreed>0?Math.round(p.costs/p.agreed*100):0}%` },
          { label: "Прибыль", val: fmt(p.agreed - p.costs), sub: `маржа ${p.agreed>0?Math.round((p.agreed-p.costs)/p.agreed*100):0}%` },
        ].map((k, i) => (
          <div key={i} className="kpi" style={{ padding: "14px 16px" }}>
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className="text-lg font-bold text-gray-900">{k.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="tab-bar">
        {TABS.map(t => <div key={t} className={`tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>{TAB_LABELS[t]}</div>)}
      </div>

      {tab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="panel p-4">
            <p className="label-sm mb-3">Данные объекта</p>
            <div className="space-y-2.5">
              {[
                ["Тип объекта", p.type],
                ["Адрес", p.address],
                ["Начало работ", dateRu(p.start)],
                ["Плановое завершение", dateRu(p.planEnd)],
                ["Фактическое завершение", p.factEnd ? dateRu(p.factEnd) : "—"],
                ["Менеджер", p.manager],
                ["Прораб", p.foreman || "—"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-400">{l}</span>
                  <span className="font-medium text-gray-800 text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-4">
            <p className="label-sm mb-3">Клиент</p>
            <div className="flex items-center gap-3 mb-4">
              <Av name={client.name} size={40} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
                <p className="text-xs text-gray-400">{client.type === "company" ? "Юридическое лицо" : "Физическое лицо"}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-gray-600"><Icon name="Phone" size={13} />{client.phone}</div>
              <div className="flex items-center gap-2 text-gray-600"><Icon name="Mail" size={13} />{client.email}</div>
            </div>
            <hr className="divider" />
            <p className="label-sm mb-2">Прогресс выполнения</p>
            <div className="flex items-center gap-3">
              <div className="pbar flex-1" style={{ height: 8, borderRadius: 4 }}>
                <div className="pbar-fill" style={{ width: `${p.progress}%`, borderRadius: 4 }} />
              </div>
              <span className="font-bold text-sm text-gray-800">{p.progress}%</span>
            </div>
          </div>
        </div>
      )}

      {tab === "estimate" && (
        <div className="panel overflow-hidden">
          {ESTIMATE_SECTIONS.map(sec => (
            <div key={sec.id}>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{sec.title}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="tbl w-full">
                  <thead><tr><th>Наименование</th><th>Ед.</th><th className="text-right">Кол-во</th><th className="text-right">Цена</th><th className="text-right">Себест.</th><th className="text-right">Сумма</th><th className="text-right">Вып.</th></tr></thead>
                  <tbody>
                    {sec.items.map(item => (
                      <tr key={item.id}>
                        <td className="font-medium text-gray-800">{item.name}</td>
                        <td className="text-gray-400 text-xs">{item.unit}</td>
                        <td className="text-right">{item.qty}</td>
                        <td className="text-right">{fmt(item.price)}</td>
                        <td className="text-right text-gray-400">{fmt(item.cost)}</td>
                        <td className="text-right font-semibold">{fmt(item.qty * item.price)}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="pbar" style={{ width: 36 }}>
                              <div className={`pbar-fill ${item.done===100?"green":""}`} style={{ width: `${item.done}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{item.done}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div><p className="text-xs text-gray-400">Себестоимость</p><p className="font-bold text-gray-700">{fmt(totalCost)}</p></div>
            <div><p className="text-xs text-gray-400">Продажная стоимость</p><p className="font-bold text-gray-900">{fmt(totalEst)}</p></div>
            <div><p className="text-xs text-gray-400">Плановая прибыль</p><p className="font-bold text-emerald-600">{fmt(totalEst - totalCost)}</p></div>
          </div>
        </div>
      )}

      {tab === "progress" && (
        <div className="space-y-3">
          {ESTIMATE_SECTIONS.map(sec => (
            <div key={sec.id} className="panel overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{sec.title}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {sec.items.map(item => (
                  <div key={item.id} className="px-4 py-3 flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.qty} {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="pbar" style={{ width: 80 }}>
                        <div className={`pbar-fill ${item.done===100?"green":""}`} style={{ width: `${item.done}%` }} />
                      </div>
                      <span className="text-sm font-bold w-10 text-right">{item.done}%</span>
                    </div>
                    <Badge cls={item.done===0?"badge-gray":item.done===100?"badge-green":"badge-teal"} label={item.done===0?"Не начато":item.done===100?"Готово":"В работе"} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn-primary"><Icon name="FileText" size={14} />КС-2</button>
            <button className="btn-ghost"><Icon name="FileCheck" size={14} />КС-3</button>
          </div>
        </div>
      )}

      {tab === "finance" && (
        <div className="panel overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <p className="font-semibold text-sm text-gray-800">Операции по объекту</p>
            <button className="btn-ghost" style={{ padding: "5px 10px" }}><Icon name="Plus" size={13} />Добавить</button>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl w-full">
              <thead><tr><th>Дата</th><th>Тип</th><th>Категория</th><th>Контрагент</th><th className="text-right">Сумма</th></tr></thead>
              <tbody>
                {FIN_OPS.slice(0, 5).map(op => (
                  <tr key={op.id}>
                    <td className="text-gray-400 text-xs">{dateRu(op.date)}</td>
                    <td><Badge cls={op.type==="income"?"badge-green":"badge-red"} label={op.type==="income"?"Приход":"Расход"} /></td>
                    <td className="text-sm">{op.category}</td>
                    <td className="text-sm text-gray-500">{op.counterparty}</td>
                    <td className={`text-right font-bold text-sm ${op.type==="income"?"text-emerald-600":"text-red-500"}`}>
                      {op.type==="income"?"+":"−"}{fmt(op.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "docs" && (
        <div className="panel p-8 text-center">
          <Icon name="FolderOpen" size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 mb-4">Документы по объекту</p>
          <div className="flex gap-2 justify-center">
            <button className="btn-accent"><Icon name="Upload" size={14} />Загрузить</button>
            <button className="btn-ghost"><Icon name="FilePlus" size={14} />Создать</button>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="space-y-2">
          {TASKS.filter(t => t.project.includes("Смирнов")).map(task => (
            <div key={task.id} className="panel p-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-medium text-gray-800 text-sm">{task.title}</p>
                  <Badge {...TASK_STATUS[task.status]} />
                  <Badge {...TASK_PRIORITY[task.priority]} />
                </div>
                <p className="text-xs text-gray-400">{task.assignee} · до {dateRu(task.due)}</p>
              </div>
            </div>
          ))}
          <button className="btn-ghost w-full justify-center"><Icon name="Plus" size={14} />Добавить задачу</button>
        </div>
      )}

      {tab === "log" && (
        <div className="panel p-4">
          <div className="space-y-3">
            {[
              { time: "10 апр, 14:22", user: "Иванова А.", action: "Изменён статус с «Договор» на «В работе»" },
              { time: "08 апр, 10:05", user: "Система", action: "Загружен документ: Акт замера.pdf" },
              { time: "07 апр, 16:30", user: "Морозов А.", action: "Обновлён прогресс: 65%" },
              { time: "05 апр, 09:15", user: "Иванова А.", action: "Добавлена задача: Закупить плитку" },
              { time: "01 апр, 11:00", user: "Система", action: "Объект переведён в статус «В работе»" },
            ].map((e, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-gray-800">{e.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{e.time} · {e.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
