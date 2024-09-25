import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import "./../../styles/aboutus.css";
import { Fade, Zoom } from 'react-awesome-reveal';


const AboutUs = () => {
  return (
    <div className="about-us-container">
      <section className="company-info">
        <Fade triggerOnce>
          <h2>Sobre Nosotros</h2>
          <p>
            Liquiboxes fue fundada por tres estudiantes apasionados de la programación: <strong>Miguel, Michell y Elis</strong>.
            Nuestra misión es ayudar a los comercios a liquidar su stock de manera eficiente, conectándolos con clientes
            que buscan productos de calidad a precios irresistibles. Lo hacemos a través de <strong>Mistery Boxes</strong>
            que los usuarios pueden comprar, basadas en sus preferencias.
          </p>
        </Fade>
      </section>

      <section className="mission-section">
        <Fade triggerOnce>
          <h2>Nuestra Misión</h2>
          <p>
            Queremos transformar la manera en que los comercios gestionan su inventario y ofrecer a los clientes
            una experiencia única de compra, donde la emoción de recibir una <strong>Mistery Box</strong> se combina
            con la satisfacción de obtener productos que realmente desean.
          </p>
        </Fade>
      </section>

      <section className="how-it-works">
        <Zoom triggerOnce>
          <h2>¿Cómo funciona Liquiboxes?</h2>
          <p>
           Las tiendas crean <strong>Mistery Boxes</strong> de diferentes tamaños y precios, seleccionando los productos posibles que pueden tocar en esa caja y el número de artículos que va a contener la Mystery Box.

          </p>
          <p>
            Los clientes, al registrarse, eligen sus preferencias en términos de tallas, colores, tipos de productos y categorías con las que se sientan identificados.
          </p>
          <p>
            Cuando un cliente compra una de las cajas a una tienda, Liquiboxes genera aleatoriamente los artículos que va a contener esa caja, entre los artículos disponibles. La tienda que vende esa caja recibe una notificación con las preferencias del usuario para que confirme el stock de los artículos que han sido seleccionados respecto a las preferencias del usuario.
          </p>
          <p>
            Si la tienda no tuviera stock de los artículos seleccionados o no coincidiera su stock con las preferencias del usuario, tiene la opción de cambiar este artículo por cualquier otro, pero este cambio lo debe aprobar la administración.
          </p>
          <p>
            Una vez todo ha sido confirmado al usario tienda se le descarga un PDF con la orden de envío, los artículos seleccionados y los datos del usuario.
          </p>
        </Zoom>
      </section>

      <section className="team-section">
        <h2>Conoce a los Fundadores</h2>
        <div className="team-members">
          <Zoom>
            <div className="team-member">
              <img src="https://res.cloudinary.com/dg7u2cizh/image/upload/v1727259070/miguel1_o0prjp.jpg" alt="Miguel" className="team-photo" />
              <h3>Miguel Toyas</h3>
              <p>Desarrollador Full-Stack</p>
              <div className="social-links">
                <a href="https://github.com/mitoperni" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="social-icon" />
                </a>
                <a href="https://linkedin.com/in/migueltoyaspernichi" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="social-icon" />
                </a>
              </div>
            </div>
          </Zoom>

          <Zoom>
            <div className="team-member">
              <img src="/images/michell.jpg" alt="Michell" className="team-photo" />
              <h3>Michell Denjoy</h3>
              <p>Desarrolladora Full-Stack</p>
              <div className="social-links">
                <a href="https://github.com/michelldenjoy" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="social-icon" />
                </a>
                <a href="https://linkedin.com/in/michell-d-enjoy-0bb274317" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="social-icon" />
                </a>
              </div>
            </div>
          </Zoom>

          <Zoom>
            <div className="team-member">
              <img src="src/front/img/elis g.jpg/images/elis.jpg" alt="Elis" className="team-photo" />
              <h3>Elis Gomez</h3>
              <p>Desarrolladora Full-Stack</p>
              <div className="social-links">
                <a href="https://github.com/elisG24" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="social-icon" />
                </a>
                <a href="https://linkedin.com/in/elis" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="social-icon" />
                </a>
              </div>
            </div>
          </Zoom>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
