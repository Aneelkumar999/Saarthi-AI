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
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  sendOTP: (payload) => request('/auth/otp/send', { method: 'POST', body: JSON.stringify(payload) }),
  verifyOTP: (payload) => request('/auth/otp/verify', { method: 'POST', body: JSON.stringify(payload) }),
  googleAuth: (payload) => request('/auth/google', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
}
