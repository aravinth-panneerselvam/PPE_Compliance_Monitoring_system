import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ViolationsDownloader } from "./downloadbutton";

export function Home() {
  const [selectedImage, setSelectedImage] = useState(null); // preview URL
  const [selectedImageFile, setSelectedImageFile] = useState(null); // actual file
  const [output, setOutput] = useState(null);

  // ---- DETECT BUTTON HANDLER ----
  const handleDetect = async () => {
    if (!selectedImageFile) {
      alert("Please upload an image before detecting!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      const response = await axios.post(
        "http://127.0.0.1:8000/detect",
        formData,
        {
          responseType: "blob", // <-- important
        }
      );

      const imageUrl = URL.createObjectURL(response.data);
      setOutput(imageUrl);

      await axios.post("http://127.0.0.1:8000/send-mail");
  
      alert("Email sent successfully!");
    
    } 

    catch (err) {
      console.error("Detection error:", err);
    }

  };

  // -------------- IMAGE UPLOAD ----------------
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setSelectedImageFile(file); // store original file
  };

  // ---------------- CHAT STATES ----------------
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  // ---------------- UPDATED CHAT FUNCTION ----------------
  const sendMessage = async () => {
      if (!input.trim()) return;
      const userMessage = input;
      setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
      setInput("");
      try {
        const res = await axios.post("http://localhost:8000/ask", { question: userMessage });
        const botReply = res.data.answer;
        setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error connecting to AI server." }]);
      }
    };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Container>
      {/* ---------------- LEFT PANE ---------------- */}
      <Left>
        <Title> Object Detection </Title>

        <UploadLabel>
          Upload Image
          <UploadInput type="file" accept="image/*" onChange={handleUpload} />
        </UploadLabel>

        <Row>
          <PreviewPane>
            {selectedImage ? (
              <PreviewImage src={selectedImage} alt="Preview" />
            ) : (
              <Placeholder> No image selected </Placeholder>
            )}
          </PreviewPane>

          <OutputPane>
            {output ? (
              <PreviewImage src={output} style = {{ width: "100%" }} alt= "Detected Output" />
            ) : (
              <Placeholder> Bounding Box Output Will Appear Here </Placeholder>
            )}
          </OutputPane>
        </Row>

        <DetectButton onClick= {handleDetect}> Detect </DetectButton>
        <ViolationsDownloader />
      </Left>

      {/* ---------------- RIGHT CHAT PANE ---------------- */}
      <Right>
        <ChatTitle> AI Chatbot </ChatTitle>

        <ChatBox ref={messagesRef}>
          {messages.map((msg, index) => (
            <Message key={index} isUser={msg.sender === "user"}>
              {msg.text}
            </Message>
          ))}
        </ChatBox>
        
        <InputRow>
          <ChatInput
            placeholder = "Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <SendButton onClick={sendMessage}> Send </SendButton>
        </InputRow>
      </Right>
    </Container>
  );
}

// ---------------- STYLED COMPONENTS ----------------

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Left = styled.div`
  flex: 0.8;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: #435997ff;
  border-right: 2px solid #d0d7ff;
`;

const Right = styled.div`
  flex: 1;
  padding: 20px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #fff;
`;

const ChatTitle = styled.h2`
  margin-bottom: 15px;
`;

const UploadLabel = styled.label`
  display: inline-block;
  padding: 12px 18px;
  background: #005bbb;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  width: fit-content;
  transition: 0.3s;

  &:hover {
    background: #0077ff;
    transform: translateY(-2px);
  }
`;

const UploadInput = styled.input`
  display: none;
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 20px;
`;

const BasePane = styled.div`
  flex: 1;
  height: 260px;
  border: 2px solid #ffffff66;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 25px;
  background: transparent;
  padding: 10px;
`;

const PreviewPane = styled(BasePane)``;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const OutputPane = styled(BasePane)`
  color: white;
  overflow: auto;
`;

const Placeholder = styled.p`
  color: #dddddd;
`;

const DetectButton = styled.button`
  margin-top: 20px;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: bold;
  background: #31b96a;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #28a85d;
    transform: translateY(-3px);
  }
`;

// CHAT STYLES
const ChatBox = styled.div`
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 15px;
  background: white;
  overflow-y: auto;
`;

const Message = styled.div`
  padding: 10px 14px;
  margin-bottom: 10px;
  max-width: 75%;
  border-radius: 10px;
  background: ${(props) => (props.isUser ? "#d1ffd6" : "#eaeaea")};
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
`;

const InputRow = styled.div`
  display: flex;
  margin-top: 15px;
  gap: 10px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const SendButton = styled.button`
  padding: 12px 18px;
  background: #005bbb;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: #0077ff;
  }
`;
