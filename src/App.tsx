import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Diagnosis from './pages/Diagnosis';
import Scenarios, { ScenarioDetail } from './pages/Scenarios';
import Tutorial from './pages/Tutorial';
import History from './pages/History';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="diagnosis" element={<Diagnosis />} />
          <Route path="scenarios" element={<Scenarios />}>
            <Route path=":id" element={<ScenarioDetail />} />
          </Route>
          <Route path="tutorial" element={<Tutorial />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
