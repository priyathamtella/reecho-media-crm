import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- LOGIC SECTION ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Hits app.Post("/login", controllers.Login) in your Go backend
      const response = await axios.post('http://localhost:5050/login', {
        email,
        password
      });

      if (response.data.token) {
        // Store JWT to clear the AuthRequired middleware later
        localStorage.setItem('token', response.data.token);
        localStorage.setItem("userName", response.data.user.name);  
        localStorage.setItem("userEmail", response.data.user.email);
        navigate('/home');
      }
    } catch (err) {
      alert("Invalid email or password");
    }
  };

  // --- UI SECTION ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold mb-2 text-slate-800 text-center">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-8 text-sm">Sign in to your boards</p>

        <div className="space-y-4">
          <input 
            type="email" placeholder="Email" required value={email}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required value={password}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full bg-slate-900 text-white mt-8 p-3 rounded-lg font-bold hover:bg-black transition shadow-lg">
          Sign In
        </button>

        <p className="mt-6 text-center text-slate-500 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 font-semibold">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;