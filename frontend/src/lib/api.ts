const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const AUTH_MOCK_FALLBACK = process.env.NEXT_PUBLIC_AUTH_MOCK_FALLBACK !== "false";

async function parseError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data.detail ?? fallback;
  } catch {
    return fallback;
  }
}

export type AuthUser = {
  id: number;
  phone: string;
  full_name?: string | null;
};

export async function sendOtp(phone: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    if (!response.ok) {
      if (AUTH_MOCK_FALLBACK && response.status >= 500) return mockOtpResponse();
      throw new Error(await parseError(response, "Unable to send OTP"));
    }

    return response.json() as Promise<{ message: string; expires_in_seconds: number; dev_otp?: string | null }>;
  } catch (error) {
    if (AUTH_MOCK_FALLBACK) return mockOtpResponse();
    throw error;
  }
}

export async function verifyOtp(phone: string, otp: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp })
    });

    if (!response.ok) {
      if (AUTH_MOCK_FALLBACK && response.status >= 500) return mockVerifyResponse(phone, otp);
      throw new Error(await parseError(response, "Unable to verify OTP"));
    }

    return response.json() as Promise<{ access_token: string; token_type: string; user: AuthUser }>;
  } catch (error) {
    if (AUTH_MOCK_FALLBACK) return mockVerifyResponse(phone, otp);
    throw error;
  }
}

function mockOtpResponse() {
  return Promise.resolve({
    message: "Demo OTP generated locally because backend auth is unavailable",
    expires_in_seconds: 300,
    dev_otp: "123456"
  });
}

function mockVerifyResponse(phone: string, otp: string) {
  if (otp !== "123456") {
    return Promise.reject(new Error("Invalid OTP. Use demo OTP 123456."));
  }

  return Promise.resolve({
    access_token: `mock-token-${Date.now()}`,
    token_type: "bearer",
    user: {
      id: 1,
      phone: phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "").slice(-10)}`,
      full_name: "Demo Citizen"
    }
  });
}

export async function getCurrentUser(token: string) {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Session expired"));
  }

  return response.json() as Promise<AuthUser>;
}

export async function sendChatMessage(message: string) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    throw new Error("Unable to reach Saarthi AI chat service");
  }

  return response.json() as Promise<{ response: string; intent_id?: number | null; roadmap?: unknown }>;
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Document OCR failed");
  }

  return response.json();
}
