const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function get_drawing_items() {
  const response = await fetch(`${API_BASE_URL}/get_drawing_items`);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
}

export async function save_drawing_item({ name, description, type }) {
  const response = await fetch(`${API_BASE_URL}/save_drawing_item`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description, type }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save feature");
  }

  return response.json();
}

export async function delete_drawing_item(id) {
  const response = await fetch(`${API_BASE_URL}/delete_drawing_item/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete item");
  }
  return response.json();
}

export async function save_polygon({
  user,
  userGroup,
  name,
  color,
  description = "",
  density = 0,
  timestamp,
  geometry,
  token,
}) {
  const response = await fetch(`${API_BASE_URL}/save_polygon`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      user,
      userGroup,
      name,
      color,
      description,
      density,
      timestamp,
      geometry,
    }),
  });

  if (!response.ok) {
    console.log("Token:", token);
    console.log("Headers:", {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });

    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save polygon");
  }

  return response.json();
}
