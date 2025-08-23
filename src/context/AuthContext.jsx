import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Loading from "../components/Loading/Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Cari profil user
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, nama, jabatan")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Akun ini belum terdaftar di sistem desa.");

      const fullUser = { ...data.user, ...profile };
      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));

      return { data: { user: data.user, profile }, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return <Loading message="Menyiapkan aplikasi..." />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
