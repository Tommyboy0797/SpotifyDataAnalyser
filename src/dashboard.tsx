import {useNavigate } from 'react-router-dom';
import './dashboard.css';
import { useEffect, useState } from 'react';
import {
  Chart,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

Chart.register(
  LinearScale,
  CategoryScale,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  Tooltip,
  Legend
);



let timeset: string = "short_term"; // can be long_term, medium_term, short_term. 
let detailed: boolean = false; // return detailed info or not..
const genreCounts: { [genre: string]: number } = {};


function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}



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
    <div className="profile_container">
      <h1 className="profile_data_title">Profile Overview</h1>
      <div className="profile_info">
        <p><span className="profile_label">Username:</span> <span className="profile_data">{profile.display_name}</span></p>
        <p><span className="profile_label">Email:</span> <span className="profile_data">{profile.email}</span></p>
        <p><span className="profile_label">Country:</span> <span className="profile_data">{profile.country}</span></p>
        <p
          className="clickable_text"
          onClick={() => handle_redirect("/dashboard/following")}
          id="artists_followed"
        >
          {artistsFollowedNum !== null
            ? `${artistsFollowedNum} followed artists`
            : "Loading followed artists..."}
        </p>
      </div>
    </div>
  );
}

async function get_artist_genre(artist_id: string, detail: boolean) {
  const data = await fetch("http://127.0.0.1:8000/artist_info?id=" + artist_id, {
    credentials: 'include'
  }).then(res => res.json());
  if (detail == true){
    if (data.genres && Array.isArray(data.genres)) {
      data.genres.forEach((genre: string) => {
        if (genreCounts[genre]) {
          genreCounts[genre]++;
        } else {
          genreCounts[genre] = 1;
        }
      });
    }
  } else {
      let genre: any = data.genres[0]
        if (genreCounts[genre]) {
          genreCounts[genre]++;
        } else {
          genreCounts[genre] = 1;
        }  
  };
}


let genreChartInstance: Chart | null = null;


function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function renderGenreChart(data: any) {
  const ctx = document.getElementById('genreChart') as HTMLCanvasElement;

  if (genreChartInstance) {
    genreChartInstance.destroy();
  }

  const labels = Object.keys(data);
  const values = Object.values(data).map(v => Number(v));
  const backgroundColors = labels.map(() => getRandomColor());

  genreChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'Genre Count',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: '#ffffff',
        borderWidth: 2
      }],
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#333',
            padding: 15,
          },
        },
        title: {
          display: true,
          text: 'Your Top Genres',
          color: '#111',
          font: {
            size: 20,
            weight: 'bold'
          },
          padding: {
            top: 20,
            bottom: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.raw;
              return `${label}: ${value}`;
            }
          }
        }
      }
    }
  });
}



async function display_genre_charts(time: string){

  let request_url: string = "http://127.0.0.1:8000/tracks_data?time_range=" + time;
  const promises: any = [];
  Object.keys(genreCounts).forEach(key => delete genreCounts[key]);

  const response = await fetch(request_url, { credentials: 'include' })
   .then(res => res.json())
   .then(data => {

    if (detailed == true){
          data.forEach((track: any) => {
            track.artists.forEach((artist: any) => {
            if (artist && artist.id) {
              promises.push(get_artist_genre(artist.id, true));
            }
          });
        });
    } else {
          data.forEach((track: any) => {
            let artist = track.artists[0];
            if (artist && artist.id) {
              promises.push(get_artist_genre(artist.id, false));
            }
          });
    }
    Promise.all(promises).then(() => {
      renderGenreChart(genreCounts);
    });
    });


};

function mode_changed(type: string, curr_value: any){
  if (type == "detailedToggle"){
    detailed = curr_value;
  }
  else if (type == "timeRangeSelect"){
    const selectElem = document.getElementById("timeRangeSelect") as HTMLSelectElement | null;
    if (selectElem) {
      timeset = selectElem.value;
    }
  }
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
      .then(data => {
        setUser(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    display_genre_charts(timeset);

    const detailedToggle = document.getElementById("detailedToggle") as HTMLInputElement | null;
    const timeRangeSelect = document.getElementById("timeRangeSelect") as HTMLSelectElement | null;

    function onDetailedChange() {
      if (detailedToggle) {
        mode_changed("detailedToggle", detailedToggle.checked);
        display_genre_charts(timeset)
      }
    }
    function onTimeRangeChange() {
      if (timeRangeSelect) {
        mode_changed("timeRangeSelect", timeRangeSelect.value);
        display_genre_charts(timeset)
      }
    }

    detailedToggle?.addEventListener("change", onDetailedChange);
    timeRangeSelect?.addEventListener("change", onTimeRangeChange);

    return () => {
      detailedToggle?.removeEventListener("change", onDetailedChange);
      timeRangeSelect?.removeEventListener("change", onTimeRangeChange);
    };
  }, []);

  return (
    <>
      <h1 className="title_text">DASHBOARD</h1>
      {user ? <DisplayProfile profile={user} /> : <p>Loading...</p>}

      <div className="chart_container">
        <h2 className="chart_title">Genre Distribution</h2>
        <p className='sub_title_txt'> based on 15 most listened to songs in time range</p>
        <div className="chart_content_row">

          <div className="chart_canvas">
            <canvas id="genreChart" width="400" height="200"></canvas>
          </div>

          <div className="chart_controls_right">

            <div className="toggle_group_column">
              <label className="toggle_label">Detailed Mode</label>
              <label className="switch">
                <input type="checkbox" id="detailedToggle" />
                <span className="slider round"></span>
              </label>
            </div>

            <div className="toggle_group_column">
              <label className="toggle_label">Time Range</label>
              <select id="timeRangeSelect" className="time_dropdown">
                <option value="short_term">Short</option>
                <option value="medium_term">Medium</option>
                <option value="long_term">Long</option>
              </select>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}

export default Dashboard;
