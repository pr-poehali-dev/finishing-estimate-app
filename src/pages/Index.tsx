import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { getToken, getStoredUser, getMe, logout as apiLogout, type UserData } from "@/lib/api";
import { type View, NAV } from "@/pages/shared";
import { Dashboard, ObjectsList, ObjectDetail } from "@/pages/DashboardObjects";
import { ClientsPage, EstimatesPage, FinancePage, WarehousePage } from "@/pages/FinancePages";
import { TasksPage, AnalyticsPage, TeamPage, DocsPage } from "@/pages/WorkPages";

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
