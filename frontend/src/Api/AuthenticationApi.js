const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function post(path, options) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      ...options,
    })
  }
  catch {
    throw new Error('Cannot connect to server')
  }
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Username or Password is incorrect')
    }
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.msg || response.statusText || 'API Error')
  }
  return response.json()
}

function credentials(username, password) {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }
}

export function login(username, password) {
  return post('/auth', credentials(username, password))
}
