import { redirect, useNavigate } from 'react-router-dom';
import './following.css';
import { useEffect, useState } from 'react';

async function get_followed_artists(token: string, after?: string): Promise <any>{
    const artist_list: any[] = [];
    let next_after: string | undefined = after;


    while (true) {
        const params = new URLSearchParams({type: 'artist', limit: '50'});

        const response = await fetch(`https://api.spotify.com/v1/me/following?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        });
    }


}


function Following(){
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
    fetch('http://127.0.0.1:8000/api/me', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setToken(data.access_token);
      })
      .catch(err => console.error(err));
  }, []);

    return (
        <>
            <h1>ARTISTS YOU FOLLOW:</h1>
        </>
    );
}

export default Following;