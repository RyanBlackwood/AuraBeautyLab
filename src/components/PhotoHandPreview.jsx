
import React from 'react'

export function PhotoHandPreview({ look }) {
  const colorMap = {
    Rose: ['#f6a7d1', '#ffe7f5'],
    Pearl: ['#fff6dc', '#ffffff'],
    Lilac: ['#ccb8ff', '#efe7ff'],
    Aqua: ['#8de9fb', '#e7fdff'],
    Cherry: ['#df4f7c', '#ffc1d1'],
    Noir: ['#191325', '#54446f'],
  }

  const [primary, secondary] = colorMap[look.color.name] || colorMap.Rose

  return (
    <div className="photo-hand-preview">
      <img
        src="/AuraBeautyLab/hands/base-hand.png"
        alt="Luxury nail preview"
        className="real-hand-image"
      />

      <div className="nail-layer">
        <div className="nail nail-1" style={{ '--primary': primary, '--secondary': secondary }} />
        <div className="nail nail-2" style={{ '--primary': primary, '--secondary': secondary }} />
        <div className="nail nail-3" style={{ '--primary': primary, '--secondary': secondary }} />
        <div className="nail nail-4" style={{ '--primary': primary, '--secondary': secondary }} />
        <div className="nail nail-5" style={{ '--primary': primary, '--secondary': secondary }} />
      </div>
    </div>
  )
}
