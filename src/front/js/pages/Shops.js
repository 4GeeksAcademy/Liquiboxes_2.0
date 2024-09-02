import React, { useState } from 'react'

function Shops() {
  const [ showArmario, setShowArmario] = useState(false)
  const [ showValoraciones, setShowValoraciones] = useState(true)

  const handleShowArmario = () => {
    setShowArmario(true)
    setShowValoraciones(false)
  }

  const handleShowValoraciones = () => {
    setShowArmario(false)
    setShowValoraciones(true)
  }


  return (
    <div>
      <button type='button' onClick={handleShowArmario}>Mostrar Armario</button>
      <button type='button' onClick={handleShowValoraciones}>Mostrar Valoraciones</button>

    {showArmario && (
      <p>Aquí va el armario</p>
    )}
    {showValoraciones && (
      <p>Aquí va el valoraciones</p>
    )}

    </div>
  )
}

export default Shops