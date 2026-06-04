import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import AppRouter from "./router/AppRouter";

function App() {
  console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL);
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
