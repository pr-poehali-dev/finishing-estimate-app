import json
import os
import hashlib
import secrets
import psycopg2


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Authorization",
        "Access-Control-Max-Age": "86400",
        "Content-Type": "application/json"
    }


def get_user_by_token(token: str) -> dict:
    """Получает пользователя по токену"""
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


def extract_token(event):
    headers = event.get("headers", {})
    auth = headers.get("X-Authorization", "") or headers.get("x-authorization", "")
    return auth.replace("Bearer ", "").strip()


def handler(event, context):
    """Обновление профиля и смена пароля пользователя"""

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    headers = cors_headers()

    token = extract_token(event)
    if not token:
        return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Требуется авторизация"})}

    user = get_user_by_token(token)
    if not user:
        return {"statusCode": 401, "headers": headers, "body": json.dumps({"error": "Сессия истекла"})}

    if method == "PUT" and action == "update":
        return handle_update(event, headers, user)
    elif method == "PUT" and action == "password":
        return handle_password(event, headers, user)

    return {"statusCode": 404, "headers": headers, "body": json.dumps({"error": "Маршрут не найден"})}


def handle_update(event, headers, user):
    body = json.loads(event.get("body", "{}"))
    full_name = body.get("full_name", "").strip()
    phone = body.get("phone", "").strip()
    company_name = body.get("company_name", "").strip()
    position = body.get("position", "").strip()

    if not full_name:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "ФИО обязательно"})}

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """UPDATE users SET full_name = %s, phone = %s, company_name = %s, position = %s, updated_at = NOW()
           WHERE id = %s
           RETURNING id, email, full_name, phone, role, company_name, position, avatar_url""",
        (full_name, phone or None, company_name or None, position or None, user["id"])
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "user": {
                "id": row[0], "email": row[1], "full_name": row[2], "phone": row[3],
                "role": row[4], "company_name": row[5], "position": row[6], "avatar_url": row[7]
            }
        })
    }


def handle_password(event, headers, user):
    body = json.loads(event.get("body", "{}"))
    current = body.get("current_password", "")
    new_pass = body.get("new_password", "")

    if not current or not new_pass:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Укажите текущий и новый пароль"})}

    if len(new_pass) < 6:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "Новый пароль — минимум 6 символов"})}

    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT password_hash FROM users WHERE id = %s", (user["id"],))
    row = cur.fetchone()

    salt, _ = row[0].split(":")
    check_hash = hashlib.pbkdf2_hmac("sha256", current.encode(), salt.encode(), 100000).hex()
    if f"{salt}:{check_hash}" != row[0]:
        cur.close()
        conn.close()
        return {"statusCode": 403, "headers": headers, "body": json.dumps({"error": "Неверный текущий пароль"})}

    new_salt = secrets.token_hex(16)
    new_hash = hashlib.pbkdf2_hmac("sha256", new_pass.encode(), new_salt.encode(), 100000).hex()
    cur.execute(
        "UPDATE users SET password_hash = %s, updated_at = NOW() WHERE id = %s",
        (f"{new_salt}:{new_hash}", user["id"])
    )
    conn.commit()
    cur.close()
    conn.close()

    return {"statusCode": 200, "headers": headers, "body": json.dumps({"ok": True, "message": "Пароль изменён"})}