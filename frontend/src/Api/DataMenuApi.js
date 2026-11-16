const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// One fetch for every call: JSON body and bearer token when given, and a
// thrown Error (the server's `error` if it sent one) on a non-2xx response.
async function request(path, failMessage, { body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.error || failMessage)
  }
  return response.json()
}

/**
 * PAD activities, same list as the main app's Add Activity popup.
 * [{ id, category, activity }]; `data` arrives as a JSON string.
 */
export async function get_pad_activities() {
  return JSON.parse(
    (await request('/getActivities', 'Failed to fetch activities')).data,
  )
}

export async function get_feature_layers() {
  return (
    await request(
      '/engage?action=list-features',
      'Failed to fetch feature layers',
    )
  ).features || []
}

export async function get_activity_layers() {
  return (
    await request(
      '/engage?action=list-activities',
      'Failed to fetch activity layers',
    )
  ).activities || []
}

/** Runs are not collected via this app, only displayed for visualization. */
export async function get_prioritizr_runs(projectId) {
  return projectId == null
    ? []
    : (
        await request(
          `/prioritizr?action=list-runs&project-id=${projectId}`,
          'Failed to fetch prioritizr runs',
        )
      ).data || []
}

/**
 * The (h3_index, solution) pairs for a single run, so the caller can highlight
 * selected hexes on top of the project planning-unit layer.
 */
export async function get_prioritizr_run_results(runId) {
  return runId == null
    ? []
    : (
        await request(
          `/prioritizr?action=get-results&run-id=${runId}`,
          'Failed to fetch run results',
        )
      ).data || []
}

export function save_polygon({
  user,
  userGroup,
  name,
  color,
  description = '',
  density = 1,
  timestamp,
  geometry,
  euniscombd = null,
  token,
}) {
  return request('/engage?action=create-feature', 'Failed to save polygon', {
    token,
    body: {
      user,
      userGroup,
      name: `${name} - ${userGroup}`,
      color,
      description,
      density,
      timestamp,
      geometry,
      euniscombd,
    },
  })
}

export function save_activity({
  user,
  userGroup,
  name,
  description = '',
  density = 1,
  timestamp,
  geometry,
  token,
}) {
  return request('/engage?action=create-activity', 'Failed to save activity', {
    token,
    body: {
      user,
      userGroup,
      name,
      description,
      density,
      timestamp,
      geometry,
    },
  })
}
