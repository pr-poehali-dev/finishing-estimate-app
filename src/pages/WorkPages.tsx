import Icon from "@/components/ui/icon";
import { Badge, Av, PageTitle } from "@/pages/DashboardObjects";
import { type ObjStatus, type TaskStatus, type DocStatus, PROJECTS, TASKS, EMPLOYEES, fmt, dateRu, OBJ_STATUS, TASK_STATUS, TASK_PRIORITY } from "@/pages/shared";

export function TasksPage() {
  const cols: TaskStatus[] = ["new", "in_progress", "done"];
  return (
    <div className="fade-up">
      <PageTitle title="Задачи" action="Новая задача" />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {cols.map(col => (
          <div key={col} className="flex-1 min-w-56">
            <div className="flex items-center gap-2 mb-3">
              <Badge {...TASK_STATUS[col]} />
              <span className="text-xs text-gray-400">{TASKS.filter(t=>t.status===col).length}</span>
            </div>
            <div className="space-y-2">
              {TASKS.filter(t => t.status===col).map(task => (
                <div key={task.id} className="panel p-3 cursor-pointer hover:border-amber-300 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-800 leading-snug">{task.title}</p>
                    <Badge {...TASK_PRIORITY[task.priority]} />
                  </div>
                  <p className="text-xs text-gray-400 mb-2 truncate">{task.project}</p>
                  {task.checklist.length > 0 && (
                    <div className="mb-2">
                      <div className="pbar">
                        <div className="pbar-fill" style={{ width:`${(task.checklist.filter(c=>c.done).length/task.checklist.length)*100}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{task.checklist.filter(c=>c.done).length}/{task.checklist.length} пунктов</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Av name={task.assignee} size={20} bg="#374151" />
                      <span className="text-xs text-gray-400">{task.assignee.split(" ")[0]}</span>
                    </div>
                    <span className={`text-xs ${new Date(task.due)<new Date() && col!=="done" ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                      {dateRu(task.due)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const totalBudget = PROJECTS.reduce((s,p) => s+p.budget, 0);
  const totalAgreed = PROJECTS.reduce((s,p) => s+p.agreed, 0);
  const totalPaid   = PROJECTS.reduce((s,p) => s+p.paid, 0);
  const totalCosts  = PROJECTS.reduce((s,p) => s+p.costs, 0);
  const totalProfit = totalAgreed - totalCosts;
  const avgMargin   = totalAgreed > 0 ? Math.round(totalProfit / totalAgreed * 100) : 0;

  return (
    <div className="fade-up">
      <PageTitle title="Аналитика и отчёты" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label:"Портфель",       val:fmt(totalBudget), sub:"бюджет всех объектов" },
          { label:"Получено",       val:fmt(totalPaid),   sub:`${totalAgreed>0?Math.round(totalPaid/totalAgreed*100):0}% от согласованного` },
          { label:"Расходы (факт)", val:fmt(totalCosts),  sub:`${totalAgreed>0?Math.round(totalCosts/totalAgreed*100):0}% от бюджетов` },
          { label:"Прибыль",        val:fmt(totalProfit), sub:`средняя маржа ${avgMargin}%` },
        ].map((k,i) => (
          <div key={i} className="kpi">
            <p className="text-xs text-gray-500 mb-2">{k.label}</p>
            <p className="text-2xl font-bold text-gray-900">{k.val}</p>
            <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-4">
          <p className="label-sm mb-4">Рентабельность по объектам</p>
          <div className="space-y-3.5">
            {PROJECTS.filter(p=>p.agreed>0).sort((a,b)=>(b.agreed-b.costs)/b.agreed-(a.agreed-a.costs)/a.agreed).map(p => {
              const margin = Math.round((p.agreed-p.costs)/p.agreed*100);
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-800 truncate flex-1 mr-2">{p.name}</p>
                    <span className={`text-sm font-bold ${margin>=20?"text-emerald-600":margin>=10?"text-amber-600":"text-red-500"}`}>{margin}%</span>
                  </div>
                  <div className="pbar">
                    <div className="pbar-fill" style={{ width:`${Math.round(p.paid/p.agreed*100)}%`, background: margin>=20?"#10b981":margin>=10?"#f59e0b":"#ef4444" }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Расходы: {fmt(p.costs)}</span>
                    <span>Бюджет: {fmt(p.agreed)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel p-4">
          <p className="label-sm mb-4">Статусы объектов</p>
          <div className="space-y-2.5">
            {(Object.keys(OBJ_STATUS) as ObjStatus[]).map(s => {
              const cnt = PROJECTS.filter(p=>p.status===s).length;
              const vol = PROJECTS.filter(p=>p.status===s).reduce((a,p)=>a+p.budget,0);
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-20 flex justify-end"><Badge {...OBJ_STATUS[s]} /></div>
                  <div className="flex-1 pbar">
                    <div className="pbar-fill" style={{ width:`${(cnt/PROJECTS.length)*100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-4 text-center">{cnt}</span>
                  <span className="text-xs font-semibold text-gray-700 w-28 text-right">{fmt(vol)}</span>
                </div>
              );
            })}
          </div>
          <hr className="divider" />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xl font-bold text-gray-900">{PROJECTS.length}</p><p className="text-xs text-gray-400">всего</p></div>
            <div><p className="text-xl font-bold text-emerald-600">{PROJECTS.filter(p=>p.status==="done").length}</p><p className="text-xs text-gray-400">завершено</p></div>
            <div><p className="text-xl font-bold text-amber-600">{PROJECTS.filter(p=>p.status==="working").length}</p><p className="text-xs text-gray-400">в работе</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamPage() {
  const statusMap = {
    available: { label:"Свободен", cls:"badge-green" },
    busy:      { label:"Занят",    cls:"badge-amber" },
    vacation:  { label:"Отпуск",   cls:"badge-gray" },
  };
  const colors = ["#1e3a5f","#1a5c3a","#5c1a1a","#3a1a5c","#1a4a5c","#5c3a1a"];
  return (
    <div className="fade-up">
      <PageTitle title="Команда" action="Добавить сотрудника" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EMPLOYEES.map((e, i) => (
          <div key={e.id} className="panel p-4 hover:border-amber-300 transition-colors cursor-pointer">
            <div className="flex items-start gap-3 mb-3">
              <Av name={e.name} size={44} bg={colors[i%colors.length]} />
              <div>
                <p className="font-semibold text-gray-900 text-sm">{e.name}</p>
                <p className="text-xs text-gray-400">{e.role}</p>
                <div className="mt-1.5"><Badge {...statusMap[e.status]} /></div>
              </div>
            </div>
            <hr className="divider" />
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-gray-600"><Icon name="Phone" size={12} />{e.phone}</div>
              <div className="flex items-center gap-2 text-gray-500"><Icon name="Wrench" size={12} /><span className="text-xs">{e.specialty.join(", ")}</span></div>
              <div className="flex items-center gap-2 text-gray-600"><Icon name="Banknote" size={12} />{fmt(e.rate)}/день</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DocsPage() {
  const docs = [
    { name: "Договор №47 — Смирновы", type: "Договор", project: "Квартира Смирновых", date: "2026-02-10", status: "signed" as DocStatus, size: "245 KB" },
    { name: "Смета v3 — Квартира Смирновых", type: "Смета", project: "Квартира Смирновых", date: "2026-02-08", status: "agreed" as DocStatus, size: "88 KB" },
    { name: "КС-2 №1 — Черновые работы", type: "КС-2", project: "Квартира Смирновых", date: "2026-03-28", status: "draft" as DocStatus, size: "120 KB" },
    { name: "Договор №52 — Прогресс", type: "Договор", project: "Офис Прогресс", date: "2026-03-25", status: "signed" as DocStatus, size: "310 KB" },
    { name: "Акт приёмки — Дом Петровых", type: "Акт", project: "Дом Петровых", date: "2026-03-05", status: "signed" as DocStatus, size: "95 KB" },
    { name: "КС-3 итоговая — Дом Петровых", type: "КС-3", project: "Дом Петровых", date: "2026-03-06", status: "signed" as DocStatus, size: "78 KB" },
  ];
  const statusDoc: Record<DocStatus,{label:string;cls:string}> = {
    draft:    { label:"Черновик",   cls:"badge-gray" },
    sent:     { label:"Отправлен",  cls:"badge-blue" },
    agreed:   { label:"Согласован", cls:"badge-amber" },
    signed:   { label:"Подписан",   cls:"badge-green" },
    rejected: { label:"Отклонён",   cls:"badge-red" },
  };
  return (
    <div className="fade-up">
      <PageTitle title="Документы" action="Загрузить файл" />
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl w-full">
            <thead><tr><th>Документ</th><th>Тип</th><th>Объект</th><th>Дата</th><th>Статус</th><th>Размер</th><th></th></tr></thead>
            <tbody>
              {docs.map((d,i) => (
                <tr key={i} className="cursor-pointer">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" size={13} className="text-gray-500" />
                      </div>
                      <span className="font-medium text-sm text-gray-800">{d.name}</span>
                    </div>
                  </td>
                  <td><Badge cls="badge-blue" label={d.type} /></td>
                  <td className="text-xs text-gray-500">{d.project}</td>
                  <td className="text-sm text-gray-400">{dateRu(d.date)}</td>
                  <td><Badge {...statusDoc[d.status]} /></td>
                  <td className="text-xs text-gray-400">{d.size}</td>
                  <td><button className="btn-ghost" style={{ padding:"4px 8px" }}><Icon name="Download" size={12} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
