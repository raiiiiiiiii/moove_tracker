import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ShareCard from './pages/ShareCard.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="ambient-bg" />
      <div className="page-root">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/dashboard/:username" element={<Dashboard />} />
          <Route path="/share/:username" element={<ShareCard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
