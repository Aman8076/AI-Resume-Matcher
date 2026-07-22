import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api")

      .then((response) => {
        setMessage(response.data.message);
      });
  }, []);

  return (
    <div>
      <h1>AI Resume Matcher</h1>

      <h2>{message}</h2>
    </div>
  );
}

export default App;
