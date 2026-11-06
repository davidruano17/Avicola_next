/**
 * Servicio Central de Comunicación con la API REST de Django (AVISENA COL)
 * Con soporte para:
 * 1. Renovación automática y silenciosa de tokens JWT (Silent Token Refresh).
 * 2. Cola de sincronización fuera de línea (Offline Sync Queue) para evitar pérdida de datos.
 */

const SYNC_QUEUE_KEY = 'avisena_sync_queue';

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    if (typeof window !== 'undefined' && window.location.hostname) {
      try {
        const parsed = new URL(process.env.NEXT_PUBLIC_API_URL);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          parsed.hostname = window.location.hostname;
          return parsed.toString().replace(/\/+$/, '');
        }
      } catch (_) {}
    }
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  return 'http://127.0.0.1:8000/api';
}

function getAuthHeader() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('user_token');
  if (token && !token.startsWith('token-') && !token.startsWith('dummy-token')) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

// Control de promesa única para evitar múltiples renovaciones en paralelo
let promesaRenovacionEnCurso = null;

export async function renovarToken() {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  if (promesaRenovacionEnCurso) {
    return promesaRenovacionEnCurso;
  }

  promesaRenovacionEnCurso = (async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.access) {
          localStorage.setItem('user_token', data.access);
          if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
          }
          return data.access;
        }
      } else if (res.status === 401 || res.status === 400) {
        // El refresh token expiró (superó los 7 días de validez)
        console.warn('[API Auth] La sesión ha caducado por completo.');
        localStorage.removeItem('user_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return null;
    } catch (err) {
      console.warn('[API Auth] No fue posible renovar el token con el servidor:', err?.message || err);
      return null;
    } finally {
      promesaRenovacionEnCurso = null;
    }
  })();

  return promesaRenovacionEnCurso;
}

// ==========================================
// GESTIÓN DE COLA DE SINCRONIZACIÓN OFFLINE
// ==========================================

export function encolarPendiente(item) {
  if (typeof window === 'undefined') return;
  try {
    const cola = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    const nuevoElemento = {
      id_temporal: 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      creado_en: new Date().toISOString(),
      ...item,
    };
    cola.push(nuevoElemento);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(cola));
    window.dispatchEvent(new CustomEvent('avisena:queue-updated', { detail: { cola } }));
    return nuevoElemento;
  } catch (e) {
    console.error('[Sync Queue] Error al encolar petición offline:', e);
  }
}

export function obtenerPendientes(filtro = null) {
  if (typeof window === 'undefined') return [];
  try {
    const cola = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    if (typeof filtro === 'string' && filtro.trim()) {
      return cola.filter(item => (item.endpoint && item.endpoint.includes(filtro)) || item.modulo === filtro);
    }
    return cola;
  } catch (_) {
    return [];
  }
}

let sincronizacionEnCurso = false;

