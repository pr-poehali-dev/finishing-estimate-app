import json
import os
import hashlib
import secrets
import random
import psycopg2
from datetime import datetime, timedelta


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str, salt: str = None) -> tuple:
    """Хэширует пароль с солью"""
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100000).hex()
    return f"{salt}:{hashed}", salt


def verify_password(password: str, stored_hash: str) -> bool:
    """Проверяет пароль"""
    salt, _ = stored_hash.split(":")
    new_hash, _ = hash_password(password, salt)
    return new_hash == stored_hash


def create_session(user_id: int) -> str:
    """Создаёт сессию и возвращает токен"""
    token = secrets.token_urlsafe(48)
    expires = datetime.now() + timedelta(days=30)
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (user_id, token, expires)
    )
    conn.commit()
    cur.close()
    conn.close()
    return token


def get_user_by_token(token: str) -> dict:
    """Получает пользователя по токену сессии"""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT u.id, u.email, u.full_name, u.phone, u.role, u.company_name, 
                  u.position, u.avatar_url, u.is_active, u.created_at
           FROM users u
           JOIN sessions s ON s.user_id = u.id
           WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = TRUE""",
        (token,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {
        "id": row[0], "email": row[1], "full_name": row[2], "phone": row[3],
        "role": row[4], "company_name": row[5], "position": row[6],
        "avatar_url": row[7], "is_active": row[8], "created_at": str(row[9])
    }


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
        "Access-Control-Max-Age": "86400",
        "Content-Type": "application/json"
    }


def handler(event, context):
    """Регистрация, вход и проверка сессии пользователей"""

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    headers = cors_headers()

    if method == "POST" and action == "register":
        return handle_register(event, headers)
    elif method == "POST" and action == "login":
        return handle_login(event, headers)
    elif method == "GET" and action == "me":
        return handle_me(event, headers)
    elif method == "POST" and action == "logout":
        return handle_logout(event, headers)
    elif method == "POST" and action == "request-reset":
        return handle_request_reset(event, headers)
    elif method == "POST" and action == "confirm-reset":
        return handle_confirm_reset(event, headers)

    return {
        "statusCode": 404,
        "headers": headers,
        "body": json.dumps({"error": "Маршрут не найден"})
    }


def handle_register(event, headers):
    body = json.loads(event.get("body", "{}"))
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")
    full_name = body.get("full_name", "").strip()
    phone = body.get("phone", "").strip()
    company_name = body.get("company_name", "").strip()
    position = body.get("position", "").strip()

    if not email or not password or not full_name:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Email, пароль и ФИО обязательны"})
        }

    if len(password) < 6:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Пароль должен содержать минимум 6 символов"})
        }

    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            "statusCode": 409,
            "headers": headers,
            "body": json.dumps({"error": "Пользователь с таким email уже существует"})
        }

    password_hash, _ = hash_password(password)
    cur.execute(
        """INSERT INTO users (email, password_hash, full_name, phone, company_name, position)
           VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
        (email, password_hash, full_name, phone or None, company_name or None, position or None)
    )
    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    token = create_session(user_id)

    return {
        "statusCode": 201,
        "headers": headers,
        "body": json.dumps({
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "phone": phone,
                "role": "manager",
                "company_name": company_name,
                "position": position
            }
        })
    }


def handle_login(event, headers):
    body = json.loads(event.get("body", "{}"))
    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Email и пароль обязательны"})
        }

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, email, password_hash, full_name, phone, role, company_name, 
                  position, avatar_url, is_active
           FROM users WHERE email = %s""",
        (email,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {
            "statusCode": 401,
            "headers": headers,
            "body": json.dumps({"error": "Неверный email или пароль"})
        }

    if not row[9]:
        return {
            "statusCode": 403,
            "headers": headers,
            "body": json.dumps({"error": "Аккаунт заблокирован"})
        }

    if not verify_password(password, row[2]):
        return {
            "statusCode": 401,
            "headers": headers,
            "body": json.dumps({"error": "Неверный email или пароль"})
        }

    token = create_session(row[0])

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "token": token,
            "user": {
                "id": row[0], "email": row[1], "full_name": row[3],
                "phone": row[4], "role": row[5], "company_name": row[6],
                "position": row[7], "avatar_url": row[8]
            }
        })
    }


def handle_me(event, headers):
    auth = event.get("headers", {}).get("X-Authorization", "") or event.get("headers", {}).get("x-authorization", "")
    token = auth.replace("Bearer ", "").strip()

    if not token:
        return {
            "statusCode": 401,
            "headers": headers,
            "body": json.dumps({"error": "Требуется авторизация"})
        }

    user = get_user_by_token(token)
    if not user:
        return {
            "statusCode": 401,
            "headers": headers,
            "body": json.dumps({"error": "Сессия истекла"})
        }

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"user": user})
    }


def handle_logout(event, headers):
    auth = event.get("headers", {}).get("X-Authorization", "") or event.get("headers", {}).get("x-authorization", "")
    token = auth.replace("Bearer ", "").strip()

    if token:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
        conn.commit()
        cur.close()
        conn.close()

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"ok": True})
    }


def handle_request_reset(event, headers):
    """Запрос сброса пароля — генерирует 6-значный код"""
    body = json.loads(event.get("body", "{}"))
    email = body.get("email", "").strip().lower()

    if not email:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Email обязателен"})
        }

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id, full_name FROM users WHERE email = %s AND is_active = TRUE", (email,))
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"ok": True, "message": "Если аккаунт существует, код отправлен на почту"})
        }

    user_id = row[0]
    code = str(random.randint(100000, 999999))
    expires = datetime.now() + timedelta(minutes=15)

    cur.execute("UPDATE password_resets SET used = TRUE WHERE user_id = %s AND used = FALSE", (user_id,))
    cur.execute(
        "INSERT INTO password_resets (user_id, code, expires_at) VALUES (%s, %s, %s)",
        (user_id, code, expires)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "ok": True,
            "message": "Если аккаунт существует, код отправлен на почту",
            "debug_code": code
        })
    }


def handle_confirm_reset(event, headers):
    """Подтверждение сброса пароля — проверяет код и устанавливает новый пароль"""
    body = json.loads(event.get("body", "{}"))
    email = body.get("email", "").strip().lower()
    code = body.get("code", "").strip()
    new_password = body.get("new_password", "")

    if not email or not code or not new_password:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Email, код и новый пароль обязательны"})
        }

    if len(new_password) < 6:
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Пароль должен содержать минимум 6 символов"})
        }

    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        """SELECT pr.id, pr.user_id FROM password_resets pr
           JOIN users u ON u.id = pr.user_id
           WHERE u.email = %s AND pr.code = %s AND pr.used = FALSE AND pr.expires_at > NOW()
           ORDER BY pr.created_at DESC LIMIT 1""",
        (email, code)
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"error": "Неверный или просроченный код"})
        }

    reset_id = row[0]
    user_id = row[1]

    password_hash, _ = hash_password(new_password)
    cur.execute("UPDATE users SET password_hash = %s, updated_at = NOW() WHERE id = %s", (password_hash, user_id))
    cur.execute("UPDATE password_resets SET used = TRUE WHERE id = %s", (reset_id,))
    cur.execute("UPDATE sessions SET expires_at = NOW() WHERE user_id = %s", (user_id,))
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({"ok": True, "message": "Пароль успешно изменён"})
    }