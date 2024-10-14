import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import "./../../styles/aboutus.css";
import { Fade, Zoom } from 'react-awesome-reveal';
import NotType from '../component/Utils/NotType';
import createbox from '/workspaces/Liquiboxes_2.0/src/front/img/createbox.gif';
import clothes from '/workspaces/Liquiboxes_2.0/src/front/img/clothes.gif';
import usergif from '/workspaces/Liquiboxes_2.0/src/front/img/usergif.gif';
import download from '/workspaces/Liquiboxes_2.0/src/front/img/download.gif';
import change from '/workspaces/Liquiboxes_2.0/src/front/img/change.gif';

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <section className="about-mission">
        <Fade triggerOnce>
          <div className="about-content">
            <div className="about-section">
              <h2 className='section-title'>Sobre Nosotros</h2>
              <p>
                Liquiboxes fue fundada por <strong>Miguel, Michell y Elis</strong>, tres estudiantes apasionados de la programación. Nuestra misión es ayudar a los comercios a liquidar su stock de manera eficiente, conectándolos con clientes que buscan productos de calidad a precios irresistibles, a través de <strong>Mystery Boxes</strong> personalizadas.
              </p>
            </div>
            <div className="mission-section">
              <h2 className='section-title'>Nuestra Misión</h2>
              <p>
                Transformamos la forma en que los comercios gestionan su inventario y ofrecemos a los clientes una experiencia única de compra, combinando la emoción de recibir una <strong>Mystery Box</strong> con la satisfacción de encontrar productos deseados.
              </p>
            </div>
          </div>
        </Fade>
      </section>

      <section className="how-it-works">
        <Zoom triggerOnce>
          <h2 className='section-title'>¿Cómo funciona Liquiboxes?</h2>
          <div className="steps-container">
            <div className='step'>
              <img src={createbox} alt='Crear caja' className='step-icon' />
              <div className='step-text'>
                <p><strong>1. Creación de Cajas:</strong> Las tiendas crean <strong>Mystery Boxes</strong> de diferentes tamaños y precios, seleccionando los productos y el número de artículos que contendrá la caja.</p>
              </div>
            </div>
            <div className='step'>
              <img src={clothes} alt='Preferencias' className='step-icon' />
              <div className='step-text'>
                <p><strong>2. Preferencias del Cliente:</strong> Los clientes especifican sus tallas, estilo, tipos de productos y categorías que les interesan.</p>
              </div>
            </div>
            <div className='step'>
              <img src={usergif} alt='Selección aleatoria' className='step-icon' />
              <div className='step-text'>
                <p><strong>3. Selección Aleatoria:</strong> Cuando un cliente compra una caja, Liquiboxes elige artículos aleatoriamente, y la tienda confirma la coincidencia de stock.</p>
              </div>
            </div>
            <div className='step'>
              <img src={change} alt='Cambio de productos' className='step-icon' />
              <div className='step-text'>
                <p><strong>4. Cambios:</strong> Si no hay stock de un artículo, la tienda puede cambiarlo por otro con la aprobación de la administración.</p>
              </div>
            </div>
            <div className='step centered-step'>
              <img src={download} alt='Descarga de PDF' className='step-icon' />
              <div className='step-text'>
                <p><strong>5. Descarga de Orden:</strong> Tras la confirmación, la tienda descarga un PDF con la orden de envío, artículos seleccionados y datos del cliente.</p>
              </div>
            </div>
          </div>
        </Zoom>
      </section>

      <section className="team-section my-4">
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
              <img src="https://res.cloudinary.com/dg7u2cizh/image/upload/v1727986307/fotoperfil_hh5zfp.jpg" alt="Michell" className="team-photo" />
              <h3>Michell D' Enjoy</h3>
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
              <img src="https://res.cloudinary.com/dg7u2cizh/image/upload/v1727986511/Imagen_de_WhatsApp_2024-10-03_a_las_16.58.01_ec968be9_zevtu6.jpg" alt="Elis" className="team-photo" />
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


      <NotType user_or_shop='user' />

    </div>
  );
};

export default AboutUs;
