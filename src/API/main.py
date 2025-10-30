import os
from flask import Flask, request, jsonify
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# función de conexión (luego metemos las variables en Render)
def get_conn():
    return psycopg2.connect(
        host=os.environ["DB_HOST"],
        port=os.environ.get("DB_PORT", 5432),
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
    )

@app.get("/")
def home():
    return "API Breathe Tracking funcionando 👌"

@app.post("/register")
def register():
    data = request.get_json()
    nombre = data.get("nombre")
    email = data.get("email")
    password = data.get("password")

    if not nombre or not email or not password:
        return jsonify({"ok": False, "error": "Faltan datos"}), 400

    password_hash = generate_password_hash(password)

    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO "usuarios" ("Id_Rol", "nombre", "email", "password_hash")
            VALUES (
                (SELECT "id_rol" FROM "roles" WHERE "nombre" = 'Usuario'),
                %s, %s, %s
            )
            RETURNING "id_usuario"
        """, (nombre, email, password_hash))
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"ok": True, "id_usuario": user_id})
    except psycopg2.errors.UniqueViolation:
        return jsonify({"ok": False, "error": "El email ya existe"}), 409
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.post("/login")
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"ok": False, "error": "Faltan datos"}), 400

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT "id_usuario", "Id_Rol", "nombre", "email", "password_hash"
        FROM "usuarios"
        WHERE "email" = %s
    """, (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"ok": False, "error": "Usuario no encontrado"}), 404

    user_id, id_rol, nombre, email_db, password_hash = row

    if not check_password_hash(password_hash, password):
        return jsonify({"ok": False, "error": "Contraseña incorrecta"}), 401

    return jsonify({
        "ok": True,
        "id_usuario": user_id,
        "Id_Rol": id_rol,
        "nombre": nombre,
        "email": email_db
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
