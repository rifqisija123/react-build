import axios from 'axios';

const api = axios.create({
  baseURL: 'https://foliodev.smkn9kotabekasi.sch.id/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Send cookies cross-origin for remember_me
});

// Attach Sanctum token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On errors, handle global redirects for specific status codes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle Network Timeout or 408 Request Timeout
    if (error.code === 'ECONNABORTED' || error.response?.status === 408) {
      if (!window.location.pathname.includes('/timeout')) {
        window.location.href = '/timeout';
      }
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      // 401 Unauthorized
      if (status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        if (
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/unauthorized') &&
          !error.config?.url?.includes('logout')
        ) {
          window.location.href = '/unauthorized?showToast=true';
        }
      }
      // 403 Forbidden
      else if (status === 403) {
        // Exclude /forgot-password routes from global 403 redirect since they handle it gracefully in UI
        if (
          !window.location.pathname.includes('/forbidden') && 
          !error.config?.url?.includes('forgot-password')
        ) {
          window.location.href = '/forbidden';
        }
      }
      
      // 400 Bad Request
      // Catatan: Laravel biasanya menggunakan 422 untuk validasi form, jadi 400 benar-benar untuk Bad Request
      else if (status === 400) {
        if (!window.location.pathname.includes('/bad-request')) {
          window.location.href = '/bad-request';
        }
      }
      
      // 500 Internal Server Error (Server Bug, Database Error, Config Error, etc)
      else if (status === 500) {
        if (!window.location.pathname.includes('/server-error')) {
          window.location.href = '/server-error';
        }
      }
      
      // 502 Bad Gateway (Server Down, Reverse Proxy Error)
      else if (status === 502) {
        if (!window.location.pathname.includes('/bad-gateway')) {
          window.location.href = '/bad-gateway';
        }
      }
      
      // 503 Service Unavailable (Maintenance, Overloaded)
      else if (status === 503) {
        if (!window.location.pathname.includes('/service-unavailable')) {
          window.location.href = '/service-unavailable';
        }
      }
    }

    return Promise.reject(error);
  }
);

export const requestAccountDeletion = () => api.post('/settings/account/request-deletion');
export const confirmAccountDeletion = (token: string) => api.post('/account/confirm-deletion', { token });

// Two-Factor Authentication
export const get2FAStatus = () => api.get('/settings/2fa/status');
export const setup2FA = () => api.post('/settings/2fa/setup');
export const enable2FA = (code: string) => api.post('/settings/2fa/enable', { code });
export const disable2FA = (password: string) => api.post('/settings/2fa/disable', { password });
export const verify2FALogin = (twoFactorToken: string, code: string, rememberMe: boolean) =>
  api.post('/login/2fa', { two_factor_token: twoFactorToken, code, remember_me: rememberMe });
export const send2FAEmailBackup = (twoFactorToken: string) =>
  api.post('/login/2fa/email-backup', { two_factor_token: twoFactorToken });

// Settings
export const updatePortfolioVisibility = (hideFromSearch: boolean) => api.post('/settings/portfolio/visibility', { hide_from_search: hideFromSearch });

export default api;
