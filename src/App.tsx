import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Assessment from './pages/Assessment'
import Results from './pages/Results'
import Admin from './pages/Admin'
import Benchmark from './pages/Benchmark'
import Disclaimer from './pages/Disclaimer'
import Copyright from './pages/Copyright'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/benchmark" element={<Benchmark />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/copyright" element={<Copyright />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
