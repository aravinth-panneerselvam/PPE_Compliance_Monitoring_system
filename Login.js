import styled from "styled-components";
import worker from "./ppe1.jpg";
import { IoPersonOutline, IoLockClosedOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

export default function Login() {

  const navigate = useNavigate();
  
  
  // Setting the Loading state
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
      e.preventDefault();   // prevent form refresh
    
      // TODO: (optional) validate email/password
    
      navigate("/home");  // redirect to Home page
  };

  const handleFaceLogin = async () => {
    try {
      setLoading(true); // Start loading indicator

      // ---- 1. Open camera ----
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();
  
      // ---- 2. Capture image ----
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
  
      // Stop camera stream
      stream.getTracks().forEach((track) => track.stop());
  
      // ---- 3. Convert frame to Blob and send to backend ----
      canvas.toBlob(async (blob) => {
  
        const formData = new FormData();
        formData.append("file", blob, "captured.jpg");
  
        // --- Send to backend: upload + deepface verify ---
        const response = await fetch("http://localhost:8000/face-login", {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
  
        if (data.status === "success") {
          setLoading(false); // Stop loading indicator
          alert("Login Success! Welcome " + data.user);
          window.location.href = `/home?user=${data.user}`;
        } else {
          alert("Face login failed: " + data.message);
        }
  
      }, "image/jpeg");
  
    } catch (error) {
      setLoading(false);
      console.error("Camera error:", error);
      alert("Unable to access camera");
    }
  };

  return (
    <Section>
      <LoginContainer>
        <LeftSection>
          <WorkerImg src={worker} alt="PPE Worker" />
        </LeftSection>

        <RightSection>
          <MainTitle> PPE Compliance Monitoring System </MainTitle>

          <LoginBox>
            <form action="/login" method="POST">
              <LoginHeading> Login </LoginHeading>

              <InputBox>
                <IoPersonOutline className="icon" />
                <input type="text" name="email" required placeholder=" " />
                <label> Username </label>
              </InputBox>

              <InputBox>
                <IoLockClosedOutline className="icon" />
                <input type="password" name="password" required placeholder=" " />
                <label> Password </label>
              </InputBox>

              <LoginBtn type="button" onClick={handleLogin}> Login </LoginBtn>

              <Separator> OR </Separator>

              <FaceBtn type="button" onClick={handleFaceLogin} disabled={loading}> 
                {loading ? "Processing..." : "Login with Face ID"} 
              </FaceBtn>

              {loading && (
                <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                  Verifying your face, please wait...
                </p>
              )}

            </form>
          </LoginBox>
        </RightSection>
      </LoginContainer>
    </Section>
  );
}

/* -------------------- Styled Components -------------------- */

const Section = styled.section`
  font-family: "Poppins", sans-serif;
`;

const LoginContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const LeftSection = styled.div`
  flex: 1;
`;

const WorkerImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  justify-content: center;
  align-items: center;
`;

const MainTitle = styled.h1`
  font-size: 2.3rem;
  font-weight: 700;
  text-align: center;
  color: #030108;
  margin-bottom: 75px;
  letter-spacing: 0.8px;
`;

const LoginBox = styled.div`
  position: relative;
  width: 400px;
  height: 450px;
  background: #8ca3d7;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginHeading = styled.h2`
  color: #030000;
  font-size: 2em;
  text-align: center;
`;

/* Input container */
const InputBox = styled.div`
  position: relative;
  width: 310px;
  margin: 25px 0;
  padding: 10px 12px;
  border-radius: 12px;

  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);

  display: flex;
  align-items: center;
  transition: 0.3s;

  &:focus-within {
    border-color: #6a00ff;
    box-shadow: 0 0 10px rgba(106, 0, 255, 0.3);
  }

  .icon {
    font-size: 22px;
    margin-right: 10px;
    color: #4b0082;
    transition: 0.3s;
  }

  &:focus-within .icon {
    color: #6a00ff;
  }

  input {
    width: 100%;
    padding: 6px;
    border: none;
    outline: none;
    font-size: 16px;
    color: #1a1a1a;
    background: transparent;
  }

  label {
    position: absolute;
    left: 50px;
    top: 50%;
    transform: translateY(-50%);
    color: #6a00ff;
    font-size: 16px;
    pointer-events: none;
    transition: 0.3s;
    opacity: 0.7;
  }

  input:focus + label,
  input:not(:placeholder-shown) + label {
    top: 2px;
    left: 50px;
    font-size: 12px;
    opacity: 1;
  }
`;

/* Buttons */
const LoginBtn = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 10px;
  font-size: 18px;

  background: #005bbb;
  color: white;

  border: none;
  border-radius: 8px;
  cursor: pointer;

  transition: 0.3s ease;

  &:hover {
    background-color: #31b96a;
    transform: translateY(-3px);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const FaceBtn = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 10px;
  font-size: 18px;

  background: #222;
  color: white;

  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background-color: #31b96a;
    transform: translateY(-3px);
  }

  &:active {
    transform: scale(0.97);
  }
`;

/* Separator */
const Separator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  margin: 12px 0;
  color: #070404;
  font-size: 0.9em;
  font-weight: 500;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #050000;
    margin: 0 10px;
  }
`;
