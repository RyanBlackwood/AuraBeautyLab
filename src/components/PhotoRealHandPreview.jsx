import React from "react";
import "./PhotoRealHandPreview.css";

export default function PhotoRealHandPreview({
  color = "#f3b6d1",
  finish = "chrome",
  shape = "almond",
  length = "medium",
}) {

  return (
    <div className="photo-preview-wrapper">
      <img
        src="/AuraBeautyLab/hands/base-hand.png"
        className="real-hand-base"
        alt="Hand Preview"
      />

      <div className={`nail thumb ${shape} ${length} ${finish}`} style={{"--nail-color": color}}>
        <div className="gloss"></div>
      </div>

      <div className={`nail index ${shape} ${length} ${finish}`} style={{"--nail-color": color}}>
        <div className="gloss"></div>
      </div>

      <div className={`nail middle ${shape} ${length} ${finish}`} style={{"--nail-color": color}}>
        <div className="gloss"></div>
      </div>

      <div className={`nail ring ${shape} ${length} ${finish}`} style={{"--nail-color": color}}>
        <div className="gloss"></div>
      </div>

      <div className={`nail pinky ${shape} ${length} ${finish}`} style={{"--nail-color": color}}>
        <div className="gloss"></div>
      </div>
    </div>
  );
}
