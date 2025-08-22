import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/roleUtils";
import TextType from "./TextType";
import { supabase } from "../../lib/supabase"; 
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  const [absensiHarian, setAbsensiHarian] = useState({ hadir: 0, sakit: 0, izin: 0 });
  const [pengumuman, setPengumuman] = useState([]);
  const [absensiBulanan, setAbsensiBulanan] = useState([]);
  const [lihatDetailId, setLihatDetailId] = useState(null);

  useEffect(() => {
    fetchAbsensiHarian();
    fetchPengumuman();
    if (user?.role === ROLES.KEPALA_DESA) fetchAbsensiBulanan();
  }, [user]);

  const fetchAbsensiHarian = async () => {
    const today = new Date().toISOString().split("T")[0];
    const todayStart = today + "T00:00:00Z";
    const todayEnd = today + "T23:59:59Z";

    const { data, error } = await supabase
      .from("absensi")
      .select("status")
      .gte("waktu_absensi", todayStart)
      .lte("waktu_absensi", todayEnd);

    if (error) return console.error("Error fetch absensi harian:", error);

    const counts = { hadir: 0, sakit: 0, izin: 0 };
    data.forEach((row) => {
      if (row.status === "Hadir") counts.hadir++;
      else if (row.status === "Sakit") counts.sakit++;
      else if (row.status === "Izin") counts.izin++;
    });
    setAbsensiHarian(counts);
  };

  const fetchPengumuman = async () => {
    const { data, error } = await supabase
      .from("pengumuman")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) return console.error("Error fetch pengumuman:", error);
    setPengumuman(data);
  };

  const fetchAbsensiBulanan = async () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split("T")[0];
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString().split("T")[0];

    // Ambil absensi + join ke profiles
    const { data: absensiData, error } = await supabase
      .from("absensi")
      .select("status, user_id, profiles(nama)")
      .gte("waktu_absensi", startOfMonth + "T00:00:00Z")
      .lte("waktu_absensi", endOfMonth + "T23:59:59Z");

    if (error) return console.error("Error fetch absensi bulanan:", error);

    // Kelompokkan per user berdasarkan nama
    const absensiMap = {};
    absensiData.forEach((row) => {
      const nama = row.profiles?.nama || "Tidak ada nama";
      if (!absensiMap[nama]) absensiMap[nama] = { nama, hadir: 0, sakit: 0, izin: 0 };
      if (row.status === "Hadir") absensiMap[nama].hadir++;
      else if (row.status === "Sakit") absensiMap[nama].sakit++;
      else if (row.status === "Izin") absensiMap[nama].izin++;
    });

    setAbsensiBulanan(Object.values(absensiMap));
  };

  const absensiCards = [
    { title: "Hadir", count: absensiHarian.hadir },
    { title: "Sakit", count: absensiHarian.sakit },
    { title: "Izin", count: absensiHarian.izin },
  ];

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="dashboard-top"><ProfileMenu /></div>
          <h1>
            <TextType text={[`Selamat Datang ${user?.nama}`]} typingSpeed={100} textColors={["#7c4dff"]} showCursor={false}/>
          </h1>
        </header>

        <section className="dashboard-cards">
          {absensiCards.map((item, idx) => (
            <div className="card" key={idx}>
              <h2>{item.title}</h2>
              <p>{item.count}</p>
            </div>
          ))}
        </section>

        <section className="dashboard-pengumuman">
          <h2>Pengumuman Terbaru</h2>
          {pengumuman.map((item) => (
            <div className="pengumuman-card" key={item.id}>
              <div className="pengumuman-info">
                <h3>{item.judul}</h3>
                <button onClick={() => setLihatDetailId(lihatDetailId === item.id ? null : item.id)}>
                  {lihatDetailId === item.id ? "Tutup" : "Lihat"}
                </button>
              </div>
              {lihatDetailId === item.id && <p>{item.isi}</p>}
            </div>
          ))}
        </section>

        {user?.role === ROLES.KEPALA_DESA && (
          <section className="dashboard-table">
            <h2>Absensi Bulanan</h2>
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Hadir</th>
                  <th>Sakit</th>
                  <th>Izin</th>
                </tr>
              </thead>
              <tbody>
                {absensiBulanan.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.nama}</td>
                    <td>{item.hadir}</td>
                    <td>{item.sakit}</td>
                    <td>{item.izin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
