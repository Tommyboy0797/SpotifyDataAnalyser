import spotify_logo from './assets/spotify_logo.png'
import './App.css'

function App() {
  const CLIENT_ID = '499337586f42443baa43cb4e67c76517'; // ← Replace with your real Spotify Client ID
  const REDIRECT_URI = 'http://127.0.0.1:8000/callback'; // ← Must match what you've set in Spotify Developer Dashboard
  const SCOPE = 'user-read-email user-read-private'; // ← Add or remove scopes as needed
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';

  const handleSpotifyLogin = () => {
    const state = crypto.randomUUID(); // Optional: Use localStorage to store this if you want to verify it on callback

    const authUrl = new URL(AUTH_ENDPOINT);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', state);

    window.location.href = authUrl.toString(); // 🚀 Redirect to Spotify login
  };

  return (
    <>
      <h1>Log-In</h1>
      <div>
        <img
          src={spotify_logo}
          className="spotifyLogo"
          alt="Spotify logo"
          onClick={handleSpotifyLogin}
          style={{ cursor: 'pointer' }}
        />
      </div>

      <p className="slight-faded-text">
        Click above to sign in with Spotify
      </p>
    </>
  );
}

export default App;
