import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SavedProvider } from './context/SavedContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InfoPage from './pages/InfoPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedProvider>
          <ScrollToTop />
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/"                   element={<HomePage />} />
                <Route path="/search"             element={<SearchResultsPage />} />
                <Route path="/property/:id"       element={<PropertyDetailPage />} />
                <Route path="/login"              element={<LoginPage />} />
                <Route path="/register"           element={<RegisterPage />} />
                <Route path="/post-property"      element={<Navigate to="/" replace />} />
                <Route path="/saved"              element={<SearchResultsPage isSavedView={true} />} />
                <Route path="/account"            element={<Navigate to="/" replace />} />
                <Route path="/about-us"           element={<InfoPage page="about-us" />} />
                <Route path="/careers"            element={<InfoPage page="careers" />} />
                <Route path="/contact-us"         element={<InfoPage page="contact-us" />} />
                <Route path="/privacy"            element={<InfoPage page="privacy" />} />
                <Route path="/guide"              element={<InfoPage page="guide" />} />
                <Route path="/nri-services"       element={<InfoPage page="nri-services" />} />
                <Route path="/how-to-buy"         element={<InfoPage page="how-to-buy" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SavedProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

