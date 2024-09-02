import React, { useState } from 'react'; //Cambiarle el nombre por SCROLLHORIZAONTAL
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "../../../styles/slide.css";
import ScrollHorizontal from "../Home/ScrollHorizantal";  // Importa ScrollHorizontal

function CardScroll({ cardsData }) {  // Recibe cardsData desde Home como prop
  const [slides, setSlides] = useState(cardsData);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4
  };

  return (

    <div>
      <div className="slider-container">
        <Slider {...settings}>

          {slides.map((card) => (
            <div key={card.id}>
              {/* Renderiza ScrollHorizontal con los datos de la tarjeta */}
              <ScrollHorizontal
                imageSrc={card.image_shop_url}
                title={card.shop_name}
                text={card.shop_summary}
                link={card.id}
              />
            </div>
          ))}
        </Slider>
      </div>
    </div>

  );
}

export default CardScroll;




// export default function CardScroll() {
//   const settings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 3,
//     slidesToScroll: 3,

//   };
//   return (
//     <div>

//       <div className="slider-container">
//         <Slider {...settings} className='d-flex '>
//           <div>
//             <h3>Caja 1</h3>
//             <img className="img-fluid" style={{ width: '100%', height: '200px', objectFit: 'cover' }}
//               src='https://images.pexels.com/photos/5872364/pexels-photo-5872364.jpeg?auto=compress&cs=tinysrgb&w=600' />
//           </div>
//           <div>
//             <h3>Caja 2</h3>
//             <img className="img-fluid" style={{ width: '100%', height: '200px', objectFit: 'cover' }}
//               src='https://images.pexels.com/photos/157879/gift-jeans-fashion-pack-157879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' />
//           </div>
//           <div>
//             <h3>Caja 3</h3>
//             <img className="img-fluid" style={{ width: '100%', height: '200px', objectFit: 'cover' }}
//               src='https://images.pexels.com/photos/1050283/pexels-photo-1050283.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' />
//           </div>
//           <div>
//             <h3>Caja 4</h3>
//             <img className="img-fluid" style={{ width: '100%', height: '200px', objectFit: 'cover' }}
//               src='https://images.pexels.com/photos/4397835/pexels-photo-4397835.jpeg?auto=compress&cs=tinysrgb&w=600' />
//           </div>
//           <div>
//             <h3>Caja 5</h3>
//             <img className="img-fluid" style={{ width: '100%', height: '200px', objectFit: 'cover' }}
//               src='https://images.pexels.com/photos/4397835/pexels-photo-4397835.jpeg?auto=compress&cs=tinysrgb&w=600' />
//           </div>

//         </Slider>
//       </div>
//     </div>

//   )
// }