export async function sincronizarPendientes() {
  if (typeof window === 'undefined' || sincronizacionEnCurso) {
    return { sincronizados: 0, pendientes: 0 };
  }

  const rawCola = localStorage.getItem(SYNC_QUEUE_KEY);
  if (!rawCola) return { sincronizados: 0, pendientes: 0 };

  let cola = [];
  try {
    cola = JSON.parse(rawCola);
  } catch (_) {
    return { sincronizados: 0, pendientes: 0 };
  }

  if (!Array.isArray(cola) || cola.length === 0) {
    return { sincronizados: 0, pendientes: 0 };
  }

  sincronizacionEnCurso = true;
  const noSincronizados = [];
  let sincronizados = 0;

  for (const item of cola) {
    try {
      const url = `${getApiBaseUrl()}/${item.endpoint.replace(/^\/+/, '')}`;
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      };

      const res = await fetch(url, {
        method: item.metodo || 'POST',
        headers,
        body: typeof item.datos === 'string' ? item.datos : JSON.stringify(item.datos),
      });

      if (res.ok || res.status === 201 || res.status === 204) {
        sincronizados++;
      } else if (res.status === 401) {
        // Intentar renovar token y reintentar este elemento
        const nuevoToken = await renovarToken();
        if (nuevoToken) {
          headers['Authorization'] = `Bearer ${nuevoToken}`;
          const retryRes = await fetch(url, {
            method: item.metodo || 'POST',
            headers,
            body: typeof item.datos === 'string' ? item.datos : JSON.stringify(item.datos),
          });
          if (retryRes.ok || retryRes.status === 201) {
            sincronizados++;
            continue;
          }
        }
        noSincronizados.push(item);
      } else if (res.status >= 400 && res.status < 500) {
        // Error de validación cliente (p. ej. dato duplicado); descartar para evitar loop infinito
        console.warn(`[Sync Queue] Elemento descartado por error ${res.status}:`, item.endpoint);
      } else {
        // Error 5xx del servidor; conservar para reintento
        noSincronizados.push(item);
      }
    } catch (err) {
      // Servidor caído o error de red; conservar en cola
      noSincronizados.push(item);
    }
  }

  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(noSincronizados));
    window.dispatchEvent(new CustomEvent('avisena:synced', {
      detail: { sincronizados, pendientesRestantes: noSincronizados.length }
    }));
  } finally {
    sincronizacionEnCurso = false;
  }

  return { sincronizados, pendientes: noSincronizados.length };
}

// ==========================================
// FUNCIÓN CENTRAL DE PETICIONES HTTP
// ==========================================

async function request(endpoint, options = {}, isRetry = false) {
  const url = `${getApiBaseUrl()}/${endpoint.replace(/^\/+/, '')}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Renovación silenciosa ante HTTP 401
    if (response.status === 401 && !isRetry && !endpoint.includes('auth/')) {
      const nuevoToken = await renovarToken();
      if (nuevoToken) {
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${nuevoToken}`,
        };
        return request(endpoint, { ...options, headers: retryHeaders }, true);
      }
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let mensajeError = data?.detail || data?.non_field_errors?.[0] || data?.error;

      if (!mensajeError && data && typeof data === 'object') {
        const entries = Object.entries(data);
        if (entries.length > 0) {
          const [field, val] = entries[0];
          const text = Array.isArray(val) ? val[0] : String(val);
          mensajeError = text || `${field}: error de validación`;
        }
      }

      const error = new Error(mensajeError || `Error HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    const metodo = (config.method || 'GET').toUpperCase();

    // Si falló por desconexión en operaciones de escritura (POST, PUT, PATCH, DELETE),
    // guardar automáticamente en la cola offline para evitar pérdida de datos
    if (
      !isRetry &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(metodo) &&
      !endpoint.includes('auth/') &&
      typeof window !== 'undefined'
    ) {
      encolarPendiente({
        endpoint,
        metodo,
        datos: typeof options.body === 'string' ? JSON.parse(options.body) : options.body,
      });
      console.warn(`[API Offline] Petición encolada para sincronización automática cuando vuelva el servidor: [${metodo}] ${endpoint}`);
    } else {
      console.warn(`[API Info] [${metodo}] ${url}:`, err?.message || err);
    }

    throw err;
  }
}

export const api = {
  get: (endpoint, params = {}) => {
    let query = '';
    const validParams = Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '');
    if (validParams.length > 0) {
      query = '?' + new URLSearchParams(validParams).toString();
    }
    return request(`${endpoint}${query}`, { method: 'GET' });
  },

  post: (endpoint, body) => {
    return request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put: (endpoint, body) => {
    return request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  patch: (endpoint, body) => {
    return request(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  delete: (endpoint) => {
    return request(endpoint, { method: 'DELETE' });
  },

  // Auth específico
  login: async (email, password) => {
    const res = await request('auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res && res.access && typeof window !== 'undefined') {
      localStorage.setItem('user_token', res.access);
      if (res.refresh) localStorage.setItem('refresh_token', res.refresh);
    }
    return res;
  },

  // Utilidades añadidas para sincronización y tokens
  renovarToken,
  sincronizarPendientes,
  encolarPendiente,
  obtenerPendientes,
};

export default api;
