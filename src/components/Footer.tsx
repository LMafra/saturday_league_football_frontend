import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="page-footer default_color scrollspy">
      <div className="container">
        <div className="row">
          {/* About Section */}
          <div className="col l4 s12">
            <h5 className="white-text">About</h5>
            <p className="grey-text text-lighten-4">
              Pelada Insights helps you manage games with ease.
            </p>
          </div>
          {/* Links Section */}
          <div className="col l4 s12">
            <h5 className="white-text">Quick Links</h5>
            <ul>
              <li><a className="grey-text text-lighten-3" href="#!">Home</a></li>
              <li><a className="grey-text text-lighten-3" href="#!">Services</a></li>
              <li><a className="grey-text text-lighten-3" href="#!">Privacy Policy</a></li>
            </ul>
          </div>
          {/* Contact Section */}
          <div className="col l4 s12">
            <h5 className="white-text">Contact</h5>
            <p className="grey-text text-lighten-4">Email: chagas.lucas.mafra@gmail.com</p>
            <p className="grey-text text-lighten-4">
              <a href="https://github.com/LMafra" className="grey-text text-lighten-3" target="_blank" rel="noopener noreferrer">
                Github: LMafra
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="footer-copyright default_color">
        <div className="container">
          <p className="white-text">© {currentYear} Pelada Insights. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
