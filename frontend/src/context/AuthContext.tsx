"use client";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const AuthContext = createContext({
  token: "",
  setToken: (token: string) => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSetToken = (newToken: string) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken: handleSetToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
