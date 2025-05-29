import spotify_logo from './assets/spotify_logo.png';
import './App.css';

function App() {
  const CLIENT_ID = '499337586f42443baa43cb4e67c76517';
  const REDIRECT_URI = 'http://127.0.0.1:8000/callback';
  const SCOPE = 'user-read-email user-read-private user-follow-read';
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';

  const handleSpotifyLogin = () => {
    // Construct the URL with query parameters
    const authUrl = new URL(AUTH_ENDPOINT);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('scope', SCOPE);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', crypto.randomUUID()); // CSRF protection
    console.log(authUrl.toString())
    window.location.href = authUrl.toString();
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
