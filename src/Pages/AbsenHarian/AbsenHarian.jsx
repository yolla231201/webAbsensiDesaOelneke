import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import { FiMapPin } from "react-icons/fi";
import Alert from "../../components/Alert/Alert";
import { supabase } from "../../lib/supabase";
import "./AbsenHarian.css";

const AbsensiHarian = () => {
  const [status, setStatus] = useState("Hadir");
  const [keterangan, setKeterangan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [distance, setDistance] = useState(null);
  const [message, setMessage] = useState("");
  const [errorKeterangan, setErrorKeterangan] = useState(false);
  const [errorLokasi, setErrorLokasi] = useState(false);
  const [pengaturan, setPengaturan] = useState(null);
  const [todayAbsensi, setTodayAbsensi] = useState(null);
  const [formDisabled, setFormDisabled] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const fetchAuthUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setAuthUser(data.user);
    };
    fetchAuthUser();
  }, []);

  useEffect(() => {
    const fetchPengaturan = async () => {
      const { data: pengaturan, error } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single(); // ganti single() dengan maybeSingle()
      if (error) setMessage("⚠️ Gagal mengambil pengaturan: " + error.message);
      else setPengaturan(pengaturan);
    };
    fetchPengaturan();
  }, []);

  useEffect(() => {
    const fetchTodayAbsensi = async () => {
      if (!authUser) return;
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("absensi")
        .select("*")
        .eq("user_id", authUser.id)
        .gte("waktu_absensi", today + "T00:00:00Z")
        .lte("waktu_absensi", today + "T23:59:59Z");

      if (error)
        setMessage("⚠️ Gagal mengambil absensi hari ini: " + error.message);
      else setTodayAbsensi(data?.[0] || null);
    };
    fetchTodayAbsensi();
  }, [authUser]);

  useEffect(() => {
    if (!pengaturan) return;
    const now = new Date();
    const [hStart, mStart, sStart] = pengaturan.jam_mulai
      .split(":")
      .map(Number);
    const [hEnd, mEnd, sEnd] = pengaturan.jam_selesai.split(":").map(Number);

    const startTime = new Date();
    startTime.setHours(hStart, mStart, sStart, 0);
    const endTime = new Date();
    endTime.setHours(hEnd, mEnd, sEnd, 0);
    if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);

    if (todayAbsensi) {
      setStatus(todayAbsensi.status);
      setKeterangan(todayAbsensi.keterangan || "");
      if (now >= startTime && now <= endTime) {
        setCanEdit(true);
        setFormDisabled(false);
      } else {
        setCanEdit(false);
        setFormDisabled(true);
      }
    } else {
      if (now >= startTime && now <= endTime) {
        setFormDisabled(false);
      } else {
        setFormDisabled(true);
      }
    }
  }, [pengaturan, todayAbsensi]);

  const getDistanceFromLatLonInMeter = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getLokasi = () => {
    if (!navigator.geolocation) {
      setMessage("⚠️ Geolocation tidak didukung browser Anda!");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLokasi(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        if (pengaturan) {
          const jarak = getDistanceFromLatLonInMeter(
            lat,
            lng,
            pengaturan.latitude,
            pengaturan.longitude
          );
          setDistance(jarak);
          setErrorLokasi(false);
          if (jarak > pengaturan.max_jarak) {
            setMessage("⚠️ Jarak Anda terlalu jauh! Pindah lokasi dulu.");
          }
        }
      },
      (err) => setMessage("⚠️ Gagal mendapatkan lokasi: " + err.message)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formDisabled) return;

    if (!lokasi.trim()) {
      setMessage("⚠️ Harap ambil lokasi Anda!");
      setErrorLokasi(true);
      return;
    }

    if (distance > pengaturan?.max_jarak) {
      setMessage("⚠️ Jarak terlalu jauh, pindah lokasi dulu!");
      return;
    }

    let hasError = false;
    if ((status === "Sakit" || status === "Izin") && !keterangan.trim()) {
      setMessage("⚠️ Harap isi keterangan jika Sakit/Izin!");
      setErrorKeterangan(true);
      hasError = true;
    } else {
      setErrorKeterangan(false);
    }
    if (hasError) return;

    try {
      if (todayAbsensi && canEdit) {
        const { data, error } = await supabase
          .from("absensi")
          .update({
            status,
            keterangan,
            waktu_absensi: new Date().toISOString(),
          })
          .eq("id", todayAbsensi.id)
          .select();

        if (error) throw error;
        setMessage("✅ Absensi berhasil diperbarui!");
        setTodayAbsensi(data[0]);
      } else if (!todayAbsensi) {
        const { data, error } = await supabase
          .from("absensi")
          .insert([
            {
              user_id: authUser.id,
              status,
              keterangan,
              waktu_absensi: new Date().toISOString(),
            },
          ])
          .select();
        if (error) throw error;
        setMessage("✅ Absensi berhasil dikirim!");
        setTodayAbsensi(data[0]);
      } else {
        setMessage(
          "⚠️ Waktu edit absensi sudah lewat, tidak bisa mengubah data."
        );
      }

      setLokasi("");
      setDistance(null);
    } catch (err) {
      console.error("Gagal mengirim absensi:", err);
      setMessage("⚠️ Gagal mengirim absensi: " + err.message);
    }
  };

  return (
    <div className="absensi-wrapper">
      <Navbar />
      <main className="absensi-main">
        <header className="absensi-header">
          <div className="absensi-top">
            <ProfileMenu />
          </div>
        </header>

        <h1 className="absensi-title">Absensi Harian</h1>

        {message && (
          <Alert
            message={message}
            duration={4000}
            onClose={() => setMessage("")}
          />
        )}

        <form className="absensi-form" onSubmit={handleSubmit}>
          {(status === "Sakit" || status === "Izin") && (
            <div className="form-group">
              <label>Keterangan</label>
              <input
                type="text"
                placeholder="Isi keterangan..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className={errorKeterangan ? "input-error" : ""}
                disabled={formDisabled}
              />
            </div>
          )}

          <div className="form-group">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={formDisabled}
            >
              <option value="Hadir">Hadir</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin">Izin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Lokasi Saat Ini</label>
            <div className="lokasi-input-wrapper">
              <input
                type="text"
                placeholder="Klik tombol untuk ambil lokasi"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className={errorLokasi ? "input-error" : ""}
                disabled={formDisabled}
              />
              <button
                type="button"
                className="lokasi-btn"
                onClick={getLokasi}
                disabled={formDisabled}
              >
                <FiMapPin size={18} />
              </button>
            </div>
          </div>

          <div className="submit-row">
            <p
              className={
                distance > pengaturan?.max_jarak
                  ? "distance-out"
                  : "distance-ok"
              }
            >
              {distance !== null ? `Jarak: ${Math.round(distance)} m` : ""}
            </p>
            <button type="submit" disabled={formDisabled}>
              {todayAbsensi && canEdit ? "Update Absensi" : "Kirim Absensi"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AbsensiHarian;
