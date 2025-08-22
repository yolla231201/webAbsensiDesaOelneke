import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/roleUtils";
import TextType from "./TextType";
import { supabase } from "../../lib/supabase"; // supabase client
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  // State
  const [absensiHarian, setAbsensiHarian] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
  });
  const [pengumuman, setPengumuman] = useState([]);
  const [absensiBulanan, setAbsensiBulanan] = useState([]);
  const [lihatDetailId, setLihatDetailId] = useState(null);

  // Ambil data saat komponen mount
  useEffect(() => {
    fetchAbsensiHarian();
    fetchPengumuman();
    if (user?.role === ROLES.KEPALA_DESA) {
      fetchAbsensiBulanan();
    }
  }, [user]);

  // --- Ambil absensi harian ---
  const fetchAbsensiHarian = async () => {
    const today = new Date().toISOString().split("T")[0];
    const todayStart = today + "T00:00:00Z";
    const todayEnd = today + "T23:59:59Z";

    const { data, error } = await supabase
      .from("absensi")
      .select("status")
      .gte("waktu_absensi", todayStart)
      .lte("waktu_absensi", todayEnd);

    if (error) {
      console.error("Error fetch absensi harian:", error);
      return;
    }

    const counts = { hadir: 0, sakit: 0, izin: 0 };
    data.forEach((row) => {
      if (row.status === "Hadir") counts.hadir += 1;
      else if (row.status === "Sakit") counts.sakit += 1;
      else if (row.status === "Izin") counts.izin += 1;
    });

    setAbsensiHarian(counts);
  };

  // --- Ambil pengumuman ---
  const fetchPengumuman = async () => {
    const { data, error } = await supabase
      .from("pengumuman")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) {
      console.error("Error fetch pengumuman:", error);
      return;
    }

    setPengumuman(data);
  };

  // --- Ambil absensi bulanan (khusus Kepala Desa) ---
  const fetchAbsensiBulanan = async () => {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];
    const endOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    )
      .toISOString()
      .split("T")[0];

    // Join langsung dengan profiles
    const { data: absensiData, error } = await supabase
      .from("absensi")
      .select("status, profiles(nama)")
      .gte("waktu_absensi", startOfMonth + "T00:00:00Z")
      .lte("waktu_absensi", endOfMonth + "T23:59:59Z");

    if (error) {
      console.error("Error fetch absensi bulanan:", error);
      return;
    }

    // Hitung absensi per user
    const absensiMap = {};
    absensiData.forEach((row) => {
      const nama = row.profiles?.nama || "Tidak ada nama";
      if (!absensiMap[nama]) {
        absensiMap[nama] = { nama, hadir: 0, sakit: 0, izin: 0 };
      }
      if (row.status === "Hadir") absensiMap[nama].hadir++;
      else if (row.status === "Sakit") absensiMap[nama].sakit++;
      else if (row.status === "Izin") absensiMap[nama].izin++;
    });

    setAbsensiBulanan(Object.values(absensiMap));
  };

  // --- Cards absensi harian ---
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
          <div className="dashboard-top">
            <ProfileMenu />
          </div>
          <h1>
            <TextType
              text={[`Selamat Datang ${user?.nama}`]}
              typingSpeed={100}
              textColors={["#7c4dff"]}
              showCursor={false}
            />
          </h1>
        </header>

        {/* Cards Absensi Harian */}
        <section className="dashboard-cards">
          {absensiCards.map((item, idx) => (
            <div className="card" key={idx}>
              <h2>{item.title}</h2>
              <p>{item.count}</p>
            </div>
          ))}
        </section>

        {/* Pengumuman */}
        <section className="dashboard-pengumuman">
          <h2>Pengumuman Terbaru</h2>
          {pengumuman.map((item) => (
            <div className="pengumuman-card" key={item.id}>
              <div className="pengumuman-info">
                <h3>{item.judul}</h3>
                <button
                  onClick={() =>
                    setLihatDetailId(lihatDetailId === item.id ? null : item.id)
                  }
                >
                  {lihatDetailId === item.id ? "Tutup" : "Lihat"}
                </button>
              </div>
              {lihatDetailId === item.id && <p>{item.isi}</p>}
            </div>
          ))}
        </section>

        {/* Tabel Absensi Bulanan hanya untuk Kepala Desa */}
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
