
import {
  createContext,
  useContext,
  useState,
} from "react";
import { authApi } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("loggedUser");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("authToken") || ""
  );

  async function signup(name, email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await authApi.get(
      `/users?email=${encodeURIComponent(normalizedEmail)}`
    );

    if (existing.data.length > 0) {
      throw new Error("An account with this email already exists.");
    }

    // Demo only. Never store plain-text passwords in a real app.
    await authApi.post("/users", {
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    // Account created; user must log in separately.
    return true;
  }

  async function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();

    const response = await authApi.get(
      `/users?email=${encodeURIComponent(normalizedEmail)}`
    );

    const account = response.data.find(
      (item) => item.password === password
    );

    if (!account) {
      throw new Error("Invalid email or password.");
    }

    // Demo token, not a real server-issued authentication token.
    const newToken = crypto.randomUUID();

    const loggedInUser = {
      id: account.id,
      name: account.name,
      email: account.email,
    };

    localStorage.setItem("authToken", newToken);
    localStorage.setItem("loggedUser", JSON.stringify(loggedInUser));

    setToken(newToken);
    setUser(loggedInUser);

    return true;
  }

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedUser");
    setToken("");
    setUser(null);
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
