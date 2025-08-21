import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/roleUtils";
import TextType from "./TextType";
import { supabase } from "../../lib/supabase"; // pastikan supabase client sudah di-setup
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();

  // State untuk absensi harian, pengumuman, dan absensi bulanan
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

  // --- Fungsi ambil absensi harian ---
  const fetchAbsensiHarian = async () => {
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
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

    // Hitung jumlah per status
    const counts = { hadir: 0, sakit: 0, izin: 0 };
    data.forEach((row) => {
      if (row.status === "Hadir") counts.hadir += 1;
      else if (row.status === "Sakit") counts.sakit += 1;
      else if (row.status === "Izin") counts.izin += 1;
    });

    setAbsensiHarian(counts);
  };

  // --- Fungsi ambil pengumuman ---
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

  // --- Fungsi ambil absensi bulanan (khusus Kepala Desa) ---
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

    // Ambil semua profil
    const { data: users, error: userError } = await supabase
      .from("profiles")
      .select("user_id, nama");
    if (userError) {
      console.error("Error fetch profiles:", userError);
      return;
    }

    // Ambil semua absensi bulan ini
    const { data: absensiData, error: absensiError } = await supabase
      .from("absensi")
      .select("user_id, status")
      .gte("waktu_absensi", startOfMonth + "T00:00:00Z")
      .lte("waktu_absensi", endOfMonth + "T23:59:59Z");

    if (absensiError) {
      console.error("Error fetch absensi bulanan:", absensiError);
      return;
    }

    // Hitung per user
    const absensiMap = users.map((u) => {
      const userAbsensi = absensiData.filter((a) => a.user_id === u.user_id);
      const hadir = userAbsensi.filter((a) => a.status === "Hadir").length;
      const sakit = userAbsensi.filter((a) => a.status === "Sakit").length;
      const izin = userAbsensi.filter((a) => a.status === "Izin").length;
      return { nama: u.nama, hadir, sakit, izin };
    });

    setAbsensiBulanan(absensiMap);
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
