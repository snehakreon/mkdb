import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { API_CONFIG } from '../config/api.config';

interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface Props {
  onLogin: (token: string, userData: AuthUser, refreshToken?: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid email or password.');
        return;
      }

      if (!data.accessToken || !data.user) {
        setError('Unexpected server response. Please try again.');
        return;
      }

      // Extract token and user data from response
      const userData: AuthUser = {
        email: data.user.email,
        firstName: data.user.firstName || data.user.first_name || '',
        lastName: data.user.lastName || data.user.last_name || '',
        roles: data.user.roles || [],
      };

      onLogin(data.accessToken, userData, data.refreshToken);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mk-red via-red-600 to-mk-gray flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-mk-red p-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Material King" className="w-20 h-20 rounded-full object-cover shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-white">MATERIAL KING</h1>
          <p className="text-red-100 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Sign In to Continue</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@platform.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded p-3 text-red-800 text-sm">
                <p className="font-semibold">Login Failed</p>
                <p>{error}</p>
              </div>
            )}

            {/* Default Credentials Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 text-sm">
              <p className="font-bold text-blue-900 mb-2">Default Credentials:</p>
              <div className="space-y-1 text-blue-800">
                <p><span className="font-semibold">Email:</span> admin@platform.com</p>
                <p><span className="font-semibold">Password:</span> admin123</p>
              </div>
              <p className="text-xs text-blue-600 mt-2 italic">
                Register an admin user first via the API if not done yet.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-xs text-gray-500">
              Material King B2B Platform v1.0
            </p>
            <p className="text-xs text-gray-400 mt-1">
              &copy; 2026 All rights reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
