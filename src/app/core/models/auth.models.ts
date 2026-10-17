export interface UserProfile {
  id: string;
  mobileNumber: string;
  countryCode: string;
  name: string;
  email: string;
  isProfileComplete: boolean;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  expiresAt: number;
}

export interface AuthMockData {
  testMobileNumber: string;
  countryCode: string;
  testOtp: string;
  otpResendCooldownSeconds: number;
  mockSessionDurationSeconds: number;
  mockUser: UserProfile;
  mockAuthToken: string;
}

export interface OtpRequestPayload {
  countryCode: string;
  mobileNumber: string;
}

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  cooldownSeconds: number;
  devHintOtp?: string;
}

export interface OtpVerifyPayload {
  countryCode: string;
  mobileNumber: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  session?: AuthSession;
}
