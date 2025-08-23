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

    if (error) return console.error("Error fetch absensi harian:", error);

    const counts = { hadir: 0, sakit: 0, izin: 0 };
    data.forEach((row) => {
      if (row.status === "Hadir") counts.hadir++;
      else if (row.status === "Sakit") counts.sakit++;
      else if (row.status === "Izin") counts.izin++;
    });
    setAbsensiHarian(counts);
  };

  // --- Ambil pengumuman ---
  const fetchPengumuman = async () => {
    const { data, error } = await supabase
      .from("pengumuman")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) return console.error("Error fetch pengumuman:", error);
    setPengumuman(data);
  };
  // --- Ambil absensi bulanan (khusus Kepala Desa) ---
  const fetchAbsensiBulanan = async () => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split("T")[0];
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString().split("T")[0];
  // --- Fungsi ambil absensi bulanan (khusus Kepala Desa) ---
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

  // Ambil semua profil (semua user)
  const { data: users, error: userError } = await supabase
    .from("profiles")
    .select("user_id, nama");

  if (userError) {
    console.error("Error fetch profiles:", userError);
    return;
  }

    if (absensiError) return console.error("Error fetch absensi bulanan:", absensiError);

    // Ambil semua profiles
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, nama");

    if (profileError) return console.error("Error fetch profiles:", profileError);

    // Map absensi ke nama
    const absensiMap = {};
    absensiData.forEach((row) => {
      const profile = profiles.find(p => p.user_id === row.user_id);
      const nama = profile?.nama || "Tidak ada nama"; // fallback jika tidak ditemukan
      if (!absensiMap[nama]) absensiMap[nama] = { nama, hadir: 0, sakit: 0, izin: 0 };
      if (row.status === "Hadir") absensiMap[nama].hadir++;
      else if (row.status === "Sakit") absensiMap[nama].sakit++;
      else if (row.status === "Izin") absensiMap[nama].izin++;
    });

    setAbsensiBulanan(Object.values(absensiMap));
  };
  // Ambil semua absensi bulan ini (tanpa filter user_id)
  const { data: absensiData, error: absensiError } = await supabase
    .from("absensi")
    .select("user_id, status")
    .gte("waktu_absensi", startOfMonth + "T00:00:00Z")
    .lte("waktu_absensi", endOfMonth + "T23:59:59Z");

  if (absensiError) {
    console.error("Error fetch absensi bulanan:", absensiError);
    return;
  }

  // Hitung rekap per user
  const absensiMap = users.map((u) => {
    const userAbsensi = absensiData.filter((a) => a.user_id === u.user_id);
    const hadir = userAbsensi.filter((a) => a.status === "Hadir").length;
    const sakit = userAbsensi.filter((a) => a.status === "Sakit").length;
    const izin = userAbsensi.filter((a) => a.status === "Izin").length;
    return { nama: u.nama, hadir, sakit, izin };
  });

  setAbsensiBulanan(absensiMap);
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
          <div className="dashboard-top">
            <ProfileMenu />
          </div>
          
        </header>

        <h1 className="dashboard-title">
            <TextType
              text={[`Selamat Datang ${user?.nama}`]}
              typingSpeed={100}
              textColors={["#7c4dff"]}
              showCursor={false}
            />
          </h1>

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
                <button onClick={() => setLihatDetailId(lihatDetailId === item.id ? null : item.id)}>
                  {lihatDetailId === item.id ? "Tutup" : "Lihat"}
                </button>
              </div>
              {lihatDetailId === item.id && <p>{item.isi}</p>}
            </div>
          ))}
        </section>

        {/* Tabel Absensi Bulanan (Hanya Kepala Desa) */}
        {user?.role === ROLES.KEPALA_DESA && (
          <section className="dashboard-table">
            <h2>Absensi Bulan ini </h2>
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
      
