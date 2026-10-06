import { useEffect, useState } from "react";
import "./Portal.css";

export default function Portal() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function checkUserLogin() {
    try {
      const res = await fetch("https://hfml.health.gov.la/hfml/api/me", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Not logged in");
      const data = await res.json();
      return { loggedIn: true, user: data };
    } catch (err) {
      return { loggedIn: false };
    }
  }

  // ฟังก์ชัน fetch DataStore ขึ้นอยู่กับว่า user login หรือไม่
  async function fetchPortalLinks() {
    const { loggedIn } = await checkUserLogin();

    if (loggedIn) {
      const res = await fetch("https://hfml.health.gov.la/hfml/api/dataStore/portal/links", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } else {
      const username = import.meta.env.VITE_USERNAME;
      const password = import.meta.env.VITE_PASSWORD;
      const token = btoa(`${username}:${password}`);
      const res = await fetch("https://hfml.health.gov.la/hfml/api/dataStore/portal/links", {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchPortalLinks()
      .then((data) => {
        const list = data.links || data || [];
        const fixed = Array.isArray(list)
          ? list.map((sys) => ({
              ...sys,
              link: sys.link?.startsWith("http")
                ? sys.link
                : `https://${sys.link}`,
            }))
          : [];
        setSystems(fixed);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Digital Health Portal</h1>

        <div className="subtitle">
          ກະລຸນາເລືອກລະບົບ / Select a system
        </div>

        <div className="grid">
          {systems.map((sys, i) => (
            <a className="card" href={sys.link} key={i}>
              <span className="en">{sys.title}</span>
              <span className="lo">{sys.desc1}</span>
              {sys.desc2 && <span className="lo">{sys.desc2}</span>}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}