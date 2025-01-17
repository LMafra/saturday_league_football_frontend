import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p className="text">© {currentYear} Gestor de Peladas. All rights reserved.</p>
    </footer>
  );
};
export default Footer;
