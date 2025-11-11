import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import Login from './pages/Login';
import PinLock from './pages/PinLock';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import DeviceControl from './pages/DeviceControl';
import TestDevice from './pages/TestDevice';
import WhatsAppSettings from './pages/WhatsAppSettings';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import ToastProvider from './components/ToastProvider';

function App() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const needsPinUnlock = localStorage.getItem('pinLockTime');

  // Update PIN lock time on user activity to prevent permanent lock
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const updateActivity = () => {
      localStorage.setItem('pinLockTime', Date.now().toString());
    };
    
    // Update on any user interaction
    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
    };
  }, [isAuthenticated]);

  // Check if session needs PIN unlock (after 5 minutes of inactivity)
  const requiresPinUnlock = isAuthenticated && needsPinUnlock && 
    Date.now() - parseInt(needsPinUnlock) > 5 * 60 * 1000;

  return (
    <>
      <ToastProvider />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />
          
          <Route path="/pin-lock" element={
            requiresPinUnlock ? <PinLock /> : <Navigate to="/" replace />
          } />

          <Route path="/" element={
            isAuthenticated ? <Layout /> : <Navigate to="/login" replace />
          }>
            <Route index element={<Dashboard />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="device-control" element={<DeviceControl />} />
            <Route path="test-device" element={<TestDevice />} />
            <Route path="whatsapp" element={<WhatsAppSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
