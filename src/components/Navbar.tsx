import React from 'react';
import { Link } from 'react-router';

const Navbar = () => {
  return (
    <nav className="nav">
      <h1 className="logo">Gestor de Peladas</h1>
      <ul className="navbar-header">
        <li className="navItem">
          <Link to="/" className="navLink">
            Home
          </Link>
        </li>
        <li className="navItem">
          <Link to="/championships" className="navLink">
            Championships
          </Link>
        </li>
      </ul>
    </nav>
  );
};
export default Navbar;
