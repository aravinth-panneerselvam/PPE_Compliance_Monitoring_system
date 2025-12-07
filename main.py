from fastapi import FastAPI, UploadFile, File, Response, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from ultralytics import YOLO
from PIL import Image
import io
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from langchain_community.llms import Ollama
import shutil
import numpy as np
import cv2
from deepface import DeepFace
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO(r"E:\01. Academics\05. GUVI\Websites\PPE Compliance\backend\best.pt")


# -----------------------------------
# Database Connection Function
# -----------------------------------

def get_connection():
    connection = psycopg2.connect(
        database = 'ppe_compliance',
        user = 'postgres',
        password = 123456,
        host = 'localhost',
        port = 5432
    )
    connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    return connection

def run_sql(sql):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(sql)
    rows = cur.fetchall()

    # Convert rows to a simple string for chat
    result = "\n".join([str(row) for row in rows])

    conn.commit()
    cur.close()
    conn.close()

    return result

# Generating CSV File
def generate_violations_csv():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT v.id, v.metadata_id, v.ppe_type, v.confidence,
        v.x1, v.y1, v.x2, v.y2, m.image_name, m.overall_status
        FROM violations v
        JOIN metadata m ON v.metadata_id = m.id
        WHERE v.ppe_type LIKE 'no%'
        ORDER BY v.id;
    """)

    rows = cursor.fetchall()
    headers = [desc[0] for desc in cursor.description]

    cursor.close()
    conn.close()

    csv_data = ",".join(headers) + "\n"
    for row in rows:
        csv_data += ",".join(map(str, row)) + "\n"

    return csv_data

# ============================================
# End Points
# ============================================

@app.get("/")
def home():
    return {"message": "API running"}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KNOWN_DIR = os.path.join(BASE_DIR, "known_faces")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/face-login")
async def face_login(file: UploadFile = File(...)):

    # Save uploaded image
    saved_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ---- Compare with each known face ----
    for filename in os.listdir(KNOWN_DIR):
        known_path = f"{KNOWN_DIR}/{filename}"

        try:
            result = DeepFace.verify(
                img1_path = saved_path,
                img2_path = known_path,
                model_name = "Facenet",
                enforce_detection = False
            )
            
            if result["verified"]:
                user = filename.split(".")[0]
                return {"status": "success", "user": user}

        except Exception as e:
            print("DeepFace error:", e)

    return {"status": "failed", "message": "No matching face found"}


class QueryRequestModel(dict):
    pass

@app.post("/ask")
async def ask_sql(payload: dict = Body(...)):
    question = payload.get("question", "")

    # Step 1: Ask Ollama to generate SQL
    llm = Ollama(model="llama3.2:1b", temperature=0)

    sql_prompt = f"""
    You are an expert SQL assistant.
    Convert the following user question into a SQL query for PostgreSQL.
    Removes Markdown code block wrappers (e.g., ```sql...) from the output

    - Table 1: metadata(id, image_name, overall_status)
    - Table 2: violations(id, metadata_id, ppe_type, confidence, x1, y1, x2, y2)

    Rules:
    - ONLY return SQL. No explanation. No backticks. No comments.
    - Output must be executable directly.
    - Use ILIKE for text filtering.
    - Never guess table names.

    User question:
    "{question}"
    """

    generated_sql = llm.invoke(sql_prompt).strip()
    
    
    import re

    def clean_sql(sql_text):
        """
        Removes Markdown code block wrappers (e.g., ```sql...) from the output.
        """
        # Use a regex to find content inside the first ```...``` block.
        # The '?' makes the quantifier non-greedy, matching the first closing ```
        match = re.search(r"```[sS][qQ][lL]?\s*(.*?)\s*```", sql_text, re.DOTALL)

        if match:
            # Return the extracted content (group 1)
            return match.group(1).strip()
        else:
            # If no markdown is found, return the original text after stripping whitespace
            return sql_text.strip()

    # Apply the cleaning function
    cleaned_sql = clean_sql(generated_sql)

    # Safety check (avoid DROP/DELETE)
    forbidden = ["drop", "delete", "update", "alter"]
    if any(word in generated_sql.lower() for word in forbidden):
        return {"answer": " Unsafe SQL detected, query blocked."}

    print("Generated SQL:", cleaned_sql)

    try:
        result = run_sql(cleaned_sql)
        return {"answer": result}
    except Exception as e:
        return {"answer": f"SQL Error: {str(e)}"}


@app.get("/download_violations")
async def download_violations():
    
    csv_data = generate_violations_csv()

    # Return CSV as file response
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=violations.csv"
        },
    )

@app.post("/send-mail")
async def send_violations_email():
    
    csv_data = generate_violations_csv() 

    # 3. Convert rows into an HTML table
    html = """
        <html>
            <body style="font-family: Arial, sans-serif;">

                <p> Hello, Safety Manager </p>

                <p>
                    Please find below the latest <strong> PPE Violations Report </strong> extracted from the system.
                    This report includes all recent safety violations detected by the monitoring system.
                </p>

                <p> Review and take necessary action. </p>

                <h3> PPE Violations Table </h3>

                <table border="1" cellpadding="8" style="border-collapse: collapse;">
                    <tr style="background-color: #f2f2f2;">
                        <th>ID</th>
                        <th>Metadata ID</th>
                        <th>PPE Type</th>
                        <th>Confidence</th>
                        <th>X1</th>
                        <th>Y1</th>
                        <th>X2</th>
                        <th>Y2</th>
                        <th>Image Name</th>
                        <th>Overall Status</th>
                    </tr>
                </table>
            </body>
        </html>
    """
    
    #===============================
    # SMTP Server Details
    #===============================
    SMTP_HOST = "smtp.gmail.com" 
    SMTP_PORT = 587                        
    SMTP_USER = "aravinthsmtp@gmail.com"    
    SMTP_PASS = "jhzznyyxgopjlsjv"
    
    
    # 4. Create email
    sender = SMTP_USER
    receiver = "aravinthsmtp@gmail.com"
    
    # I have used same email as sender and receiver for testing purposes.
    # In real scenarios, use different emails.

    msg = MIMEMultipart()
    msg["Subject"] = "PPE Violations Report (PostgreSQL)"
    msg["From"] = sender
    msg["To"] = receiver
    
    msg.attach(MIMEText(html, "html"))
    
    # Attach CSV
    part = MIMEBase("application", "octet-stream")
    part.set_payload(csv_data)
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", "attachment; filename=violations.csv")
    msg.attach(part)

    # 5. Send using SMTP
    await aiosmtplib.send(
        msg,
        hostname = SMTP_HOST,
        port = SMTP_PORT,
        start_tls = True,
        username = SMTP_USER,
        password = SMTP_PASS,
    )

    return {"message": "Email sent successfully"}


@app.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    img = Image.open(io.BytesIO(image_bytes))

    results = model(img)
    detections = results[0]

    # Save image with bounding boxes
    output_path = "output.jpg"
    detections.save(output_path)

    # Connection to DataBase
    conn = get_connection()
    cursor = conn.cursor()

     # --- Insert into metadata table ---
    # overall_status = "violation" if len(detections.boxes) > 0 else "normal"

    labels = []

    for det in detections.boxes:
        cls_id = None

        # YOLOv8 / YOLOv5 structure
        if hasattr(det, "cls"):
            cls_id = int(det.cls)

        # Raw tensor output structure
        elif hasattr(det, "data"):
            cls_id = int(det.data[0][-1])

        if cls_id is not None:
            labels.append(model.names[cls_id])

    violation_labels = {"no_glove", "no_goggles"}
    safe_labels = {"glove", "goggles"}

    labels = [model.names[int(det.cls)] for det in detections.boxes]

    if any(label in violation_labels for label in labels):
        overall_status = "violation"
    elif any(label in safe_labels for label in labels):
        overall_status = "non_violation"
    else:
        overall_status = "normal"

    cursor.execute("""
        INSERT INTO metadata (image_name, overall_status)
        VALUES (%s, %s)
        RETURNING id;
    """, (file.filename, overall_status))

    metadata_id = cursor.fetchone()[0]

    # --- Insert each detected object into violations table ---
    for box in detections.boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        x1, y1, x2, y2 = box.xyxy[0]
        label = detections.names[cls]   # e.g: "glove", "no_glove"

        cursor.execute("""
            INSERT INTO violations
            (metadata_id, ppe_type, confidence, x1, y1, x2, y2)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            metadata_id,
            label,
            conf,
            float(x1), float(y1), float(x2), float(y2)
        ))

    conn.commit()
    cursor.close()
    conn.close()

    return FileResponse(output_path, media_type="image/jpeg")
