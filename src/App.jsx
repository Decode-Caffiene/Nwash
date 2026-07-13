import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
