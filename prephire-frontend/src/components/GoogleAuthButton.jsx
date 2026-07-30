import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

export default function GoogleAuthButton() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('https://prephire-7vlj.onrender.com/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save your app's JWT token
        localStorage.setItem('token', data.access_token);
        
        // Navigate straight to dashboard
        navigate('/dashboard');
      } else {
        console.error('OAuth Backend Error:', data.detail);
      }
    } catch (err) {
      console.error('Network Error during OAuth:', err);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In failed');
  };

  return (
    <div className="flex justify-center my-4">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text="continue_with" // Displays "Continue with Google"
        shape="rectangular"
      />
    </div>
  );
}