import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { getToken, getStoredUser, getMe, logout as apiLogout, type UserData } from "@/lib/api";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

type View = "dashboard" | "objects" | "object-detail" | "clients" | "estimates" | "finance" | "warehouse" | "tasks" | "team" | "analytics" | "docs";

type ObjStatus = "lead" | "measure" | "estimate" | "contract" | "working" | "paused" | "done" | "closed";
type DocStatus = "draft" | "sent" | "agreed" | "signed" | "rejected";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type TaskStatus = "new" | "in_progress" | "done" | "cancelled";

interface Project {
  id: number; name: string; type: string; address: string;
  clientId: number; status: ObjStatus;
  start: string; planEnd: string; factEnd?: string;
  manager: string; foreman: string;
  budget: number; agreed: number; paid: number;
  costs: number; progress: number;
  tags: string[];
}

interface Client {
  id: number; name: string; type: "person" | "company";
  phone: string; email: string;
  inn?: string; address?: string;
  projects: number; revenue: number; lastContact: string;
}

interface EstimateSection {
  id: number; title: string;
  items: EstimateItem[];
}

interface EstimateItem {
  id: number; name: string; unit: string;
  qty: number; price: number; cost: number;
  done: number; section: string;
}

interface FinOp {
  id: number; date: string; type: "income" | "expense";
  category: string; project: string; counterparty: string;
  amount: number; method: "cash" | "bank" | "card";
  basis: string; note: string; confirmed: boolean;
}

interface Task {
  id: number; title: string; project: string;
  assignee: string; due: string;
  priority: TaskPriority; status: TaskStatus;
  checklist: { text: string; done: boolean }[];
}

interface Material {
  id: number; name: string; category: string;
  unit: string; qty: number; minQty: number;
  price: number; supplier: string;
}

interface Employee {
  id: number; name: string; role: string;
  phone: string; status: "available" | "busy" | "vacation";
  specialty: string[]; rate: number;
}

// ═══════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════

const CLIENTS: Client[] = [
  { id: 1, name: "Смирнов Александр Витальевич", type: "person", phone: "+7 911 111-11-11", email: "smirnov@mail.ru", projects: 2, revenue: 1440000, lastContact: "2026-04-10" },
  { id: 2, name: "ООО «Прогресс Девелопмент»", type: "company", phone: "+7 800 200-30-40", email: "info@progress.ru", inn: "7701234567", projects: 3, revenue: 4800000, lastContact: "2026-04-08" },
  { id: 3, name: "Петров Дмитрий Сергеевич", type: "person", phone: "+7 922 222-22-22", email: "petrov@gmail.com", projects: 1, revenue: 950000, lastContact: "2026-03-01" },
  { id: 4, name: "ИП Козлова Марина Юрьевна", type: "company", phone: "+7 933 333-33-33", email: "kozlova@yandex.ru", inn: "503500111222", projects: 2, revenue: 1080000, lastContact: "2026-04-06" },
  { id: 5, name: "Новикова Мария Леонидовна", type: "person", phone: "+7 944 444-44-44", email: "novikova@mail.ru", projects: 1, revenue: 280000, lastContact: "2026-04-09" },
  { id: 6, name: "ЗАО «СтройКомфорт»", type: "company", phone: "+7 495 700-10-20", email: "mail@stroykomfort.ru", inn: "7709876543", projects: 4, revenue: 9200000, lastContact: "2026-04-11" },
];

