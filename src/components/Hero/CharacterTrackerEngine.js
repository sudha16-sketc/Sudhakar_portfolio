/**
 * CharacterTrackerEngine.js
 * High-performance, zero-ghosting, DPR-aware Canvas character animation engine.
 * Preloads preprocessed WebP frames and maps mouse cursor angle to directional frames.
 *
 * FIX LOG (2026-09-25):
 * 1. Upper-left STUCK / frame-jump eliminated:
 *    - lerpAngle() uses Math.atan2(sin, cos) delta — guaranteed shortest path,
 *      never crosses the -PI/+PI seam.
 *    - angleToFrameFloat() returns a CONTINUOUS float; rounding happens only
 *      at the final array lookup so tiny angle changes never cause big index jumps.
 *
 * 2. Face-glitch (flicker when cursor near face) eliminated:
 *    - Dual-threshold HYSTERESIS deadzone: a wider "outer" radius to enter
 *      tracking mode, a smaller "inner" radius to exit. Prevents rapid
 *      center↔tracking flipping when the mouse hovers near the face.
 *
 * 3. Character as CENTREPIECE:
 *    - characterCenterX/Y are now derived from the centered canvas position.
 *    - Hero.css updated separately to make the canvas fill the full width.
 */

// Angular calibration keypoints: [angleInRadians, continuousFrameIndex]
// Frame indices are CONTINUOUS (monotonically increasing across the full -PI..+PI
// sweep) so interpolation is smooth with no modulo wrap-around jumps.
const CALIBRATION_KEYPOINTS = [
  [-Math.PI,          136.0], // Left      (-180°)
  [-3 * Math.PI / 4, 152.0], // Up-Left   (-135°)
  [-Math.PI / 2,     168.0], // Up         (-90°)
  [-Math.PI / 4,     194.0], // Up-Right   (-45°)
  [0.0,              222.0], // Right        (0°)
  [Math.PI / 4,      246.0], // Down-Right  (+45°)
  [Math.PI / 2,      266.0], // Down        (+90°)
  [3 * Math.PI / 4,  282.0], // Down-Left  (+135°)
  [Math.PI,          300.0], // Left       (+180°) ← mirrors -180° for wrap
];

export class CharacterTrackerEngine {
  constructor(options) {
    this.canvas = options.canvas;
    this.totalDirectionalFrames = options.totalDirectionalFrames ?? 164;
    this.lerpFactor = options.lerpFactor ?? 0.24;

    const ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) throw new Error('Could not obtain 2D canvas context');
    this.ctx = ctx;

    this.images = [];
    this.centerImage = null;
    this.isLoaded = false;
    this.isDestroyed = false;

    this.currentAngle = -Math.PI / 2; // Start facing forward/up
    this.targetAngle  = -Math.PI / 2;
    this.currentFrameIndex = 0; // resolved in updateState

    // centerInfluence: 1.0 = show neutral/center frame, 0.0 = show directional frame
    this.centerInfluence       = 1.0;
    this.targetCenterInfluence = 1.0;

    // Whether the cursor is currently in "tracking" mode (outside outer deadzone)
    this.isTracking = false;

    this.rafId = null;
    this.dpr = 1;
    this.canvasWidth  = 0;
    this.canvasHeight = 0;
    this.characterCenterX = 0;
    this.characterCenterY = 0;

    this.boundOnMouseMove  = this.handleMouseMove.bind(this);
    this.boundOnMouseEnter = this.handleMouseEnter.bind(this);
    this.boundOnMouseLeave = this.handleMouseLeave.bind(this);
    this.boundOnResize     = this.handleResize.bind(this);

