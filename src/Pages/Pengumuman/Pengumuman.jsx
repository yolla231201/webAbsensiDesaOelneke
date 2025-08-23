import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import { supabase } from "../../lib/supabase";
import "./Pengumuman.css";

const Pengumuman = () => {
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPengumuman = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pengumuman")
          .select("*")
          .order("tanggal", { ascending: false });
        if (error) throw error;
        setPengumuman(data);
      } catch (err) {
        console.error("Gagal fetch pengumuman:", err);
        setMessage("⚠️ Gagal mengambil data pengumuman: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPengumuman();
  }, []);

  return (
    <div className="pengumuman-wrapper">
      <Navbar />
      <main className="pengumuman-main">
        <header className="pengumuman-header-wrapper">
          <div className="pengumuman-top">
            <ProfileMenu />
          </div>
        </header>

        <h1 className="pengumuman-title">Pengumuman</h1>

        {message && <div className="pengumuman-alert">{message}</div>}

        <div className="pengumuman-list">
          {loading ? (
            <p>Loading...</p>
          ) : pengumuman.length === 0 ? (
            <p>Belum ada pengumuman.</p>
          ) : (
            pengumuman.map((item, idx) => (
              <div className="pengumuman-card" key={idx}>
                <div className="pengumuman-card-header">
                  <h3>{item.judul}</h3>
                  <span>
                    {new Date(item.tanggal).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <p>{item.isi}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Pengumuman;
