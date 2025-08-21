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
  const [filter, setFilter] = useState("hari");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Ambil data absensi dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        let gteDate, lteDate;

        if (filter === "hari") {
          const today = now.toISOString().split("T")[0];
          gteDate = today + "T00:00:00Z";
          lteDate = today + "T23:59:59Z";
        } else if (filter === "minggu") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          gteDate = startOfWeek.toISOString();
          lteDate = endOfWeek.toISOString();
        } else if (filter === "bulan") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          gteDate = startOfMonth.toISOString();
          lteDate = endOfMonth.toISOString();
        }

        const { data, error } = await supabase
          .from("absensi")
          .select(`
            status,
            waktu_absensi,
            profiles!inner(nama)
          `)
          .gte("waktu_absensi", gteDate)
          .lte("waktu_absensi", lteDate)
          .order("waktu_absensi", { ascending: false });

        if (error) throw error;
        // map ke format yang sama seperti sebelumnya
        const mappedData = data.map((item) => ({
          nama: item.profiles.nama,
          status: item.status,
          waktu: item.waktu_absensi,
        }));

        setRiwayatData(mappedData);
      } catch (err) {
        console.error("Gagal fetch riwayat absensi:", err);
        setMessage("⚠️ Gagal mengambil data absensi: " + err.message);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };
    fetchData();
  }, [filter]);

  const totalPages = Math.ceil(riwayatData.length / perPage);
  const currentData = riwayatData.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      riwayatData.map((item) => ({
        Nama: item.nama,
        Status: item.status,
        Waktu: new Date(item.waktu).toLocaleString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Absen");
    XLSX.writeFile(workbook, "RiwayatAbsen.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let title = "Riwayat Absen";
    const now = new Date();

    if (filter === "hari") {
      title += ` Hari Ini, ${now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`;
    } else if (filter === "minggu") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      title += ` Minggu Ini, ${startOfWeek.toLocaleDateString(
        "id-ID"
      )} - ${endOfWeek.toLocaleDateString("id-ID")}`;
    } else if (filter === "bulan") {
      const monthName = now.toLocaleString("id-ID", { month: "long" });
      title += ` Bulan ${monthName} ${now.getFullYear()}`;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    const tableColumn = ["Nama", "Status", "Waktu"];
    const tableRows = riwayatData.map((item) => [
      item.nama,
      item.status,
      new Date(item.waktu).toLocaleString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8, fillColor: [255, 255, 255] },
      headStyles: { fillColor: [200, 200, 200], textColor: 0 },
    });

    doc.save("RiwayatAbsen.pdf");
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Desa Oelneke</h1>
          <ProfileMenu />
        </header>

        {message && <div className="alert">{message}</div>}

        <div className="filter-buttons">
          <button
            className={filter === "hari" ? "active" : ""}
            onClick={() => setFilter("hari")}
          >
            Hari Ini
          </button>
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

        <div className="export-buttons">
          <button onClick={exportExcel} className="excel">
            Excel
          </button>
          <button onClick={exportPDF} className="pdf">
            PDF
          </button>
        </div>

        <div className="dashboard-table">
          <div className="table-title">Riwayat Absensi</div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Status Absen</th>
                  <th>Waktu Absen</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.nama}</td>
                    <td>
                      <span className={`status ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {new Date(item.waktu).toLocaleString("id-ID", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pagination">
            <button onClick={handlePrev} disabled={currentPage === 1}>
              &lt; Sebelumnya
            </button>
            <span>
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Selanjutnya &gt;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiwayatAbsen;
