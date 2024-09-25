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
            <p className="mb-4">Nuestra misión es crear una experiencia de compra emocionante y económica, donde tanto las tiendas como los usuarios salgan ganando. Liquiboxes no solo facilita que los comercios liquiden su inventario, sino que ofrece a los usuarios la oportunidad de obtener productos únicos y a buen precio, todo en un solo click.</p>
          </div>
          <div className="col-lg-2 col-md-6">
            <h5 className="mb-4">Enlaces Rápidos</h5>
            <ul className="list-unstyled">
              <li><a href="/about" className="footer-link">Sobre Nosotros</a></li>
              <li><a href="/services" className="footer-link">Metodos de pago</a></li>
              <li><a href="/products" className="footer-link">Carrito</a></li>
              <li><a href="/contact" className="footer-link">Cerrar sesión</a></li>
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
                +34 (915) 123-4567
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
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="btn btn-outline-light btn-floating me-2">
                <FontAwesomeIcon icon={faFacebookF} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="btn btn-outline-light btn-floating me-2">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="btn btn-outline-light btn-floating">
                <FontAwesomeIcon icon={faLinkedinIn} />
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