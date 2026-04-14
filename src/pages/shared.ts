export type View = "dashboard" | "objects" | "object-detail" | "clients" | "estimates" | "finance" | "warehouse" | "tasks" | "team" | "analytics" | "docs";

export type ObjStatus = "lead" | "measure" | "estimate" | "contract" | "working" | "paused" | "done" | "closed";
export type DocStatus = "draft" | "sent" | "agreed" | "signed" | "rejected";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "new" | "in_progress" | "done" | "cancelled";

export interface Project {
  id: number; name: string; type: string; address: string;
  clientId: number; status: ObjStatus;
  start: string; planEnd: string; factEnd?: string;
  manager: string; foreman: string;
  budget: number; agreed: number; paid: number;
  costs: number; progress: number;
  tags: string[];
}

export interface Client {
  id: number; name: string; type: "person" | "company";
  phone: string; email: string;
  inn?: string; address?: string;
  projects: number; revenue: number; lastContact: string;
}

export interface EstimateSection {
  id: number; title: string;
  items: EstimateItem[];
}

export interface EstimateItem {
  id: number; name: string; unit: string;
  qty: number; price: number; cost: number;
  done: number; section: string;
}

export interface FinOp {
  id: number; date: string; type: "income" | "expense";
  category: string; project: string; counterparty: string;
  amount: number; method: "cash" | "bank" | "card";
  basis: string; note: string; confirmed: boolean;
}

export interface Task {
  id: number; title: string; project: string;
  assignee: string; due: string;
  priority: TaskPriority; status: TaskStatus;
  checklist: { text: string; done: boolean }[];
}

export interface Material {
  id: number; name: string; category: string;
  unit: string; qty: number; minQty: number;
  price: number; supplier: string;
}

export interface Employee {
  id: number; name: string; role: string;
  phone: string; status: "available" | "busy" | "vacation";
  specialty: string[]; rate: number;
}

export const CLIENTS: Client[] = [
  { id: 1, name: "Смирнов Александр Витальевич", type: "person", phone: "+7 911 111-11-11", email: "smirnov@mail.ru", projects: 2, revenue: 1440000, lastContact: "2026-04-10" },
  { id: 2, name: "ООО «Прогресс Девелопмент»", type: "company", phone: "+7 800 200-30-40", email: "info@progress.ru", inn: "7701234567", projects: 3, revenue: 4800000, lastContact: "2026-04-08" },
  { id: 3, name: "Петров Дмитрий Сергеевич", type: "person", phone: "+7 922 222-22-22", email: "petrov@gmail.com", projects: 1, revenue: 950000, lastContact: "2026-03-01" },
  { id: 4, name: "ИП Козлова Марина Юрьевна", type: "company", phone: "+7 933 333-33-33", email: "kozlova@yandex.ru", inn: "503500111222", projects: 2, revenue: 1080000, lastContact: "2026-04-06" },
  { id: 5, name: "Новикова Мария Леонидовна", type: "person", phone: "+7 944 444-44-44", email: "novikova@mail.ru", projects: 1, revenue: 280000, lastContact: "2026-04-09" },
  { id: 6, name: "ЗАО «СтройКомфорт»", type: "company", phone: "+7 495 700-10-20", email: "mail@stroykomfort.ru", inn: "7709876543", projects: 4, revenue: 9200000, lastContact: "2026-04-11" },
];

