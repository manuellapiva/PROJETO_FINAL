
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import logo from "/img/logo_buscfisica.png";

export default function Home() {
  const navigate = useNavigate();

  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuario"));
  } catch {
    usuario = null;
  }

  const ehAdmin = usuario?.tipo === "admin";

  function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("usuario");
    navigate("/", { replace: true });
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <h1>BUSCFÍSICA</h1>
          <img src={logo} alt="Logo BuscFísica" />
        </div>

        <nav className={styles.navbar}>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive ? styles.active : ""
            }
          >
            HOME
          </NavLink>

          <NavLink
            to="/questoes"
            className={({ isActive }) =>
              isActive ? styles.active : ""
            }
          >
            QUESTÕES
          </NavLink>

          <NavLink
            to="/formulas"
            className={({ isActive }) =>
              isActive ? styles.active : ""
            }
          >
            FÓRMULAS
          </NavLink>

          {ehAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? styles.active : ""
              }
            >
              ADMINISTRAÇÃO
            </NavLink>
          )}

          <button
            className={styles.logoutButton}
            onClick={logout}
          >
            SAIR
          </button>
        </nav>
      </header>
    </>
  );
}
