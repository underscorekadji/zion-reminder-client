import { useState } from 'react';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

export function AuthButton() {
  const { isAuthenticated, setAuthToken, clearAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    if (isAuthenticated) {
      clearAuth();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getAuthToken();
      setAuthToken(response.token);
    } catch (err) {
      setError('Failed to authenticate');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center my-4">      <button 
        onClick={handleAuth} 
        disabled={isLoading}
        className={`btn btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
      </button>
      {error && <p className="text-error mt-2 text-sm">{error}</p>}
    </div>
  );
}