    this.updateDimensions();
    this.preloadFrames(options.onProgress, options.onReady);
    this.bindEvents();
    this.startLoop();
  }

  // ─── Frame loading ────────────────────────────────────────────────────────

  preloadFrames(onProgress, onReady) {
    const totalToLoad = this.totalDirectionalFrames + 1;
    let loadedCount = 0;

    const checkDone = () => {
      loadedCount++;
      if (onProgress) onProgress(Math.min(loadedCount / totalToLoad, 1.0));
      if (loadedCount === totalToLoad && !this.isDestroyed) {
        this.isLoaded = true;
        if (onReady) onReady();
        this.renderSingleFrame(this.centerImage ?? this.images[0]);
      }
    };

    // Center / neutral frame
    const centerImg = new Image();
    centerImg.src = '/frames/frame-center.webp';
    centerImg.onload  = () => { this.centerImage = centerImg; checkDone(); };
    centerImg.onerror = () => { console.warn('Center frame failed to load'); checkDone(); };

    // Directional frames
    for (let i = 0; i < this.totalDirectionalFrames; i++) {
      const img = new Image();
      img.src = `/frames/frame-${String(i).padStart(3, '0')}.webp`;
      img.onload  = () => checkDone();
      img.onerror = () => { console.warn(`Frame ${i} failed`); checkDone(); };
      this.images.push(img);
    }
  }

  // ─── Events ──────────────────────────────────────────────────────────────

  bindEvents() {
    window.addEventListener('mousemove', this.boundOnMouseMove, { passive: true });
    window.addEventListener('resize',    this.boundOnResize,    { passive: true });
    document.addEventListener('mouseenter', this.boundOnMouseEnter);
    document.addEventListener('mouseleave', this.boundOnMouseLeave);
  }

  updateDimensions() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    this.canvasWidth  = rect.width;
    this.canvasHeight = rect.height;

    const pw = Math.round(rect.width  * this.dpr);
    const ph = Math.round(rect.height * this.dpr);
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width  = pw;
      this.canvas.height = ph;
    }

    // Eye-level tracking point.
    // 0.38 puts the Y at roughly the character's eyes when the canvas is centred.
    this.characterCenterX = rect.left + rect.width  / 2;
    this.characterCenterY = rect.top  + rect.height * 0.38;
  }

  handleResize() {
    this.updateDimensions();
    if (this.isLoaded) this.render();
  }

  handleMouseEnter() { /* handled by mousemove */ }

  handleMouseLeave() {
    this.isTracking = false;
    this.targetCenterInfluence = 1.0;
  }

  handleMouseMove(e) {
    const dx = e.clientX - this.characterCenterX;
    const dy = e.clientY - this.characterCenterY;
    const distance = Math.hypot(dx, dy);

    // HYSTERESIS DEADZONE — eliminates the "face glitch":
    //   • outerRadius: must move THIS FAR from center to enter tracking mode
    //   • innerRadius: must come THIS CLOSE to center to exit tracking mode
    // Having two different thresholds prevents rapid center↔directional flipping
    // when the cursor sits right in front of the character's face.
    const minDim      = Math.min(this.canvasWidth, this.canvasHeight);
    const outerRadius = minDim * 0.20; // ~20 % of smallest dimension
    const innerRadius = minDim * 0.10; // ~10 % — tighter "reset" zone

    if (this.isTracking) {
      // Already tracking: stop only when cursor enters the inner (tighter) zone
      if (distance <= innerRadius) {
        this.isTracking = false;
        this.targetCenterInfluence = 1.0;
      } else {
        this.targetAngle = Math.atan2(dy, dx);
      }
    } else {
      // In center mode: only start tracking once clearly past the outer radius
      if (distance > outerRadius) {
        this.isTracking = true;
        this.targetCenterInfluence = 0.0;
        this.targetAngle = Math.atan2(dy, dx);
      }
      // Inside outer radius: do nothing — prevents the upper-left corner trap
    }
  }

  // ─── Math helpers ─────────────────────────────────────────────────────────

  /**
   * Shortest-path angular LERP.
   * The atan2(sin, cos) trick keeps the delta in [-PI, PI], so the interpolation
   * NEVER crosses the -PI/+PI discontinuity — the root cause of the upper-left
   * "stuck → jump" behaviour.
   */
  lerpAngle(current, target, t) {
    const delta = Math.atan2(
      Math.sin(target - current),
      Math.cos(target - current)
    );
    return current + delta * t;
  }

  /**
   * Maps angle in [-PI, PI] to a CONTINUOUS float frame index.
   * Returning a float (not an integer) means the subsequent round() call
   * on a smoothly-changing angle never produces sudden large index jumps.
   */
  angleToFrameFloat(angle) {
    const a = Math.max(-Math.PI, Math.min(Math.PI, angle)); // strict clamp

    for (let i = 0; i < CALIBRATION_KEYPOINTS.length - 1; i++) {
      const [a1, f1] = CALIBRATION_KEYPOINTS[i];
      const [a2, f2] = CALIBRATION_KEYPOINTS[i + 1];
      if (a >= a1 && a <= a2) {
        const t = (a - a1) / (a2 - a1);
        return f1 + t * (f2 - f1); // continuous float
      }
    }
    return 136.0; // Left fallback
  }

  // ─── Animation loop ───────────────────────────────────────────────────────

  startLoop() {
    const tick = () => {
      if (this.isDestroyed) return;
      this.updateState();
      if (this.isLoaded) this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  updateState() {
    // Ease center influence toward its target
    this.centerInfluence += (this.targetCenterInfluence - this.centerInfluence) * 0.14;

    // Ease angle via shortest angular path
    this.currentAngle = this.lerpAngle(this.currentAngle, this.targetAngle, this.lerpFactor);

    if (this.centerInfluence >= 0.5) {
      this.currentFrameIndex = -1; // sentinel → render neutral/center frame
    } else {
      const raw = this.angleToFrameFloat(this.currentAngle);
      let idx   = Math.round(raw) % this.totalDirectionalFrames;
      if (idx < 0) idx += this.totalDirectionalFrames;
      this.currentFrameIndex = idx;
    }
  }

  // ─── Rendering ────────────────────────────────────────────────────────────

  /**
   * ZERO-GHOSTING RENDERING:
   * Draws exactly ONE frame at 100% opacity — no blending, no stacking.
   */
  render() {
    let img = null;

    if (this.currentFrameIndex === -1) {
      img = this.centerImage;
    } else if (this.currentFrameIndex >= 0 && this.currentFrameIndex < this.images.length) {
      img = this.images[this.currentFrameIndex];
    }
    img ??= this.centerImage; // ultimate fallback

    if (img && img.complete && img.naturalWidth > 0) {
      this.renderSingleFrame(img);
    }
  }

  renderSingleFrame(img) {
    const pw = this.canvas.width;
    const ph = this.canvas.height;

    const imgRatio    = img.naturalWidth / img.naturalHeight;
    const canvasRatio = pw / ph;

    let drawW, drawH, drawX, drawY;

    if (canvasRatio > imgRatio) {
      // Canvas wider — fit by height, centre horizontally
      drawH = ph;
      drawW = ph * imgRatio;
      drawX = (pw - drawW) / 2;
      drawY = 0;
    } else {
      // Canvas taller — fit by width, anchor bottom
      drawW = pw;
      drawH = pw / imgRatio;
      drawX = 0;
      drawY = ph - drawH;
    }

    this.ctx.fillStyle = '#ce0908';
    this.ctx.fillRect(0, 0, pw, ph);

    this.ctx.imageSmoothingEnabled  = true;
    this.ctx.imageSmoothingQuality  = 'high';
    this.ctx.globalAlpha = 1.0;
    this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  destroy() {
    this.isDestroyed = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    window.removeEventListener('resize',    this.boundOnResize);
    document.removeEventListener('mouseenter', this.boundOnMouseEnter);
    document.removeEventListener('mouseleave', this.boundOnMouseLeave);
    this.images = [];
    this.centerImage = null;
  }
}