const PROJECTS: Project[] = [
  { id: 1, name: "Квартира Смирновых — 3-комн.", type: "Квартира", address: "ул. Ленина, 45, кв. 12", clientId: 1, status: "working", start: "2026-02-15", planEnd: "2026-05-15", manager: "Иванова А.", foreman: "Морозов А.", budget: 580000, agreed: 560000, paid: 340000, costs: 310000, progress: 65, tags: ["капитальный", "вторичка"] },
  { id: 2, name: "Офис ООО Прогресс — 3 этаж", type: "Офис", address: "пр. Победы, 12, оф. 301", clientId: 2, status: "contract", start: "2026-04-01", planEnd: "2026-06-30", manager: "Иванова А.", foreman: "Попов Д.", budget: 1200000, agreed: 1180000, paid: 180000, costs: 95000, progress: 18, tags: ["офис", "white-box"] },
  { id: 3, name: "Дом Петровых — коттедж", type: "Дом", address: "ул. Садовая, 8", clientId: 3, status: "done", start: "2025-10-01", planEnd: "2026-03-01", factEnd: "2026-03-05", manager: "Соколов В.", foreman: "Козлов А.", budget: 950000, agreed: 940000, paid: 940000, costs: 820000, progress: 100, tags: ["капитальный", "коттедж"] },
  { id: 4, name: "Магазин Уют — торговый зал", type: "Коммерческое", address: "пр. Мира, 55", clientId: 4, status: "paused", start: "2026-01-15", planEnd: "2026-07-10", manager: "Иванова А.", foreman: "Морозов А.", budget: 430000, agreed: 420000, paid: 95000, costs: 110000, progress: 22, tags: ["коммерческое"] },
  { id: 5, name: "Студия дизайна — офис", type: "Офис", address: "ул. Горького, 78", clientId: 5, status: "working", start: "2026-03-01", planEnd: "2026-05-01", manager: "Соколов В.", foreman: "Волков С.", budget: 280000, agreed: 275000, paid: 220000, costs: 195000, progress: 78, tags: ["дизайнерский"] },
  { id: 6, name: "БЦ «Кристалл» — 2 этаж", type: "Офис", address: "Ленинградский пр., 80", clientId: 6, status: "working", start: "2026-03-20", planEnd: "2026-08-30", manager: "Иванова А.", foreman: "Попов Д.", budget: 3400000, agreed: 3350000, paid: 800000, costs: 620000, progress: 24, tags: ["коммерческое", "капитальный"] },
  { id: 7, name: "Квартира Смирновых — кухня", type: "Квартира", address: "ул. Ленина, 45, кв. 12", clientId: 1, status: "estimate", start: "2026-05-20", planEnd: "2026-07-10", manager: "Иванова А.", foreman: "", budget: 180000, agreed: 0, paid: 0, costs: 0, progress: 0, tags: ["доп. работы"] },
];

const ESTIMATE_SECTIONS: EstimateSection[] = [
  { id: 1, title: "Демонтажные работы", items: [
    { id: 1, name: "Демонтаж стяжки", unit: "м²", qty: 60, price: 350, cost: 180, done: 100, section: "Демонтаж" },
    { id: 2, name: "Демонтаж перегородок", unit: "м²", qty: 18, price: 600, cost: 280, done: 100, section: "Демонтаж" },
  ]},
  { id: 2, title: "Черновые работы", items: [
    { id: 3, name: "Стяжка пола (50мм)", unit: "м²", qty: 60, price: 850, cost: 420, done: 80, section: "Черновые" },
    { id: 4, name: "Штукатурка стен механизированная", unit: "м²", qty: 180, price: 480, cost: 220, done: 60, section: "Черновые" },
    { id: 5, name: "Шпатлёвка стен", unit: "м²", qty: 180, price: 280, cost: 130, done: 30, section: "Черновые" },
  ]},
  { id: 3, title: "Чистовая отделка", items: [
    { id: 6, name: "Покраска стен 2 слоя", unit: "м²", qty: 180, price: 380, cost: 160, done: 0, section: "Чистовая" },
    { id: 7, name: "Укладка плитки (санузел)", unit: "м²", qty: 22, price: 1800, cost: 850, done: 45, section: "Чистовая" },
    { id: 8, name: "Укладка ламината", unit: "м²", qty: 38, price: 650, cost: 280, done: 0, section: "Чистовая" },
  ]},
  { id: 4, title: "Материалы", items: [
    { id: 9, name: "Шпатлёвка Knauf Rotband 30кг", unit: "мешок", qty: 40, price: 580, cost: 480, done: 100, section: "Материалы" },
    { id: 10, name: "Плитка керам. 30×60 (белая)", unit: "м²", qty: 25, price: 1200, cost: 1200, done: 60, section: "Материалы" },
  ]},
];

