const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const post = async (path, options) => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      ...options,
    });
  } catch {
    throw new Error("Cannot connect to server");
  }
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Username or Password is incorrect");
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.msg || response.statusText || "API Error");
  }
  return response.json();
};

const credentials = (username, password) => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});

export const login = (username, password) =>
  post("/auth", credentials(username, password));

export const signup = (username, password) =>
  post("/signup", credentials(username, password));

export const logout = () => post("/logout", { credentials: "include" });
