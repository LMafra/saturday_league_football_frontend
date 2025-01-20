import React from 'react';
import { Link } from 'react-router';

const Navbar = () => {
  return (
    <div className='navbar-fixed'>
      <nav id="nav_f" className='default_color'>
        <div className='container'>
          <div className='nav-wrapper'>
            <a className='brand-logo'>Pelada Insights</a>
            <ul className='right hide-on-med-and-down'>
              <li>
                <Link to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/championships">
                  Championships
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};
export default Navbar;
