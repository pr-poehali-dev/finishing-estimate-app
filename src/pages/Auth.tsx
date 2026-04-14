import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { login, register, requestPasswordReset, confirmPasswordReset } from "@/lib/api";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register" | "reset-request" | "reset-confirm">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");

  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/");
      } else if (mode === "register") {
        await register({
          email, password, full_name: fullName,
          phone: phone || undefined,
          company_name: company || undefined,
          position: position || undefined,
        });
        navigate("/");
      } else if (mode === "reset-request") {
        const result = await requestPasswordReset(email);
        if (result.debug_code) {
          setDebugCode(result.debug_code);
        }
        setMode("reset-confirm");
        setSuccess("Код отправлен на вашу почту. Введите его ниже.");
      } else if (mode === "reset-confirm") {
        await confirmPasswordReset(email, resetCode, newPassword);
        setMode("login");
        setPassword("");
        setResetCode("");
        setNewPassword("");
        setDebugCode("");
        setSuccess("Пароль успешно изменён. Войдите с новым паролем.");
      }
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e.error || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register" | "reset-request") => {
    setMode(newMode);
    setError("");
    setSuccess("");
    setDebugCode("");
    setResetCode("");
    setNewPassword("");
  };

  const title = {
    login: "Вход в систему",
    register: "Регистрация",
    "reset-request": "Восстановление пароля",
    "reset-confirm": "Новый пароль",
  }[mode];

  const subtitle = {
    login: "Введите email и пароль для входа",
    register: "Создайте аккаунт для работы с системой",
    "reset-request": "Введите email, на который зарегистрирован аккаунт",
    "reset-confirm": "Введите код из письма и задайте новый пароль",
  }[mode];

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

          <h1 className="text-xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-sm text-gray-400 mb-6">{subtitle}</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700">
              <Icon name="AlertCircle" size={15} className="text-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-sm text-emerald-700">
              <Icon name="CheckCircle" size={15} className="text-emerald-500 flex-shrink-0" />
              {success}
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

            {(mode === "login" || mode === "register" || mode === "reset-request") && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email *</label>
                <input className="inp" type="email" placeholder="your@email.ru" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            )}

            {(mode === "login" || mode === "register") && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Пароль *</label>
                <input className="inp" type="password" placeholder={mode === "register" ? "Минимум 6 символов" : "Ваш пароль"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
            )}

            {mode === "reset-confirm" && (
              <>
                {debugCode && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <Icon name="Info" size={15} className="text-amber-500 flex-shrink-0" />
                    Ваш код для сброса: <strong>{debugCode}</strong>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Код из письма *</label>
                  <input className="inp" placeholder="123456" value={resetCode} onChange={e => setResetCode(e.target.value)} required maxLength={6} style={{ letterSpacing: "0.3em", fontSize: 18, textAlign: "center" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Новый пароль *</label>
                  <input className="inp" type="password" placeholder="Минимум 6 символов" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-accent w-full justify-center" style={{ padding: "11px 16px", marginTop: 8, fontSize: 14 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={15} className="animate-spin" />
                  {{
                    login: "Вход...",
                    register: "Регистрация...",
                    "reset-request": "Отправка...",
                    "reset-confirm": "Сохранение...",
                  }[mode]}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon name={{
                    login: "LogIn",
                    register: "UserPlus",
                    "reset-request": "Mail",
                    "reset-confirm": "Check",
                  }[mode]} size={15} />
                  {{
                    login: "Войти",
                    register: "Создать аккаунт",
                    "reset-request": "Отправить код",
                    "reset-confirm": "Установить пароль",
                  }[mode]}
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 text-center space-y-2">
            {mode === "login" && (
              <>
                <button
                  onClick={() => switchMode("reset-request")}
                  className="text-sm text-gray-400 hover:text-gray-600 hover:underline block mx-auto"
                >
                  Забыли пароль?
                </button>
                <button
                  onClick={() => switchMode("register")}
                  className="text-sm text-amber-600 hover:underline block mx-auto"
                >
                  Нет аккаунта? Зарегистрируйтесь
                </button>
              </>
            )}
            {mode === "register" && (
              <button
                onClick={() => switchMode("login")}
                className="text-sm text-amber-600 hover:underline"
              >
                Уже есть аккаунт? Войдите
              </button>
            )}
            {(mode === "reset-request" || mode === "reset-confirm") && (
              <button
                onClick={() => switchMode("login")}
                className="text-sm text-amber-600 hover:underline"
              >
                Вернуться ко входу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
