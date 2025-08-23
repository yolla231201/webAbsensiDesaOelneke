import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import { supabase } from "../../lib/supabase";
import "./Pengaturan.css";
import Alert from '../../components/Alert/Alert';

const Pengaturan = () => {
  const [settings, setSettings] = useState({
    id: 1, // pastikan id ada
    jam_mulai: "",
    jam_selesai: "",
    max_jarak: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User belum login");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (profileError) throw profileError;

      setRole(profile.role);

      if (profile.role !== "kepala_desa") {
        setMessage("⚠️ Hanya kepala desa yang dapat mengakses halaman ini.");
        return;
      }

      const { data, error } = await supabase
        .from("pengaturan")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;

      setSettings(data);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e, field) => {
    setSettings({ ...settings, [field]: e.target.value });
  };

  const handleToggleEdit = async () => {
    if (editing) {
      // Simpan perubahan
      try {
        const { error } = await supabase
          .from("pengaturan")
          .update({
            jam_mulai: settings.jam_mulai,
            jam_selesai: settings.jam_selesai,
            max_jarak: Number(settings.max_jarak),
            latitude: settings.latitude,
            longitude: settings.longitude,
          })
          .eq("id", settings.id); // pakai id dari state

        if (error) throw error;

        // Ambil kembali data terbaru
        const { data: updatedData, error: fetchError } = await supabase
          .from("pengaturan")
          .select("*")
          .eq("id", settings.id)
          .single();
        if (fetchError) throw fetchError;

        setSettings(updatedData); // update state
        setMessage("✅ Data berhasil disimpan!");
      } catch (err) {
        console.error(err);
        setMessage("⚠️ " + err.message);
      }
    }

    setEditing(!editing); // toggle edit/simpan
  };

  return (
    <div className="pengaturan-wrapper">
      <Navbar />
      <main className="pengaturan-main">
        <header className="pengaturan-header">
          <div className="pengaturan-top">
            <ProfileMenu />
          </div>
        </header>

        <h1 className="pengaturan-title">Pengaturan Absensi</h1>

        {message && <Alert message={message}/>}

        {loading ? (
          <p>Loading...</p>
        ) : role !== "kepala_desa" ? null : (
          <div className="pengaturan-form">
            <label>
              Jam Mulai
              <input
                type="time"
                value={settings.jam_mulai || ""}
                onChange={(e) => handleChange(e, "jam_mulai")}
                disabled={!editing}
              />
            </label>

            <label>
              Jam Selesai
              <input
                type="time"
                value={settings.jam_selesai || ""}
                onChange={(e) => handleChange(e, "jam_selesai")}
                disabled={!editing}
              />
            </label>

            <label>
              Max Jarak (m)
              <input
                type="number"
                value={settings.max_jarak || ""}
                onChange={(e) => handleChange(e, "max_jarak")}
                disabled={!editing}
              />
            </label>

            <label>
              Latitude
              <input
                type="text"
                value={settings.latitude || ""}
                onChange={(e) => handleChange(e, "latitude")}
                disabled={!editing}
              />
            </label>

            <label>
              Longitude
              <input
                type="text"
                value={settings.longitude || ""}
                onChange={(e) => handleChange(e, "longitude")}
                disabled={!editing}
              />
            </label>

            <button
              className={editing ? "pengaturan-save-btn" : "pengaturan-edit-btn"}
              onClick={handleToggleEdit}
            >
              {editing ? "Simpan" : "Edit"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Pengaturan;
