import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import ProfileMenu from "../../components/ProfileMenu/ProfileMenu";
import { supabase } from "../../lib/supabase";
import "./EditProfil.css";
import Alert from '../../components/Alert/Alert';

const EditProfil = () => {
  const [profile, setProfile] = useState({
    nama: "",
    jabatan: "",
    user_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("User belum login");

      const { data, error } = await supabase
        .from("profiles")
        .select("nama, jabatan, user_id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err) {
      console.error(err);
      setMessage("⚠️ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e, field) => {
    setProfile({ ...profile, [field]: e.target.value });
  };

  const handleToggleEdit = async () => {
    if (editing) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            nama: profile.nama,
            jabatan: profile.jabatan,
          })
          .eq("user_id", profile.user_id);

        if (error) throw error;

        setMessage("✅ Data berhasil disimpan!");
      } catch (err) {
        console.error(err);
        setMessage("⚠️ " + err.message);
      }
    }

    setEditing(!editing);
  };

  return (
    <div className="edit-profil-wrapper">
      <Navbar />
      <main className="edit-profil-main">
        <header className="edit-profil-header">
          <div className="edit-profil-top">
            <ProfileMenu />
          </div>
        </header>

        <h1 className="edit-profil-title">Edit Profil</h1>

        {message && <Alert message={message}/>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="edit-profil-form">
            <label>
              Nama
              <input
                type="text"
                value={profile.nama || ""}
                onChange={(e) => handleChange(e, "nama")}
                disabled={!editing}
              />
            </label>

            <label>
              Jabatan
              <input
                type="text"
                value={profile.jabatan || ""}
                onChange={(e) => handleChange(e, "jabatan")}
                disabled={!editing}
              />
            </label>

            <button
              className={editing ? "edit-profil-save-btn" : "edit-profil-edit-btn"}
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

export default EditProfil;
