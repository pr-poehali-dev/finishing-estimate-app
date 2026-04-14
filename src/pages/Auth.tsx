import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { login, register } from "@/lib/api";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({
          email, password, full_name: fullName,
          phone: phone || undefined,
          company_name: company || undefined,
          position: position || undefined,
        });
      }
      navigate("/");
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e.error || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(222 20% 96%)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between p-10" style={{ background: "hsl(220 28% 11%)" }}>
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(38 92% 50%)" }}>
              <Icon name="HardHat" size={18} className="text-gray-900" />
            </div>
            <div>
              <p className="font-bold text-white text-base leading-none">СтройПро</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(220 12% 45%)" }}>Управление объектами</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white leading-tight mb-4">
            Единый центр управления вашими объектами
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(220 12% 55%)" }}>
            Сметы, финансы, задачи, документы — всё в одном месте.
            Контролируйте каждый объект и зарабатывайте больше.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: "Building2", text: "Управление объектами и сметами" },
              { icon: "Wallet", text: "Финансовый контроль и аналитика" },
              { icon: "Users", text: "Команда, клиенты, подрядчики" },
              { icon: "FileText", text: "Документы и акты КС-2, КС-3" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(220 20% 18%)" }}>
                  <Icon name={f.icon} size={15} style={{ color: "hsl(38 92% 50%)" }} />
                </div>
                <span className="text-sm" style={{ color: "hsl(220 12% 65%)" }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "hsl(220 12% 30%)" }}>© 2026 СтройПро. Все права защищены.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(38 92% 50%)" }}>
              <Icon name="HardHat" size={18} className="text-gray-900" />
            </div>
            <p className="font-bold text-gray-900 text-lg">СтройПро</p>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {mode === "login" ? "Вход в систему" : "Регистрация"}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {mode === "login"
              ? "Введите email и пароль для входа"
              : "Создайте аккаунт для работы с системой"}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700">
              <Icon name="AlertCircle" size={15} className="text-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">ФИО *</label>
                  <input className="inp" placeholder="Иванов Алексей Сергеевич" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Телефон</label>
                    <input className="inp" placeholder="+7 900 123-45-67" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Должность</label>
                    <input className="inp" placeholder="Руководитель" value={position} onChange={e => setPosition(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Компания</label>
                  <input className="inp" placeholder="ООО «Ваша компания»" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email *</label>
              <input className="inp" type="email" placeholder="your@email.ru" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Пароль *</label>
              <input className="inp" type="password" placeholder={mode === "register" ? "Минимум 6 символов" : "Ваш пароль"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            <button type="submit" disabled={loading} className="btn-accent w-full justify-center" style={{ padding: "11px 16px", marginTop: 8, fontSize: 14 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={15} className="animate-spin" />
                  {mode === "login" ? "Вход..." : "Регистрация..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name={mode === "login" ? "LogIn" : "UserPlus"} size={15} />
                  {mode === "login" ? "Войти" : "Создать аккаунт"}
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-sm text-amber-600 hover:underline"
            >
              {mode === "login" ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
