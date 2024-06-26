import { useOktaAuth } from '@okta/okta-react';
import React from 'react';
import { Redirect } from 'react-router-dom';

const LoginDashboard = () => {
  const { oktaAuth, authState } = useOktaAuth();

  const handleLogin = () => oktaAuth.signInWithRedirect({ originalUri: '/' });

  return authState?.isAuthenticated ? (
    <Redirect to={{ pathname: '/home' }} />
  ) : (
      <div >
        <button onClick={handleLogin} className="scroll-button">
          Login With Okta
        </button>
      </div>
  );
};

export default LoginDashboard;
