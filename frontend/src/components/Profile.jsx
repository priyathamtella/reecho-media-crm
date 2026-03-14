import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, ArrowLeft, LogOut, Shield, Loader2, AlertCircle 
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [user, setUser] = useState({
    name: "",
    email: "",
    initials: ""
  });

  useEffect(() => {
    // Retrieve the exact keys set during Login
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/login");
        return;
    }

    // If data is missing, we show an error state instead of just "Unknown"
    if (!name || !email) {
        setError(true);
    } else {
        setUser({
          name: name,
          email: email,
          initials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        });
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // This clears userName, userEmail, and token
    navigate("/");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Section */}
        <div className="bg-slate-900 px-6 py-10 flex flex-col items-center relative text-center">
             <button onClick={() => navigate('/')} className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
             </button>

             {error ? (
                <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-4">
                    <AlertCircle size={40} />
                </div>
             ) : (
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full border-4 border-slate-800 flex items-center justify-center text-2xl font-bold text-white mb-4">
                    {user.initials}
                </div>
             )}
             
             <h2 className="text-xl font-bold text-white">{error ? "Session Error" : user.name}</h2>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-5">
            {error ? (
                <div className="text-center space-y-4">
                    <p className="text-sm text-slate-500">We couldn't find your profile data. Please try logging in again to refresh your session.</p>
                    <button onClick={handleLogout} className="text-indigo-600 font-bold hover:underline">Go to Login</button>
                </div>
            ) : (
                <>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 mt-1">
                            <User size={18} className="text-slate-400 mr-3" />
                            <span className="font-semibold text-slate-700">{user.name}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 mt-1">
                            <Mail size={18} className="text-slate-400 mr-3" />
                            <span className="font-medium text-slate-600 truncate">{user.email}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-rose-500 hover:text-white hover:bg-rose-500 font-bold px-4 py-4 rounded-2xl border border-rose-100 transition-all mt-4"
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Profile;