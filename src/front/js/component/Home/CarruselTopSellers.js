import React from 'react'
// import Card_shops from 'Card_shops'
import Carousel from 'react-bootstrap/Carousel';


function CarruselTopSellers() {
  return (
<div className="carousel-container">
      <Carousel fade> {/* Agrega el atributo fade para transiciones suaves */}
        <Carousel.Item>
          <img
            className="d-block w-100 carousel-image" // Añadir clase para imagen
            src="https://images.pexels.com/photos/21404298/pexels-photo-21404298/free-photo-of-madera-verano-jardin-casa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="First slide"
          />
          <Carousel.Caption>
            <h3>First slide label</h3>
            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100 carousel-image"
            src="https://images.pexels.com/photos/21404298/pexels-photo-21404298/free-photo-of-madera-verano-jardin-casa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Second slide"
          />
          <Carousel.Caption>
            <h3>Second slide label</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="d-block w-100 carousel-image"
            src="https://images.pexels.com/photos/21404298/pexels-photo-21404298/free-photo-of-madera-verano-jardin-casa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3>Third slide label</h3>
            <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  )
}

export default CarruselTopSellers