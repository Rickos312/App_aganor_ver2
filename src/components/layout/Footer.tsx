import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-image">
          <img src="/metrologie.png" alt="Métrologie - Système International d'Unités" className="metrologie-image" />
        </div>
        
        <div className="footer-info">
          <div className="footer-links">
            <a href="#faq" className="footer-link">FAQ</a>
            <span className="footer-separator">|</span>
            <span className="footer-copyright">© 2025 ERGI SYSTEMS NUMERIC</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;