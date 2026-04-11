import { useState } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ──────────────────────────────────────────────────────────────────

type Section =
  | "dashboard"
  | "objects"
  | "estimates"
  | "warehouse"
  | "finance"
  | "team"
  | "analytics"
  | "clients";

type ObjectStatus = "active" | "progress" | "done" | "paused";

interface Project {
  id: number;
  name: string;
  address: string;
  client: string;
  status: ObjectStatus;
  deadline: string;
  budget: number;
  spent: number;
  progress: number;
}

interface EstimateItem {
  id: number;
  name: string;
  unit: string;
  qty: number;
  price: number;
}

interface Material {
  id: number;
  name: string;
  category: string;
  unit: string;
  qty: number;
  minQty: number;
  price: number;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  project: string;
  type: "income" | "expense";
  amount: number;
}

interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
  tasks: number;
  status: "available" | "busy" | "vacation";
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  projects: number;
  totalRevenue: number;
  lastContact: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  { id: 1, name: "Квартира Смирновых", address: "ул. Ленина, 45, кв. 12", client: "Смирнов А.В.", status: "progress", deadline: "2026-05-15", budget: 580000, spent: 340000, progress: 65 },
  { id: 2, name: "Офис ООО Прогресс", address: "пр. Победы, 12, оф. 301", client: "ООО Прогресс", status: "active", deadline: "2026-06-30", budget: 1200000, spent: 180000, progress: 20 },
  { id: 3, name: "Дом Петровых", address: "ул. Садовая, 8", client: "Петров Д.С.", status: "done", deadline: "2026-03-01", budget: 950000, spent: 920000, progress: 100 },
  { id: 4, name: "Магазин Уют", address: "пр. Мира, 55", client: "ИП Козлова", status: "paused", deadline: "2026-07-10", budget: 430000, spent: 95000, progress: 22 },
  { id: 5, name: "Студия дизайна", address: "ул. Горького, 78", client: "Новикова М.Л.", status: "progress", deadline: "2026-05-01", budget: 280000, spent: 190000, progress: 75 },
];

const ESTIMATE_ITEMS: EstimateItem[] = [
  { id: 1, name: "Шпатлёвка стен", unit: "м²", qty: 120, price: 280 },
  { id: 2, name: "Грунтовка", unit: "м²", qty: 240, price: 45 },
  { id: 3, name: "Покраска 2 слоя", unit: "м²", qty: 120, price: 380 },
  { id: 4, name: "Укладка плитки", unit: "м²", qty: 45, price: 1200 },
  { id: 5, name: "Установка плинтусов", unit: "п.м.", qty: 80, price: 180 },
  { id: 6, name: "Монтаж гипсокартона", unit: "м²", qty: 35, price: 650 },
];

const MATERIALS: Material[] = [
  { id: 1, name: "Шпатлёвка Knauf", category: "Штукатурка", unit: "кг", qty: 450, minQty: 100, price: 42 },
  { id: 2, name: "Грунтовка Ceresit", category: "Грунт", unit: "л", qty: 85, minQty: 20, price: 180 },
  { id: 3, name: "Краска Caparol белая", category: "ЛКМ", unit: "л", qty: 12, minQty: 30, price: 420 },
  { id: 4, name: "Плитка керамическая", category: "Плитка", unit: "м²", qty: 38, minQty: 10, price: 850 },
  { id: 5, name: "Плиточный клей", category: "Клей", unit: "кг", qty: 220, minQty: 50, price: 35 },
  { id: 6, name: "Гипсокартон 12мм", category: "ГКЛ", unit: "лист", qty: 45, minQty: 15, price: 380 },
  { id: 7, name: "Профиль CD 60", category: "Профиль", unit: "шт", qty: 8, minQty: 20, price: 95 },
  { id: 8, name: "Дюбель-гвоздь 6x40", category: "Метизы", unit: "уп", qty: 30, minQty: 10, price: 65 },
];

