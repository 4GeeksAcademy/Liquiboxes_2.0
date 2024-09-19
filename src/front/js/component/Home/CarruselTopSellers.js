import React from 'react'
import Carousel from 'react-bootstrap/Carousel';


function CarruselTopSellers() {
  return (
<div className="carousel-container">
      <Carousel fade> {/* Agrega el atributo fade para transiciones suaves */}
        <Carousel.Item>
          <img
            className=" img-fluid" 
            src="https://images.pexels.com/photos/1666070/pexels-photo-1666070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="First slide"/>          
          <Carousel.Caption>
            <h3>First Box</h3>
            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="img-fluid"
            src="https://images.pexels.com/photos/697224/pexels-photo-697224.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Second slide"/>          
          <Carousel.Caption>
            <h3>Second Box</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="img-fluid"
            src="https://images.pexels.com/photos/1050256/pexels-photo-1050256.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Third slide"/>          
          <Carousel.Caption>
            <h3>Third Box</h3>
            <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
          </Carousel.Caption>
        </Carousel.Item>          
      </Carousel>
    </div>
  )
}
export default CarruselTopSellers