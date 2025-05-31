import {useNavigate } from 'react-router-dom';
import './dashboard.css';
import { useEffect, useState } from 'react';

function DisplayProfile({ profile }: { profile: any }) {
  const [artistsFollowedNum, setArtistsFollowedNum] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFollowedArtists() {
      try {
        const params = new URLSearchParams({ token: profile});
        const response = await fetch(`http://127.0.0.1:8000/dashboard/following/followed_artists?${params.toString()}`, {
          credentials: 'include',
        });
        const data = await response.json();
        setArtistsFollowedNum(data.length);
      } catch (err) {
        console.error("Failed to fetch followed artists:", err);
      }
    }

    if (profile) {
      fetchFollowedArtists();
    }
  }, [profile]);

  const handle_redirect = (location: string) => {
    navigate(location);
  };

  return (
    <>
      <h1 className='profile_data_title'>PROFILE DATA:</h1>
      <p className='profile_data' id='account_username'>{profile.display_name}</p>
      <p className='profile_data' id='account_email'>{profile.email}</p>
      <p className='profile_data' id='account_country'>{profile.country}</p>
      <p className='clickable_text' onClick={() => handle_redirect("/dashboard/following")} id='artists_followed'>
        {artistsFollowedNum !== null ? `${artistsFollowedNum} followed artists` : 'Loading followed artists...'}
      </p>
    </>
  );
}


function Dashboard() {
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/me', {
      credentials: 'include', // IMPORTANT: Sends the cookie
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <h1 className='title_text'>DASHBOARD</h1>
      {user ? <DisplayProfile profile = {user} />: <p>Loading...</p>}
    </>
  );
}

export default Dashboard;
