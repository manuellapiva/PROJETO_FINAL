export const API = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');
export const WEB = (process.env.EXPO_PUBLIC_WEB_URL || 'http://localhost:5173').replace(/\/$/, '');

export async function request(path, token = null, options = {}) {
  if (!API) {
    throw new Error('Configure EXPO_PUBLIC_API_URL no arquivo .env.');
  }

  const headers = { ...(options.headers || {}) };
  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body &&
    options.body instanceof FormData;

  if (!isFormData && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error(
      'Não foi possível conectar à API. Verifique se o backend está ligado e se a URL do .env está correta.'
    );
  }

  const contentType = response.headers?.get?.('content-type') || '';
  let data;

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  } else {
    data = await response.text().catch(() => '');
  }

  if (!response.ok) {
    const message =
      data?.mensagem ||
      data?.message ||
      data?.erro ||
      (typeof data === 'string' && data) ||
      `Erro HTTP ${response.status}.`;
    throw new Error(message);
  }

  return data;
}

export function extractArray(data, possibleKeys = []) {
  if (Array.isArray(data)) return data;

  for (const key of possibleKeys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}


export function getImageUrl(imagePath) {
  if (!imagePath) return null;

  const path = String(imagePath).trim();

  if (!path) return null;

  // Imagem com endereço completo
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Caminhos relativos começando com ./img/
  if (path.startsWith('./img/')) {
    return `${WEB}${path.slice(1)}`;
  }

  // Outros caminhos relativos começando com ./
  if (path.startsWith('./')) {
    return `${WEB}/${path.slice(2)}`;
  }

  // Imagens armazenadas na pasta uploads do backend
  if (path.startsWith('/uploads/')) {
    return `${API}${path}`;
  }

  // Imagens armazenadas na pasta img do frontend
  if (path.startsWith('/img/')) {
    return `${WEB}${path}`;
  }

  // Outros caminhos absolutos do backend
  if (path.startsWith('/')) {
    return `${API}${path}`;
  }

  // Nome de arquivo sem diretório
  return `${WEB}/img/${path}`;
}

