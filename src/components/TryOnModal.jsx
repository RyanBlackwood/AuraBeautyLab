import React, { useEffect, useRef, useState } from 'react';
import { Camera, FlipHorizontal2, Hand, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { LiveHandPreview } from './LiveHandPreview.jsx';

export function TryOnModal({ open, onClose, look }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const detectorRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('Manual overlay');
  const [facingMode, setFacingMode] = useState('user');
  const [manual, setManual] = useState({ x: 0, y: 0, scale: 1, rotate: 0 });
  const dragRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    startCamera();
    return () => stopAll();
  }, [open, facingMode]);

  useEffect(() => {
    if (!open || !cameraReady) return;
    tryStartHandTracking();
  }, [open, cameraReady]);

  async function startCamera() {
    stopAll(false);
    setCameraReady(false);
    setTracking(false);
    setTrackingStatus('Starting camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1920 } },
        audio: false
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraReady(true);
      setTrackingStatus('Camera active');
    } catch (err) {
      setTrackingStatus('Camera permission needed');
    }
  }

  function stopAll(clearStatus = true) {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
    setTracking(false);
    if (clearStatus) setTrackingStatus('Manual overlay');
  }

  async function tryStartHandTracking() {
    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { FilesetResolver, HandLandmarker } = vision;
      const fileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      detectorRef.current = await HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 1
      });

      setTracking(true);
      setTrackingStatus('Hand tracking on');
      detectLoop();
    } catch (err) {
      setTracking(false);
      setTrackingStatus('Tracking unavailable — manual mode active');
    }
  }

  function detectLoop() {
    const video = videoRef.current;
    const detector = detectorRef.current;
    const canvas = canvasRef.current;
    if (!video || !detector || !canvas || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const result = detector.detectForVideo(video, performance.now());
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (result?.landmarks?.[0]) {
      const lm = result.landmarks[0];
      const xs = lm.map(p => p.x);
      const ys = lm.map(p => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);

      const cx = (minX + maxX) / 2 * rect.width;
      const cy = (minY + maxY) / 2 * rect.height;
      const handW = (maxX - minX) * rect.width;
      const handH = (maxY - minY) * rect.height;
      const wrist = lm[0], middle = lm[9];
      const angle = Math.atan2((middle.y - wrist.y), (middle.x - wrist.x)) * 180 / Math.PI - 90;

      const overlay = overlayRef.current;
      if (overlay) {
        overlay.style.left = `${cx}px`;
        overlay.style.top = `${cy + handH * 0.05}px`;
        overlay.style.width = `${Math.max(230, handW * 1.55)}px`;
        overlay.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      }

      ctx.strokeStyle = 'rgba(245,168,210,.88)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(minX * rect.width, minY * rect.height, handW, handH, 22);
      ctx.stroke();
      setTrackingStatus('Hand detected');
    } else {
      setTrackingStatus('Show one hand to the camera');
    }

    animationRef.current = requestAnimationFrame(detectLoop);
  }

  function resetManual() {
    setManual({ x: 0, y: 0, scale: 1, rotate: 0 });
  }

  function onPointerDown(e) {
    if (tracking) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      base: { ...manual }
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragRef.current || tracking) return;
    setManual(prev => ({
      ...prev,
      x: dragRef.current.base.x + e.clientX - dragRef.current.startX,
      y: dragRef.current.base.y + e.clientY - dragRef.current.startY
    }));
  }

  function onPointerUp(e) {
    dragRef.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  }

  function saveSnapshot() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#130d19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
    const dw = video.videoWidth * scale;
    const dh = video.videoHeight * scale;
    const dx = (canvas.width - dw) / 2;
    const dy = (canvas.height - dh) / 2;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, dx, dy, dw, dh);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.drawImage(video, dx, dy, dw, dh);
    }

    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.font = 'bold 34px system-ui';
    ctx.fillText(`Aura Beauty Lab — ${look.name}`, 42, canvas.height - 52);

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'aura-beauty-lab-try-on.png';
    a.click();
  }

  const manualStyle = tracking ? undefined : {
    left: `calc(50% + ${manual.x}px)`,
    top: `calc(52% + ${manual.y}px)`,
    width: `${330 * manual.scale}px`,
    transform: `translate(-50%, -50%) rotate(${manual.rotate}deg)`
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="tryon-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <motion.div className="tryon-shell" initial={{scale:.96,y:20,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:.96,y:20,opacity:0}}>
            <div className={`tryon-view ${facingMode === 'user' ? 'mirror' : ''}`} id="try-on">
              <video ref={videoRef} playsInline muted autoPlay />
              {!cameraReady && (
                <div className="camera-empty">
                  <Hand size={46}/>
                  <h3>ABL AR Try-On</h3>
                  <p>Allow camera access. If tracking is unavailable, manual overlay mode still works.</p>
                </div>
              )}
              <canvas ref={canvasRef} className="tracking-canvas" />
              <div
                ref={overlayRef}
                className={`nail-overlay ${tracking ? 'tracked' : ''}`}
                style={manualStyle}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <LiveHandPreview look={look} ar />
                {!tracking && <span className="resize-dot" />}
              </div>

              <div className="tryon-top">
                <span>{trackingStatus}</span>
                <button onClick={onClose}><X size={18}/></button>
              </div>
            </div>

            <div className="tryon-controls">
              <div className="tryon-buttons">
                <button onClick={startCamera}><Camera size={16}/> Start</button>
                <button onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}><FlipHorizontal2 size={16}/> Flip</button>
                <button onClick={() => setTracking(!tracking)}><Hand size={16}/> {tracking ? 'Manual' : 'Track'}</button>
                <button onClick={resetManual}><RotateCcw size={16}/> Reset</button>
              </div>

              <div className="manual-controls">
                <label><SlidersHorizontal size={15}/> Scale
                  <input type="range" min=".55" max="1.85" step=".01" value={manual.scale} onChange={e => setManual(v => ({...v, scale:Number(e.target.value)}))}/>
                </label>
                <label>Rotate
                  <input type="range" min="-45" max="45" step="1" value={manual.rotate} onChange={e => setManual(v => ({...v, rotate:Number(e.target.value)}))}/>
                </label>
              </div>

              <div className="tryon-actions">
                <button onClick={saveSnapshot}>Save Snapshot</button>
                <button className="primary-action" onClick={onClose}>Use This Look</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
