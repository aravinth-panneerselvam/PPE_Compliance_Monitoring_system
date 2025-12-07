import axios from "axios";

export function ViolationsDownloader() {
  const downloadCSV = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/download_violations",
        { responseType: "blob" }
      );

      // Create a download link
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "violations.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download Failed:", err);
    }
  };


  return (

    <div 
        style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px",       // space between label & button
        marginTop: "20px" 
      }}>
        
        <p 
            style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#000203ff",
            margin: 0         // important: remove default <p> margin
        }}>
          Download detections as CSV:
        </p>       

        <button
            onClick={downloadCSV}
            style={{
            padding: "10px 20px",
            background: "#1e90ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            transform: "translateY(-2px)", 
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#187bcd")}
          onMouseOut={(e) => (e.target.style.background = "#1e90ff")}
          
        > Download as .csv
        </button>
      
    </div>
      
  );
}
