import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import "../../styles/footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="mb-4">Liquiboxes</h5>
            <p className="mb-4">Déjate sorprender por nuestras Mistery Boxes.</p>
          </div>
          <div className="col-lg-2 col-md-6">
            <h5 className="mb-4">Enlaces Rápidos</h5>
            <ul className="list-unstyled">
              <li><a href="/aboutus" className="footer-link">Sobre Nosotros</a></li>
              <li><a href="/shopssearch" className="footer-link">Buscador</a></li>
              <li><a className="footer-link">Cerrar sesión</a></li>
              <li><a href="/" className="footer-link">Inciar sesión</a></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-4">Contáctanos</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                Calle Jorge Juan 106, 28009,Madrid
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                +34 915 123 456
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                emimidetogo@gmail.com
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-4">Síguenos</h5>
            <div className="d-flex">
              <a href="https://www.facebook.com/profile.php?id=61565897416494" target="_blank" rel="noreferrer" className="btn btn-outline-light btn-floating me-2">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://www.instagram.com/liquiboxes_esp/" target="_blank" rel="noreferrer" className="btn btn-outline-light btn-floating me-2">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center py-3 copyright">
        © {new Date().getFullYear()} Liquiboxes. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;