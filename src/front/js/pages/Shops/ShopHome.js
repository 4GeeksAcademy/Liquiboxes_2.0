import React from 'react'
import { useNavigate } from 'react-router-dom'

function ShopHome() {
  const navigate= useNavigate()

  return (
    <div>
      <h2>Home para las tiendas</h2>
      <div>
        <button type='button' className='btn btn-success' onClick={() =>  {navigate("/createbox")}}>Crear una nueva caja</button>
      </div>
    </div>
  )
}

export default ShopHome