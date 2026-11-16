import fallbackData from "../data/drawingItems";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// One fetch for every call: JSON body and bearer token when given, and a
// thrown Error (the server's `error` if it sent one) on a non-2xx response.
const request = async (path, failMessage, { method, body, token } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      ...(body && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || failMessage);
  }
  return response.json();
};

// The item list is bundled with the app, not fetched.
export const get_drawing_items = () => fallbackData;

// PAD activities, same list as the main app's Add Activity popup.
// [{ id, category, activity }]; `data` arrives as a JSON string.
export const get_pad_activities = async () =>
  JSON.parse(
    (await request("/getActivities", "Failed to fetch activities")).data,
  );

export const save_drawing_item =({ name, description, type }) =>
  request("/save_drawing_item", "Failed to save feature", {
    body: { name, description, type },
  });

export const delete_drawing_item = (id) =>
  request(`/delete_drawing_item/${id}`, "Failed to delete item", {
    method: "DELETE",
  });

export const get_planning_unit_layers = async () =>
  (
    await request(
      "/planning-units?action=list",
      "Failed to fetch planning unit layers",
    )
  ).planning_unit_grids;

export const get_feature_layers = async () =>
  (
    await request(
      "/engage?action=list-features",
      "Failed to fetch feature layers",
    )
  ).features || [];

export const get_activity_layers = async () =>
  (
    await request(
      "/engage?action=list-activities",
      "Failed to fetch activity layers",
    )
  ).activities || [];

// Runs are not collected via this app, only displayed for visualization.
export const get_prioritizr_runs = async (projectId) =>
  projectId == null
    ? []
    : (
        await request(
          `/prioritizr?action=list-runs&project-id=${projectId}`,
          "Failed to fetch prioritizr runs",
        )
      ).data || [];

// The (h3_index, solution) pairs for a single run, so the caller can highlight
// selected hexes on top of the project planning-unit layer.
export const get_prioritizr_run_results = async (runId) =>
  runId == null
    ? []
    : (
        await request(
          `/prioritizr?action=get-results&run-id=${runId}`,
          "Failed to fetch run results",
        )
      ).data || [];

export const save_polygon = ({
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
}) =>
  request("/engage?action=create-feature", "Failed to save polygon", {
    token,
    body: {
      user,
      userGroup,
      name: name + " - " + userGroup,
      color,
      description,
      density,
      timestamp,
      geometry,
      euniscombd,
    },
  });

export const save_activity = ({
  user,
  userGroup,
  name,
  description = "",
  density = 1,
  timestamp,
  geometry,
  token,
}) =>
  request("/engage?action=create-activity", "Failed to save activity", {
    token,
    body: { user, userGroup, name, description, density, timestamp, geometry },
  });
