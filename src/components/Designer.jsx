import React, { useMemo, useState } from 'react';
import { Camera, Save, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LiveHandPreview } from './LiveHandPreview.jsx';
import { TryOnModal } from './TryOnModal.jsx';

const COLORS = [
  { name: 'Rose', a: '#f6a8d4', b: '#d8c2ff', c: '#fff1f8' },
  { name: 'Lilac', a: '#cbb7ff', b: '#f3eaff', c: '#ffffff' },
  { name: 'Pearl', a: '#fff7d9', b: '#ffffff', c: '#f9e5ff' },
  { name: 'Aqua', a: '#87e8fb', b: '#e8fbff', c: '#d5c0ff' },
  { name: 'Noir', a: '#14101c', b: '#4b3a61', c: '#f7a8d4' },
  { name: 'Cherry', a: '#cf305f', b: '#ff9ebd', c: '#fff5f8' }
];

const SHAPES = ['Almond', 'Coffin', 'Square', 'Oval'];
const FINISHES = ['Chrome', 'Gloss', 'Matte', 'Glitter'];
const LENGTHS = ['Short', 'Medium', 'Long', 'XL'];

export function Designer() {
  const [shape, setShape] = useState('Almond');
  const [finish, setFinish] = useState('Chrome');
  const [length, setLength] = useState('Medium');
  const [color, setColor] = useState(COLORS[0]);
  const [accent, setAccent] = useState(true);
  const [notes, setNotes] = useState('');
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const look = useMemo(() => ({
    name: `${color.name} ${finish} Aura`,
    shape,
    finish,
    length,
    color,
    accent,
    notes,
    price: 64
      + (finish === 'Chrome' ? 14 : finish === 'Glitter' ? 12 : finish === 'Matte' ? 6 : 0)
      + (shape === 'Coffin' ? 8 : 0)
      + ({ Short: -8, Medium: 0, Long: 16, XL: 26 }[length] ?? 0)
      + (accent ? 8 : 0)
  }), [shape, finish, length, color, accent, notes]);

  const saveLook = () => {
    localStorage.setItem('ablSavedLook-v3.2', JSON.stringify(look));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1300);
  };

  return (
    <section id="designer" className="designer-shell">
      <motion.aside
        className="preview-card glass-card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="panel-top">
          <span className="status-pill"><Sparkles size={15}/> Live Preview</span>
          <span className="status-pill muted-pill">{look.price}</span>
        </div>

        <LiveHandPreview look={look} />

        <div className="look-footer">
          <div>
            <p className="eyebrow small">Current Look</p>
            <h3>{look.name}</h3>
            <p>{shape} • {length} • {finish} • {accent ? 'Accent shimmer' : 'No accent'}</p>
          </div>
          <button className="primary-action compact" onClick={() => setTryOnOpen(true)}>
            <Camera size={18}/> AR Try-On
          </button>
        </div>
      </motion.aside>

      <motion.div
        className="controls-card glass-card"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: .08 }}
      >
        <div className="controls-header">
          <div>
            <p className="eyebrow small">Designer v3.2</p>
            <h3>Build your nail set</h3>
          </div>
          <div className="estimate">
            <span>Estimate</span>
            <strong>${look.price}</strong>
          </div>
        </div>

        <OptionGroup label="Shape" value={shape} options={SHAPES} onChange={setShape} />
        <OptionGroup label="Finish" value={finish} options={FINISHES} onChange={setFinish} />

        <div className="control-group">
          <div className="group-label"><span>Color Aura</span><strong>{color.name}</strong></div>
          <div className="swatch-row">
            {COLORS.map(item => (
              <button
                key={item.name}
                className={`swatch ${item.name === color.name ? 'selected' : ''}`}
                style={{ '--a': item.a, '--b': item.b }}
                onClick={() => setColor(item)}
                aria-label={item.name}
              />
            ))}
          </div>
        </div>

        <div className="control-group">
          <div className="group-label"><span>Length</span><strong>{length}</strong></div>
          <input
            className="premium-range"
            type="range"
            min="0"
            max="3"
            step="1"
            value={LENGTHS.indexOf(length)}
            onChange={(e) => setLength(LENGTHS[Number(e.target.value)])}
          />
          <div className="range-labels"><span>Short</span><span>Medium</span><span>Long</span><span>XL</span></div>
        </div>

        <div className="toggle-row">
          <button className={`toggle-chip ${accent ? 'active' : ''}`} onClick={() => setAccent(!accent)}>
            <Wand2 size={16}/> Accent shimmer {accent ? 'On' : 'Off'}
          </button>
        </div>

        <div className="control-group">
          <div className="group-label"><span>Prep Notes</span><strong>Optional</strong></div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Example: softer pink base, chrome only on ring finger, keep length practical for work."
          />
        </div>

        <div className="summary-card">
          <div>
            <strong>{look.name}</strong>
            <p>{shape} shape, {length.toLowerCase()} length, {finish.toLowerCase()} finish.</p>
          </div>
          <button onClick={saveLook} className="save-action">
            <Save size={17}/> {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </motion.div>

      <TryOnModal open={tryOnOpen} onClose={() => setTryOnOpen(false)} look={look} />
    </section>
  );
}

function OptionGroup({ label, value, options, onChange }) {
  return (
    <div className="control-group">
      <div className="group-label"><span>{label}</span><strong>{value}</strong></div>
      <div className="option-grid">
        {options.map(option => (
          <button
            key={option}
            className={`option-button ${value === option ? 'active' : ''}`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
