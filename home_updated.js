// home.js
import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ViolationsDownloader } from "./downloadbutton";

export function Home() {
  const [selectedImage, setSelectedImage] = useState(null); // preview URL
  const [selectedImageFile, setSelectedImageFile] = useState(null); // original file
  const [output, setOutput] = useState(null); // detected image object URL
  const [loading, setLoading] = useState(false);
  const prevOutputRef = useRef(null);

  // Clean up previously created object URLs to avoid stale previews
  useEffect(() => {
    return () => {
      if (prevOutputRef.current) {
        URL.revokeObjectURL(prevOutputRef.current);
        prevOutputRef.current = null;
      }
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleDetect = async () => {
    if (!selectedImageFile) {
      alert("Please upload an image before detecting!");
      return;
    }

    setLoading(true);
    // Clear previous output immediately so old boxes disappear
    if (prevOutputRef.current) {
      URL.revokeObjectURL(prevOutputRef.current);
      prevOutputRef.current = null;
    }
    setOutput(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      const response = await axios.post("http://127.0.0.1:8000/detect", formData, {
        responseType: "blob",
        headers: {
          // browser will set Content-Type multipart/form-data properly
        },
      });

      const imageBlob = response.data;
      const imageUrl = URL.createObjectURL(imageBlob);

      // Revoke previous and store current
      if (prevOutputRef.current) {
        URL.revokeObjectURL(prevOutputRef.current);
      }
      prevOutputRef.current = imageUrl;

      setOutput(imageUrl);
    } catch (err) {
      console.error("Detection error:", err);
      alert("Detection failed. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // revoke old preview
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);
    setSelectedImageFile(file);
    // clear previous detection output when a new image is chosen
    if (prevOutputRef.current) {
      URL.revokeObjectURL(prevOutputRef.current);
      prevOutputRef.current = null;
      setOutput(null);
    }
  };

  // Chat states unchanged
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/ask", { question: userMessage });
      const botReply = res.data.answer;
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error connecting to AI server." }]);
    }
  };

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  return (
    <Container>
      <Left>
        <Title> Object Detection </Title>

        <UploadLabel>
          Upload Image
          <UploadInput type="file" accept="image/*" onChange={handleUpload} />
        </UploadLabel>

        <Row>
          <PreviewPane>
            {selectedImage ? <PreviewImage src={selectedImage} alt="Preview" /> : <Placeholder> No image selected </Placeholder>}
          </PreviewPane>

          <OutputPane>
            {loading ? (
              <Placeholder>Processing...</Placeholder>
            ) : output ? (
              <PreviewImage src={output} style={{ width: "100%" }} alt="Detected Output" />
            ) : (
              <Placeholder> Bounding Box Output Will Appear Here </Placeholder>
            )}
          </OutputPane>
        </Row>

        <DetectButton onClick={handleDetect} disabled={loading}>
          {loading ? "Detecting..." : "Detect"}
        </DetectButton>
        <ViolationsDownloader />
      </Left>

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
          <ChatInput placeholder="Type your message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
          <SendButton onClick={sendMessage}> Send </SendButton>
        </InputRow>
      </Right>
    </Container>
  );
}

/* (styled components unchanged) */
