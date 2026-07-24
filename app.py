import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling

load_dotenv()

app = Flask(__name__)
CORS(app)

db_pool = pooling.MySQLConnectionPool(
    pool_name="todolist_pool",
    pool_size=5,
    pool_reset_session=True,
    host=os.getenv("DB_HOST"),
    port=3306,
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

def get_connection():
    return db_pool.get_connection()

@app.route("/api/list", methods=["POST"])
def create_activity():
    data = request.json
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO atividades (nome, descricao, data_criacao, status, user_id)
               VALUES (%s, %s, %s, %s, %s)""",
            (
                data.get("name"),
                data.get("descricao"),
                data.get("criadoEm") or None,
                data.get("status") or None,
                data.get("user_id"),
            )
        )
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({"id": new_id}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()
        
@app.route("/api/list", methods=["GET"])
def list_all():
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify([]), 200 
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM atividades WHERE user_id = %s", (user_id,))
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users)


@app.route("/api/list", methods=["DELETE"])
def delete_activity():
    activity_id = request.args.get("id")
    if not activity_id:
        return jsonify({"error": "id é obrigatório"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM atividades WHERE id = %s", (activity_id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "atividade não encontrada"}), 404
        return jsonify({"id": activity_id}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()
    
@app.route("/api/list", methods=["PUT"])
def updateActivity():
    data = request.json
    activity_id = request.args.get("id")
    if not activity_id:
        return jsonify({"error": "id é obrigatório"}), 400

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """UPDATE atividades
               SET nome = %s, descricao = %s, data_criacao = %s, status = %s, user_id = %s
               WHERE id = %s""",
            (
                data.get("name"),
                data.get("descricao"),
                data.get("criadoEm") or None,
                data.get("status") or None,
                activity_id,
                data.get("user_id"),
            )
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "atividade não encontrada"}), 404
        return jsonify({"id": activity_id}), 200
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 400
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)