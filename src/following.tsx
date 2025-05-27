import { redirect, useNavigate } from 'react-router-dom';
import './following.css';
import { useEffect, useState } from 'react';

interface Artist {
  id: string;
  name: string;
  href: string;
  uri: string;
  type: string;
  popularity: number;
  genres: string[];
  followers: {
    href: string | null;
    total: number;
  };
  images: {
    url: string;
    height: number | null;
    width: number | null;
  }[];
  external_urls: {
    spotify: string;
  };
}



function Following(){
    const [token, setToken] = useState<string | null>(null);
    const [artists, set_artists] = useState<Artist[]>([]);

    useEffect(() => {
    fetch('http://127.0.0.1:8000/api/usr', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        console.log("Access token from /api/usr:", data.access_token); // DEBUG
        setToken(data.access_token);
      })
      .catch(err => console.error(err));
    }, []);

    useEffect(() => {
      if (!token) return;

      const params = new URLSearchParams({ token });
      fetch(`http://127.0.0.1:8000/dashboard/following/followed_artists?${params.toString()}`, {
        credentials: 'include', // include the cookies for the user 
      })
        .then(response => response.json())
        .then(data => {
          set_artists(data);
          console.log("artists data: ", data);
        })
        .catch(err => console.error(err));



    }, [token]);


  return (
      <>
          <h1>ARTISTS YOU FOLLOW:</h1>
      </>
  );


}

export default Following;