// RiwayatAbsen.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../../lib/supabase";
import "./RiwayatAbsen.css";

const RiwayatAbsen = () => {
  const [riwayatData, setRiwayatData] = useState([]);
  const [filter, setFilter] = useState("hari"); // default sementara
  const [role, setRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fungsi judul untuk UI (bisa pakai <br/>)
  const getReportTitle = () => {
    const now = new Date();

    if (filter === "hari") {
      return (
        "Riwayat Absensi Hari " +
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }

    if (filter === "minggu") {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return (
        <>
          Riwayat Absensi Minggu Ini <br />
          {monday.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) +
            " - " +
            sunday.toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </>
      );
    }

    if (filter === "bulan") {
      return (
        "Riwayat Absensi Bulan " +
        now.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        })
      );
    }

    return "Riwayat Absensi";
  };

  // Fungsi judul khusus string (untuk nama file & isi PDF/Excel)
  const getReportTitleText = () => {
    const now = new Date();

    if (filter === "hari") {
      return (
        "Riwayat Absensi Hari Ini - " +
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }

    if (filter === "minggu") {
      const currentDay = now.getDay();
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return (
        "Riwayat Absensi Minggu Ini - " +
        monday.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }) +
        " sampai " +
        sunday.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }

    if (filter === "bulan") {
      return (
        "Riwayat Absensi Bulan " +
        now.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      );
    }

    return "Riwayat Absensi";
  };

  // Ambil data absensi sesuai role
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("User belum login");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (profileError) throw profileError;
        const userRole = profile?.role;
        setRole(userRole);

        // Jika staf, set default filter ke minggu (sesuai aturan semula)
        if (userRole === "staf" && filter === "hari") {
          setFilter("minggu");
          setLoading(false);
          return;
        }

        const now = new Date();
        let gteDate, lteDate;

        if (filter === "hari") {
          const today = now.toISOString().split("T")[0];
          gteDate = today + "T00:00:00Z";
          lteDate = today + "T23:59:59Z";
        } else if (filter === "minggu") {
          const currentDay = now.getDay();
          const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
          const monday = new Date(now);
          monday.setDate(now.getDate() + diffToMonday);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          gteDate = monday.toISOString();
          lteDate = sunday.toISOString();
        } else if (filter === "bulan") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          gteDate = startOfMonth.toISOString();
          lteDate = endOfMonth.toISOString();
        }

        let query = supabase
          .from("absensi")
          .select(
            `
            status,
            waktu_absensi,
            profiles!inner(user_id, nama)
          `
          )
          .gte("waktu_absensi", gteDate)
          .lte("waktu_absensi", lteDate)
          .order("waktu_absensi", { ascending: false });

        // Jika staf, hanya ambil data dirinya saja
        if (userRole === "staf") {
          query = query.eq("profiles.user_id", user.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        setRiwayatData(
          data.map((item) => ({
            nama: item.profiles.nama,
            status: item.status,
            waktu: item.waktu_absensi,
          }))
        );
      } catch (err) {
        console.error("Gagal fetch riwayat absensi:", err);
        setMessage("⚠️ " + err.message);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const totalPages = Math.ceil(riwayatData.length / perPage);
  const currentData = riwayatData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      riwayatData.map((item) => ({
        Nama: item.nama,
        Status: item.status,
        Waktu:
          new Date(item.waktu).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) +
          " | " +
          new Date(item.waktu).toLocaleTimeString("id-ID"),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Absen");

    XLSX.writeFile(workbook, getReportTitleText() + ".xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);

    doc.text(getReportTitleText(), 14, 15);

    const tableRows = riwayatData.map((item) => [
      item.nama,
      item.status,
      new Date(item.waktu).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }) +
        " | " +
        new Date(item.waktu).toLocaleTimeString("id-ID"),
    ]);

    autoTable(doc, {
      head: [["Nama", "Status", "Waktu"]],
      body: tableRows,
      startY: 25,
    });

    doc.save(getReportTitleText() + ".pdf");
  };

  return (
    <div className="riwayat-absen-wrapper">
      <Navbar />
      <main className="riwayat-absen-main">
        <header className="riwayat-absen-header">
          <div className="riwayat-absen-top">
            <ProfileMenu />
          </div>
        </header>

        {/* Judul dipisah agar sejajar dengan konten */}
        <h1 className="riwayat-absen-title">Riwayat Absensi</h1>

        {message && <div className="riwayat-absen-alert">{message}</div>}

        {/* Filter */}
        <div className="riwayat-absen-filter-buttons">
          {role === "kepala_desa" && (
            <button
              className={filter === "hari" ? "active" : ""}
              onClick={() => setFilter("hari")}
            >
              Hari Ini
            </button>
          )}
          <button
            className={filter === "minggu" ? "active" : ""}
            onClick={() => setFilter("minggu")}
          >
            Minggu Ini
          </button>
          <button
            className={filter === "bulan" ? "active" : ""}
            onClick={() => setFilter("bulan")}
          >
            Bulan Ini
          </button>
        </div>

        {/* Export hanya kepala desa */}
        {role === "kepala_desa" && (
          <div className="riwayat-absen-export-buttons">
            <button onClick={exportExcel} className="excel">
              Excel
            </button>
            <button onClick={exportPDF} className="pdf">
              PDF
            </button>
          </div>
        )}

        {/* Table */}
        <div className="riwayat-absen-table-container">
          <div className="riwayat-absen-table-title">{getReportTitle()}</div>
          {loading ? (
            <p className="Loading">Loading...</p>
          ) : riwayatData.length === 0 && filter === "hari" ? (
            <div className="riwayat-absen-empty-card">
              <p>Data absensi hari ini belum ada.</p>
            </div>
          ) : (
            <>
              <div className="riwayat-absen-table-responsive">
                <table className="riwayat-absen-table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Status</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.nama}</td>
                        <td>
                          <span className={`status ${item.status?.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          {new Date(item.waktu).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }) +
                            " | " +
                            new Date(item.waktu).toLocaleTimeString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination muncul hanya kalau ada data */}
              <div className="riwayat-absen-pagination">
                <button onClick={handlePrev} disabled={currentPage === 1}>
                  &lt; Sebelumnya
                </button>
                <span>
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya &gt;
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RiwayatAbsen;
