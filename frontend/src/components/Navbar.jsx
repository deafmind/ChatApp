import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { FaSignOutAlt } from 'react-icons/fa';


const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  background-color: var(--sidebar-rich-purple);
  height: 60px;

  .nav-links {
    display: flex;
    gap: 2rem;
  }
  
  .nav-link {
    color: var(--text-light-pink);
    text-decoration: none;
    font-size: 1.1rem;
    position: relative;
    padding: 0.5rem 0;
  }

  .nav-link.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--accent-soft-pink);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .logout-btn {
    background: none;
    border: none;
    color: var(--accent-soft-pink);
    cursor: pointer;
    font-size: 1.5rem;
    &:hover {
        color: var(--text-light-pink);
    }
  }
`;

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Nav>
            <div className="nav-links">
                <NavLink to="/chat" className="nav-link">Chat</NavLink>
                <NavLink to="/monitoring" className="nav-link">Monitoring</NavLink>
            </div>
            <div className='user-info'>
                <span>Welcome, {user.username}</span>
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                    <FaSignOutAlt />
                </button>
            </div>
        </Nav>
    )
}

export default Navbar;