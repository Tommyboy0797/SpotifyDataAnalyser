import './dashboard.css';
import { useEffect, useState } from 'react';

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
      <h1>LOGGED THE HECK IN</h1>
      {user && (
        <p>Welcome, {user.display_name} ({user.email})</p>
      )}
    </>
  );
}

export default Dashboard;
