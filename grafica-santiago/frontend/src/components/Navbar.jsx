import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  return (
    <nav style={styles.navbar}>
      <div style={styles.left}>
        <img src={logo} alt="Gráfica Santiago" style={styles.logo} />
        <span style={styles.brand}>Gráfica Santiago</span>
      </div>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Inicio</Link>
        <Link to="/products" style={styles.link}>Productos</Link>
        <Link to="/categories" style={styles.link}>Categorías</Link>
      </div>

      <div>
        <Link to="/login" style={styles.loginBtn}>Ingresar</Link>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 24px",
    backgroundColor: "#0B3A5A", // azul
    color: "white"
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  logo: {
    height: "42px"
  },
  brand: {
    fontSize: "18px",
    fontWeight: "bold"
  },
  links: {
    display: "flex",
    gap: "20px"
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: 500
  },
  loginBtn: {
    backgroundColor: "#FFC300", // amarillo
    color: "#0B3A5A",
    padding: "8px 16px",
    borderRadius: "20px",
    textDecoration: "none",
    fontWeight: "bold"
  }
};
