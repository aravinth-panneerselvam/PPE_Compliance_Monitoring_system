# PPE Compliance Monitoring System

AI-powered workplace safety monitoring system that automatically detects
whether employees are wearing required Personal Protective Equipment
(PPE) such as helmets, masks, and safety vests using computer vision and
deep learning.

The system performs real-time monitoring from video streams or webcam
feeds, identifies safety violations, and generates analytics dashboards
and reports for safety managers.

------------------------------------------------------------------------

# Project Overview

Industrial environments such as construction sites, manufacturing
plants, and warehouses require strict adherence to PPE regulations.

Manual monitoring of workers is inefficient and prone to human error.

This system uses AI-based object detection models to automatically
detect PPE compliance from camera feeds and provide real-time alerts and
reports.

The system enables:

-   Automated workplace safety monitoring
-   Real-time PPE violation detection
-   Attendance tracking using face recognition
-   Compliance analytics and reports

------------------------------------------------------------------------

# Key Features

## Real-Time PPE Detection

Detects required safety equipment from images, video files, or live
webcam streams.

Detected PPE types: - Safety helmet - Safety vest - Face mask

## Violation Detection

The system identifies workers missing required PPE and highlights them
in the video stream.

## Face Recognition Attendance

Employees can be registered in the system, and their attendance is
automatically recorded when they appear in the camera.

## Live Dashboard

Interactive dashboard showing:

-   Compliance statistics
-   PPE violations
-   Attendance tracking
-   Historical analysis

## Exportable Reports

Detection results and analytics can be exported as:

-   CSV
-   JSON
-   Excel

------------------------------------------------------------------------

# System Architecture

Camera / Video Input\
↓\
Frame Processing (OpenCV)\
↓\
YOLOv8 Object Detection\
↓\
PPE Compliance Logic\
↓\
Face Recognition + Attendance\
↓\
Analytics Dashboard (Streamlit)\
↓\
Data Storage (SQLite)

------------------------------------------------------------------------

# Tech Stack

## Programming Language

-   Python

## AI / Machine Learning

-   YOLOv8
-   PyTorch

## Computer Vision

-   OpenCV

## Face Recognition

-   face_recognition
-   dlib

## Data Processing

-   Pandas
-   NumPy

## Visualization

-   Plotly
-   Matplotlib

## Backend / Application Framework

-   Streamlit

## Database

-   SQLite

## Other Libraries

-   scikit-learn
-   OpenPyXL

------------------------------------------------------------------------

# Project Structure

    PPE_Compliance_Monitoring_System
    │
    ├── app_ultra_fast.py
    ├── ppe_detection_engine.py
    ├── face_recognition_engine.py
    ├── attendance_manager.py
    ├── results_viewer.py
    ├── webcam_component.py
    ├── theme_manager.py
    ├── utils.py
    ├── requirements.txt
    ├── run_ultra_fast.py
    ├── attendance.db
    ├── face_dataset/
    └── face_encodings/

------------------------------------------------------------------------

# Installation

Clone the repository

    git clone https://github.com/aravinth-panneerselvam/PPE_Compliance_Monitoring_system.git
    cd PPE_Compliance_Monitoring_system

Install dependencies

    pip install -r requirements.txt

------------------------------------------------------------------------

# Running the Application

Start the application

    python run_ultra_fast.py

or

    streamlit run app_ultra_fast.py

Open in browser

    http://localhost:8501

------------------------------------------------------------------------

# Usage

## Register Employees

1.  Navigate to Face Recognition → Manage People
2.  Add employee details
3.  Capture face samples
4.  Train the recognition model

## Start Monitoring

1.  Open Live Detection
2.  Select webcam or video input
3.  Start PPE monitoring

## View Analytics

Use the Results Dashboard to analyze:

-   PPE compliance statistics
-   Violations
-   Attendance logs
-   Exportable reports

------------------------------------------------------------------------

# Example Use Cases

-   Construction site safety monitoring
-   Manufacturing plant compliance checks
-   Warehouse safety monitoring
-   Industrial workplace audits
-   Smart factory safety automation

------------------------------------------------------------------------

# Future Improvements

-   Multi-camera monitoring
-   Cloud deployment
-   Mobile notifications for violations
-   Edge AI deployment on CCTV devices
-   Integration with HR systems
-   AI-based risk prediction

------------------------------------------------------------------------

# License

MIT License

------------------------------------------------------------------------

# Author

Aravinth Panneerselvam

AI / Data Science Enthusiast focused on applying machine learning and
computer vision to real-world industrial safety problems.
