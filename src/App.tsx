import { useState } from 'react'
import spotify_logo from './assets/spotify_logo.png'
import './App.css'

function App() {

  return (
    <>
    <h1>Log-In</h1>
      <div>
        <a href="https://react.dev" target="_blank">
          <img src={spotify_logo} className="spotifyLogo" alt="Spotify logo" />
        </a>
      </div>

      <p className="slight-faded-text">
        Click above to sign in with Spotify
      </p>

    </>
  )
}

export default App
