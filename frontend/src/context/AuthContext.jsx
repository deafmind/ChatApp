import { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/axiosConfig';
// import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return accessToken ? { access: accessToken, refresh: refreshToken } : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokens?.access) {
  
      try {
        // setUser({ username: username, id: decodedUser.user_id });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
      } catch (error) {
        console.error('Invalid access token:', error);
        setUser(null);
        setTokens(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, [tokens]);


  const login = async (username, password) => { // <--- The essential 'async' keyword is here
    try {
      const response = await apiClient.post('/auth/login/', { username, password });
      const { access_token, refresh_token } = response.data;
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      setTokens({ access: access_token, refresh: refresh_token });


    //   const decodedUser = jwtDecode(access_token);
      setUser({ username: username});
    } catch (error) {
      console.error('Login failed:', error);

      throw error;
    }
  };


  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common['Authorization'];
  };
  
  const register = async (userData) => {
    try {
        await apiClient.post('/auth/register/', userData);
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
  }

  const contextData = {
    user,
    tokens,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;