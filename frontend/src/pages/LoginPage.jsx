import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  .form-box {
    background-color: var(--sidebar-rich-purple);
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  h2 {
    color: var(--text-light-pink);
    margin-bottom: 1rem;
  }
  .link {
    color: var(--accent-soft-pink);
    text-decoration: none;
    align-self: center;
    &:hover {
        text-decoration: underline;
    }
  }
`;


const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/chat');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <LoginContainer>
        <form onSubmit={handleSubmit} className="form-box">
            <h2>Login to Your Account</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="email" // Your backend uses email as username
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Login</button>
            <Link to="/register" className='link'>Don't have an account? Register</Link>
        </form>
    </LoginContainer>
  );
};

export default LoginPage;
