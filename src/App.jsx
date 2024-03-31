import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Events from "./pages/Events";
import Protected from "./components/Protected";
import Landing from "./pages/Landing";
function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Protected>
                <Login />
              </Protected>
            }
          />
          <Route
            path="/events"
            element={
              <Protected>
                <Events />
              </Protected>
            }
          />
          <Route
            path="/contactus"
            element={
                <Landing />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
