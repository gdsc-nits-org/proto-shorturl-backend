import React, { useState } from "react";
import axios from 'axios';

interface User {
  username: string;
  email: string;
  password: string;
}

// ... Signup form component

const SignupForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/signup', { username, email, password });
      const { token, user } = response.data;

      // Store token and user data locally (e.g., using localStorage or a state management library)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to /api/shorten endpoint after successful signup
      window.location.href = '/api/shorten';
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setError('Email already exists. Please log in.');
      } else {
        setError('An error occurred. Please try again.'); // Generic error message for now
      }
    } finally {
      setIsLoading(false);
    }
  };

  // return (
  //   <form onSubmit={handleSubmit}>
  //     {/* ... form fields and submit button */}
  //     {isLoading && <p>Loading...</p>}
  //     {error && <p style={{ color: 'red' }}>{error}</p>}
  //   </form>
  // );
};

export default SignupForm;