const TRANSACTIONS: Transaction[] = [
  { id: 1, date: "2026-04-10", description: "Оплата работ — Квартира Смирновых", project: "Квартира Смирновых", type: "income", amount: 120000 },
  { id: 2, date: "2026-04-09", description: "Закупка материалов", project: "Офис Прогресс", type: "expense", amount: 45000 },
  { id: 3, date: "2026-04-08", description: "Аванс — Студия дизайна", project: "Студия дизайна", type: "income", amount: 80000 },
  { id: 4, date: "2026-04-07", description: "Зарплата бригады", project: "Квартира Смирновых", type: "expense", amount: 95000 },
  { id: 5, date: "2026-04-06", description: "Финальная оплата — Дом Петровых", project: "Дом Петровых", type: "income", amount: 250000 },
  { id: 6, date: "2026-04-05", description: "Аренда инструментов", project: "Офис Прогресс", type: "expense", amount: 12000 },
];

const EMPLOYEES: Employee[] = [
  { id: 1, name: "Алексей Морозов", role: "Бригадир", phone: "+7 912 345-67-89", tasks: 3, status: "busy" },
  { id: 2, name: "Дмитрий Попов", role: "Плиточник", phone: "+7 923 456-78-90", tasks: 2, status: "busy" },
  { id: 3, name: "Сергей Волков", role: "Маляр", phone: "+7 934 567-89-01", tasks: 1, status: "available" },
  { id: 4, name: "Андрей Козлов", role: "Штукатур", phone: "+7 945 678-90-12", tasks: 2, status: "busy" },
  { id: 5, name: "Иван Новиков", role: "Разнорабочий", phone: "+7 956 789-01-23", tasks: 0, status: "vacation" },
];

