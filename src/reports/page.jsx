import { useEffect, useState } from "react";
import "./Portal.css";
import { API_AUTH } from "../../config";

export default function Portal() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { username, password } = API_AUTH;

    const token = btoa(`${username}:${password}`);

    fetch("https://hfml.gov.la/hfml/api/dataStore/portal/links", {
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
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
        <h1>DHIS2 System Portal</h1>

        <div className="subtitle">
          ກະລຸນາເລືອກລະບົບ / Select a system
        </div>

        <div className="grid">
          {systems.map((sys, i) => (
            <a
              className="card"
              href={sys.link}
              key={i}
              target="_blank"
              rel="noopener noreferrer"
            >
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