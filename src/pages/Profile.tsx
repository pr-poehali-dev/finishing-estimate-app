import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { getMe, updateProfile, changePassword, logout, getToken, getStoredUser, type UserData } from "@/lib/api";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(getStoredUser());
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");

  useEffect(() => {
    if (!getToken()) { navigate("/auth"); return; }
    getMe()
      .then(u => { setUser(u); fillForm(u); setLoading(false); })
      .catch(() => { navigate("/auth"); });
  }, [navigate]);

  const fillForm = (u: UserData) => {
    setFullName(u.full_name || "");
    setPhone(u.phone || "");
    setCompany(u.company_name || "");
    setPosition(u.position || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setMsg("");
    try {
      const updated = await updateProfile({
        full_name: fullName,
        phone: phone || undefined,
        company_name: company || undefined,
        position: position || undefined,
      });
      setUser(updated);
      setMsg("Профиль обновлён");
      setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const er = err as { error?: string };
      setError(er.error || "Ошибка сохранения");
    } finally { setSaving(false); }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== newPass2) { setError("Пароли не совпадают"); return; }
    setSaving(true); setError(""); setMsg("");
    try {
      await changePassword(curPass, newPass);
      setMsg("Пароль изменён");
      setCurPass(""); setNewPass(""); setNewPass2("");
      setTimeout(() => setMsg(""), 3000);
    } catch (err: unknown) {
      const er = err as { error?: string };
      setError(er.error || "Ошибка смены пароля");
    } finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(222 20% 96%)" }}>
        <Icon name="Loader2" size={28} className="animate-spin text-amber-500" />
      </div>
    );
  }

  const initials = user?.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";

  return (
    <div className="min-h-screen" style={{ background: "hsl(222 20% 96%)" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-100 h-14 flex items-center px-6 gap-4">
        <button className="btn-ghost" onClick={() => navigate("/")} style={{ padding: "6px 12px" }}>
          <Icon name="ArrowLeft" size={14} />Назад
        </button>
        <p className="text-sm font-semibold text-gray-700 flex-1">Личный кабинет</p>
        <button className="btn-ghost" onClick={handleLogout} style={{ padding: "6px 12px" }}>
          <Icon name="LogOut" size={14} />Выйти
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {/* User card */}
        <div className="panel p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: "hsl(38 92% 50%)", color: "hsl(220 28% 11%)" }}>
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{user?.full_name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="badge badge-teal">{user?.role === "admin" ? "Администратор" : user?.role === "foreman" ? "Прораб" : "Менеджер"}</span>
              {user?.company_name && <span className="badge badge-gray">{user.company_name}</span>}
              {user?.position && <span className="badge badge-blue">{user.position}</span>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {[
            { id: "profile", label: "Профиль" },
            { id: "password", label: "Безопасность" },
          ].map(t => (
            <div key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setError(""); setMsg(""); }}>
              {t.label}
            </div>
          ))}
        </div>

        {msg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-sm text-emerald-700">
            <Icon name="CheckCircle" size={15} className="text-emerald-500" />{msg}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700">
            <Icon name="AlertCircle" size={15} className="text-red-500" />{error}
          </div>
        )}

        {tab === "profile" && (
          <form onSubmit={handleSave} className="panel p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">ФИО *</label>
              <input className="inp" value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Телефон</label>
                <input className="inp" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 900 123-45-67" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Должность</label>
                <input className="inp" value={position} onChange={e => setPosition(e.target.value)} placeholder="Руководитель" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Компания</label>
              <input className="inp" value={company} onChange={e => setCompany(e.target.value)} placeholder="ООО «Компания»" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input className="inp" value={user?.email || ""} disabled style={{ opacity: 0.5 }} />
              <p className="text-xs text-gray-400 mt-1">Email нельзя изменить</p>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-accent" style={{ padding: "10px 20px" }}>
                {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Save" size={14} />}
                Сохранить
              </button>
            </div>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={handlePassword} className="panel p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Текущий пароль *</label>
              <input className="inp" type="password" value={curPass} onChange={e => setCurPass(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Новый пароль *</label>
              <input className="inp" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={6} placeholder="Минимум 6 символов" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Подтверждение пароля *</label>
              <input className="inp" type="password" value={newPass2} onChange={e => setNewPass2(e.target.value)} required minLength={6} />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "10px 20px" }}>
                {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Lock" size={14} />}
                Сменить пароль
              </button>
            </div>
          </form>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="panel p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-400 mt-1">объектов</p>
          </div>
          <div className="panel p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-400 mt-1">задач</p>
          </div>
          <div className="panel p-4 text-center">
            <p className="text-xs text-gray-400">Аккаунт создан</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
