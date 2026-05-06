import React from "react";
import "./LuxuryPhotoPreview.css";

export default function LuxuryPhotoPreview({
  color = "#f3b6d1",
  shape = "Almond",
  finish = "Chrome",
  length = "Medium",
}) {
  return (
    <div className="luxury-preview-shell">
      <div className="photo-stage">
        <img
          src="/AuraBeautyLab/hands/base-hand.png"
          alt="Luxury hand preview"
          className="hand-photo"
        />

        <div
          className="finish-aura"
          style={{ background: `radial-gradient(circle, ${color}55, transparent 70%)` }}
        />
      </div>

      <div className="look-summary-card">
        <div className="summary-label">Current Luxury Set</div>

        <h2>Rose Chrome Aura</h2>

        <div className="summary-tags">
          <span>{shape}</span>
          <span>{length}</span>
          <span>{finish}</span>
        </div>

        <div
          className="color-pill"
          style={{ background: color }}
        />

        <p>
          Photoreal luxury preview mode enabled.
        </p>
      </div>
    </div>
  );
}
