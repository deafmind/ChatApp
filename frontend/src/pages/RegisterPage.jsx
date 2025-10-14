import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem 0;
  box-sizing: border-box;
`;

const FormBox = styled.form`
  background-color: var(--sidebar-rich-purple);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  h2 {
    color: var(--text-light-pink);
    margin-bottom: 1rem;
    text-align: center;
  }

  .name-fields {
    display: flex;
    gap: 1rem;
  }

  .link {
    color: var(--accent-soft-pink);
    text-decoration: none;
    align-self: center;
    margin-top: 1rem;
    &:hover {
        text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
    background-color: #ff4d4f20;
    color: #ff7875;
    border: 1px solid #ff4d4f;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;

    ul {
        margin: 0;
        padding-left: 1.2rem;
    }
`;

const SuccessMessage = styled.div`
    background-color: #52c41a20;
    color: #95de64;
    border: 1px solid #52c41a;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
`;


const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(null);
    setSuccess(false);

    if (formData.password !== formData.password2) {
      setErrors({ password2: ["Passwords do not match."] });
      return;
    }

    try {
      // Your UserRegistrationForm expects password1 and password2
      const submissionData = { ...formData, password1: formData.password };
      await register(submissionData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Wait 2 seconds before redirecting
    } catch (err) {
      // The backend will return form errors in err.response.data
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: ["An unexpected error occurred. Please try again."] });
      }
    }
  };

  return (
    <RegisterContainer>
        <FormBox onSubmit={handleSubmit}>
            <h2>Create a New Account</h2>

            {success && (
                <SuccessMessage>
                    Registration successful! Redirecting to login...
                </SuccessMessage>
            )}

            {errors && (
                 <ErrorMessage>
                    <ul>
                        {Object.entries(errors).map(([field, messages]) =>
                            messages.map((message, index) => (
                                <li key={`${field}-${index}`}>
                                  {field !== 'general' && <strong>{field.replace(/_/g, ' ')}: </strong>}
                                  {message}
                                </li>
                            ))
                        )}
                    </ul>
                </ErrorMessage>
            )}

            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
            />
            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            <div className="name-fields">
                <input
                    type="text"
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                />
            </div>
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            <input
                type="password"
                name="password2"
                placeholder="Confirm Password"
                value={formData.password2}
                onChange={handleChange}
                required
            />
            <button type="submit" disabled={success}>Register</button>
            <Link to="/login" className='link'>Already have an account? Login</Link>
        </FormBox>
    </RegisterContainer>
  );
};

export default RegisterPage;

