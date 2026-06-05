const API_BASE = '/api/v1'

async function request(path, options = {}) {
  const token = localStorage.getItem('saarthi_token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch (err) {
    throw new Error('Cannot connect to server. Make sure the backend is running on port 8000.')
  }

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { detail: text || 'Invalid server response' }
  }

  if (!res.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail.map(e => e.msg || e).join(', ')
      : data.detail || `Request failed (${res.status})`
    throw new Error(message)
  }

  return data
}

export const authAPI = {
  signup: (p) => request('/auth/signup', { method: 'POST', body: JSON.stringify(p) }),
  sendOTP: (p) => request('/auth/otp/send', { method: 'POST', body: JSON.stringify(p) }),
  verifyOTP: (p) => request('/auth/otp/verify', { method: 'POST', body: JSON.stringify(p) }),
  googleAuth: (p) => request('/auth/google', { method: 'POST', body: JSON.stringify(p) }),
  me: () => request('/auth/me'),
}

export const chatAPI = {
  send: (message) => request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
}

export const dashboardAPI = {
  stats: () => request('/dashboard/stats'),
  journeys: () => request('/journeys'),
  createJourney: (intentId) => request('/journeys', { method: 'POST', body: JSON.stringify({ intent_id: intentId }) }),
}

export const intentAPI = {
  list: () => request('/intents'),
  get: (id) => request(`/intents/${id}`),
}

export const workflowAPI = {
  get: (intentId) => request(`/workflow/${intentId}`),
}

export const documentAPI = {
  list: () => request('/documents'),
  upload: (formData) => {
    const token = localStorage.getItem('saarthi_token')
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    return fetch(`${API_BASE}/documents/upload`, { method: 'POST', headers, body: formData })
      .then(async (res) => {
        const text = await res.text()
        let data
        try {
          data = text ? JSON.parse(text) : {}
        } catch {
          data = { detail: text || 'Invalid server response' }
        }

        if (!res.ok) {
          throw new Error(data.detail || `Upload failed (${res.status})`)
        }

        return data
      })
  },
  delete: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
}

export const formAPI = {
  generate: (serviceId) => request(`/forms/generate/${serviceId}`),
}

export const profileAPI = {
  get: () => request('/profile'),
  update: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
}
