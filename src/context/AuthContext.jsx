import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Loading from "../components/Loading/Loading"; // <-- import komponen loading

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, nama, jabatan")
        .eq("user_id", data.user.id)
        .single();

      if (profileError) throw profileError;

      const fullUser = { ...data.user, ...profile };
      setUser(fullUser);
      localStorage.setItem("user", JSON.stringify(fullUser));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("user");
  };

  // ⬇⬇ loading screen saat inisialisasi
  if (loading) {
    return <Loading message="Menyiapkan aplikasi..." />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
