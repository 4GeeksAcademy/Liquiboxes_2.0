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
            que buscan productos de calidad a precios irresistibles. Lo hacemos a través de <strong>cajas misteriosas </strong>   
            que los usuarios pueden comprar, basadas en sus preferencias.
          </p>
        </Fade>
      </section>

      <section className="mission-section">
        <Fade triggerOnce>
          <h2>Nuestra Misión</h2>
          <p>
            Queremos transformar la manera en que los comercios gestionan su inventario y ofrecer a los clientes 
            una experiencia única de compra, donde la emoción de recibir una <strong>"mystery box"</strong> se combina 
            con la satisfacción de obtener productos que realmente desean.
          </p>
        </Fade>
      </section>

      <section className="how-it-works">
        <Zoom triggerOnce>
          <h2>¿Cómo funciona Liquiboxes?</h2>
          <p>
            Liquiboxes conecta a tiendas que necesitan liquidar inventario con clientes que buscan ofertas. Las tiendas 
            crean <strong>"mystery boxes"</strong> de diferentes tamaños y precios, seleccionando qué tipos de productos incluir. 
            Los clientes, al registrarse, eligen sus preferencias en términos de tallas, colores y tipos de productos. 
            Con esta información, pueden comprar las cajas que mejor se adapten a sus necesidades.
          </p>
        </Zoom>
      </section>

      <section className="team-section">
        <h2>Conoce a los Fundadores</h2>
        <div className="team-members">
          <Zoom>
            <div className="team-member">
              <img src="/images/miguel.jpg" alt="Miguel" className="team-photo" />
              <h3>Miguel Toyas</h3>
              <p>Desarrollador Full-Stack</p>
              <div className="social-links">
                <a href="https://github.com/miguel" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="social-icon" />
                </a>
                <a href="https://linkedin.com/in/miguel" target="_blank" rel="noopener noreferrer">
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
                <a href="https://github.com/michell" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="social-icon" />
                </a>
                <a href="https://linkedin.com/in/michell" target="_blank" rel="noopener noreferrer">
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
                <a href="https://github.com/elis" target="_blank" rel="noopener noreferrer">
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