export const PROJECTS: Project[] = [
  { id: 1, name: "Квартира Смирновых — 3-комн.", type: "Квартира", address: "ул. Ленина, 45, кв. 12", clientId: 1, status: "working", start: "2026-02-15", planEnd: "2026-05-15", manager: "Иванова А.", foreman: "Морозов А.", budget: 580000, agreed: 560000, paid: 340000, costs: 310000, progress: 65, tags: ["капитальный", "вторичка"] },
  { id: 2, name: "Офис ООО Прогресс — 3 этаж", type: "Офис", address: "пр. Победы, 12, оф. 301", clientId: 2, status: "contract", start: "2026-04-01", planEnd: "2026-06-30", manager: "Иванова А.", foreman: "Попов Д.", budget: 1200000, agreed: 1180000, paid: 180000, costs: 95000, progress: 18, tags: ["офис", "white-box"] },
  { id: 3, name: "Дом Петровых — коттедж", type: "Дом", address: "ул. Садовая, 8", clientId: 3, status: "done", start: "2025-10-01", planEnd: "2026-03-01", factEnd: "2026-03-05", manager: "Соколов В.", foreman: "Козлов А.", budget: 950000, agreed: 940000, paid: 940000, costs: 820000, progress: 100, tags: ["капитальный", "коттедж"] },
  { id: 4, name: "Магазин Уют — торговый зал", type: "Коммерческое", address: "пр. Мира, 55", clientId: 4, status: "paused", start: "2026-01-15", planEnd: "2026-07-10", manager: "Иванова А.", foreman: "Морозов А.", budget: 430000, agreed: 420000, paid: 95000, costs: 110000, progress: 22, tags: ["коммерческое"] },
  { id: 5, name: "Студия дизайна — офис", type: "Офис", address: "ул. Горького, 78", clientId: 5, status: "working", start: "2026-03-01", planEnd: "2026-05-01", manager: "Соколов В.", foreman: "Волков С.", budget: 280000, agreed: 275000, paid: 220000, costs: 195000, progress: 78, tags: ["дизайнерский"] },
  { id: 6, name: "БЦ «Кристалл» — 2 этаж", type: "Офис", address: "Ленинградский пр., 80", clientId: 6, status: "working", start: "2026-03-20", planEnd: "2026-08-30", manager: "Иванова А.", foreman: "Попов Д.", budget: 3400000, agreed: 3350000, paid: 800000, costs: 620000, progress: 24, tags: ["коммерческое", "капитальный"] },
  { id: 7, name: "Квартира Смирновых — кухня", type: "Квартира", address: "ул. Ленина, 45, кв. 12", clientId: 1, status: "estimate", start: "2026-05-20", planEnd: "2026-07-10", manager: "Иванова А.", foreman: "", budget: 180000, agreed: 0, paid: 0, costs: 0, progress: 0, tags: ["доп. работы"] },
];

