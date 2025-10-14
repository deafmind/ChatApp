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


const RegisterPage = () => {
  const { register } = useAuth();
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
    <RegisterContainer>
        <form onSubmit={handleSubmit} className="form-box">
            <h2>Create a New Account</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                placeholder="Username"
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
            <button type="submit">Register</button>
            <Link to="/login" className="link">Already have an account? Login</Link>
        </form>
    </RegisterContainer>
  );
};

export default RegisterPage;
// NOTE: You might need to install styled-components: npm install styled-components