const FIN_OPS: FinOp[] = [
  { id: 1, date: "2026-04-10", type: "income", category: "Оплата по договору", project: "Квартира Смирновых", counterparty: "Смирнов А.В.", amount: 120000, method: "bank", basis: "Счёт №47", note: "", confirmed: true },
  { id: 2, date: "2026-04-09", type: "expense", category: "Материалы", project: "БЦ Кристалл", counterparty: "ООО СтройМаркет", amount: 148000, method: "bank", basis: "Счёт №1201", note: "Плитка, клей", confirmed: true },
  { id: 3, date: "2026-04-08", type: "income", category: "Аванс", project: "Студия дизайна", counterparty: "Новикова М.Л.", amount: 80000, method: "cash", basis: "ПКО №15", note: "", confirmed: true },
  { id: 4, date: "2026-04-07", type: "expense", category: "Зарплата", project: "Квартира Смирновых", counterparty: "Морозов А.", amount: 55000, method: "bank", basis: "", note: "Аванс за апрель", confirmed: false },
  { id: 5, date: "2026-04-06", type: "income", category: "Итоговый расчёт", project: "Дом Петровых", counterparty: "Петров Д.С.", amount: 250000, method: "bank", basis: "Счёт №44", note: "", confirmed: true },
  { id: 6, date: "2026-04-05", type: "expense", category: "Аренда оборудования", project: "Офис Прогресс", counterparty: "ИП Аренда+", amount: 18000, method: "card", basis: "Договор аренды", note: "Лесá", confirmed: true },
  { id: 7, date: "2026-04-04", type: "expense", category: "Материалы", project: "БЦ Кристалл", counterparty: "ТД Кнауф", amount: 67000, method: "bank", basis: "Счёт №882", note: "Шпатлёвка, грунт", confirmed: true },
  { id: 8, date: "2026-04-03", type: "income", category: "Промежуточная оплата", project: "БЦ Кристалл", counterparty: "ЗАО СтройКомфорт", amount: 400000, method: "bank", basis: "Счёт №50", note: "", confirmed: true },
];

const TASKS: Task[] = [
  { id: 1, title: "Закупить плитку для санузла — Смирновы", project: "Квартира Смирновых", assignee: "Морозов А.", due: "2026-04-14", priority: "high", status: "in_progress", checklist: [{ text: "Согласовать артикул с клиентом", done: true }, { text: "Оформить заказ", done: false }, { text: "Доставка на объект", done: false }] },
  { id: 2, title: "Согласовать смету с клиентом", project: "Офис Прогресс", assignee: "Иванова А.", due: "2026-04-13", priority: "urgent", status: "new", checklist: [] },
  { id: 3, title: "Замер квартиры Смирновых — кухня", project: "Квартира Смирновых — кухня", assignee: "Волков С.", due: "2026-04-12", priority: "medium", status: "done", checklist: [{ text: "Выехать на замер", done: true }, { text: "Сделать чертёж", done: true }] },
  { id: 4, title: "Вывоз строительного мусора", project: "БЦ Кристалл", assignee: "Попов Д.", due: "2026-04-15", priority: "low", status: "new", checklist: [] },
  { id: 5, title: "Оформить акт КС-2 — Дом Петровых", project: "Дом Петровых", assignee: "Иванова А.", due: "2026-04-11", priority: "high", status: "in_progress", checklist: [{ text: "Заполнить форму", done: true }, { text: "Подписать у прораба", done: false }, { text: "Отправить клиенту", done: false }] },
];

const MATERIALS: Material[] = [
  { id: 1, name: "Шпатлёвка Knauf Rotband", category: "Штукатурка", unit: "кг", qty: 450, minQty: 100, price: 42, supplier: "ТД Кнауф" },
  { id: 2, name: "Грунтовка Ceresit CT 17", category: "Грунт", unit: "л", qty: 85, minQty: 20, price: 180, supplier: "Ceresit" },
  { id: 3, name: "Краска Caparol ELF белая", category: "ЛКМ", unit: "л", qty: 12, minQty: 30, price: 420, supplier: "Caparol" },
  { id: 4, name: "Плитка керам. 30×60 белая", category: "Плитка", unit: "м²", qty: 38, minQty: 10, price: 850, supplier: "CeramicsPlus" },
  { id: 5, name: "Плиточный клей C1T", category: "Клей", unit: "кг", qty: 220, minQty: 50, price: 35, supplier: "Bergauf" },
  { id: 6, name: "Гипсокартон 12.5мм", category: "ГКЛ", unit: "лист", qty: 45, minQty: 15, price: 380, supplier: "Knauf" },
  { id: 7, name: "Профиль CD 60/3000", category: "Профиль", unit: "шт", qty: 8, minQty: 20, price: 95, supplier: "ЛП Профиль" },
  { id: 8, name: "Ламинат 32кл. 8мм дуб", category: "Напольные", unit: "м²", qty: 0, minQty: 5, price: 640, supplier: "FloorMaster" },
];

