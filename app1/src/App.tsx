import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider,  signInWithRedirect, signOut } from 'aws-amplify/auth/cognito';
import { CookieStorage } from 'aws-amplify/utils';
import { fetchAuthSession } from '@aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: "auth.dev.apps-fracta-leap.com",
          scopes: [
            // 'phone',
            "email",
            "profile",
            "openid",
            // 'aws.cognito.signin.user.admin'
          ],
          redirectSignIn: ["https://lo.dev.apps-fracta-leap.com:5173/"],
          redirectSignOut: ["https://lo.dev.apps-fracta-leap.com:5173/"],
          responseType: "code", // or 'token', note that REFRESH token will only be generated when the responseType is code
        },
      },
    },
  },
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(new CookieStorage({
  domain: 'dev.apps-fracta-leap.com',
  path: '/',
  expires: 30,
  secure: true,
  sameSite: 'lax'
}));

function App() {
  const [params] = useState(new URLSearchParams(window.location.search));
  const [code] = useState(params.get('code'));
  const [email, setEmail] = useState<string|null>(null);
  
  useEffect(() => {
    fetchAuthSession().then((sess) => {
      const jwt = sess?.tokens?.idToken;

      if(!jwt && !code) {
        signInWithRedirect();
      } else {
        setEmail(jwt?.payload["email"] as string);
      }
    });
  }, [code]);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React: 1</h1>

      <div className="card">
        <p>Signed in as <b>{email}</b></p>
      </div>

      <div>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    </>
  )
}

export default App
