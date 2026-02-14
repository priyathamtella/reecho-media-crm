import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- LOGIC SECTION ---
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Hits app.Post("/register", controllers.Register) in your Go backend
      const response = await axios.post('http://localhost:5050/register', {
        name,
        email,
        password // Will be hashed via bcrypt on the backend [cite: 101]
      });

      if (response.data.token) {
        // Store JWT for future authenticated requests [cite: 104]
        localStorage.setItem('token', response.data.token);
        navigate('/login');
      }
      alert("Successfully registered!");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  // --- UI SECTION ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-bold mb-2 text-slate-800 text-center">Join Milanote</h2>
        <p className="text-slate-500 text-center mb-8 text-sm">Organize your creative projects</p>
        
        <div className="space-y-4">
          <input 
            type="text" placeholder="Full Name" required value={name}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="email" placeholder="Email Address" required value={email}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password (Min 6 chars)" required value={password}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full bg-blue-600 text-white mt-8 p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
          Create Account
        </button>
        
        <p className="mt-6 text-center text-slate-500 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;