const EMPLOYEES: Employee[] = [
  { id: 1, name: "Алексей Морозов", role: "Бригадир", phone: "+7 912 345-67-89", status: "busy", specialty: ["Штукатурка", "Плитка", "ГКЛ"], rate: 2800 },
  { id: 2, name: "Дмитрий Попов", role: "Плиточник", phone: "+7 923 456-78-90", status: "busy", specialty: ["Плитка", "Стяжка"], rate: 3200 },
  { id: 3, name: "Сергей Волков", role: "Маляр", phone: "+7 934 567-89-01", status: "available", specialty: ["Покраска", "Шпатлёвка"], rate: 2400 },
  { id: 4, name: "Андрей Козлов", role: "Штукатур", phone: "+7 945 678-90-12", status: "busy", specialty: ["Штукатурка", "ГКЛ"], rate: 2600 },
  { id: 5, name: "Иван Новиков", role: "Разнорабочий", phone: "+7 956 789-01-23", status: "vacation", specialty: ["Демонтаж"], rate: 1800 },
  { id: 6, name: "Виталий Рогов", role: "Электрик", phone: "+7 967 890-12-34", status: "available", specialty: ["Электрика", "Слаботочка"], rate: 3500 },
];

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

const dateRu = (s: string) =>
  new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });

const OBJ_STATUS: Record<ObjStatus, { label: string; cls: string }> = {
  lead:     { label: "Лид",         cls: "badge-gray" },
  measure:  { label: "Замер",       cls: "badge-blue" },
  estimate: { label: "Смета",       cls: "badge-purple" },
  contract: { label: "Договор",     cls: "badge-amber" },
  working:  { label: "В работе",    cls: "badge-teal" },
  paused:   { label: "Пауза",       cls: "badge-orange" },
  done:     { label: "Завершён",    cls: "badge-green" },
  closed:   { label: "Закрыт",      cls: "badge-gray" },
};

const TASK_PRIORITY: Record<TaskPriority, { label: string; cls: string }> = {
  low:    { label: "Низкий",  cls: "badge-gray" },
  medium: { label: "Средний", cls: "badge-blue" },
  high:   { label: "Высокий", cls: "badge-amber" },
  urgent: { label: "Срочно",  cls: "badge-red" },
};

const TASK_STATUS: Record<TaskStatus, { label: string; cls: string }> = {
  new:         { label: "Новая",     cls: "badge-gray" },
  in_progress: { label: "В работе", cls: "badge-teal" },
  done:        { label: "Готово",   cls: "badge-green" },
  cancelled:   { label: "Отменена", cls: "badge-red" },
};

function Badge({ cls, label }: { cls: string; label: string }) {
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Av({ name, size = 32, bg = "hsl(220 28% 20%)" }: { name: string; size?: number; bg?: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35, background: bg, color: "#fff" }}>
      {initials}
    </div>
  );
}

function PageTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
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

// ═══════════════════════════════════════════════════════════
// SIDEBAR CONFIG
// ═══════════════════════════════════════════════════════════

const NAV: { section?: string; id?: View; label?: string; icon?: string }[] = [
  { section: "Обзор" },
  { id: "dashboard", label: "Дашборд",    icon: "LayoutDashboard" },
  { section: "Работа" },
  { id: "objects",   label: "Объекты",    icon: "Building2" },
  { id: "clients",   label: "Клиенты",    icon: "Users" },
  { id: "estimates", label: "Сметы",      icon: "FileText" },
  { id: "tasks",     label: "Задачи",     icon: "CheckSquare" },
  { section: "Финансы и склад" },
  { id: "finance",   label: "Бухгалтерия", icon: "Wallet" },
  { id: "warehouse", label: "Склад",       icon: "Package" },
  { section: "Отчёты" },
  { id: "analytics", label: "Аналитика",  icon: "BarChart2" },
  { id: "docs",      label: "Документы",  icon: "FolderOpen" },
  { section: "Компания" },
  { id: "team",      label: "Команда",    icon: "UserCircle" },
];

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

