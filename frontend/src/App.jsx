import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import MonitoringPage from './pages/MonitoringPage';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
    const { user } = useAuth();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {user && <Navbar />}
            <main style={{ flex: 1, overflow: 'hidden' }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/chat/*" element={
                        <PrivateRoute><ChatPage /></PrivateRoute>
                    } />
                    <Route path="/monitoring" element={
                        <PrivateRoute><MonitoringPage /></PrivateRoute>
                    } />
                    <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
                </Routes>
            </main>
        </div>
    )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;