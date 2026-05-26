import axios from "axios"
import { ApiResponse } from "@/types/SolarRecordMapper"

const API = axios.create({
  // baseURL: "http://localhost:8080"
  baseURL: import.meta.env.VITE_API_URL
})


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  name: string
  role: string
  permissions: string[]
}

export interface RegisterRequest {
  name: string
  email: string
  mobile: string
  password: string
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await API.post<LoginResponse>("/auth/login", data)
  if (res.data.token) {
    localStorage.clear();
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userRole', res.data.role)
    localStorage.setItem('userEmail', data.email)
    localStorage.setItem('userPermissions', JSON.stringify(res.data.permissions))
  }
  return res.data
}

export const register = async (
  data: RegisterRequest
): Promise<void> => {
  await API.post<ApiResponse<null>>("/auth/register", data)
}

export const sendEmailOtp = async (email: string): Promise<void> => {
  await API.post<ApiResponse<null>>(`/auth/send-email-otp?email=${email}`)
}

export const verifyEmailOtp = async (
  email: string,
  otp: string
): Promise<void> => {
  await API.post<ApiResponse<null>>(
    `/auth/verify-email-otp?email=${email}&otp=${otp}`
  )
}

export const sendMobileOtp = async (mobile: string): Promise<void> => {
  await API.post<ApiResponse<null>>(`/auth/send-mobile-otp?mobile=${mobile}`)
}

export const verifyMobileOtp = async (
  mobile: string,
  otp: string
): Promise<void> => {
  await API.post<ApiResponse<null>>(
    `/auth/verify-mobile-otp?mobile=${mobile}&otp=${otp}`
  )
}