function Dashboard({ onNav }: { onNav: (v: View) => void }) {
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

// ═══════════════════════════════════════════════════════════
// OBJECTS LIST
// ═══════════════════════════════════════════════════════════

function ObjectsList({ onSelect }: { onSelect: (id: number) => void }) {
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

// ═══════════════════════════════════════════════════════════
// OBJECT DETAIL
// ═══════════════════════════════════════════════════════════

function ObjectDetail({ id, onBack }: { id: number; onBack: () => void }) {
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

// ═══════════════════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════════════════

function ClientsPage() {
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

// ═══════════════════════════════════════════════════════════
// ESTIMATES
// ═══════════════════════════════════════════════════════════

function EstimatesPage() {
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

// ═══════════════════════════════════════════════════════════
// FINANCE
// ═══════════════════════════════════════════════════════════

function FinancePage() {
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

// ═══════════════════════════════════════════════════════════
// WAREHOUSE
// ═══════════════════════════════════════════════════════════

function WarehousePage() {
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

// ═══════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════

function TasksPage() {
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

// ═══════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════

function AnalyticsPage() {
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

// ═══════════════════════════════════════════════════════════
// TEAM
// ═══════════════════════════════════════════════════════════

function TeamPage() {
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

// ═══════════════════════════════════════════════════════════
// DOCS
// ═══════════════════════════════════════════════════════════

function DocsPage() {
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

// ═══════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════

export default function Index() {
  const routerNav = useNavigate();
  const [view, setView] = useState<View>("dashboard");
  const [selProject, setSelProject] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState<UserData | null>(getStoredUser());

  useEffect(() => {
    if (!getToken()) { routerNav("/auth"); return; }
    getMe().then(u => setAuthUser(u)).catch(() => routerNav("/auth"));
  }, [routerNav]);

  const handleLogout = async () => { await apiLogout(); routerNav("/auth"); };

  const navigate = (v: View) => { setView(v); setSidebarOpen(false); };

  const handleSelect = (id: number) => { setSelProject(id); setView("object-detail"); };

  const renderMain = () => {
    switch (view) {
      case "dashboard":     return <Dashboard onNav={navigate} />;
      case "objects":       return <ObjectsList onSelect={handleSelect} />;
      case "object-detail": return selProject ? <ObjectDetail id={selProject} onBack={() => setView("objects")} /> : <ObjectsList onSelect={handleSelect} />;
      case "clients":       return <ClientsPage />;
      case "estimates":     return <EstimatesPage />;
      case "finance":       return <FinancePage />;
      case "warehouse":     return <WarehousePage />;
      case "tasks":         return <TasksPage />;
      case "analytics":     return <AnalyticsPage />;
      case "team":          return <TeamPage />;
      case "docs":          return <DocsPage />;
    }
  };

  const activeLabel = NAV.find(n => n.id === view)?.label ?? (view === "object-detail" ? "Объект" : "");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(222 20% 96%)" }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sb fixed lg:relative z-30 h-full flex flex-col transition-transform duration-300 ${sidebarOpen?"translate-x-0":"-translate-x-full lg:translate-x-0"}`} style={{ width: 220 }}>
        <div className="px-4 py-4" style={{ borderBottom: "1px solid hsl(220 20% 17%)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(38 92% 50%)" }}>
              <Icon name="HardHat" size={16} className="text-gray-900" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-none">СтройПро</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 12% 40%)" }}>Управление объектами</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: "none" }}>
          {NAV.map((item, i) => {
            if (item.section) return <div key={i} className="sb-section">{item.section}</div>;
            const isActive = item.id === view || (item.id === "objects" && view === "object-detail");
            return (
              <div key={i} className={`sb-link ${isActive ? "active" : ""}`} onClick={() => navigate(item.id!)}>
                <Icon name={item.icon!} size={16} />
                {item.label}
              </div>
            );
          })}
        </nav>

        <div className="px-3 py-3" style={{ borderTop: "1px solid hsl(220 20% 17%)" }}>
          <div className="flex items-center gap-2.5 px-2 cursor-pointer" onClick={() => routerNav("/profile")}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "hsl(38 92% 50%)", color: "#0f1b2d" }}>
              {authUser?.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{authUser?.full_name || "Загрузка..."}</p>
              <p className="text-xs truncate" style={{ color: "hsl(220 12% 40%)" }}>{authUser?.position || authUser?.role || ""}</p>
            </div>
          </div>
          <button className="sb-link mt-1" onClick={handleLogout} style={{ fontSize: 12, color: "hsl(220 12% 42%)" }}>
            <Icon name="LogOut" size={13} />Выйти
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 h-12 flex items-center px-4 gap-3 flex-shrink-0">
          <button className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Icon name="Menu" size={18} />
          </button>
          <p className="text-sm font-semibold text-gray-700 flex-1">{activeLabel}</p>
          <div className="flex items-center gap-1">
            <button className="relative p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
              <Icon name="Bell" size={17} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"><Icon name="Settings" size={17} /></button>
            <button className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"><Icon name="HelpCircle" size={17} /></button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderMain()}
        </main>
      </div>
    </div>
  );
}