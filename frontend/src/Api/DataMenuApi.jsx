import fallbackData from "../data/drawingItems";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const get_drawing_items = () => {
  // const response = await fetch(`${API_BASE_URL}/get_drawing_items`);
  // if (!response.ok) {
  //   throw new Error("Failed to fetch data");
  // }
  // return response.json();
  return fallbackData;
};

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

export async function get_planning_unit_layers() {
  const response = await fetch(`${API_BASE_URL}/planning-units?action=list`);
  if (!response.ok) {
    throw new Error("Failed to fetch planning unit layers");
  }
  const data = await response.json();
  return data.planning_unit_grids;
}

export async function get_feature_layers() {
  const response = await fetch(`${API_BASE_URL}/engage?action=list-features`);
  if (!response.ok) {
    throw new Error("Failed to fetch feature layers");
  }
  const data = await response.json();
  return data.features;
}

export async function get_activity_layers() {
  const response = await fetch(
    `${API_BASE_URL}/engage?action=list-activities`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch activity layers");
  }
  const data = await response.json();
  return data.activities || [];
}

/**
 * List prioritizr runs for a given project. Backed by the existing
 * prioritizr_handler.list_runs — kept in its own namespace because runs are
 * not collected via this app, only displayed for visualization.
 */
export async function get_prioritizr_runs(projectId) {
  if (projectId == null) return [];
  const response = await fetch(
    `${API_BASE_URL}/prioritizr?action=list-runs&project-id=${projectId}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch prioritizr runs");
  }
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch the (h3_index, solution) pairs for a single run, so the caller can
 * highlight selected hexes on top of the project planning-unit layer.
 */
export async function get_prioritizr_run_results(runId) {
  if (runId == null) return [];
  const response = await fetch(
    `${API_BASE_URL}/prioritizr?action=get-results&run-id=${runId}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch run results");
  }
  const data = await response.json();
  return data.data || [];
}

export async function save_polygon({
  user,
  userGroup,
  name,
  color,
  description = "",
  density = 1,
  timestamp,
  geometry,
  euniscombd = null,
  token,
}) {
  name = name + " - " + userGroup;

  const response = await fetch(`${API_BASE_URL}/engage?action=create-feature`, {
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
      euniscombd,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save polygon");
  }

  return response.json();
}

export async function save_activity({
  user,
  userGroup,
  name,
  description = "",
  density = 1,
  timestamp,
  geometry,
  token,
}) {
  const response = await fetch(
    `${API_BASE_URL}/engage?action=create-activity`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user,
        userGroup,
        name,
        description,
        density,
        timestamp,
        geometry,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save activity");
  }

  return response.json();
}