const CLIENTS: Client[] = [
  { id: 1, name: "Смирнов Александр Витальевич", phone: "+7 911 111-11-11", email: "smirnov@mail.ru", projects: 2, totalRevenue: 860000, lastContact: "2026-04-10" },
  { id: 2, name: "ООО Прогресс", phone: "+7 800 200-30-40", email: "info@progress.ru", projects: 1, totalRevenue: 1200000, lastContact: "2026-04-08" },
  { id: 3, name: "Петров Дмитрий Сергеевич", phone: "+7 922 222-22-22", email: "petrov@gmail.com", projects: 1, totalRevenue: 950000, lastContact: "2026-03-01" },
  { id: 4, name: "ИП Козлова Марина", phone: "+7 933 333-33-33", email: "kozlova@yandex.ru", projects: 1, totalRevenue: 430000, lastContact: "2026-03-20" },
  { id: 5, name: "Новикова Мария Леонидовна", phone: "+7 944 444-44-44", email: "novikova@mail.ru", projects: 1, totalRevenue: 280000, lastContact: "2026-04-09" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

const statusLabels: Record<ObjectStatus, string> = {
  active: "Новый",
  progress: "В работе",
  done: "Завершён",
  paused: "Пауза",
};

const statusClass: Record<ObjectStatus, string> = {
  active: "status-active",
  progress: "status-progress",
  done: "status-done",
  paused: "status-paused",
};

// ─── Nav items ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Главная", icon: "LayoutDashboard" },
  { id: "objects", label: "Объекты", icon: "Building2" },
  { id: "estimates", label: "Сметы", icon: "FileText" },
  { id: "warehouse", label: "Склад", icon: "Package" },
  { id: "finance", label: "Финансы", icon: "Wallet" },
  { id: "team", label: "Команда", icon: "Users" },
  { id: "analytics", label: "Аналитика", icon: "BarChart2" },
  { id: "clients", label: "Клиенты", icon: "UserCircle" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ObjectStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Icon name="Plus" size={16} />
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard() {
  const income = TRANSACTIONS.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = TRANSACTIONS.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const lowStock = MATERIALS.filter(m => m.qty < m.minQty).length;

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Панель управления" subtitle={`Сегодня, ${new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Активных объектов", value: PROJECTS.filter(p => p.status !== "done").length, sub: `из ${PROJECTS.length} всего`, icon: "Building2", color: "text-blue-600 bg-blue-50" },
          { label: "Доходы (апрель)", value: fmt(income), sub: "этот месяц", icon: "TrendingUp", color: "text-green-600 bg-green-50" },
          { label: "Расходы (апрель)", value: fmt(expense), sub: "этот месяц", icon: "TrendingDown", color: "text-red-500 bg-red-50" },
          { label: "Низкий запас", value: `${lowStock} позиций`, sub: "нужно пополнить", icon: "AlertTriangle", color: "text-orange-500 bg-orange-50" },
        ].map((s, i) => (
          <div key={i} className="stat-card p-5">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-gray-500">{s.label}</span>
              <span className={`p-2 rounded-lg ${s.color}`}>
                <Icon name={s.icon} size={16} />
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Активные объекты</h2>
          <div className="space-y-4">
            {PROJECTS.filter(p => p.status !== "done").slice(0, 4).map(p => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-800">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="progress-bar mb-1.5">
                  <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{p.progress}% выполнено</span>
                  <span>до {new Date(p.deadline).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Последние операции</h2>
          <div className="space-y-3">
            {TRANSACTIONS.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type === "income" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  <Icon name={t.type === "income" ? "ArrowDownLeft" : "ArrowUpRight"} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{t.description}</div>
                  <div className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString("ru-RU")}</div>
                </div>
                <div className={`text-sm font-semibold flex-shrink-0 ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Команда</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {EMPLOYEES.map(e => (
            <div key={e.id} className="flex flex-col items-center p-3 rounded-lg bg-gray-50 text-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-semibold text-sm mb-2">
                {e.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
              <div className="text-xs font-medium text-gray-800 leading-tight">{e.name.split(" ")[0]}</div>
              <div className="text-xs text-gray-400 mt-0.5">{e.role}</div>
              <div className={`mt-2 w-2 h-2 rounded-full ${e.status === "available" ? "bg-green-400" : e.status === "busy" ? "bg-orange-400" : "bg-gray-300"}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Objects ─────────────────────────────────────────────────────────────────

function Objects() {
  const [filter, setFilter] = useState<ObjectStatus | "all">("all");
  const filtered = filter === "all" ? PROJECTS : PROJECTS.filter(p => p.status === filter);

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Объекты" subtitle={`${PROJECTS.length} объектов`} action="Новый объект" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "active", "progress", "done", "paused"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"}`}
          >
            {s === "all" ? "Все" : statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-colors cursor-pointer">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Icon name="MapPin" size={13} />
                  {p.address}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <Icon name="User" size={13} />
                  {p.client}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{fmt(p.budget)}</div>
                <div className="text-xs text-gray-400">бюджет</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
              <div>
                <div className="text-xs text-gray-400 mb-1">Потрачено</div>
                <div className="text-sm font-semibold text-gray-800">{fmt(p.spent)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Дедлайн</div>
                <div className="text-sm font-semibold text-gray-800">{new Date(p.deadline).toLocaleDateString("ru-RU")}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Прогресс {p.progress}%</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Estimates ────────────────────────────────────────────────────────────────

function Estimates() {
  const [selected, setSelected] = useState(PROJECTS[0]);
  const total = ESTIMATE_ITEMS.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Сметы" subtitle="Расчёт стоимости работ и материалов" action="Новая смета" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Объекты</h3>
          <div className="space-y-1">
            {PROJECTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${selected.id === p.id ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-4">
            <div className="p-4 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                <button className="text-sm text-orange-500 hover:text-orange-700 flex items-center gap-1">
                  <Icon name="Download" size={14} />
                  Скачать PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left px-4 py-3">Наименование</th>
                    <th className="text-center px-3 py-3">Ед.</th>
                    <th className="text-right px-3 py-3">Кол-во</th>
                    <th className="text-right px-3 py-3">Цена</th>
                    <th className="text-right px-4 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {ESTIMATE_ITEMS.map(item => (
                    <tr key={item.id} className="border-t border-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{item.name}</td>
                      <td className="px-3 py-3 text-sm text-gray-500 text-center">{item.unit}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 text-right">{item.qty}</td>
                      <td className="px-3 py-3 text-sm text-gray-800 text-right">{fmt(item.price)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(item.qty * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-orange-500 text-white rounded-xl px-6 py-4">
              <div className="text-sm opacity-80">Итого по смете</div>
              <div className="text-2xl font-bold">{fmt(total)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Warehouse ────────────────────────────────────────────────────────────────

function Warehouse() {
  const lowStock = MATERIALS.filter(m => m.qty < m.minQty);

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Склад" subtitle={`${MATERIALS.length} позиций`} action="Добавить материал" />

      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6">
          <Icon name="AlertTriangle" size={18} />
          <span className="text-sm text-orange-700">
            <strong>{lowStock.length} позиции</strong> ниже минимального запаса: {lowStock.map(m => m.name).join(", ")}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left px-4 py-3">Наименование</th>
                <th className="text-left px-4 py-3">Категория</th>
                <th className="text-right px-4 py-3">Остаток</th>
                <th className="text-right px-4 py-3">Мин. запас</th>
                <th className="text-right px-4 py-3">Цена/ед.</th>
                <th className="text-right px-4 py-3">Сумма</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {MATERIALS.map(m => (
                <tr key={m.id} className={`border-t border-gray-50 ${m.qty < m.minQty ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      {m.qty < m.minQty && <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />}
                      {m.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-right">
                    <span className={m.qty < m.minQty ? "text-red-500" : "text-gray-800"}>
                      {m.qty} {m.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">{m.minQty} {m.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{fmt(m.price)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{fmt(m.qty * m.price)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-orange-500 hover:text-orange-700">Пополнить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-right text-sm text-gray-500">
        Общая стоимость склада: <span className="font-bold text-gray-900">{fmt(MATERIALS.reduce((s, m) => s + m.qty * m.price, 0))}</span>
      </div>
    </div>
  );
}

// ─── Finance ──────────────────────────────────────────────────────────────────

function Finance() {
  const income = TRANSACTIONS.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = TRANSACTIONS.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const profit = income - expense;

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Финансы" subtitle="Доходы, расходы и прибыльность" action="Добавить операцию" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Доходы", value: fmt(income), icon: "TrendingUp", text: "text-green-600", light: "bg-green-50" },
          { label: "Расходы", value: fmt(expense), icon: "TrendingDown", text: "text-red-500", light: "bg-red-50" },
          { label: "Прибыль", value: fmt(profit), icon: "DollarSign", text: "text-orange-600", light: "bg-orange-50" },
        ].map((s, i) => (
          <div key={i} className="stat-card p-5">
            <div className={`inline-flex p-2.5 rounded-xl ${s.light} mb-3`}>
              <Icon name={s.icon} size={20} className={s.text} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Прибыльность по объектам</h3>
          <div className="space-y-4">
            {PROJECTS.map(p => {
              const margin = Math.round((1 - p.spent / p.budget) * 100);
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className={`font-semibold ${margin > 15 ? "text-green-600" : margin > 0 ? "text-orange-500" : "text-red-500"}`}>
                      {margin}% маржа
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(p.progress, 100)}%`, background: margin > 15 ? "#16a34a" : margin > 0 ? "#f97316" : "#ef4444" }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Расходы: {fmt(p.spent)}</span>
                    <span>Бюджет: {fmt(p.budget)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">История операций</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {TRANSACTIONS.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${t.type === "income" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  <Icon name={t.type === "income" ? "ArrowDownLeft" : "ArrowUpRight"} size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{t.description}</div>
                  <div className="text-xs text-gray-400">{t.project} · {new Date(t.date).toLocaleDateString("ru-RU")}</div>
                </div>
                <div className={`text-sm font-bold flex-shrink-0 ${t.type === "income" ? "text-green-600" : "text-red-500"}`}>
                  {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function Team() {
  const empStatusLabels: Record<string, string> = { available: "Свободен", busy: "Занят", vacation: "Отпуск" };
  const empStatusColors: Record<string, string> = { available: "status-active", busy: "status-progress", vacation: "status-paused" };

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Команда" subtitle={`${EMPLOYEES.length} работников`} action="Добавить работника" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {EMPLOYEES.map(e => (
          <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-colors">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                {e.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{e.name}</div>
                <div className="text-sm text-gray-500">{e.role}</div>
                <div className="mt-1.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${empStatusColors[e.status]}`}>
                    {empStatusLabels[e.status]}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 border-t border-gray-50 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="Phone" size={13} />
                {e.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name="ClipboardList" size={13} />
                Активных задач: <strong>{e.tasks}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Распределение по объектам</h3>
        <div className="space-y-3">
          {PROJECTS.filter(p => p.status !== "done").map(p => (
            <div key={p.id} className="flex items-center gap-4">
              <div className="w-40 text-sm text-gray-700 truncate font-medium">{p.name}</div>
              <div className="flex gap-2 flex-wrap">
                {EMPLOYEES.slice(0, 3).map(e => (
                  <div key={e.id} className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-xs font-medium" title={e.name}>
                    {e.name[0]}
                  </div>
                ))}
              </div>
              <div className="flex-1">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <div className="text-sm text-gray-500 w-12 text-right">{p.progress}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────

function Analytics() {
  const totalBudget = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const totalSpent = PROJECTS.reduce((s, p) => s + p.spent, 0);
  const doneCount = PROJECTS.filter(p => p.status === "done").length;
  const avgMargin = Math.round(PROJECTS.reduce((s, p) => s + (1 - p.spent / p.budget) * 100, 0) / PROJECTS.length);

  const kpis = [
    { label: "Общий бюджет проектов", value: fmt(totalBudget), sub: "по всем объектам" },
    { label: "Итого потрачено", value: fmt(totalSpent), sub: `${Math.round(totalSpent / totalBudget * 100)}% от бюджетов` },
    { label: "Завершено объектов", value: String(doneCount), sub: `из ${PROJECTS.length} всего` },
    { label: "Средняя маржа", value: `${avgMargin}%`, sub: "по всем проектам" },
  ];

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Аналитика" subtitle="Отчёты по работам и финансам" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="stat-card p-5">
            <div className="text-sm text-gray-500 mb-2">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-5">Использование бюджета</h3>
          <div className="space-y-5">
            {PROJECTS.map(p => {
              const pct = Math.round(p.spent / p.budget * 100);
              return (
                <div key={p.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-800">{p.name}</span>
                    <span className="text-gray-500">{fmt(p.spent)} / {fmt(p.budget)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, background: pct > 90 ? "#ef4444" : pct > 70 ? "#f97316" : "#22c55e" }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{pct}% использовано</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-5">Структура работ в сметах</h3>
          <div className="space-y-3">
            {ESTIMATE_ITEMS.map(item => {
              const total = ESTIMATE_ITEMS.reduce((s, i) => s + i.qty * i.price, 0);
              const pct = Math.round(item.qty * item.price / total * 100);
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-gray-700 truncate">{item.name}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-sm font-medium text-gray-600 w-10 text-right">{pct}%</div>
                  <div className="text-sm text-gray-500 w-24 text-right">{fmt(item.qty * item.price)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Clients ──────────────────────────────────────────────────────────────────

function Clients() {
  return (
    <div className="animate-fade-in">
      <SectionHeader title="Клиенты" subtitle={`${CLIENTS.length} контактов`} action="Добавить клиента" />

      <div className="grid gap-4">
        {CLIENTS.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{c.name}</div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Icon name="Phone" size={13} />
                      {c.phone}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Icon name="Mail" size={13} />
                      {c.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-xl font-bold text-gray-900">{c.projects}</div>
                  <div className="text-xs text-gray-400">объектов</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-500">{fmt(c.totalRevenue)}</div>
                  <div className="text-xs text-gray-400">выручка</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">{new Date(c.lastContact).toLocaleDateString("ru-RU")}</div>
                  <div className="text-xs text-gray-400">контакт</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard />;
      case "objects": return <Objects />;
      case "estimates": return <Estimates />;
      case "warehouse": return <Warehouse />;
      case "finance": return <Finance />;
      case "team": return <Team />;
      case "analytics": return <Analytics />;
      case "clients": return <Clients />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar fixed lg:relative z-30 h-full w-64 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <Icon name="HardHat" size={18} />
            </div>
            <div>
              <div className="font-bold text-white text-base leading-none">ОтделкаПро</div>
              <div className="text-xs text-white/40 mt-0.5">CRM система</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium ${section === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold text-sm">
              И
            </div>
            <div>
              <div className="text-sm font-medium text-white">Иван Иванов</div>
              <div className="text-xs text-white/40">Владелец</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-800"
          >
            <Icon name="Menu" size={20} />
          </button>
          <div className="flex-1 text-sm text-gray-400 hidden sm:block">
            {NAV_ITEMS.find(n => n.id === section)?.label}
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Icon name="Bell" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Icon name="Settings" size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
