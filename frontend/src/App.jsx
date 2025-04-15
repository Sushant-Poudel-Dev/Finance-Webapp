import "./styles/main/main.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Expense from "./pages/Expense";
import Income from "./pages/Income";
import Planner from "./pages/Planner";
import AddingPage from "./pages/AddingPage";
import Intro from "./pages/Intro";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path='/'
          element={<Intro />}
        />
        <Route
          path='/dashboard'
          element={<Layout />}
        >
          <Route
            path='/dashboard'
            element={<Dashboard />}
          />
          <Route
            path='/dashboard/expense'
            element={<Expense />}
          />
          <Route
            path='/dashboard/income'
            element={<Income />}
          />
          <Route
            path='/dashboard/planner'
            element={<Planner />}
          />
          <Route
            path='/dashboard/addingPage'
            element={<AddingPage />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