export const ESTIMATE_SECTIONS: EstimateSection[] = [
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

export const FIN_OPS: FinOp[] = [
  { id: 1, date: "2026-04-10", type: "income", category: "Оплата по договору", project: "Квартира Смирновых", counterparty: "Смирнов А.В.", amount: 120000, method: "bank", basis: "Счёт №47", note: "", confirmed: true },
  { id: 2, date: "2026-04-09", type: "expense", category: "Материалы", project: "БЦ Кристалл", counterparty: "ООО СтройМаркет", amount: 148000, method: "bank", basis: "Счёт №1201", note: "Плитка, клей", confirmed: true },
  { id: 3, date: "2026-04-08", type: "income", category: "Аванс", project: "Студия дизайна", counterparty: "Новикова М.Л.", amount: 80000, method: "cash", basis: "ПКО №15", note: "", confirmed: true },
  { id: 4, date: "2026-04-07", type: "expense", category: "Зарплата", project: "Квартира Смирновых", counterparty: "Морозов А.", amount: 55000, method: "bank", basis: "", note: "Аванс за апрель", confirmed: false },
  { id: 5, date: "2026-04-06", type: "income", category: "Итоговый расчёт", project: "Дом Петровых", counterparty: "Петров Д.С.", amount: 250000, method: "bank", basis: "Счёт №44", note: "", confirmed: true },
  { id: 6, date: "2026-04-05", type: "expense", category: "Аренда оборудования", project: "Офис Прогресс", counterparty: "ИП Аренда+", amount: 18000, method: "card", basis: "Договор аренды", note: "Лесá", confirmed: true },
  { id: 7, date: "2026-04-04", type: "expense", category: "Материалы", project: "БЦ Кристалл", counterparty: "ТД Кнауф", amount: 67000, method: "bank", basis: "Счёт №882", note: "Шпатлёвка, грунт", confirmed: true },
  { id: 8, date: "2026-04-03", type: "income", category: "Промежуточная оплата", project: "БЦ Кристалл", counterparty: "ЗАО СтройКомфорт", amount: 400000, method: "bank", basis: "Счёт №50", note: "", confirmed: true },
];

export const TASKS: Task[] = [
  { id: 1, title: "Закупить плитку для санузла — Смирновы", project: "Квартира Смирновых", assignee: "Морозов А.", due: "2026-04-14", priority: "high", status: "in_progress", checklist: [{ text: "Согласовать артикул с клиентом", done: true }, { text: "Оформить заказ", done: false }, { text: "Доставка на объект", done: false }] },
  { id: 2, title: "Согласовать смету с клиентом", project: "Офис Прогресс", assignee: "Иванова А.", due: "2026-04-13", priority: "urgent", status: "new", checklist: [] },
  { id: 3, title: "Замер квартиры Смирновых — кухня", project: "Квартира Смирновых — кухня", assignee: "Волков С.", due: "2026-04-12", priority: "medium", status: "done", checklist: [{ text: "Выехать на замер", done: true }, { text: "Сделать чертёж", done: true }] },
  { id: 4, title: "Вывоз строительного мусора", project: "БЦ Кристалл", assignee: "Попов Д.", due: "2026-04-15", priority: "low", status: "new", checklist: [] },
  { id: 5, title: "Оформить акт КС-2 — Дом Петровых", project: "Дом Петровых", assignee: "Иванова А.", due: "2026-04-11", priority: "high", status: "in_progress", checklist: [{ text: "Заполнить форму", done: true }, { text: "Подписать у прораба", done: false }, { text: "Отправить клиенту", done: false }] },
];

export const MATERIALS: Material[] = [
  { id: 1, name: "Шпатлёвка Knauf Rotband", category: "Штукатурка", unit: "кг", qty: 450, minQty: 100, price: 42, supplier: "ТД Кнауф" },
  { id: 2, name: "Грунтовка Ceresit CT 17", category: "Грунт", unit: "л", qty: 85, minQty: 20, price: 180, supplier: "Ceresit" },
  { id: 3, name: "Краска Caparol ELF белая", category: "ЛКМ", unit: "л", qty: 12, minQty: 30, price: 420, supplier: "Caparol" },
  { id: 4, name: "Плитка керам. 30×60 белая", category: "Плитка", unit: "м²", qty: 38, minQty: 10, price: 850, supplier: "CeramicsPlus" },
  { id: 5, name: "Плиточный клей C1T", category: "Клей", unit: "кг", qty: 220, minQty: 50, price: 35, supplier: "Bergauf" },
  { id: 6, name: "Гипсокартон 12.5мм", category: "ГКЛ", unit: "лист", qty: 45, minQty: 15, price: 380, supplier: "Knauf" },
  { id: 7, name: "Профиль CD 60/3000", category: "Профиль", unit: "шт", qty: 8, minQty: 20, price: 95, supplier: "ЛП Профиль" },
  { id: 8, name: "Ламинат 32кл. 8мм дуб", category: "Напольные", unit: "м²", qty: 0, minQty: 5, price: 640, supplier: "FloorMaster" },
];

export const EMPLOYEES: Employee[] = [
  { id: 1, name: "Алексей Морозов", role: "Бригадир", phone: "+7 912 345-67-89", status: "busy", specialty: ["Штукатурка", "Плитка", "ГКЛ"], rate: 2800 },
  { id: 2, name: "Дмитрий Попов", role: "Плиточник", phone: "+7 923 456-78-90", status: "busy", specialty: ["Плитка", "Стяжка"], rate: 3200 },
  { id: 3, name: "Сергей Волков", role: "Маляр", phone: "+7 934 567-89-01", status: "available", specialty: ["Покраска", "Шпатлёвка"], rate: 2400 },
  { id: 4, name: "Андрей Козлов", role: "Штукатур", phone: "+7 945 678-90-12", status: "busy", specialty: ["Штукатурка", "ГКЛ"], rate: 2600 },
  { id: 5, name: "Иван Новиков", role: "Разнорабочий", phone: "+7 956 789-01-23", status: "vacation", specialty: ["Демонтаж"], rate: 1800 },
  { id: 6, name: "Виталий Рогов", role: "Электрик", phone: "+7 967 890-12-34", status: "available", specialty: ["Электрика", "Слаботочка"], rate: 3500 },
];

export const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

export const dateRu = (s: string) =>
  new Date(s).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });

export const OBJ_STATUS: Record<ObjStatus, { label: string; cls: string }> = {
  lead:     { label: "Лид",         cls: "badge-gray" },
  measure:  { label: "Замер",       cls: "badge-blue" },
  estimate: { label: "Смета",       cls: "badge-purple" },
  contract: { label: "Договор",     cls: "badge-amber" },
  working:  { label: "В работе",    cls: "badge-teal" },
  paused:   { label: "Пауза",       cls: "badge-orange" },
  done:     { label: "Завершён",    cls: "badge-green" },
  closed:   { label: "Закрыт",      cls: "badge-gray" },
};

export const TASK_PRIORITY: Record<TaskPriority, { label: string; cls: string }> = {
  low:    { label: "Низкий",  cls: "badge-gray" },
  medium: { label: "Средний", cls: "badge-blue" },
  high:   { label: "Высокий", cls: "badge-amber" },
  urgent: { label: "Срочно",  cls: "badge-red" },
};

export const TASK_STATUS: Record<TaskStatus, { label: string; cls: string }> = {
  new:         { label: "Новая",     cls: "badge-gray" },
  in_progress: { label: "В работе", cls: "badge-teal" },
  done:        { label: "Готово",   cls: "badge-green" },
  cancelled:   { label: "Отменена", cls: "badge-red" },
};

export const NAV: { section?: string; id?: View; label?: string; icon?: string }[] = [
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
