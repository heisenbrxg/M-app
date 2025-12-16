import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, Activity } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err) {
            console.error(err);
            // Friendly error messages
            let msg = 'Failed to ' + (isLogin ? 'log in' : 'sign up');
            if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
            if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
            if (err.code === 'auth/email-already-in-use') msg = 'Email already in use.';
            if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
            if (err.code === 'auth/api-key-not-valid') msg = 'System Error: Firebase Config (API Key) is missing.';
            setError(msg);
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="brand-logo">
                    <div className="logo-circle">
                        <Activity size={32} color="white" />
                    </div>
                </div>

                <h2 className="login-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="login-subtitle">
                    {isLogin ? 'Log in to track your migraine journey' : 'Start your pain-free journey today'}
                </p>

                {error && <div className="error-alert">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')} <ArrowRight size={18} />
                    </button>
                </form>

                <div className="toggle-box">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
