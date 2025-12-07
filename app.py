
# from flask import Flask, request, jsonify
# import psycopg2
# from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# app = Flask(__name__)

# def get_connection():
#     connection = psycopg2.connect(
#         database='ppe_compliance',
#         user='postgres',
#         password='123456',
#         host='localhost',
#         port='5432'
#     )
#     connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
#     return connection

# @app.route("/login", methods=["POST"])
# def login():
#     data = request.get_json()  # Read JSON body
#     email = data.get("email")
#     password = data.get("password")

#     # Connect to Database
#     conn = get_connection()
#     cur = conn.cursor()

#     cur.execute("SELECT * FROM users WHERE email=%s AND password=%s", (email, password))
#     user = cur.fetchone()

#     cur.close()
#     conn.close()

#     # API Response for React
#     if user:
#         return jsonify({"success": True, "message": "Login successful", "user": str(user)})
#     else:
#         return jsonify({"success": False, "message": "Invalid credentials"}), 401

# if __name__ == "__main__":
#     app.run(debug=True)


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

app = FastAPI()

# ---------------------------
# Database Connection Function
# ---------------------------
def get_connection():
    connection = psycopg2.connect(
        database='ppe_compliance',
        user='postgres',
        password='123456',
        host='localhost',
        port='5432'
    )
    connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    return connection


# ---------------------------
# Pydantic Model for Request Body
# ---------------------------
class LoginRequest(BaseModel):
    email: str
    password: str


# ---------------------------
# Login Route (POST)
# ---------------------------
@app.post("/login")
def login(request_data: LoginRequest):

    email = request_data.email
    password = request_data.password

    # Connect to database
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE email=%s AND password=%s",
        (email, password)
    )
    user = cur.fetchone()

    cur.close()
    conn.close()

    # If user found
    if user:
        return {
            "success": True,
            "message": "Login successful",
            "user": str(user)
        }
    else:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "message": "Invalid credentials"}
        )


# ---------------------------
# Run app (for development)
# ---------------------------
# Run with:  uvicorn filename:app --reload

