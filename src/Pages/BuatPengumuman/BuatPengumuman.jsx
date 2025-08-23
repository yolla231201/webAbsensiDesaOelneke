import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import { supabase } from "../../lib/supabase";
import Alert from "../../components/Alert/Alert";
import "./BuatPengumuman.css";

const BuatPengumuman = () => {
  const [pengumumanList, setPengumumanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ judul: "", isi: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch pengumuman
  const fetchPengumuman = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pengumuman")
        .select("*")
        .order("tanggal", { ascending: false });
      if (error) throw error;
      setPengumumanList(data);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Gagal mengambil data pengumuman: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const handleChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.judul || !form.isi) {
      setMessage("⚠️ Judul dan Isi tidak boleh kosong");
      return;
    }

    try {
      if (editingId) {
        // Update pengumuman
        const { error } = await supabase
          .from("pengumuman")
          .update({
            judul: form.judul,
            isi: form.isi,
            tanggal: new Date().toISOString(),
          })
          .eq("id", editingId);
        if (error) throw error;
        setMessage("✅ Pengumuman berhasil diperbarui!");
      } else {
        // Tambah pengumuman baru
        const { error } = await supabase
          .from("pengumuman")
          .insert({
            judul: form.judul,
            isi: form.isi,
            tanggal: new Date().toISOString(),
          });
        if (error) throw error;
        setMessage("✅ Pengumuman berhasil dibuat!");
      }
      setForm({ judul: "", isi: "" });
      setEditingId(null);
      fetchPengumuman();
    } catch (err) {
      console.error(err);
      setMessage("⚠️ " + err.message);
    }
  };

  const handleEdit = (item) => {
    setForm({ judul: item.judul, isi: item.isi });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;
    try {
      const { error } = await supabase.from("pengumuman").delete().eq("id", id);
      if (error) throw error;
      setMessage("✅ Pengumuman berhasil dihapus!");
      fetchPengumuman();
    } catch (err) {
      console.error(err);
      setMessage("⚠️ " + err.message);
    }
  };

  return (
    <div className="buat-pengumuman-wrapper">
      <Navbar />
      <main className="buat-pengumuman-main">
        <header className="buat-pengumuman-header-wrapper">
          <div className="buat-pengumuman-top">
            <ProfileMenu />
          </div>
        </header>

        <h1 className="buat-pengumuman-title">Buat Pengumuman</h1>

        {message && <Alert message={message} />}

        {/* Form pengumuman */}
        <div className="buat-pengumuman-form">
          <label>
            Judul
            <input
              type="text"
              value={form.judul}
              onChange={(e) => handleChange(e, "judul")}
            />
          </label>
          <label>
            Isi
            <textarea
              rows="4"
              value={form.isi}
              onChange={(e) => handleChange(e, "isi")}
            />
          </label>
          <button
            className="buat-pengumuman-save-btn"
            onClick={handleSave}
          >
            {editingId ? "Perbarui" : "Tambahkan"}
          </button>
        </div>

        {/* List pengumuman */}
        <div className="buat-pengumuman-list">
          {loading ? (
            <p>Loading...</p>
          ) : pengumumanList.length === 0 ? (
            <p>Belum ada pengumuman.</p>
          ) : (
            pengumumanList.map((item) => (
              <div className="buat-pengumuman-card" key={item.id}>
                <div className="buat-pengumuman-card-content">
                  <div className="buat-pengumuman-card-header">
                    <h3>{item.judul}</h3>
                    <span>{new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p>{item.isi}</p>
                </div>
                <div className="buat-pengumuman-actions">
                  <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(item.id)}>Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default BuatPengumuman;
