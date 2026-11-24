
import { Navigate } from 'react-router-dom';

function tokenValido(token) {
  if (!token) return false;

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;

    const normalized = payloadBase64
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      '='
    );

    const payload = JSON.parse(atob(padded));

    return (
      typeof payload.exp === 'number' &&
      payload.exp * 1000 > Date.now()
    );
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('jwtToken');

  if (!tokenValido(token)) {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('usuario');

    return <Navigate to="/" replace />;
  }

  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem('usuario'));
  } catch {
    localStorage.removeItem('usuario');
  }

  if (adminOnly && usuario?.tipo !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
}
