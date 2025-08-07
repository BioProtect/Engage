const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function handleResponse(response) {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
      console.log("Error data from backend:", errorData);
    } catch {
      errorData = null;
      console.log("Failed to parse error JSON");
    }

    let errorMessage = errorData?.msg || response.statusText || "API Error";
    if (response.status === 401) {
      errorMessage = "Username or Password is incorrect";
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function login(username, password) {
  console.log("API base url:", process.env.REACT_APP_API_BASE_URL);

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Cannot connect to server");
    }
    throw err;
  }
}

export async function signup(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return await handleResponse(response);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Cannot connect to server");
    }
    throw err;
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    return await handleResponse(response);
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Cannot connect to server");
    }
    throw err;
  }
}
