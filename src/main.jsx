import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import MovieDetail from './components/MovieDetail.jsx';
import MyWishlist from './components/MyWishlist.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/wishlist" element={<MyWishlist />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
