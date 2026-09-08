

// ----- variables/constAndVars.js -----


let startDrag = null;
var endDrag = null;
let cameraFollowingIndex = 0;
let cameraFollow = false;
let collideIsON = true;
let massTransferEnabled = true; // Controls whether bodies combine/transfer mass during collisions
let camSpeed = 5; 
let showTrailsIsON = true;
let showStarsIsON = true;
let showVelocitiesIsON = true;
let showLabelsIsON = true;
let showFPSIsON = false;
let showDebugPoints = false;
let devModeIsON = false;
let showBHNodesIsON = false;
let showBHCenterOfMassIsON = false;
let showTrailPointsIsON = false;
let velocityUnit = 'm/s';

let showGravityGridIsON = false;
let showGravityVectorsIsON = false;
let showGravityHeatmapIsON = false;
let showGravityContoursIsON = false;

const gravityFieldSettings = {
  gridOpacity: 1.0,
  heatmapOpacity: 0.85,
  vectorOpacity: 1.0,
  contourOpacity: 0.9,
  warpStrength: 1.0
};
let zoomFactor = 0.85;
let zoomSpeed = 0.1;
let isCameraLockedOn = false;
let smoothedSpeed = 0;
let selectedBody = '';
let selectedPreset = null; // For preset selection system (4-9 keys)
let isPaused = false;

// Probe mode variables
let probeModeEnabled = false;
let probe = null; // { x, y, startX, startY, targetX, targetY, isTransitioning, transitionProgress, waypoints: [] }
const probeTransitionSpeed = 0.005; // Speed of smooth probe transition (slower for observation)
let timeScale = 1;

// Preset definitions for number key selection
const presetDefinitions = {
  4: { name: 'Three Body Problem', key: '4' },
  5: { name: 'Galaxy', key: '5' },
  6: { name: 'Solar System', key: '6' },
  7: { name: 'Binary Star System', key: '7' },
  8: { name: 'Meteor Shower', key: '8' },
  9: { name: 'Stress Test (3000)', key: '9' }
};

const cameraMoveSpeed = 1;

/** @type {BackgroundStar[]} */
const backgroundStars = [];

/** @type {CelestialBody[]} */
const celestialBodies = [];

/** * @typedef {Object} Camera
 * @property {number} x - Current x position of the camera
 * @property {number} y - Current y position of the camera
 * @property {number} prevX - Previous x position of the camera
 * @property {number} prevY - Previous y position of the camera
 * @property {number} lastMouseX - Last recorded x position of the mouse
 * @property {number} lastMouseY - Last recorded y position of the mouse
 */
const camera = {
  x: 0,
  y: 0,
  prevX: 0,
  prevY: 0,
  lastMouseX: 0,
  lastMouseY: 0,
  clientX: 0,
  clientY: 0
};

/** * @typedef {Object} TargetCamera
 * @property {number} x - Target x position for camera movement
 * @property {number} y - Target y position for camera movement
 */
let targetCamera = { x: 0, y: 0 };

/**
 * @typedef {Object} KeyState
 * @property {boolean} ArrowUp - State of the up arrow key
 * @property {boolean} ArrowDown - State of the down arrow key
 * @property {boolean} ArrowLeft - State of the left arrow key
 * @property {boolean} ArrowRight - State of the right arrow key
*/
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

/**
 * @typedef {Object} CelestialBodyType
 * @property {number} radius - Default radius for this type
 * @property {number} density - Default density for this type
 * @property {Object} color - Default color for this type
 * @property {number} color.r - Red component (0-255)
 * @property {number} color.g - Green component (0-255)
 * @property {number} color.b - Blue component (0-255)
 */
const celestialBodyValues = {
  planet: {
    radius: 4,
    density: 1.5,
    color: { r: 255, g: 255, b: 255 }
  },
  star: {
    radius: 10,
    density: 15,
    color: { r: 255, g: 165, b: 0 }
  },
  blackHole: {
    radius: 15,
    density: 360,
    color: { r: 0, g: 0, b: 0 }
  }
};


// ----- classes/CelestialBodyClass.js -----


/**
 * Represents a celestial body in a space simulation with physical properties and rendering capabilities.
 * @class
 * @property {string} bodyType - The type of celestial body ('planet', 'star', 'blackHole')
 * @property {number} radius - The radius of the celestial body
 * @property {number} density - The density of the celestial body
 * @property {number} weight - The weight/mass of the celestial body
 * @property {number} x - Current x position
 * @property {number} y - Current y position
 * @property {number} dx - Velocity in x direction
 * @property {number} dy - Velocity in y direction
 * @property {number} ax - Acceleration in x direction
 * @property {number} ay - Acceleration in y direction
 * @property {string} color - RGB color string in rgba format
 * @property {string} trailColor - Color used for trajectory trail
 * @property {string} textColor - Color used for labels and text
 * @property {number} elasticity - Bounce elasticity coefficient
 * @property {string} label - Display label for the celestial body
 * @property {number} prevX - Previous x position
 * @property {number} prevY - Previous y position
 */
class CelestialBody {
  /**
   * Creates a new celestial body.
   * @param {Object} params - The celestial body parameters
   * @param {string} params.bodyType - Type of celestial body
   * @param {number} [params.radius] - Radius (calculated from weight if not provided)
   * @param {number} params.density - Density of the body
   * @param {number} [params.weight] - Weight (calculated from radius if not provided)
   * @param {number} params.x - Initial x position
   * @param {number} params.y - Initial y position
   * @param {number} params.dx - Initial velocity in x direction
   * @param {number} params.dy - Initial velocity in y direction
   * @param {Object} params.color - RGB color object
   * @param {number} params.color.r - Red component (0-255)
   * @param {number} params.color.g - Green component (0-255)
   * @param {number} params.color.b - Blue component (0-255)
   * @param {string} [params.label] - Display label
   * @param {string} [params.trailColor] - Color for trajectory trail
   * @param {string} [params.textColor] - Color for labels and text
   */
  constructor(
    {
      bodyType,
      radius,
      density,
      weight,
      x,
      y,
      dx,
      dy,
      color,
      label,
      trailColor,
      textColor
    }
  ) {
    this.bodyType = bodyType;
    this.radius = radius || (weight ? Math.cbrt(weight / (4 / 3 * Math.PI * density)) : 4);
    this.density = density;
    this.weight = weight || 4 / 3 * Math.PI * radius * radius * radius * density;
    this.x = x;
    this.y = y;
    this.dx = dx;
    // this.dx = 2997.92458 * 1;
    this.dy = dy;
    this.color = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
    this.trailColor = trailColor || `rgba(${color.r}, ${color.g}, ${color.b}, 0.65)`;
    this.textColor = textColor || `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
    this.elasticity = bodyType === 'planet' ? 0.8 : bodyType === 'star' ? 0.1 : bodyType === 'blackHole' ? 0.001 : 0.8;
    this.label = label;
    this.prevX = x;
    this.prevY = y;
    
    // Initialize acceleration components for physics system
    this.ax = 0;
    this.ay = 0;
    
    // Pinning functionality
    this.isPinned = false;
    this.pinnedX = null;
    this.pinnedY = null;
    
    // Generate a unique ID for this body
    this.id = crypto.randomUUID();

    // Cached Path2D for body circle; rebuilt if radius changes
    this._cachedRadius = null;
    this._circlePath = null;
    
    // Cached accretion disk gradients for black holes
    this._accretionDiskGradient = null;
    this._cachedAccretionRadius = null;
  }

  /**
   * Draws the accretion disk for black holes with 3D effect.
   * The disk is rendered in two parts - back and front - to create depth.
   */
  drawAccretionDisk() {
    if (this.bodyType !== 'blackHole') return;
    
    const diskRadius = this.radius * 4;
    const diskHeight = this.radius * 0.8;
    
    // Create or update cached gradient if radius changed
    if (this._cachedAccretionRadius !== this.radius || !this._accretionDiskGradient) {
      this._accretionDiskGradient = ctx.createRadialGradient(0, 0, this.radius * 1.2, 0, 0, diskRadius);
      this._accretionDiskGradient.addColorStop(0, 'rgba(255, 140, 0, 0)'); // Transparent center
      this._accretionDiskGradient.addColorStop(0.3, 'rgba(255, 140, 0, 0.8)'); // Orange glow
      this._accretionDiskGradient.addColorStop(0.6, 'rgba(255, 80, 0, 0.6)'); // Red-orange
      this._accretionDiskGradient.addColorStop(0.8, 'rgba(120, 40, 0, 0.4)'); // Dark red
      this._accretionDiskGradient.addColorStop(1, 'rgba(60, 20, 0, 0.1)'); // Very dark edge
      this._cachedAccretionRadius = this.radius;
    }
    
    ctx.save();
    
    // Draw back part of the disk (behind black hole) - bottom half
    ctx.scale(1, diskHeight / diskRadius); // Flatten to create oval
    ctx.fillStyle = this._accretionDiskGradient;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(0, 0, diskRadius, diskRadius, 0, 0, Math.PI); // Bottom semicircle
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * Draws the front part of the accretion disk (in front of black hole).
   */
  drawAccretionDiskFront() {
    if (this.bodyType !== 'blackHole') return;
    
    const diskRadius = this.radius * 4;
    const diskHeight = this.radius * 0.8;
    
    ctx.save();
    
    // Draw front part of the disk (in front of black hole) - top half
    ctx.scale(1, diskHeight / diskRadius); // Flatten to create oval
    ctx.fillStyle = this._accretionDiskGradient;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(0, 0, diskRadius, diskRadius, 0, Math.PI, Math.PI * 2); // Top semicircle
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * Draws the celestial body text labels and UI elements on the 2D canvas.
   * The main body rendering is now handled by WebGL.
   * @param {boolean} isFollowed - Whether this body is currently being followed by the camera
   */
  drawLabels(isFollowed = false) {
    // Always show labels for followed body, otherwise check global setting
    if (showLabelsIsON || isFollowed) {
      ctx.fillStyle = isFollowed ? 'rgba(255, 255, 255, 1)' : this.textColor; // Bright white for followed body
      const fontSize = zoomFactor > 0.5 ? 14 / zoomFactor : 14 * 0.6/ zoomFactor;
      ctx.font = `${fontSize}px Arial`;
      const textWidth = ctx.measureText(this.label).width;
      ctx.fillText(this.label, this.x - camera.x - textWidth / 2, this.y - camera.y + this.radius + (16/zoomFactor));
    }
  
    // Always show velocities for followed body, otherwise check global setting
    if (showVelocitiesIsON || isFollowed) {
      // Calculate magnitude of velocity from dx and dy properties for a stable reading
      const velocityMagnitude = Math.sqrt(this.dx ** 2 + this.dy ** 2);
      const velocityKMPS = `${(velocityMagnitude).toFixed(2)}km/s`;
      const velocityMPS = `${(velocityMagnitude * 1000).toFixed(2)}m/s`;
    
      // Display the magnitude of velocity
      const velocityText = velocityUnit === 'm/s' ? velocityMPS : velocityKMPS;
      const velocityTextWidth = ctx.measureText(velocityText).width;
      const fontSize = zoomFactor > 0.5 ? 12 / zoomFactor : 12 * 0.6/ zoomFactor;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = isFollowed ? 'rgba(0, 255, 255, 1)' : this.textColor; // Cyan for followed body velocity
      ctx.fillText(
        velocityText,
        this.x - camera.x - velocityTextWidth / 2, 
        this.y - camera.y - this.radius - (6/zoomFactor)
      );
    }
  
    // Update previous position for the next frame
    this.prevX = this.x;
    this.prevY = this.y;
  }

  /**
   * Legacy draw method for fallback to Canvas 2D rendering.
   * @deprecated Use WebGL rendering instead with drawLabels for UI elements.
   */
  draw() {
    // Check if this body is currently being followed
    const isFollowed = cameraFollow && cameraFollowingIndex !== -1 && 
                      celestialBodies[cameraFollowingIndex] === this;
    // Build path cache if needed (radius change or first draw)
    if (this._cachedRadius !== this.radius || !this._circlePath) {
      this._circlePath = new Path2D();
      this._circlePath.arc(0, 0, this.radius, 0, Math.PI * 2);
      this._cachedRadius = this.radius;
    }

    ctx.save();
    ctx.translate(this.x - camera.x, this.y - camera.y);
    
    // Draw back part of accretion disk for black holes (behind the body)
    this.drawAccretionDisk();
    
    // Add glow effect for followed body or stars
    if (isFollowed) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 15 / zoomFactor;
    } else if (this.bodyType === 'star') {
      // Add much stronger glow to all stars
      ctx.shadowColor = this.color.replace('1)', '0.9)'); // Use star color with higher opacity
      ctx.shadowBlur = this.radius * 2.5 / zoomFactor; // Much larger glow radius
    }
    
    ctx.fillStyle = this.color;
    
    ctx.fill(this._circlePath);
    
    // Reset shadow for other elements
    if (isFollowed || this.bodyType === 'star') {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }
    
    // Draw front part of accretion disk for black holes (in front of the body)
    this.drawAccretionDiskFront();
    
    if (this.color === 'rgba(0, 0, 0, 1)') {
      ctx.strokeStyle = this.trailColor;
      ctx.lineWidth = 2;
      ctx.stroke(this._circlePath);
    }
    
    // Draw pin indicator if body is pinned
    if (this.isPinned) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.lineWidth = 3 / zoomFactor;
      ctx.stroke(this._circlePath);
      
      // Draw pin symbol (a small line with a circle at the top)
      const pinHeight = this.radius * 1.5;
      const pinRadius = this.radius * 0.3;
      
      ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
      ctx.lineWidth = 2 / zoomFactor;
      ctx.beginPath();
      // Pin shaft
      ctx.moveTo(0, -this.radius - pinHeight);
      ctx.lineTo(0, -this.radius);
      ctx.stroke();
      
      // Pin head
      ctx.fillStyle = 'rgba(255, 255, 0, 1)';
      ctx.beginPath();
      ctx.arc(0, -this.radius - pinHeight, pinRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  
    // Draw labels using the new method
    this.drawLabels(isFollowed);
  }

  pin() {
    this.isPinned = true;
    this.pinnedX = this.x;
    this.pinnedY = this.y;
    // Reset velocity when pinned
    this.dx = 0;
    this.dy = 0;
  }

  unpin() {
    this.isPinned = false;
    this.pinnedX = null;
    this.pinnedY = null;
  }

  togglePin() {
    if (this.isPinned) {
      this.unpin();
    } else {
      this.pin();
    }
  }

  /**
   * Updates the celestial body's position and velocity based on gravitational forces.
   * Uses Leapfrog integration for energy conservation and orbital stability.
   * @param {number} dt - Time step for integration (accounts for frame rate and time scaling)
   */
  update(dt = 1.0) {
    // If pinned, maintain position and reset velocities
    if (this.isPinned) {
      this.x = this.pinnedX;
      this.y = this.pinnedY;
      this.dx = 0;
      this.dy = 0;
      return;
    }

    // Leapfrog integration method for energy conservation
    // This method is symplectic and maintains orbital stability much better than Euler
    // Now properly scaled by delta time for frame rate independence
    
    // Update velocity first using current acceleration
    this.dx += this.ax * dt;
    this.dy += this.ay * dt;
    
    // Then update position using the new velocity
    this.x += this.dx * dt;
    this.y += this.dy * dt;
  }
}



// ----- classes/BackgroundStarsClass.js -----


/**
 * Represents a background star in the space simulation with parallax scrolling effect.
 * @class
 * @property {number} x - The x coordinate of the star
 * @property {number} y - The y coordinate of the star
 * @property {number} z - The z-depth of the star (affects size and parallax movement)
 * @property {number} opacity - The opacity of the star (0-0.5)
 * @property {number} speed - The movement speed of the star
 */
class BackgroundStar {
  /**
   * Creates a new background star with random position, depth, opacity, and speed.
   * Star's initial position is randomly placed within the window dimensions.
   * @constructor
   */
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = Math.random() * window.innerHeight;
    this.z = Math.random() * 5 + 1;
    this.opacity = Math.random() * 0.5;
    this.speed = Math.random() * 2 + 0.5;
    this._cachedZ = null;
    this._starPath = null;
  }

  /**
   * Draws the star on the star canvas with parallax effect based on camera position.
   * Handles wrapping of stars when they move outside the viewport.
   * Star size is determined by its z-depth value.
   */
  draw() {
    let adjustedX = this.x - (camera.x / (this.z*8));
    let adjustedY = this.y - (camera.y / (this.z*8));

    if (adjustedX < 0) {
      adjustedX = window.innerWidth;
      this.x = adjustedX + (camera.x / (this.z*8));
    }
    if (adjustedX > window.innerWidth) {
      adjustedX = 0;
      this.x = adjustedX + (camera.x / (this.z*8));
    }
    if (adjustedY < 0) {
      adjustedY = window.innerHeight;
      this.y = adjustedY + (camera.y / (this.z*8));
    }
    if (adjustedY > window.innerHeight) {
      adjustedY = 0;
      this.y = adjustedY + (camera.y / (this.z*8));
    }

    // Build path cache if z (size) changed or not built
    if (this._cachedZ !== this.z) {
      this._starPath = new Path2D();
      this._starPath.arc(0, 0, this.z/3, 0, Math.PI * 2);
      this._cachedZ = this.z;
    }
    starCtx.save();
    starCtx.translate(adjustedX, adjustedY);
    starCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    starCtx.fill(this._starPath);
    starCtx.restore();
  }
}



// ----- classes/TrailManagerClass.js -----


// Trail manager for handling all celestial body trails

// Trail manager for handling all celestial body trails with view culling & Path2D batching
class TrailManager {
  /**
   * Creates a trail manager that handles trails for all bodies
   * @param {Object} params Configuration parameters
   * @param {CanvasRenderingContext2D} params.context canvas context to draw on
   */
  constructor({ context }) {
    this.context = context;
    
    // Constants for trail capacity
    this.MAX_POINTS = 500_000; // 500,000 points per trail
    
    /**
     * @type {Map<string, {
     * positions: Float32Array,
     * head: number,      // Index where next point will be written
     * isFull: boolean,   // Whether buffer has wrapped around
     * color: string
     * }>} trails
     */
  this.trails = new Map();

  // Track previous head positions for change detection (bodyId -> lastHeadIndex)
  this._lastHeads = new Map();

    // Throttling state
    this._lastRenderTime = 0; // ms timestamp of last trail draw
    this._baseRenderInterval = 100; // default 10Hz
    this._renderInterval = this._baseRenderInterval;
    this._lastCameraX = null;
    this._lastCameraY = null;

    // Adaptive decimation configuration
    this._minPixelSeg = 2;      // Minimum on-screen pixel distance between rendered trail vertices
    this._maxDecimation = 8;    // Hard cap on skipping factor
  }

  /**
   * Initializes or gets a trail for a celestial body
   * @param {string} bodyId Unique identifier for the body
   * @param {string} trailColor Color of the trail
   */
  initializeTrail(bodyId, trailColor) {
    if (!this.trails.has(bodyId)) {
      this.trails.set(bodyId, {
        positions: new Float32Array(this.MAX_POINTS * 2), // x,y pairs
        head: 0,
        isFull: false,
        color: trailColor,
        lastDrawnHead: -1 // for point-change detection
      });
    }
  }

  /**
   * Updates the trail for a specific body using circular buffer
   * @param {string} bodyId Unique identifier for the body
   * @param {number} x Current x position
   * @param {number} y Current y position
   * @param {number} dx Current x velocity
   * @param {number} dy Current y velocity
   */
  updateTrail(bodyId, x, y, dx, dy) {
    const trail = this.trails.get(bodyId);
    if (!trail) return;

    const positions = trail.positions;
    
    // Calculate speed and set dynamic threshold
    const speed = Math.sqrt(dx * dx + dy * dy);
    const threshold = Math.min(speed * 0.1, 1); // Adjust multiplier for desired sensitivity

    // Get previous point indices for curve checking
    let prevIdx = (trail.head - 2 + positions.length) % positions.length;
    let prevPrevIdx = (trail.head - 4 + positions.length) % positions.length;

    // Check if we have enough points to perform curve optimization
    if (trail.isFull || trail.head >= 4) {
      const p1x = positions[prevPrevIdx];
      const p1y = positions[prevPrevIdx + 1];
      const p2x = positions[prevIdx];
      const p2y = positions[prevIdx + 1];

      // Calculate the area of the triangle formed by the points
      const area = Math.abs((p2x - p1x) * (y - p1y) - (x - p1x) * (p2y - p1y));

      // If points form a near-straight line, overwrite the middle point
      if (area < threshold) {
        positions[prevIdx] = x;
        positions[prevIdx + 1] = y;
        return;
      }
    }

    // Add new point
    positions[trail.head] = x;
    positions[trail.head + 1] = y;
    
    // Update head position
    trail.head = (trail.head + 2) % positions.length;
    
    // Mark as full if we've wrapped around
    if (trail.head === 0) {
      trail.isFull = true;
    }
  }

  /**
   * Draws all trails
   * @param {Object} camera Camera position
   */
  drawTrails(camera) {
    if (!showTrailsIsON) return;

    // Decide dynamic render interval based on zoom & body/trail count
    const bodyCount = celestialBodies.length || 1;
    // More bodies or high zoom => lower interval (more frequent updates)
    const zoomWeight = Math.min(zoomFactor, 2); // clamp influence
    const densityFactor = Math.min(bodyCount / 200, 1); // saturate at 200 bodies
    // Interpolate between 30ms (≈33fps) and base interval * 2 depending on zoom & density
    const fastBound = 30;
    const slowBound = this._baseRenderInterval * 2; // allow slower than base if far out & sparse
    // When zoomed in & dense -> fastBound, else approach slowBound
    const blend = 1 - ((zoomWeight / 2) * 0.6 + densityFactor * 0.4); // 0..1
    this._renderInterval = fastBound + (slowBound - fastBound) * Math.min(Math.max(blend, 0), 1);

    const now = performance.now();
    const cameraMoved = this._lastCameraX !== camera.x || this._lastCameraY !== camera.y;

    // Determine if any trail had new points since last draw (point change detection)
    let trailsChanged = false;
    this.trails.forEach((trail, id) => {
      const last = this._lastHeads.get(id);
      if (last !== trail.head) {
        trailsChanged = true;
      }
    });

    this._lastRenderTime = now;
    this._lastCameraX = camera.x;
    this._lastCameraY = camera.y;

    // Prepare world-space visible rectangle with margin
    const topLeftWorld = screenToWorldCoordinates(0, 0);
    const bottomRightWorld = screenToWorldCoordinates(canvas.width, canvas.height);
    const margin = 120 / zoomFactor;
    const visMinX = topLeftWorld.x - margin;
    const visMinY = topLeftWorld.y - margin;
    const visMaxX = bottomRightWorld.x + margin;
    const visMaxY = bottomRightWorld.y + margin;

    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.context.save();
    this.context.setLineDash([6, 2]);
    this.context.lineWidth = 1;

    // Adaptive decimation: compute skip factor so that successive vertices are at least _minPixelSeg apart
    const decimationBase = Math.max(1, Math.round(1 / Math.max(zoomFactor, 0.0001))); // more skip when zoomed out

    this.trails.forEach((trail, id) => {
      const positions = trail.positions;
      const total = trail.isFull ? positions.length : trail.head;
      if (total < 4) { this._lastHeads.set(id, trail.head); return; }
      const startIdx = trail.isFull ? trail.head : 0;

      const path = new Path2D();
      let drawing = false;
      let lastScreenX = 0, lastScreenY = 0;
      let skipAccumulator = 0;
      let lastPlottedSX = null, lastPlottedSY = null;

      // Dynamic decimation factor refined by on-screen segment length
      const maxSkip = this._maxDecimation;
      const decimation = Math.min(decimationBase, maxSkip);

      for (let i = 0; i < total; i += 2) {
        // Apply coarse decimation first
        if (decimation > 1 && ((i/2) % decimation) !== 0) continue;
        const idx = (startIdx + i) % positions.length;
        const wx = positions[idx];
        const wy = positions[idx + 1];
        const inView = wx >= visMinX && wx <= visMaxX && wy >= visMinY && wy <= visMaxY;
        if (!inView) { drawing = false; continue; }
        const { x: sx, y: sy } = worldToScreenCoordinates(wx, wy);
        if (lastPlottedSX !== null) {
          const dx = sx - lastPlottedSX;
          const dy = sy - lastPlottedSY;
          const distSq = dx*dx + dy*dy;
          if (distSq < this._minPixelSeg * this._minPixelSeg) {
            // Too close on screen; skip to avoid oversampling
            continue;
          }
        }
        if (!drawing) { path.moveTo(sx, sy); drawing = true; }
        else { path.lineTo(sx, sy); }
        lastPlottedSX = sx; lastPlottedSY = sy;
        lastScreenX = sx; lastScreenY = sy;
      }

      this.context.strokeStyle = trail.color;
      this.context.stroke(path);
      this._lastHeads.set(id, trail.head);

      if (showDebugPoints) {
        this.context.fillStyle = trail.color;
        for (let i = 0; i < total; i += 4) {
          const idx = (startIdx + i) % positions.length;
          const wx = positions[idx];
          const wy = positions[idx + 1];
          if (wx < visMinX || wx > visMaxX || wy < visMinY || wy > visMaxY) continue;
          const { x: sx, y: sy } = worldToScreenCoordinates(wx, wy);
          this.context.beginPath();
          this.context.arc(sx, sy, 2, 0, Math.PI * 2);
          this.context.fill();
        }
      }
    });

    this.context.setLineDash([]);
    this.context.restore();
  }

  /**
   * Clears trail for a specific body
   * @param {string} bodyId Unique identifier for the body
   */
  clearTrail(bodyId) {
    this.trails.delete(bodyId);
  }

  /**
   * Clears all trails
   */
  clearAllTrails() {
    this.trails.clear();
  }
}



// ----- classes/PhysicsSystem.js -----



/**
 * Represents a node in the Barnes-Hut quad tree
 */
class BHNode {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.children = [null, null, null, null]; // NW, NE, SW, SE
    this.body = null;
    this.totalMass = 0;
    this.centerOfMassX = 0;
    this.centerOfMassY = 0;
    this.isLeaf = true;
    this.bodyCount = 0;
  }

  /**
   * Checks if a point is within this node's boundaries
   */
  contains(x, y) {
    return (x >= this.x && x < this.x + this.width &&
            y >= this.y && y < this.y + this.height);
  }

  /**
   * Subdivides this node into four quadrants
   */
  subdivide() {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    // Add small overlap to prevent edge case issues
    const overlap = Math.min(halfWidth, halfHeight) * 0.001;

    this.children[0] = new BHNode(this.x - overlap, this.y - overlap, 
                                 halfWidth + overlap * 2, halfHeight + overlap * 2);
    this.children[1] = new BHNode(this.x + halfWidth - overlap, this.y - overlap,
                                 halfWidth + overlap * 2, halfHeight + overlap * 2);
    this.children[2] = new BHNode(this.x - overlap, this.y + halfHeight - overlap,
                                 halfWidth + overlap * 2, halfHeight + overlap * 2);
    this.children[3] = new BHNode(this.x + halfWidth - overlap, this.y + halfHeight - overlap,
                                 halfWidth + overlap * 2, halfHeight + overlap * 2);
    
    this.isLeaf = false;
  }

  /**
   * Gets the quadrant index for a point
   */
  getQuadrantIndex(x, y) {
    const midX = this.x + this.width / 2;
    const midY = this.y + this.height / 2;
    
    if (y < midY) {
      return x < midX ? 0 : 1; // NW : NE
    } else {
      return x < midX ? 2 : 3; // SW : SE
    }
  }
}

/**
 * Barnes-Hut tree for efficient gravity calculations
 */
class BarnesHutTree {
  constructor(x, y, size) {
    this.theta = 0.9;
    this.root = new BHNode(x, y, size, size);
    this.minDistance = 20; // Minimum distance for force calculation
    this.softening = 100; // Softening parameter for close encounters
    this.adaptiveTheta = false; // Enable adaptive multipole acceptance
  }

  /**
   * Inserts a celestial body into the tree
   */
  insert(body) {
    this._insertBody(this.root, body);
  }

  _insertBody(node, body) {
    // Update node's mass and center of mass
    const totalMass = node.totalMass + body.weight;
    const centerX = (node.centerOfMassX * node.totalMass + body.x * body.weight) / totalMass;
    const centerY = (node.centerOfMassY * node.totalMass + body.y * body.weight) / totalMass;
    
    node.totalMass = totalMass;
    node.centerOfMassX = centerX;
    node.centerOfMassY = centerY;

    // If node is empty, put the body here
    if (node.totalMass === body.weight) {
      node.body = body;
      return;
    }

    // If this is a leaf node but already contains a body, subdivide
    if (node.isLeaf && node.body !== null) {
      const oldBody = node.body;
      node.body = null;
      node.subdivide();
      this._insertBody(node.children[node.getQuadrantIndex(oldBody.x, oldBody.y)], oldBody);
    }

    // If this is not a leaf node, insert into appropriate quadrant
    if (!node.isLeaf) {
      const quadrantIndex = node.getQuadrantIndex(body.x, body.y);
      this._insertBody(node.children[quadrantIndex], body);
    }
  }

  /**
   * Calculates gravitational forces on a body
   */
  calculateForces(body) {
    return this._calculateForces(this.root, body);
  }

  _calculateForces(node, body) {
    if (node === null || node.totalMass === 0 || node.body === body) {
      return { ax: 0, ay: 0 };
    }

    const dx = node.centerOfMassX - body.x;
    const dy = node.centerOfMassY - body.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Apply softening to prevent numerical instabilities
    const softenedDistance = Math.sqrt(distance * distance + this.softening * this.softening);

    // Adaptive multipole acceptance criterion
    let effectiveTheta = this.theta;
    if (this.adaptiveTheta) {
      // Adjust theta based on the mass ratio and distance
      const massRatio = node.totalMass / body.weight;
      effectiveTheta = this.theta * (1 + Math.log10(massRatio)) / 
                      (1 + Math.abs(Math.log10(distance / this.root.width)));
    }

    if (node.isLeaf || (node.width / softenedDistance) < effectiveTheta) {
      const G = 0.1; // Gravitational constant
      if (softenedDistance < this.minDistance) {
        return { ax: 0, ay: 0 };
      }

      // Use softened force calculation
      const force = (G * body.weight * node.totalMass) / 
                   (softenedDistance * softenedDistance * softenedDistance);

      return {
        ax: force * dx,
        ay: force * dy
      };
    }

    // Recursively calculate forces with improved accuracy
    let totalForce = { ax: 0, ay: 0 };
    for (const child of node.children) {
      const force = this._calculateForces(child, body);
      totalForce.ax += force.ax;
      totalForce.ay += force.ay;
    }

    return totalForce;
  }

  /**
   * Find potential collision candidates within a certain radius
   * @param {CelestialBody} body - The body to check for potential collisions
   * @param {number} searchRadius - Radius to search for potential collisions
   * @returns {Array} Potential collision candidates
   */
  findPotentialCollisions(body, searchRadius) {
    const candidates = [];
    this._findCollisionCandidates(this.root, body, searchRadius, candidates);
    return candidates;
  }

  _findCollisionCandidates(node, body, searchRadius, candidates) {
    if (node === null) return;

    // Check if the node's bounding box intersects with the search area
    const nodeRight = node.x + node.width;
    const nodeBottom = node.y + node.height;
    const bodyRight = body.x + searchRadius;
    const bodyBottom = body.y + searchRadius;

    const intersects = 
      node.x < bodyRight && 
      nodeRight > body.x - searchRadius && 
      node.y < bodyBottom && 
      nodeBottom > body.y - searchRadius;

    if (!intersects) return;

    // If it's a leaf node with a body
    if (node.isLeaf && node.body && node.body !== body) {
      candidates.push(node.body);
      return;
    }

    // Recursively check child nodes
    for (const child of node.children) {
      this._findCollisionCandidates(child, body, searchRadius, candidates);
    }
  }

  /**
   * Clears the tree
   */
  clear() {
    this.root = new BHNode(this.root.x, this.root.y, this.root.width, this.root.height);
  }
}

/**
 * Physics system using Barnes-Hut algorithm
 */
class PhysicsSystem {
  constructor() {
    this.bhTree = null;
  }

  /**
   * Updates physics for all bodies using Barnes-Hut algorithm
   */
  update(bodies, checkCollisions, timeStep = 1.0) {
    // Find bounds of all bodies
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const body of bodies) {
      minX = Math.min(minX, body.x);
      minY = Math.min(minY, body.y);
      maxX = Math.max(maxX, body.x);
      maxY = Math.max(maxY, body.y);
    }

    // Create a square region that encompasses all bodies
    const width = maxX - minX;
    const height = maxY - minY;
    const size = Math.max(width, height) * 1.2; // Increased padding for better boundary handling

    // Create new Barnes-Hut tree instance
    this.bhTree = new BarnesHutTree(
      minX - size * 0.1, 
      minY - size * 0.1, 
      size
    );

    // Batch insert bodies for better performance
    for (const body of bodies) {
      this.bhTree.insert(body);
    }

    // Calculate forces with temporal coherence
    const forces = new Map();
    for (const body of bodies) {
      forces.set(body, this.bhTree.calculateForces(body));
    }

    // Apply forces in a separate pass to maintain consistency
    for (const body of bodies) {
      const force = forces.get(body);
      
      // If body is pinned, don't apply forces to it (but it still exerts forces on others)
      if (body.isPinned) {
        body.ax = 0;
        body.ay = 0;
      } else {
        body.ax = force.ax / body.weight;
        body.ay = force.ay / body.weight;
      }
    }

    // Handle collisions if enabled
    if (checkCollisions) {
      this._handleCollisions(bodies);
    }
  }

  /**
   * Draws the Barnes-Hut tree visualization
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   * @param {Object} camera - The camera object with x, y positions
   * @param {number} zoomFactor - Current zoom level
   * @param {Object} options - Drawing options
   * @param {boolean} options.showNodes - Whether to draw quad boundaries
   * @param {boolean} options.showCenterOfMass - Whether to draw center of mass indicators
   */
  drawTree(ctx, camera, zoomFactor, options = { showNodes: true, showCenterOfMass: true }) {
    if (!this.bhTree || !this.bhTree.root) return;
    if (!options.showNodes && !options.showCenterOfMass) return;
    
    this._drawNode(ctx, this.bhTree.root, camera, zoomFactor, 0, options);
  }

  /**
   * Recursively draws a node and its children
   * @param {CanvasRenderingContext2D} ctx - The canvas context
   * @param {BHNode} node - The current node to draw
   * @param {Object} camera - The camera object
   * @param {number} zoomFactor - Current zoom level
   * @param {number} depth - Current tree depth for coloring
   * @param {Object} options - Drawing options
   */
  _drawNode(ctx, node, camera, zoomFactor, depth, options) {
    if (!node) return;

    // Calculate screen position with camera offset
    const screenX = (node.x - camera.x) * zoomFactor + ctx.canvas.width / 2 * (1 - zoomFactor);
    const screenY = (node.y - camera.y) * zoomFactor + ctx.canvas.height / 2 * (1 - zoomFactor);
    const screenWidth = node.width * zoomFactor;
    const screenHeight = node.height * zoomFactor;

    // Color based on depth - creates a nice gradient effect
    const hue = (depth * 40) % 360;
    const saturation = 70;
    const lightness = 50 + (node.isLeaf ? 10 : 0);
    
    // Draw quad boundary if enabled
    if (options.showNodes) {
      ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX, screenY, screenWidth, screenHeight);
    }

    // Draw center of mass if node has mass and option is enabled
    if (options.showCenterOfMass && node.totalMass > 0) {
      const comScreenX = (node.centerOfMassX - camera.x) * zoomFactor + ctx.canvas.width / 2 * (1 - zoomFactor);
      const comScreenY = (node.centerOfMassY - camera.y) * zoomFactor + ctx.canvas.height / 2 * (1 - zoomFactor);
      
      // Size based on depth (larger for higher-level nodes) and mass
      // Higher level nodes (lower depth) are bigger, leaf nodes are smallest
      const depthFactor = Math.max(1, 8 - depth); // 8 at root, decreases with depth
      const massFactor = Math.log10(node.totalMass + 1) * 0.5;
      const comSize = node.isLeaf ? 2 : Math.max(3, Math.min(12, depthFactor + massFactor));
      
      // Draw center of mass point
      ctx.fillStyle = node.isLeaf 
        ? `hsla(${hue}, 90%, 70%, 0.9)` 
        : `hsla(0, 0%, 100%, 0.8)`;
      ctx.beginPath();
      ctx.arc(comScreenX, comScreenY, comSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw small cross at center of mass for better visibility (non-leaf nodes only)
      if (!node.isLeaf) {
        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(comScreenX - comSize - 2, comScreenY);
        ctx.lineTo(comScreenX + comSize + 2, comScreenY);
        ctx.moveTo(comScreenX, comScreenY - comSize - 2);
        ctx.lineTo(comScreenX, comScreenY + comSize + 2);
        ctx.stroke();
      }
    }

    // Recursively draw children
    if (!node.isLeaf) {
      for (const child of node.children) {
        this._drawNode(ctx, child, camera, zoomFactor, depth + 1, options);
      }
    }
  }

  /**
   * Handles collision detection using Barnes-Hut tree
   */
  _handleCollisions(bodies) {
    const collisionChecked = new Set();

    for (const body of bodies) {
      const searchRadius = body.radius * 2; // Search radius based on body size

      // Find potential collision candidates
      const candidates = this.bhTree.findPotentialCollisions(body, searchRadius);

      // Check actual collisions only for candidates
      for (const otherBody of candidates) {
        const collisionPair = [body.id, otherBody.id].sort().join('-');
        if (collisionChecked.has(collisionPair)) continue;

        const dx = body.x - otherBody.x;
        const dy = body.y - otherBody.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < body.radius + otherBody.radius) {
          bodyCollide(body, otherBody);
          collisionChecked.add(collisionPair);
        }
      }
    }
  }
}




// ----- classes/WebGLRenderer.js -----


/**
 * WebGL2 Renderer for celestial bodies using instanced rendering.
 * Draws ALL bodies in a single draw call for maximum performance.
 */
class WebGLRenderer {
  /**
   * Creates a WebGL renderer
   * @param {HTMLCanvasElement} canvas - The canvas element to render to
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false 
    });
    
    if (!this.gl) {
      console.warn('WebGL2 not supported, falling back to WebGL1');
      this.gl = canvas.getContext('webgl', { 
        antialias: true, 
        alpha: true,
        premultipliedAlpha: false 
      });
      this.isWebGL2 = false;
    } else {
      this.isWebGL2 = true;
    }
    
    if (!this.gl) {
      throw new Error('WebGL not supported');
    }
    
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    // Maximum instances we can render at once
    this.maxInstances = 10000;
    
    // Typed arrays for instance data (reused each frame)
    this.instancePositions = new Float32Array(this.maxInstances * 2);
    this.instanceColors = new Float32Array(this.maxInstances * 4);
    this.instanceRadii = new Float32Array(this.maxInstances);
    this.instanceGlowIntensities = new Float32Array(this.maxInstances);
    this.instanceGlowColors = new Float32Array(this.maxInstances * 4);
    
    // Trail rendering - max vertices for all trails combined
    // Each line segment = 6 vertices (2 triangles forming a quad)
    this.maxTrailVertices = 600000; // ~100k line segments
    this.trailPositions = new Float32Array(this.maxTrailVertices * 2);
    this.trailColors = new Float32Array(this.maxTrailVertices * 4);
    
    // Initialize shaders and buffers
    this._initShaders();
    this._initBuffers();
    
    // Transformation matrices
    this.projectionMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);
    
    // Initialize projection matrix with current canvas size
    this._updateProjectionMatrix();
    
    // Set initial viewport
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Initialize WebGL shaders for instanced rendering
   */
  _initShaders() {
    const gl = this.gl;
    
    // Instanced vertex shader - processes per-instance data
    const instancedVertexShaderSource = this.isWebGL2 ? `#version 300 es
      in vec2 a_position;
      in vec2 a_texCoord;
      
      // Per-instance attributes
      in vec2 a_instancePosition;
      in vec4 a_instanceColor;
      in float a_instanceRadius;
      in float a_instanceGlowIntensity;
      in vec4 a_instanceGlowColor;
      
      uniform mat4 u_projection;
      uniform mat4 u_view;
      
      out vec2 v_texCoord;
      out vec4 v_color;
      out float v_glowIntensity;
      out vec4 v_glowColor;
      out float v_bodyRadiusRatio; // Ratio of body radius to expanded radius
      
      void main() {
        // Expand radius to include glow
        float expandedRadius = a_instanceGlowIntensity > 0.0 ? 
          a_instanceRadius * (1.0 + a_instanceGlowIntensity) : a_instanceRadius;
        
        vec2 scaledPos = a_position * expandedRadius;
        vec2 worldPos = scaledPos + a_instancePosition;
        gl_Position = u_projection * u_view * vec4(worldPos, 0.0, 1.0);
        
        v_texCoord = a_texCoord;
        v_color = a_instanceColor;
        v_glowIntensity = a_instanceGlowIntensity;
        v_glowColor = a_instanceGlowColor;
        // Calculate the ratio: where does the body end within the expanded quad
        v_bodyRadiusRatio = a_instanceGlowIntensity > 0.0 ? 
          1.0 / (1.0 + a_instanceGlowIntensity) : 1.0;
      }
    ` : `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      
      uniform mat4 u_projection;
      uniform mat4 u_view;
      uniform vec2 u_translation;
      uniform float u_radius;
      uniform float u_glowIntensity;
      
      varying vec2 v_texCoord;
      varying float v_bodyRadiusRatio;
      
      void main() {
        float expandedRadius = u_glowIntensity > 0.0 ? u_radius * (1.0 + u_glowIntensity) : u_radius;
        vec2 scaledPos = a_position * expandedRadius;
        vec2 worldPos = scaledPos + u_translation;
        gl_Position = u_projection * u_view * vec4(worldPos, 0.0, 1.0);
        v_texCoord = a_texCoord;
        v_bodyRadiusRatio = u_glowIntensity > 0.0 ? 1.0 / (1.0 + u_glowIntensity) : 1.0;
      }
    `;
    
    // Instanced fragment shader
    const instancedFragmentShaderSource = this.isWebGL2 ? `#version 300 es
      precision mediump float;
      
      in vec2 v_texCoord;
      in vec4 v_color;
      in float v_glowIntensity;
      in vec4 v_glowColor;
      in float v_bodyRadiusRatio;
      
      out vec4 fragColor;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(v_texCoord, center) * 2.0;
        
        // Body ends at v_bodyRadiusRatio, glow extends from there to 1.0
        float bodyEdge = v_bodyRadiusRatio;
        
        if (dist > 1.0) {
          // Outside the quad entirely
          discard;
        } else if (dist > bodyEdge) {
          // Glow region (between body edge and quad edge)
          if (v_glowIntensity > 0.0) {
            float glowDist = (dist - bodyEdge) / (1.0 - bodyEdge);
            float glowAlpha = pow(max(0.0, 1.0 - glowDist), 2.0) * v_glowColor.a;
            fragColor = vec4(v_glowColor.rgb, glowAlpha * 0.6);
          } else {
            discard;
          }
        } else {
          // Body region - smooth edge
          float edgeSoftness = 0.02 / bodyEdge;
          float alpha = 1.0 - smoothstep(bodyEdge - edgeSoftness, bodyEdge, dist);
          fragColor = vec4(v_color.rgb, v_color.a * alpha);
        }
      }
    ` : `
      precision mediump float;
      
      uniform vec4 u_color;
      uniform float u_glowIntensity;
      uniform vec4 u_glowColor;
      
      varying vec2 v_texCoord;
      varying float v_bodyRadiusRatio;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(v_texCoord, center) * 2.0;
        
        float bodyEdge = v_bodyRadiusRatio;
        
        if (dist > 1.0) {
          discard;
        } else if (dist > bodyEdge) {
          if (u_glowIntensity > 0.0) {
            float glowDist = (dist - bodyEdge) / (1.0 - bodyEdge);
            float glowAlpha = pow(max(0.0, 1.0 - glowDist), 2.0) * u_glowColor.a;
            gl_FragColor = vec4(u_glowColor.rgb, glowAlpha * 0.6);
          } else {
            discard;
          }
        } else {
          float edgeSoftness = 0.02 / bodyEdge;
          float alpha = 1.0 - smoothstep(bodyEdge - edgeSoftness, bodyEdge, dist);
          gl_FragColor = vec4(u_color.rgb, u_color.a * alpha);
        }
      }
    `;
    
    // Accretion disk shader (still individual for complexity)
    const accretionVertexShaderSource = this.isWebGL2 ? `#version 300 es
      in vec2 a_position;
      in vec2 a_texCoord;
      
      uniform mat4 u_projection;
      uniform mat4 u_view;
      uniform vec2 u_translation;
      uniform float u_radius;
      
      out vec2 v_texCoord;
      
      void main() {
        vec2 scaledPos = a_position * u_radius;
        vec2 worldPos = scaledPos + u_translation;
        gl_Position = u_projection * u_view * vec4(worldPos, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    ` : `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      
      uniform mat4 u_projection;
      uniform mat4 u_view;
      uniform vec2 u_translation;
      uniform float u_radius;
      
      varying vec2 v_texCoord;
      
      void main() {
        vec2 scaledPos = a_position * u_radius;
        vec2 worldPos = scaledPos + u_translation;
        gl_Position = u_projection * u_view * vec4(worldPos, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;
    
    const accretionFragmentShaderSource = this.isWebGL2 ? `#version 300 es
      precision mediump float;
      
      uniform float u_innerRadius;
      uniform float u_diskHeight;
      uniform int u_isBack;
      
      in vec2 v_texCoord;
      out vec4 fragColor;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        vec2 pos = (v_texCoord - center) * 2.0;
        
        float scaledY = pos.y / u_diskHeight;
        float dist = sqrt(pos.x * pos.x + scaledY * scaledY);
        
        if (dist < u_innerRadius || dist > 1.0) {
          discard;
        }
        
        if (u_isBack == 1 && pos.y < 0.0) {
          discard;
        }
        if (u_isBack == 0 && pos.y > 0.0) {
          discard;
        }
        
        float t = (dist - u_innerRadius) / (1.0 - u_innerRadius);
        
        vec4 innerColor = vec4(1.0, 0.55, 0.0, 0.8);
        vec4 midColor1 = vec4(1.0, 0.31, 0.0, 0.6);
        vec4 midColor2 = vec4(0.47, 0.16, 0.0, 0.4);
        vec4 outerColor = vec4(0.24, 0.08, 0.0, 0.1);
        
        vec4 color;
        if (t < 0.3) {
          color = mix(innerColor, midColor1, t / 0.3);
        } else if (t < 0.6) {
          color = mix(midColor1, midColor2, (t - 0.3) / 0.3);
        } else {
          color = mix(midColor2, outerColor, (t - 0.6) / 0.4);
        }
        
        fragColor = vec4(color.rgb, color.a * 0.9);
      }
    ` : `
      precision mediump float;
      
      uniform float u_innerRadius;
      uniform float u_diskHeight;
      uniform int u_isBack;
      
      varying vec2 v_texCoord;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        vec2 pos = (v_texCoord - center) * 2.0;
        
        float scaledY = pos.y / u_diskHeight;
        float dist = sqrt(pos.x * pos.x + scaledY * scaledY);
        
        if (dist < u_innerRadius || dist > 1.0) discard;
        if (u_isBack == 1 && pos.y < 0.0) discard;
        if (u_isBack == 0 && pos.y > 0.0) discard;
        
        float t = (dist - u_innerRadius) / (1.0 - u_innerRadius);
        
        vec4 innerColor = vec4(1.0, 0.55, 0.0, 0.8);
        vec4 midColor1 = vec4(1.0, 0.31, 0.0, 0.6);
        vec4 midColor2 = vec4(0.47, 0.16, 0.0, 0.4);
        vec4 outerColor = vec4(0.24, 0.08, 0.0, 0.1);
        
        vec4 color;
        if (t < 0.3) color = mix(innerColor, midColor1, t / 0.3);
        else if (t < 0.6) color = mix(midColor1, midColor2, (t - 0.3) / 0.3);
        else color = mix(midColor2, outerColor, (t - 0.6) / 0.4);
        
        gl_FragColor = vec4(color.rgb, color.a * 0.9);
      }
    `;
    
    // Line shader for trails - simple vertex coloring
    const lineVertexShaderSource = this.isWebGL2 ? `#version 300 es
      in vec2 a_position;
      in vec4 a_color;
      
      uniform mat4 u_projection;
      uniform mat4 u_view;
      
      out vec4 v_color;
      
      void main() {
        gl_Position = u_projection * u_view * vec4(a_position, 0.0, 1.0);
        v_color = a_color;
      }
    ` : `
      attribute vec2 a_position;
      attribute vec4 a_color;
      
      uniform mat4 u_projection;
      uniform mat4 u_view;
      
      varying vec4 v_color;
      
      void main() {
        gl_Position = u_projection * u_view * vec4(a_position, 0.0, 1.0);
        v_color = a_color;
      }
    `;
    
    const lineFragmentShaderSource = this.isWebGL2 ? `#version 300 es
      precision mediump float;
      
      in vec4 v_color;
      out vec4 fragColor;
      
      void main() {
        fragColor = v_color;
      }
    ` : `
      precision mediump float;
      
      varying vec4 v_color;
      
      void main() {
        gl_FragColor = v_color;
      }
    `;
    
    // Ring shader for strokes and pin indicators
    const ringFragmentShaderSource = this.isWebGL2 ? `#version 300 es
      precision mediump float;
      
      uniform vec4 u_color;
      uniform float u_thickness;
      
      in vec2 v_texCoord;
      out vec4 fragColor;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(v_texCoord, center) * 2.0;
        float innerRadius = 1.0 - u_thickness;
        
        if (dist > 1.0 || dist < innerRadius) {
          discard;
        }
        
        fragColor = u_color;
      }
    ` : `
      precision mediump float;
      
      uniform vec4 u_color;
      uniform float u_thickness;
      
      varying vec2 v_texCoord;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(v_texCoord, center) * 2.0;
        float innerRadius = 1.0 - u_thickness;
        
        if (dist > 1.0 || dist < innerRadius) discard;
        gl_FragColor = u_color;
      }
    `;
    
    // Compile programs
    this.instancedProgram = this._createProgram(gl, instancedVertexShaderSource, instancedFragmentShaderSource);
    this.accretionProgram = this._createProgram(gl, accretionVertexShaderSource, accretionFragmentShaderSource);
    this.ringProgram = this._createProgram(gl, accretionVertexShaderSource, ringFragmentShaderSource);
    this.lineProgram = this._createProgram(gl, lineVertexShaderSource, lineFragmentShaderSource);
    
    // Get locations for instanced program
    if (this.isWebGL2) {
      this.instancedAttribLocations = {
        position: gl.getAttribLocation(this.instancedProgram, 'a_position'),
        texCoord: gl.getAttribLocation(this.instancedProgram, 'a_texCoord'),
        instancePosition: gl.getAttribLocation(this.instancedProgram, 'a_instancePosition'),
        instanceColor: gl.getAttribLocation(this.instancedProgram, 'a_instanceColor'),
        instanceRadius: gl.getAttribLocation(this.instancedProgram, 'a_instanceRadius'),
        instanceGlowIntensity: gl.getAttribLocation(this.instancedProgram, 'a_instanceGlowIntensity'),
        instanceGlowColor: gl.getAttribLocation(this.instancedProgram, 'a_instanceGlowColor')
      };
    } else {
      this.instancedAttribLocations = {
        position: gl.getAttribLocation(this.instancedProgram, 'a_position'),
        texCoord: gl.getAttribLocation(this.instancedProgram, 'a_texCoord')
      };
    }
    
    this.instancedUniformLocations = {
      projection: gl.getUniformLocation(this.instancedProgram, 'u_projection'),
      view: gl.getUniformLocation(this.instancedProgram, 'u_view'),
      // For WebGL1 fallback
      translation: gl.getUniformLocation(this.instancedProgram, 'u_translation'),
      radius: gl.getUniformLocation(this.instancedProgram, 'u_radius'),
      color: gl.getUniformLocation(this.instancedProgram, 'u_color'),
      glowIntensity: gl.getUniformLocation(this.instancedProgram, 'u_glowIntensity'),
      glowColor: gl.getUniformLocation(this.instancedProgram, 'u_glowColor')
    };
    
    // Accretion program locations
    this.accretionAttribLocations = {
      position: gl.getAttribLocation(this.accretionProgram, 'a_position'),
      texCoord: gl.getAttribLocation(this.accretionProgram, 'a_texCoord')
    };
    this.accretionUniformLocations = {
      projection: gl.getUniformLocation(this.accretionProgram, 'u_projection'),
      view: gl.getUniformLocation(this.accretionProgram, 'u_view'),
      translation: gl.getUniformLocation(this.accretionProgram, 'u_translation'),
      radius: gl.getUniformLocation(this.accretionProgram, 'u_radius'),
      innerRadius: gl.getUniformLocation(this.accretionProgram, 'u_innerRadius'),
      diskHeight: gl.getUniformLocation(this.accretionProgram, 'u_diskHeight'),
      isBack: gl.getUniformLocation(this.accretionProgram, 'u_isBack')
    };
    
    // Ring program locations
    this.ringAttribLocations = {
      position: gl.getAttribLocation(this.ringProgram, 'a_position'),
      texCoord: gl.getAttribLocation(this.ringProgram, 'a_texCoord')
    };
    this.ringUniformLocations = {
      projection: gl.getUniformLocation(this.ringProgram, 'u_projection'),
      view: gl.getUniformLocation(this.ringProgram, 'u_view'),
      translation: gl.getUniformLocation(this.ringProgram, 'u_translation'),
      radius: gl.getUniformLocation(this.ringProgram, 'u_radius'),
      color: gl.getUniformLocation(this.ringProgram, 'u_color'),
      thickness: gl.getUniformLocation(this.ringProgram, 'u_thickness')
    };
    
    // Line program locations (for trails)
    this.lineAttribLocations = {
      position: gl.getAttribLocation(this.lineProgram, 'a_position'),
      color: gl.getAttribLocation(this.lineProgram, 'a_color')
    };
    this.lineUniformLocations = {
      projection: gl.getUniformLocation(this.lineProgram, 'u_projection'),
      view: gl.getUniformLocation(this.lineProgram, 'u_view')
    };
  }
  
  _createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = this._compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this._compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }
  
  _compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  _initBuffers() {
    const gl = this.gl;
    
    // Quad geometry for all circles
    const quadPositions = new Float32Array([
      -1, -1, 1, -1, -1, 1, 1, 1
    ]);
    const quadTexCoords = new Float32Array([
      0, 0, 1, 0, 0, 1, 1, 1
    ]);
    
    this.quadPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadPositions, gl.STATIC_DRAW);
    
    this.quadTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadTexCoords, gl.STATIC_DRAW);
    
    // Instance data buffers (for WebGL2 instancing)
    if (this.isWebGL2) {
      this.instancePositionBuffer = gl.createBuffer();
      this.instanceColorBuffer = gl.createBuffer();
      this.instanceRadiusBuffer = gl.createBuffer();
      this.instanceGlowIntensityBuffer = gl.createBuffer();
      this.instanceGlowColorBuffer = gl.createBuffer();
    }
    
    // Trail line buffers
    this.trailPositionBuffer = gl.createBuffer();
    this.trailColorBuffer = gl.createBuffer();
  }
  
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
    this._updateProjectionMatrix();
  }
  
  _updateProjectionMatrix() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    this.projectionMatrix = new Float32Array([
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, -1, 0,
      -1, 1, 0, 1
    ]);
  }
  
  clear() {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  
  setCamera(cameraX, cameraY, zoom) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.viewMatrix = new Float32Array([
      zoom, 0, 0, 0,
      0, zoom, 0, 0,
      0, 0, 1, 0,
      centerX - (centerX + cameraX) * zoom, centerY - (centerY + cameraY) * zoom, 0, 1
    ]);
    
    this.currentZoom = zoom;
  }
  
  _parseColor(colorStr) {
    const match = colorStr.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return [
        parseFloat(match[1]) / 255,
        parseFloat(match[2]) / 255,
        parseFloat(match[3]) / 255,
        match[4] ? parseFloat(match[4]) : 1.0
      ];
    }
    return [1, 1, 1, 1];
  }
  
  /**
   * Draw all celestial bodies in a single batched draw call (WebGL2)
   * or multiple optimized calls (WebGL1 fallback)
   * @param {Array} bodies - Array of celestial body objects
   * @param {Object} options - Rendering options
   */
  drawAllBodies(bodies, options = {}) {
    if (bodies.length === 0) return;
    
    const { followedBodyIndex = -1, zoomFactor = 1 } = options;
    const gl = this.gl;
    
    // Separate bodies by type for proper layering
    const blackHoles = [];
    const regularBodies = [];
    
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      if (body.bodyType === 'blackHole') {
        blackHoles.push({ body, index: i });
      } else {
        regularBodies.push({ body, index: i });
      }
    }
    
    // Draw accretion disk backs first (behind everything)
    for (const { body } of blackHoles) {
      this._drawAccretionDisk(body.x, body.y, body.radius, false);
    }
    
    // Draw all regular bodies in one batch
    if (this.isWebGL2) {
      this._drawBodiesBatchedWebGL2(regularBodies, followedBodyIndex, zoomFactor);
      this._drawBodiesBatchedWebGL2(blackHoles, followedBodyIndex, zoomFactor);
    } else {
      this._drawBodiesFallback(regularBodies, followedBodyIndex, zoomFactor);
      this._drawBodiesFallback(blackHoles, followedBodyIndex, zoomFactor);
    }
    
    // Draw accretion disk fronts last (in front of black holes)
    for (const { body } of blackHoles) {
      this._drawAccretionDisk(body.x, body.y, body.radius, true);
    }
    
    // Draw pin indicators for pinned bodies
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      if (body.isPinned) {
        this._drawPinIndicator(body, zoomFactor);
      }
    }
  }
  
  /**
   * Batched rendering using WebGL2 instancing - draws ALL bodies in ONE draw call
   */
  _drawBodiesBatchedWebGL2(bodyData, followedBodyIndex, zoomFactor) {
    if (bodyData.length === 0) return;
    
    const gl = this.gl;
    const count = Math.min(bodyData.length, this.maxInstances);
    
    // Fill instance arrays
    for (let i = 0; i < count; i++) {
      const { body, index } = bodyData[i];
      const isFollowed = index === followedBodyIndex;
      
      // Position
      this.instancePositions[i * 2] = body.x;
      this.instancePositions[i * 2 + 1] = body.y;
      
      // Color
      const color = this._parseColor(body.color);
      this.instanceColors[i * 4] = color[0];
      this.instanceColors[i * 4 + 1] = color[1];
      this.instanceColors[i * 4 + 2] = color[2];
      this.instanceColors[i * 4 + 3] = color[3];
      
      // Radius
      this.instanceRadii[i] = body.radius;
      
      // Glow settings
      let glowIntensity = 0;
      let glowColor = [1, 1, 1, 0.8];
      
      if (isFollowed) {
        glowIntensity = 0.5 / zoomFactor;
        glowColor = [1, 1, 1, 0.8];
      } else if (body.bodyType === 'star') {
        glowIntensity = 2.5 / zoomFactor;
        glowColor = this._parseColor(body.color.replace('1)', '0.9)'));
      }
      
      this.instanceGlowIntensities[i] = glowIntensity;
      this.instanceGlowColors[i * 4] = glowColor[0];
      this.instanceGlowColors[i * 4 + 1] = glowColor[1];
      this.instanceGlowColors[i * 4 + 2] = glowColor[2];
      this.instanceGlowColors[i * 4 + 3] = glowColor[3];
    }
    
    // Use instanced program
    gl.useProgram(this.instancedProgram);
    
    // Set up static quad attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadPositionBuffer);
    gl.enableVertexAttribArray(this.instancedAttribLocations.position);
    gl.vertexAttribPointer(this.instancedAttribLocations.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadTexCoordBuffer);
    gl.enableVertexAttribArray(this.instancedAttribLocations.texCoord);
    gl.vertexAttribPointer(this.instancedAttribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    // Upload and bind instance position data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instancePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instancePositions.subarray(0, count * 2), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.instancedAttribLocations.instancePosition);
    gl.vertexAttribPointer(this.instancedAttribLocations.instancePosition, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instancePosition, 1);
    
    // Upload and bind instance color data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceColors.subarray(0, count * 4), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.instancedAttribLocations.instanceColor);
    gl.vertexAttribPointer(this.instancedAttribLocations.instanceColor, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instanceColor, 1);
    
    // Upload and bind instance radius data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceRadiusBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceRadii.subarray(0, count), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.instancedAttribLocations.instanceRadius);
    gl.vertexAttribPointer(this.instancedAttribLocations.instanceRadius, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instanceRadius, 1);
    
    // Upload and bind instance glow intensity data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlowIntensityBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceGlowIntensities.subarray(0, count), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.instancedAttribLocations.instanceGlowIntensity);
    gl.vertexAttribPointer(this.instancedAttribLocations.instanceGlowIntensity, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instanceGlowIntensity, 1);
    
    // Upload and bind instance glow color data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceGlowColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.instanceGlowColors.subarray(0, count * 4), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.instancedAttribLocations.instanceGlowColor);
    gl.vertexAttribPointer(this.instancedAttribLocations.instanceGlowColor, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instanceGlowColor, 1);
    
    // Set uniforms
    gl.uniformMatrix4fv(this.instancedUniformLocations.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.instancedUniformLocations.view, false, this.viewMatrix);
    
    // Draw ALL bodies in ONE call!
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    
    // Reset divisors
    gl.vertexAttribDivisor(this.instancedAttribLocations.instancePosition, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instanceColor, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instanceRadius, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instanceGlowIntensity, 0);
    gl.vertexAttribDivisor(this.instancedAttribLocations.instanceGlowColor, 0);
  }
  
  /**
   * WebGL1 fallback - individual draw calls (still optimized)
   */
  _drawBodiesFallback(bodyData, followedBodyIndex, zoomFactor) {
    const gl = this.gl;
    
    gl.useProgram(this.instancedProgram);
    
    // Set up quad attributes once
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadPositionBuffer);
    gl.enableVertexAttribArray(this.instancedAttribLocations.position);
    gl.vertexAttribPointer(this.instancedAttribLocations.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadTexCoordBuffer);
    gl.enableVertexAttribArray(this.instancedAttribLocations.texCoord);
    gl.vertexAttribPointer(this.instancedAttribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    // Set uniforms once
    gl.uniformMatrix4fv(this.instancedUniformLocations.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.instancedUniformLocations.view, false, this.viewMatrix);
    
    for (const { body, index } of bodyData) {
      const isFollowed = index === followedBodyIndex;
      const color = this._parseColor(body.color);
      
      let glowIntensity = 0;
      let glowColor = [1, 1, 1, 0.8];
      
      if (isFollowed) {
        glowIntensity = 0.5 / zoomFactor;
      } else if (body.bodyType === 'star') {
        glowIntensity = 2.5 / zoomFactor;
        glowColor = this._parseColor(body.color.replace('1)', '0.9)'));
      }
      
      const expandedRadius = glowIntensity > 0 ? body.radius * (1 + glowIntensity) : body.radius;
      
      gl.uniform2f(this.instancedUniformLocations.translation, body.x, body.y);
      gl.uniform1f(this.instancedUniformLocations.radius, expandedRadius);
      gl.uniform4f(this.instancedUniformLocations.color, color[0], color[1], color[2], color[3]);
      gl.uniform1f(this.instancedUniformLocations.glowIntensity, glowIntensity);
      gl.uniform4f(this.instancedUniformLocations.glowColor, glowColor[0], glowColor[1], glowColor[2], glowColor[3]);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  
  _drawAccretionDisk(x, y, radius, isBack) {
    const gl = this.gl;
    const diskRadius = radius * 8;
    const diskHeightRatio = 0.2;
    
    gl.useProgram(this.accretionProgram);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadPositionBuffer);
    gl.enableVertexAttribArray(this.accretionAttribLocations.position);
    gl.vertexAttribPointer(this.accretionAttribLocations.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadTexCoordBuffer);
    gl.enableVertexAttribArray(this.accretionAttribLocations.texCoord);
    gl.vertexAttribPointer(this.accretionAttribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    gl.uniformMatrix4fv(this.accretionUniformLocations.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.accretionUniformLocations.view, false, this.viewMatrix);
    gl.uniform2f(this.accretionUniformLocations.translation, x, y);
    gl.uniform1f(this.accretionUniformLocations.radius, diskRadius);
    gl.uniform1f(this.accretionUniformLocations.innerRadius, radius * 1.2 / diskRadius);
    gl.uniform1f(this.accretionUniformLocations.diskHeight, diskHeightRatio);
    gl.uniform1i(this.accretionUniformLocations.isBack, isBack ? 1 : 0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  
  _drawPinIndicator(body, zoomFactor) {
    const gl = this.gl;
    const x = body.x;
    const y = body.y;
    const radius = body.radius;
    
    gl.useProgram(this.ringProgram);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadPositionBuffer);
    gl.enableVertexAttribArray(this.ringAttribLocations.position);
    gl.vertexAttribPointer(this.ringAttribLocations.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadTexCoordBuffer);
    gl.enableVertexAttribArray(this.ringAttribLocations.texCoord);
    gl.vertexAttribPointer(this.ringAttribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    gl.uniformMatrix4fv(this.ringUniformLocations.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.ringUniformLocations.view, false, this.viewMatrix);
    
    // Draw pin ring
    gl.uniform2f(this.ringUniformLocations.translation, x, y);
    gl.uniform1f(this.ringUniformLocations.radius, radius * 1.2);
    gl.uniform4f(this.ringUniformLocations.color, 1.0, 1.0, 0.0, 0.8);
    gl.uniform1f(this.ringUniformLocations.thickness, 0.15);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Draw pin head (small yellow circle)
    const pinHeight = radius * 1.5;
    const pinRadius = radius * 0.3;
    const pinY = y - radius - pinHeight;
    
    // Use instanced program for the pin head circle
    gl.useProgram(this.instancedProgram);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadPositionBuffer);
    gl.enableVertexAttribArray(this.instancedAttribLocations.position);
    gl.vertexAttribPointer(this.instancedAttribLocations.position, 2, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadTexCoordBuffer);
    gl.enableVertexAttribArray(this.instancedAttribLocations.texCoord);
    gl.vertexAttribPointer(this.instancedAttribLocations.texCoord, 2, gl.FLOAT, false, 0, 0);
    
    gl.uniformMatrix4fv(this.instancedUniformLocations.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.instancedUniformLocations.view, false, this.viewMatrix);
    gl.uniform2f(this.instancedUniformLocations.translation, x, pinY);
    gl.uniform1f(this.instancedUniformLocations.radius, pinRadius);
    gl.uniform4f(this.instancedUniformLocations.color, 1.0, 1.0, 0.0, 1.0);
    gl.uniform1f(this.instancedUniformLocations.glowIntensity, 0.0);
    gl.uniform4f(this.instancedUniformLocations.glowColor, 0, 0, 0, 0);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  
  // Legacy method for backwards compatibility
  drawCelestialBody(body, options = {}) {
    this.drawAllBodies([body], {
      followedBodyIndex: options.isFollowed ? 0 : -1,
      zoomFactor: options.zoomFactor || 1
    });
  }
  
  /**
   * Draw all trails using WebGL - renders as thick quads for visibility
   * @param {Map} trails - Map of trail data from TrailManager
   * @param {Object} camera - Camera position {x, y}
   * @param {number} zoomFactor - Current zoom level
   * @param {Object} viewBounds - Visible area bounds {minX, minY, maxX, maxY}
   */
  drawTrails(trails, camera, zoomFactor, viewBounds) {
    if (!trails || trails.size === 0) return;
    
    const gl = this.gl;
    
    // Pre-calculate view bounds with margin for culling
    const margin = 100 / zoomFactor;
    const visMinX = viewBounds.minX - margin;
    const visMinY = viewBounds.minY - margin;
    const visMaxX = viewBounds.maxX + margin;
    const visMaxY = viewBounds.maxY + margin;
    
    // Decimation factor based on zoom (skip more points when zoomed out)
    const decimation = Math.max(1, Math.round(1 / Math.max(zoomFactor, 0.01)));
    const maxDecimation = 8;
    const skipFactor = Math.min(decimation, maxDecimation);
    
    // Line thickness in world units (thicker when zoomed out for visibility)
    const lineThickness = Math.max(1.5, 2.0 / zoomFactor);
    
    // Collect all visible trail segments
    const segments = [];
    
    trails.forEach((trail, id) => {
      const positions = trail.positions;
      const total = trail.isFull ? positions.length : trail.head;
      if (total < 4) return;
      
      const startIdx = trail.isFull ? trail.head : 0;
      const color = this._parseColor(trail.color);
      
      let prevX = null, prevY = null;
      let prevInView = false;
      
      for (let i = 0; i < total; i += 2) {
        // Apply decimation
        if (skipFactor > 1 && ((i / 2) % skipFactor) !== 0) continue;
        
        const idx = (startIdx + i) % positions.length;
        const wx = positions[idx];
        const wy = positions[idx + 1];
        
        // View culling
        const inView = wx >= visMinX && wx <= visMaxX && wy >= visMinY && wy <= visMaxY;
        
        if (prevX !== null && (inView || prevInView)) {
          // Draw line segment if either endpoint is visible
          segments.push({
            x1: prevX, y1: prevY,
            x2: wx, y2: wy,
            color: color
          });
        }
        
        prevX = wx;
        prevY = wy;
        prevInView = inView;
      }
    });
    
    if (segments.length === 0) return;
    
    // Build thick line geometry (each segment = 2 triangles = 6 vertices)
    // This creates a quad for each line segment
    const maxSegments = Math.floor(this.maxTrailVertices / 6);
    const segmentCount = Math.min(segments.length, maxSegments);
    const vertexCount = segmentCount * 6;
    
    for (let i = 0; i < segmentCount; i++) {
      const seg = segments[i];
      
      // Calculate perpendicular direction for line thickness
      const dx = seg.x2 - seg.x1;
      const dy = seg.y2 - seg.y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      
      if (len < 0.001) continue; // Skip zero-length segments
      
      // Perpendicular unit vector
      const px = (-dy / len) * lineThickness * 0.5;
      const py = (dx / len) * lineThickness * 0.5;
      
      // Quad corners
      const x1a = seg.x1 + px, y1a = seg.y1 + py;
      const x1b = seg.x1 - px, y1b = seg.y1 - py;
      const x2a = seg.x2 + px, y2a = seg.y2 + py;
      const x2b = seg.x2 - px, y2b = seg.y2 - py;
      
      // Two triangles per segment (6 vertices)
      const basePos = i * 12;  // 6 vertices * 2 components
      const baseCol = i * 24;  // 6 vertices * 4 components
      
      // Triangle 1: (1a, 1b, 2a)
      this.trailPositions[basePos] = x1a;
      this.trailPositions[basePos + 1] = y1a;
      this.trailPositions[basePos + 2] = x1b;
      this.trailPositions[basePos + 3] = y1b;
      this.trailPositions[basePos + 4] = x2a;
      this.trailPositions[basePos + 5] = y2a;
      
      // Triangle 2: (1b, 2b, 2a)
      this.trailPositions[basePos + 6] = x1b;
      this.trailPositions[basePos + 7] = y1b;
      this.trailPositions[basePos + 8] = x2b;
      this.trailPositions[basePos + 9] = y2b;
      this.trailPositions[basePos + 10] = x2a;
      this.trailPositions[basePos + 11] = y2a;
      
      // Colors for all 6 vertices
      const r = seg.color[0], g = seg.color[1], b = seg.color[2], a = seg.color[3];
      for (let v = 0; v < 6; v++) {
        this.trailColors[baseCol + v * 4] = r;
        this.trailColors[baseCol + v * 4 + 1] = g;
        this.trailColors[baseCol + v * 4 + 2] = b;
        this.trailColors[baseCol + v * 4 + 3] = a;
      }
    }
    
    // Use line program
    gl.useProgram(this.lineProgram);
    
    // Upload position data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trailPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.trailPositions.subarray(0, vertexCount * 2), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribLocations.position);
    gl.vertexAttribPointer(this.lineAttribLocations.position, 2, gl.FLOAT, false, 0, 0);
    
    // Upload color data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trailColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.trailColors.subarray(0, vertexCount * 4), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribLocations.color);
    gl.vertexAttribPointer(this.lineAttribLocations.color, 4, gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    gl.uniformMatrix4fv(this.lineUniformLocations.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.lineUniformLocations.view, false, this.viewMatrix);
    
    // Draw all trail quads in ONE call!
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
  }
  
  /**
   * Draw trail debug points - shows individual trail vertices
   * @param {Map} trails - Map of trail data from TrailManager
   * @param {Object} viewBounds - Visible area bounds {minX, minY, maxX, maxY}
   * @param {number} zoomFactor - Current zoom level
   */
  drawTrailPoints(trails, viewBounds, zoomFactor) {
    if (!trails || trails.size === 0) {
      console.log('drawTrailPoints: No trails');
      return;
    }
    console.log('drawTrailPoints: Drawing', trails.size, 'trails');
    
    const gl = this.gl;
    
    // Pre-calculate view bounds with margin for culling
    const margin = 50 / zoomFactor;
    const visMinX = viewBounds.minX - margin;
    const visMinY = viewBounds.minY - margin;
    const visMaxX = viewBounds.maxX + margin;
    const visMaxY = viewBounds.maxY + margin;
    
    // Point size - fixed screen-space size with cap for zoomed out view
    const screenPixels = 2.5;  // Target screen size in pixels
    const pointRadius = Math.min(screenPixels / zoomFactor, 5);  // Cap world size when zoomed out
    
    // Collect visible points
    const points = [];
    
    trails.forEach((trail, id) => {
      const positions = trail.positions;
      const total = trail.isFull ? positions.length : trail.head;
      if (total < 2) return;
      
      const startIdx = trail.isFull ? trail.head : 0;
      const color = this._parseColor(trail.color);
      
      // Sample every 4th point for performance
      for (let i = 0; i < total; i += 8) {
        const idx = (startIdx + i) % positions.length;
        const wx = positions[idx];
        const wy = positions[idx + 1];
        
        // View culling
        if (wx >= visMinX && wx <= visMaxX && wy >= visMinY && wy <= visMaxY) {
          points.push({ x: wx, y: wy, color: color });
        }
      }
    });
    
    if (points.length === 0) {
      console.log('drawTrailPoints: No visible points');
      return;
    }
    
    console.log('drawTrailPoints: Drawing', points.length, 'points');
    
    // Draw points as small filled circles using the line program (simpler, works everywhere)
    // Each point = 6 vertices (2 triangles forming a small square)
    const verticesPerPoint = 6;
    const maxPoints = Math.min(points.length, Math.floor(this.maxTrailVertices / verticesPerPoint));
    
    for (let i = 0; i < maxPoints; i++) {
      const point = points[i];
      const halfSize = pointRadius;
      
      // Create a small quad for each point
      const basePos = i * 12;  // 6 vertices * 2 components
      const baseCol = i * 24;  // 6 vertices * 4 components
      
      const x = point.x, y = point.y;
      
      // Triangle 1
      this.trailPositions[basePos] = x - halfSize;
      this.trailPositions[basePos + 1] = y - halfSize;
      this.trailPositions[basePos + 2] = x + halfSize;
      this.trailPositions[basePos + 3] = y - halfSize;
      this.trailPositions[basePos + 4] = x - halfSize;
      this.trailPositions[basePos + 5] = y + halfSize;
      
      // Triangle 2
      this.trailPositions[basePos + 6] = x + halfSize;
      this.trailPositions[basePos + 7] = y - halfSize;
      this.trailPositions[basePos + 8] = x + halfSize;
      this.trailPositions[basePos + 9] = y + halfSize;
      this.trailPositions[basePos + 10] = x - halfSize;
      this.trailPositions[basePos + 11] = y + halfSize;
      
      // Bright color for visibility
      const r = point.color[0], g = point.color[1], b = point.color[2];
      for (let v = 0; v < 6; v++) {
        this.trailColors[baseCol + v * 4] = r;
        this.trailColors[baseCol + v * 4 + 1] = g;
        this.trailColors[baseCol + v * 4 + 2] = b;
        this.trailColors[baseCol + v * 4 + 3] = 1.0;  // Full opacity
      }
    }
    
    const vertexCount = maxPoints * verticesPerPoint;
    
    // Use line program (simple vertex + color)
    gl.useProgram(this.lineProgram);
    
    // Upload position data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trailPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.trailPositions.subarray(0, vertexCount * 2), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribLocations.position);
    gl.vertexAttribPointer(this.lineAttribLocations.position, 2, gl.FLOAT, false, 0, 0);
    
    // Upload color data
    gl.bindBuffer(gl.ARRAY_BUFFER, this.trailColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.trailColors.subarray(0, vertexCount * 4), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribLocations.color);
    gl.vertexAttribPointer(this.lineAttribLocations.color, 4, gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    gl.uniformMatrix4fv(this.lineUniformLocations.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.lineUniformLocations.view, false, this.viewMatrix);
    
    // Draw all points in ONE call!
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    
    console.log('drawTrailPoints: Drew', vertexCount, 'vertices');
  }
}



// ----- classes/GravityFieldRenderer.js -----


class GravityFieldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2', { 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false 
    });
    
    if (!this.gl) {
      this.gl = canvas.getContext('webgl', { 
        antialias: true, 
        alpha: true,
        premultipliedAlpha: false 
      });
      this.isWebGL2 = false;
    } else {
      this.isWebGL2 = true;
    }
    
    this.settings = {
      gridOpacity: 1.0,
      heatmapOpacity: 0.85,
      vectorOpacity: 1.0,
      contourOpacity: 0.9,
      gridSpacing: 35,
      vectorSpacing: 30,
      contourLevels: 30,
      contourLineWidth: 2.0,
      maxWarpDistance: 40,
      warpStrength: 1.0
    };
    
    this.G = 1000;
    
    this._initShaders();
    this._initBuffers();
    
    this.projectionMatrix = new Float32Array(16);
    this.viewMatrix = new Float32Array(16);
    
    this._updateProjectionMatrix();
  }
  
  _initShaders() {
    const gl = this.gl;
    
    const lineVertexSource = this.isWebGL2 ? `#version 300 es
      in vec2 a_position;
      in vec4 a_color;
      uniform mat4 u_projection;
      uniform mat4 u_view;
      out vec4 v_color;
      void main() {
        gl_Position = u_projection * u_view * vec4(a_position, 0.0, 1.0);
        v_color = a_color;
      }
    ` : `
      attribute vec2 a_position;
      attribute vec4 a_color;
      uniform mat4 u_projection;
      uniform mat4 u_view;
      varying vec4 v_color;
      void main() {
        gl_Position = u_projection * u_view * vec4(a_position, 0.0, 1.0);
        v_color = a_color;
      }
    `;
    
    const lineFragmentSource = this.isWebGL2 ? `#version 300 es
      precision mediump float;
      in vec4 v_color;
      out vec4 fragColor;
      void main() {
        fragColor = v_color;
      }
    ` : `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }
    `;
    
    const heatmapVertexSource = this.isWebGL2 ? `#version 300 es
      in vec2 a_position;
      in vec2 a_texCoord;
      uniform mat4 u_projection;
      uniform mat4 u_view;
      out vec2 v_texCoord;
      void main() {
        gl_Position = u_projection * u_view * vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    ` : `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform mat4 u_projection;
      uniform mat4 u_view;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = u_projection * u_view * vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `;
    
    const heatmapFragmentSource = this.isWebGL2 ? `#version 300 es
      precision mediump float;
      in vec2 v_texCoord;
      out vec4 fragColor;
      uniform sampler2D u_heatmapTexture;
      uniform float u_opacity;
      void main() {
        vec4 color = texture(u_heatmapTexture, v_texCoord);
        fragColor = vec4(color.rgb, color.a * u_opacity);
      }
    ` : `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_heatmapTexture;
      uniform float u_opacity;
      void main() {
        vec4 color = texture2D(u_heatmapTexture, v_texCoord);
        gl_FragColor = vec4(color.rgb, color.a * u_opacity);
      }
    `;
    
    this.lineProgram = this._createProgram(gl, lineVertexSource, lineFragmentSource);
    this.heatmapProgram = this._createProgram(gl, heatmapVertexSource, heatmapFragmentSource);
    
    this.lineAttribs = {
      position: gl.getAttribLocation(this.lineProgram, 'a_position'),
      color: gl.getAttribLocation(this.lineProgram, 'a_color')
    };
    this.lineUniforms = {
      projection: gl.getUniformLocation(this.lineProgram, 'u_projection'),
      view: gl.getUniformLocation(this.lineProgram, 'u_view')
    };
    
    this.heatmapAttribs = {
      position: gl.getAttribLocation(this.heatmapProgram, 'a_position'),
      texCoord: gl.getAttribLocation(this.heatmapProgram, 'a_texCoord')
    };
    this.heatmapUniforms = {
      projection: gl.getUniformLocation(this.heatmapProgram, 'u_projection'),
      view: gl.getUniformLocation(this.heatmapProgram, 'u_view'),
      texture: gl.getUniformLocation(this.heatmapProgram, 'u_heatmapTexture'),
      opacity: gl.getUniformLocation(this.heatmapProgram, 'u_opacity')
    };
  }
  
  _createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = this._compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this._compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }
  
  _compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  
  _initBuffers() {
    const gl = this.gl;
    this.linePositionBuffer = gl.createBuffer();
    this.lineColorBuffer = gl.createBuffer();
    this.heatmapPositionBuffer = gl.createBuffer();
    this.heatmapTexCoordBuffer = gl.createBuffer();
    this.heatmapTexture = gl.createTexture();
    this.heatmapTextureSize = 256;
    this.heatmapData = new Uint8Array(this.heatmapTextureSize * this.heatmapTextureSize * 4);
    gl.bindTexture(gl.TEXTURE_2D, this.heatmapTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.maxLineVertices = 300000;
    this.linePositions = new Float32Array(this.maxLineVertices * 2);
    this.lineColors = new Float32Array(this.maxLineVertices * 4);
  }
  
  resize(width, height) {
    this._updateProjectionMatrix();
  }
  
  _updateProjectionMatrix() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.projectionMatrix = new Float32Array([
      2 / width, 0, 0, 0,
      0, -2 / height, 0, 0,
      0, 0, -1, 0,
      -1, 1, 0, 1
    ]);
  }
  
  setCamera(cameraX, cameraY, zoom) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    this.viewMatrix = new Float32Array([
      zoom, 0, 0, 0,
      0, zoom, 0, 0,
      0, 0, 1, 0,
      centerX - (centerX + cameraX) * zoom, centerY - (centerY + cameraY) * zoom, 0, 1
    ]);
    this.currentZoom = zoom;
    this.cameraX = cameraX;
    this.cameraY = cameraY;
  }
  
  calculatePotential(x, y, bodies) {
    let potential = 0;
    for (const body of bodies) {
      const dx = x - body.x;
      const dy = y - body.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const softening = body.radius * 0.5;
      const effectiveDist = Math.max(dist, softening);
      potential -= this.G * body.weight / effectiveDist;
    }
    return potential;
  }
  
  calculateField(x, y, bodies) {
    let ax = 0;
    let ay = 0;
    for (const body of bodies) {
      const dx = body.x - x;
      const dy = body.y - y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      if (dist < body.radius * 0.5) continue;
      const forceMag = this.G * body.weight / (distSq + 1);
      ax += forceMag * dx / dist;
      ay += forceMag * dy / dist;
    }
    const magnitude = Math.sqrt(ax * ax + ay * ay);
    return { ax, ay, magnitude };
  }
  
  calculateWarpDisplacement(x, y, bodies, maxDisplacement) {
    let totalDx = 0;
    let totalDy = 0;
    
    for (const body of bodies) {
      const dx = body.x - x;
      const dy = body.y - y;
      const distSq = dx * dx + dy * dy;
      const dist = Math.sqrt(distSq);
      
      // Softening parameter - controls how smooth the well is near the center
      // Larger = smoother/wider well, smaller = sharper well
      const softening = body.radius * 3;
      
      // Softened distance: sqrt(r² + a²)
      // This naturally limits displacement at center without any hard cutoffs
      const softenedDist = Math.sqrt(distSq + softening * softening);
      
      // Calculate direction to body (use softened dist to smooth direction near center too)
      const dirX = dx / softenedDist;
      const dirY = dy / softenedDist;
      
      // Gravitational well strength - creates smooth 1/r profile that saturates near center
      // At r=0: displacement = strength/softening (finite maximum)
      // At large r: displacement ≈ strength/r (standard falloff)
      const strength = body.weight * 0.8;
      const displacement = strength / softenedDist;
      
      totalDx += dirX * displacement;
      totalDy += dirY * displacement;
    }
    
    // Soft clamp using tanh for smooth limiting at max displacement
    const totalMag = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
    if (totalMag > 0.001) {
      const clampedMag = maxDisplacement * Math.tanh(totalMag / maxDisplacement);
      const scale = clampedMag / totalMag;
      totalDx *= scale;
      totalDy *= scale;
    }
    
    return { dx: totalDx, dy: totalDy };
  }
  
  drawWarpedGrid(bodies, viewBounds, options = {}) {
    if (bodies.length === 0) return;
    
    const gl = this.gl;
    const { opacity = this.settings.gridOpacity } = options;
    
    // Grid spacing that gets denser when zoomed out
    // When zoomed out (zoom < 1), we want MORE lines (smaller spacing)
    // When zoomed in (zoom > 1), we want fewer lines (larger spacing) to avoid clutter
    let spacing;
    if (this.currentZoom < 1) {
      // Zoomed out: use fixed small spacing for dense grid
      // The further out, the denser (more context visible = more grid lines needed)
      spacing = this.settings.gridSpacing * 0.7;
    } else {
      // Zoomed in: scale spacing with zoom to keep consistent visual density
      spacing = this.settings.gridSpacing / this.currentZoom;
    }
    // Clamp to reasonable bounds
    spacing = Math.max(12, Math.min(spacing, 100));
    
    const margin = spacing * 2;
    const minX = Math.floor((viewBounds.minX - margin) / spacing) * spacing;
    const maxX = Math.ceil((viewBounds.maxX + margin) / spacing) * spacing;
    const minY = Math.floor((viewBounds.minY - margin) / spacing) * spacing;
    const maxY = Math.ceil((viewBounds.maxY + margin) / spacing) * spacing;
    
    const maxWarp = this.settings.maxWarpDistance / this.currentZoom * this.settings.warpStrength;
    
    const gridCols = Math.ceil((maxX - minX) / spacing) + 1;
    const gridRows = Math.ceil((maxY - minY) / spacing) + 1;
    
    const maxGrid = 100;
    const stepX = Math.max(1, Math.floor(gridCols / maxGrid));
    const stepY = Math.max(1, Math.floor(gridRows / maxGrid));
    
    const warpedPoints = new Map();
    
    for (let row = 0; row <= gridRows; row += stepY) {
      for (let col = 0; col <= gridCols; col += stepX) {
        const x = minX + col * spacing;
        const y = minY + row * spacing;
        const key = `${col},${row}`;
        const warp = this.calculateWarpDisplacement(x, y, bodies, maxWarp);
        warpedPoints.set(key, { x: x + warp.dx, y: y + warp.dy });
      }
    }
    
    let vertexCount = 0;
    const r = 0.0, g = 0.8, b = 0.9, a = opacity * 0.7;
    
    for (let row = 0; row <= gridRows; row += stepY) {
      for (let col = 0; col < gridCols; col += stepX) {
        const p1 = warpedPoints.get(`${col},${row}`);
        const p2 = warpedPoints.get(`${col + stepX},${row}`);
        if (p1 && p2 && vertexCount < this.maxLineVertices - 2) {
          const baseIdx = vertexCount * 2;
          const colorIdx = vertexCount * 4;
          this.linePositions[baseIdx] = p1.x;
          this.linePositions[baseIdx + 1] = p1.y;
          this.linePositions[baseIdx + 2] = p2.x;
          this.linePositions[baseIdx + 3] = p2.y;
          this.lineColors[colorIdx] = r; this.lineColors[colorIdx + 1] = g; this.lineColors[colorIdx + 2] = b; this.lineColors[colorIdx + 3] = a;
          this.lineColors[colorIdx + 4] = r; this.lineColors[colorIdx + 5] = g; this.lineColors[colorIdx + 6] = b; this.lineColors[colorIdx + 7] = a;
          vertexCount += 2;
        }
      }
    }
    
    for (let col = 0; col <= gridCols; col += stepX) {
      for (let row = 0; row < gridRows; row += stepY) {
        const p1 = warpedPoints.get(`${col},${row}`);
        const p2 = warpedPoints.get(`${col},${row + stepY}`);
        if (p1 && p2 && vertexCount < this.maxLineVertices - 2) {
          const baseIdx = vertexCount * 2;
          const colorIdx = vertexCount * 4;
          this.linePositions[baseIdx] = p1.x;
          this.linePositions[baseIdx + 1] = p1.y;
          this.linePositions[baseIdx + 2] = p2.x;
          this.linePositions[baseIdx + 3] = p2.y;
          this.lineColors[colorIdx] = r; this.lineColors[colorIdx + 1] = g; this.lineColors[colorIdx + 2] = b; this.lineColors[colorIdx + 3] = a;
          this.lineColors[colorIdx + 4] = r; this.lineColors[colorIdx + 5] = g; this.lineColors[colorIdx + 6] = b; this.lineColors[colorIdx + 7] = a;
          vertexCount += 2;
        }
      }
    }
    
    if (vertexCount === 0) return;
    
    gl.useProgram(this.lineProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.linePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.linePositions.subarray(0, vertexCount * 2), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribs.position);
    gl.vertexAttribPointer(this.lineAttribs.position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.lineColors.subarray(0, vertexCount * 4), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribs.color);
    gl.vertexAttribPointer(this.lineAttribs.color, 4, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(this.lineUniforms.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.lineUniforms.view, false, this.viewMatrix);
    gl.drawArrays(gl.LINES, 0, vertexCount);
  }
  
  drawFieldVectors(bodies, viewBounds, options = {}) {
    if (bodies.length === 0) return;
    
    const gl = this.gl;
    const { opacity = this.settings.vectorOpacity } = options;
    
    const spacing = this.settings.vectorSpacing / this.currentZoom;
    const baseArrowLength = spacing * 0.55;
    const baseHeadSize = spacing * 0.12;
    
    const margin = spacing;
    const minX = Math.floor((viewBounds.minX - margin) / spacing) * spacing;
    const maxX = Math.ceil((viewBounds.maxX + margin) / spacing) * spacing;
    const minY = Math.floor((viewBounds.minY - margin) / spacing) * spacing;
    const maxY = Math.ceil((viewBounds.maxY + margin) / spacing) * spacing;
    
    let vertexCount = 0;
    let minFieldMag = Infinity;
    let maxFieldMag = 0;
    
    const fieldData = [];
    
    for (let y = minY; y <= maxY; y += spacing) {
      for (let x = minX; x <= maxX; x += spacing) {
        let insideBody = false;
        for (const body of bodies) {
          const dx = x - body.x;
          const dy = y - body.y;
          if (dx * dx + dy * dy < body.radius * body.radius * 2.5) {
            insideBody = true;
            break;
          }
        }
        if (insideBody) continue;
        
        const field = this.calculateField(x, y, bodies);
        // Skip vectors with extremely small magnitudes - they're essentially zero
        if (field.magnitude < 0.1) continue;
        
        fieldData.push({ x, y, field });
        if (field.magnitude > maxFieldMag) maxFieldMag = field.magnitude;
        if (field.magnitude < minFieldMag) minFieldMag = field.magnitude;
      }
    }
    
    if (fieldData.length === 0) return;
    if (maxFieldMag < 0.1) maxFieldMag = 1;
    if (minFieldMag < 0.1) minFieldMag = 0.1;
    
    const logMin = Math.log(minFieldMag);
    const logMax = Math.log(maxFieldMag);
    const logRange = logMax - logMin;
    
    for (const { x, y, field } of fieldData) {
      const logMag = Math.log(field.magnitude);
      const t = logRange > 0.001 ? (logMag - logMin) / logRange : 0.5;
      const normalizedT = Math.max(0, Math.min(1, t));
      
      const scale = 0.3 + normalizedT * 0.7;
      const length = baseArrowLength * scale;
      const headSize = baseHeadSize * scale;
      
      const dirX = field.ax / field.magnitude;
      const dirY = field.ay / field.magnitude;
      const endX = x + dirX * length;
      const endY = y + dirY * length;
      
      const color = this._vectorColor(normalizedT);
      const a = opacity * (0.7 + normalizedT * 0.3);
      
      if (vertexCount < this.maxLineVertices - 6) {
        const baseIdx = vertexCount * 2;
        const colorIdx = vertexCount * 4;
        
        this.linePositions[baseIdx] = x;
        this.linePositions[baseIdx + 1] = y;
        this.linePositions[baseIdx + 2] = endX;
        this.linePositions[baseIdx + 3] = endY;
        
        const headAngle1 = Math.atan2(dirY, dirX) + Math.PI * 0.75;
        const headAngle2 = Math.atan2(dirY, dirX) - Math.PI * 0.75;
        
        this.linePositions[baseIdx + 4] = endX;
        this.linePositions[baseIdx + 5] = endY;
        this.linePositions[baseIdx + 6] = endX + Math.cos(headAngle1) * headSize;
        this.linePositions[baseIdx + 7] = endY + Math.sin(headAngle1) * headSize;
        
        this.linePositions[baseIdx + 8] = endX;
        this.linePositions[baseIdx + 9] = endY;
        this.linePositions[baseIdx + 10] = endX + Math.cos(headAngle2) * headSize;
        this.linePositions[baseIdx + 11] = endY + Math.sin(headAngle2) * headSize;
        
        for (let i = 0; i < 6; i++) {
          this.lineColors[colorIdx + i * 4] = color.r;
          this.lineColors[colorIdx + i * 4 + 1] = color.g;
          this.lineColors[colorIdx + i * 4 + 2] = color.b;
          this.lineColors[colorIdx + i * 4 + 3] = a;
        }
        
        vertexCount += 6;
      }
    }
    
    if (vertexCount === 0) return;
    
    gl.useProgram(this.lineProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.linePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.linePositions.subarray(0, vertexCount * 2), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribs.position);
    gl.vertexAttribPointer(this.lineAttribs.position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.lineColors.subarray(0, vertexCount * 4), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribs.color);
    gl.vertexAttribPointer(this.lineAttribs.color, 4, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(this.lineUniforms.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.lineUniforms.view, false, this.viewMatrix);
    gl.drawArrays(gl.LINES, 0, vertexCount);
  }
  
  _vectorColor(t) {
    t = Math.max(0, Math.min(1, t));
    if (t < 0.2) {
      const s = t / 0.2;
      return { r: 0.1, g: 0.2 + s * 0.4, b: 0.8 + s * 0.2 };
    } else if (t < 0.4) {
      const s = (t - 0.2) / 0.2;
      return { r: 0.1 + s * 0.2, g: 0.6 + s * 0.3, b: 1.0 - s * 0.3 };
    } else if (t < 0.6) {
      const s = (t - 0.4) / 0.2;
      return { r: 0.3 + s * 0.4, g: 0.9 - s * 0.1, b: 0.7 - s * 0.5 };
    } else if (t < 0.8) {
      const s = (t - 0.6) / 0.2;
      return { r: 0.7 + s * 0.3, g: 0.8 - s * 0.3, b: 0.2 - s * 0.1 };
    } else {
      const s = (t - 0.8) / 0.2;
      return { r: 1.0, g: 0.5 - s * 0.3, b: 0.1 };
    }
  }
  
  drawHeatmap(bodies, viewBounds, options = {}) {
    if (bodies.length === 0) return;
    
    const gl = this.gl;
    const { opacity = this.settings.heatmapOpacity } = options;
    
    const size = this.heatmapTextureSize;
    const width = viewBounds.maxX - viewBounds.minX;
    const height = viewBounds.maxY - viewBounds.minY;
    const startX = viewBounds.minX;
    const startY = viewBounds.minY;
    
    let minPotential = 0;
    let maxPotential = -Infinity;
    const potentials = new Float32Array(size * size);
    
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const x = startX + (i / (size - 1)) * width;
        const y = startY + (j / (size - 1)) * height;
        const potential = this.calculatePotential(x, y, bodies);
        potentials[j * size + i] = potential;
        if (potential > maxPotential) maxPotential = potential;
        if (potential < minPotential) minPotential = potential;
      }
    }
    
    let refMinPotential = 0;
    for (const body of bodies) {
      const surfacePotential = -this.G * body.weight / (body.radius * 0.5);
      if (surfacePotential < refMinPotential) refMinPotential = surfacePotential;
    }
    minPotential = Math.min(minPotential, refMinPotential * 0.8);
    
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const potential = potentials[j * size + i];
        const idx = (j * size + i) * 4;
        
        const safeMinPot = Math.min(minPotential, -1);
        const safeMaxPot = Math.max(maxPotential, safeMinPot + 0.1);
        
        const logPot = -Math.log(-potential + 1);
        const logMin = -Math.log(-safeMinPot + 1);
        const logMax = -Math.log(-safeMaxPot + 1);
        
        let t = 0;
        const logRange = logMax - logMin;
        if (Math.abs(logRange) > 0.0001) t = (logPot - logMin) / logRange;
        t = Math.max(0, Math.min(1, t));
        
        const color = this._heatmapColor(t);
        this.heatmapData[idx] = Math.floor(color.r * 255);
        this.heatmapData[idx + 1] = Math.floor(color.g * 255);
        this.heatmapData[idx + 2] = Math.floor(color.b * 255);
        this.heatmapData[idx + 3] = Math.floor(color.a * 255);
      }
    }
    
    gl.bindTexture(gl.TEXTURE_2D, this.heatmapTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.heatmapData);
    
    const positions = new Float32Array([
      startX, startY, startX + width, startY, startX, startY + height, startX + width, startY + height
    ]);
    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    
    gl.useProgram(this.heatmapProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.heatmapPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.heatmapAttribs.position);
    gl.vertexAttribPointer(this.heatmapAttribs.position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.heatmapTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.heatmapAttribs.texCoord);
    gl.vertexAttribPointer(this.heatmapAttribs.texCoord, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(this.heatmapUniforms.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.heatmapUniforms.view, false, this.viewMatrix);
    gl.uniform1i(this.heatmapUniforms.texture, 0);
    gl.uniform1f(this.heatmapUniforms.opacity, opacity);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.heatmapTexture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  
  _heatmapColor(t) {
    t = Math.max(0, Math.min(1, t));
    const stops = [
      { t: 0.0, r: 0.05, g: 0.0, b: 0.2, a: 0.9 },
      { t: 0.15, r: 0.1, g: 0.1, b: 0.6, a: 0.85 },
      { t: 0.3, r: 0.0, g: 0.5, b: 0.8, a: 0.8 },
      { t: 0.45, r: 0.0, g: 0.7, b: 0.3, a: 0.75 },
      { t: 0.6, r: 0.5, g: 0.8, b: 0.0, a: 0.7 },
      { t: 0.75, r: 0.9, g: 0.7, b: 0.0, a: 0.75 },
      { t: 0.9, r: 1.0, g: 0.3, b: 0.0, a: 0.8 },
      { t: 1.0, r: 1.0, g: 0.0, b: 0.0, a: 0.9 }
    ];
    let lower = stops[0];
    let upper = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i].t && t <= stops[i + 1].t) {
        lower = stops[i];
        upper = stops[i + 1];
        break;
      }
    }
    const range = upper.t - lower.t;
    const localT = range > 0 ? (t - lower.t) / range : 0;
    return {
      r: lower.r + (upper.r - lower.r) * localT,
      g: lower.g + (upper.g - lower.g) * localT,
      b: lower.b + (upper.b - lower.b) * localT,
      a: lower.a + (upper.a - lower.a) * localT
    };
  }
  
  drawContours(bodies, viewBounds, options = {}) {
    if (bodies.length === 0) return;
    
    const gl = this.gl;
    const { opacity = this.settings.contourOpacity } = options;
    
    // Grid resolution for contour calculation
    const gridSize = 128;
    const width = viewBounds.maxX - viewBounds.minX;
    const height = viewBounds.maxY - viewBounds.minY;
    const cellWidth = width / (gridSize - 1);
    const cellHeight = height / (gridSize - 1);
    
    // Calculate potential field on grid
    const potentials = new Float32Array(gridSize * gridSize);
    
    for (let j = 0; j < gridSize; j++) {
      for (let i = 0; i < gridSize; i++) {
        const x = viewBounds.minX + (i / (gridSize - 1)) * width;
        const y = viewBounds.minY + (j / (gridSize - 1)) * height;
        const potential = this.calculatePotential(x, y, bodies);
        potentials[j * gridSize + i] = potential;
      }
    }
    
    // Calculate STABLE contour levels based on body properties (not view)
    // This prevents flickering when zooming
    const numLevels = this.settings.contourLevels;
    const levels = [];
    
    // Find the strongest potential (closest to bodies) and a reference far potential
    // based on actual body properties
    let totalMass = 0;
    let maxBodyPotential = 0;
    
    for (const body of bodies) {
      totalMass += body.weight;
      // Potential at body surface
      const surfacePotential = this.G * body.weight / (body.radius * 0.5);
      if (surfacePotential > maxBodyPotential) {
        maxBodyPotential = surfacePotential;
      }
    }
    
    // Create fixed logarithmic levels based on body properties
    // These don't change with zoom, only with body configuration
    const minPotentialRef = -maxBodyPotential * 1.5; // Near bodies
    const maxPotentialRef = -this.G * totalMass / 10000; // Far from bodies (reference distance)
    
    const logMin = Math.log(-minPotentialRef + 1);
    const logMax = Math.log(-maxPotentialRef + 1);
    
    for (let i = 1; i < numLevels; i++) {
      const t = i / numLevels;
      const logVal = logMin + (logMax - logMin) * t;
      const level = -(Math.exp(logVal) - 1);
      levels.push(level);
    }
    
    let vertexCount = 0;
    
    // Marching squares for each contour level
    for (let levelIdx = 0; levelIdx < levels.length; levelIdx++) {
      const level = levels[levelIdx];
      const t = levelIdx / (levels.length - 1);
      const color = this._contourColor(t);
      
      // Process each cell in the grid
      for (let j = 0; j < gridSize - 1; j++) {
        for (let i = 0; i < gridSize - 1; i++) {
          // Get corner potentials
          const p00 = potentials[j * gridSize + i];
          const p10 = potentials[j * gridSize + i + 1];
          const p01 = potentials[(j + 1) * gridSize + i];
          const p11 = potentials[(j + 1) * gridSize + i + 1];
          
          // Calculate marching squares case
          let caseIndex = 0;
          if (p00 >= level) caseIndex |= 1;
          if (p10 >= level) caseIndex |= 2;
          if (p11 >= level) caseIndex |= 4;
          if (p01 >= level) caseIndex |= 8;
          
          // Skip if all corners are same side of contour
          if (caseIndex === 0 || caseIndex === 15) continue;
          
          // Cell world coordinates
          const x0 = viewBounds.minX + i * cellWidth;
          const y0 = viewBounds.minY + j * cellHeight;
          const x1 = x0 + cellWidth;
          const y1 = y0 + cellHeight;
          
          // Interpolation helper
          const lerp = (v0, v1, p0, p1) => {
            if (Math.abs(p1 - p0) < 0.0001) return 0.5;
            return (level - p0) / (p1 - p0);
          };
          
          // Edge midpoints with interpolation
          const bottom = { x: x0 + lerp(x0, x1, p00, p10) * cellWidth, y: y0 };
          const top = { x: x0 + lerp(x0, x1, p01, p11) * cellWidth, y: y1 };
          const left = { x: x0, y: y0 + lerp(y0, y1, p00, p01) * cellHeight };
          const right = { x: x1, y: y0 + lerp(y0, y1, p10, p11) * cellHeight };
          
          // Draw line segments based on case
          const segments = this._getMarchingSquaresSegments(caseIndex, bottom, right, top, left);
          
          for (const seg of segments) {
            if (vertexCount >= this.maxLineVertices - 2) break;
            
            const baseIdx = vertexCount * 2;
            const colorIdx = vertexCount * 4;
            
            this.linePositions[baseIdx] = seg.x1;
            this.linePositions[baseIdx + 1] = seg.y1;
            this.linePositions[baseIdx + 2] = seg.x2;
            this.linePositions[baseIdx + 3] = seg.y2;
            
            this.lineColors[colorIdx] = color.r;
            this.lineColors[colorIdx + 1] = color.g;
            this.lineColors[colorIdx + 2] = color.b;
            this.lineColors[colorIdx + 3] = opacity * color.a;
            this.lineColors[colorIdx + 4] = color.r;
            this.lineColors[colorIdx + 5] = color.g;
            this.lineColors[colorIdx + 6] = color.b;
            this.lineColors[colorIdx + 7] = opacity * color.a;
            
            vertexCount += 2;
          }
        }
      }
    }
    
    if (vertexCount === 0) return;
    
    gl.useProgram(this.lineProgram);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Set line width for thicker contours (may not work on all platforms)
    const lineWidth = this.settings.contourLineWidth || 2.0;
    gl.lineWidth(lineWidth);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.linePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.linePositions.subarray(0, vertexCount * 2), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribs.position);
    gl.vertexAttribPointer(this.lineAttribs.position, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.lineColors.subarray(0, vertexCount * 4), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.lineAttribs.color);
    gl.vertexAttribPointer(this.lineAttribs.color, 4, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(this.lineUniforms.projection, false, this.projectionMatrix);
    gl.uniformMatrix4fv(this.lineUniforms.view, false, this.viewMatrix);
    gl.drawArrays(gl.LINES, 0, vertexCount);
    
    // Reset line width to default
    gl.lineWidth(1.0);
  }
  
  _getMarchingSquaresSegments(caseIndex, bottom, right, top, left) {
    // Returns line segments for each marching squares case
    const segments = [];
    
    switch (caseIndex) {
      case 1: case 14:
        segments.push({ x1: bottom.x, y1: bottom.y, x2: left.x, y2: left.y });
        break;
      case 2: case 13:
        segments.push({ x1: bottom.x, y1: bottom.y, x2: right.x, y2: right.y });
        break;
      case 3: case 12:
        segments.push({ x1: left.x, y1: left.y, x2: right.x, y2: right.y });
        break;
      case 4: case 11:
        segments.push({ x1: right.x, y1: right.y, x2: top.x, y2: top.y });
        break;
      case 5:
        segments.push({ x1: bottom.x, y1: bottom.y, x2: right.x, y2: right.y });
        segments.push({ x1: left.x, y1: left.y, x2: top.x, y2: top.y });
        break;
      case 6: case 9:
        segments.push({ x1: bottom.x, y1: bottom.y, x2: top.x, y2: top.y });
        break;
      case 7: case 8:
        segments.push({ x1: left.x, y1: left.y, x2: top.x, y2: top.y });
        break;
      case 10:
        segments.push({ x1: bottom.x, y1: bottom.y, x2: left.x, y2: left.y });
        segments.push({ x1: right.x, y1: right.y, x2: top.x, y2: top.y });
        break;
    }
    
    return segments;
  }
  
  _contourColor(t) {
    // Color gradient from cyan (far) to magenta (near body)
    t = Math.max(0, Math.min(1, t));
    
    if (t < 0.33) {
      // Cyan to green
      const s = t / 0.33;
      return { r: 0.0, g: 0.8 + s * 0.2, b: 1.0 - s * 0.5, a: 0.6 + s * 0.2 };
    } else if (t < 0.66) {
      // Green to yellow
      const s = (t - 0.33) / 0.33;
      return { r: s * 1.0, g: 1.0, b: 0.5 - s * 0.5, a: 0.8 };
    } else {
      // Yellow to magenta/pink
      const s = (t - 0.66) / 0.34;
      return { r: 1.0, g: 1.0 - s * 0.6, b: s * 0.8, a: 0.8 + s * 0.2 };
    }
  }
  
  updateSettings(newSettings) {
    Object.assign(this.settings, newSettings);
  }
}



// ----- functions/utils.js -----


/**
 * Converts screen coordinates to world coordinates based on the current camera position and zoom level.
 * @param {number} screenX The x coordinate on the screen
 * @param {number} screenY The y coordinate on the screen
 * @returns {{x: number, y: number}} The world coordinates
 */
const screenToWorldCoordinates = (screenX, screenY) => {
  const worldX = (screenX - canvas.width / 2) / zoomFactor + camera.x + canvas.width / 2;
  const worldY = (screenY - canvas.height / 2) / zoomFactor + camera.y + canvas.height / 2;
  return { x: worldX, y: worldY };
}

/**
 * Converts world coordinates to screen coordinates based on the current camera position and zoom level.
 * @param {number} worldX The x coordinate in world space
 * @param {number} worldY The y coordinate in world space
 * @returns {{x: number, y: number}} The screen coordinates
 */
const worldToScreenCoordinates = (worldX, worldY) => {
  const screenX = ((worldX - canvas.width / 2 - camera.x) * zoomFactor) + canvas.width / 2;
  const screenY = ((worldY - canvas.height / 2 - camera.y) * zoomFactor) + canvas.height / 2;
  return { x: screenX, y: screenY };
}

/**
 * Zoom in towards mouse position by increasing the zoom factor.
 * If camera is locked on a celestial body, the camera will zoom in towards the center of screen.
 */
const zoomIn = () => {
  // Store mouse position before zoom
  const mouseX = camera.clientX;
  const mouseY = camera.clientY;
  
  // Convert mouse position to world coordinates before zoom
  const worldPosBeforeZoom = screenToWorldCoordinates(mouseX, mouseY);
  
  zoomFactor = Math.max(Math.min(zoomFactor * (1 + zoomSpeed), 6), 0.01);
  zoomFactor = parseFloat(zoomFactor.toFixed(3));
  
  // Convert the same world position back to screen coordinates after zoom
  const screenPosAfterZoom = worldToScreenCoordinates(worldPosBeforeZoom.x, worldPosBeforeZoom.y);
  
  // Adjust camera position to keep mouse position fixed
  if(!cameraFollow) {
    camera.x += (screenPosAfterZoom.x - mouseX) / zoomFactor;
    camera.y += (screenPosAfterZoom.y - mouseY) / zoomFactor;
  }
}

/**
 * Zoom out from mouse position by decreasing the zoom factor.
 * If camera is locked on a celestial body, the camera will zoom out towards the center of screen.
 */
const zoomOut = () => {
  // Store mouse position before zoom
  const mouseX = camera.clientX;
  const mouseY = camera.clientY;
  
  // Convert mouse position to world coordinates before zoom
  const worldPosBeforeZoom = screenToWorldCoordinates(mouseX, mouseY);
  
  zoomFactor = Math.max(Math.min(zoomFactor * (1 - zoomSpeed), 6), 0.01);
  zoomFactor = parseFloat(zoomFactor.toFixed(3));
  
  // Convert the same world position back to screen coordinates after zoom
  const screenPosAfterZoom = worldToScreenCoordinates(worldPosBeforeZoom.x, worldPosBeforeZoom.y);
  
  // Adjust camera position to keep mouse position fixed
  if(!cameraFollow) {
    camera.x += (screenPosAfterZoom.x - mouseX) / zoomFactor;
    camera.y += (screenPosAfterZoom.y - mouseY) / zoomFactor;
  }
}

/**
 * Converts a hex color string to an RGB object.
 * @param {string} hex The hex color string (e.g., "#ff0000")
 * @returns {{r: number, g: number, b: number}} The RGB color object
 */
const hexToRGB = (hex) => {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return { r, g, b };
}

/**
 * Resize the canvas to match the window size.
 * @param {Object} [webglRenderer] - Optional WebGL renderer to resize
 * @param {Object} [gravityFieldRenderer] - Optional gravity field renderer to resize
 */
function resizeCanvas(webglRenderer, gravityFieldRenderer) {
  canvas.width = window.innerWidth - 1;
  canvas.height = window.innerHeight - 1;
  starCanvas.width = window.innerWidth - 1;
  starCanvas.height = window.innerHeight - 1;
  trailCanvas.width = window.innerWidth - 1;
  trailCanvas.height = window.innerHeight - 1;
  webglCanvas.width = window.innerWidth - 1;
  webglCanvas.height = window.innerHeight - 1;
  
  // Resize WebGL renderer if provided
  if (webglRenderer) {
    webglRenderer.resize(window.innerWidth - 1, window.innerHeight - 1);
  }
  
  // Resize gravity field renderer if provided
  if (gravityFieldRenderer) {
    gravityFieldRenderer.resize(window.innerWidth - 1, window.innerHeight - 1);
  }
}

/**
 * Finds the closest celestial body to the given screen coordinates.
 * @param {number} screenX The x coordinate on the screen
 * @param {number} screenY The y coordinate on the screen
 * @returns {Object|null} The closest celestial body object or null if none found
 */

function findClosestBody(screenX, screenY) {
  if (celestialBodies.length === 0) return null;
  
  const {x: worldX, y: worldY} = screenToWorldCoordinates(screenX, screenY);
  
  let closestBody = null;
  let minDistance = Infinity;
  const clickThreshold = 100 / zoomFactor;
  
  celestialBodies.forEach(body => {
    const distance = Math.sqrt((body.x - worldX) ** 2 + (body.y - worldY) ** 2);
    
    if (distance < clickThreshold && distance < minDistance) {
      minDistance = distance;
      closestBody = body;
    }
  });
  
  return closestBody;
}


/**
 * Calculates the orbital velocity needed for a circular orbit at a given distance from a central mass.
 * Uses the formula: v = sqrt(GM/r)
 * @param {number} centralMass - Mass of the central body
 * @param {number} distance - Distance from the central body
 * @param {number} G - Gravitational constant (default: 0.1 to match simulation)
 * @returns {number} Orbital velocity magnitude
 */
function calculateOrbitalVelocity(centralMass, distance, G = 0.1) {
  return Math.sqrt(G * centralMass / distance);
}

/**
 * Creates orbital velocity components for a body orbiting around a central point.
 * @param {number} centerX - X coordinate of the central body
 * @param {number} centerY - Y coordinate of the central body
 * @param {number} orbitX - X coordinate of the orbiting body
 * @param {number} orbitY - Y coordinate of the orbiting body
 * @param {number} orbitalSpeed - Magnitude of orbital velocity
 * @param {boolean} clockwise - Whether to orbit clockwise (default: false for counter-clockwise)
 * @returns {{dx: number, dy: number}} Velocity components
 */
function createOrbitalVelocity(centerX, centerY, orbitX, orbitY, orbitalSpeed, clockwise = false) {
  const dx = orbitX - centerX;
  const dy = orbitY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return { dx: 0, dy: 0 };
  
  // Perpendicular direction for circular orbit
  const perpX = clockwise ? dy / distance : -dy / distance;
  const perpY = clockwise ? -dx / distance : dx / distance;
  
  return {
    dx: perpX * orbitalSpeed,
    dy: perpY * orbitalSpeed
  };
}



// ----- functions/collisionAndMassTransfer.js -----



/**
 * Handles elastic collision physics between two celestial bodies, including velocity calculations,
 * overlap resolution, and mass transfer effects.
 * @param {CelestialBody} body1 - First celestial body in the collision
 * @param {CelestialBody} body2 - Second celestial body in the collision
 * @returns {void}
 */
const bodyCollide = (body1, body2) => {
  // Calculate the distance between the bodys
  var dx = body1.x - body2.x;
  var dy = body1.y - body2.y;
  var distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate the angle of the collision
  var angle = Math.atan2(dy, dx);

  // Calculate the components of the velocity of each body
  var velocity1 = Math.sqrt(body1.dx * body1.dx + body1.dy * body1.dy);
  var velocity2 = Math.sqrt(body2.dx * body2.dx + body2.dy * body2.dy);

  // Calculate the direction of each body
  var direction1 = Math.atan2(body1.dy, body1.dx);
  var direction2 = Math.atan2(body2.dy, body2.dx);

  // Calculate the new velocity of each body
  var velocity1x = velocity1 * Math.cos(direction1 - angle);
  var velocity1y = velocity1 * Math.sin(direction1 - angle);
  var velocity2x = velocity2 * Math.cos(direction2 - angle);
  var velocity2y = velocity2 * Math.sin(direction2 - angle);

  // The final velocities after collision are calculated considering the mass and elasticity
  var finalVelocity1x = ((body1.weight - body2.weight) * velocity1x + 2 * body2.weight * velocity2x) / (body1.weight + body2.weight) * body1.elasticity;
  var finalVelocity2x = ((body2.weight - body1.weight) * velocity2x + 2 * body1.weight * velocity1x) / (body1.weight + body2.weight) * body2.elasticity;

  // Convert velocities back to vectors
  body1.dx = Math.cos(angle) * finalVelocity1x + Math.cos(angle + Math.PI/2) * velocity1y;
  body1.dy = Math.sin(angle) * finalVelocity1x + Math.sin(angle + Math.PI/2) * velocity1y;
  body2.dx = Math.cos(angle) * finalVelocity2x + Math.cos(angle + Math.PI/2) * velocity2y;
  body2.dy = Math.sin(angle) * finalVelocity2x + Math.sin(angle + Math.PI/2) * velocity2y;

  if (distance < body1.radius + body2.radius) {
      var overlap = body1.radius + body2.radius - distance;
      var angle = Math.atan2(body2.y - body1.y, body2.x - body1.x);
      body1.x -= overlap * Math.cos(angle) / 2;
      body1.y -= overlap * Math.sin(angle) / 2;
      body2.x += overlap * Math.cos(angle) / 2;
      body2.y += overlap * Math.sin(angle) / 2;
  } else {
      // If bodys are not overlapping, they should not be moving towards each other
      var relativeVelocityX = body2.dx - body1.dx;
      var relativeVelocityY = body2.dy - body1.dy;
      var relativeVelocityDotProduct = dx * relativeVelocityX + dy * relativeVelocityY;
      if (relativeVelocityDotProduct > 0) {
          return;  // Balls are moving apart, not colliding
      }
  }

  // Only perform mass transfer if enabled
  if (massTransferEnabled) {
    applyMassTransfer(body1, body2);
  }
}

/**
 * Handles mass transfer and transformation effects when celestial bodies collide.
 * Different rules apply based on the types of bodies involved:
 * - Black holes absorb other bodies completely
 * - Stars absorb planets
 * - Star-star collisions may create black holes
 * - Planet-planet collisions result in mass transfer or absorption
 * 
 * @param {CelestialBody} body1 - First celestial body in the collision
 * @param {CelestialBody} body2 - Second celestial body in the collision
 */
function applyMassTransfer(body1, body2) {
  if (body1.bodyType === 'blackHole' || body2.bodyType === 'blackHole') {
    // Case: Black hole collides with another body (including another black hole)
    // Remove the other body from the array and add its mass to the black hole

    const nonBlackHole = body1.bodyType === 'blackHole' ? body2 : body1;
    celestialBodies.splice(celestialBodies.indexOf(nonBlackHole), 1);
    const blackHole = body1.bodyType === 'blackHole' ? body1 : body2;
    blackHole.radius = calculateNewRadius(blackHole.weight + nonBlackHole.weight, blackHole.radius, blackHole.weight);
    blackHole.weight += nonBlackHole.weight;
    blackHole.dx /= 100;
    blackHole.dy /= 100;
  } 
  
  else if ((body1.bodyType === 'star' && body2.bodyType === 'planet') ||
            (body1.bodyType === 'planet' && body2.bodyType === 'star')) {
    // Case: Star and planet collide
    // Remove the planet and add its mass to the star
    
    const star = body1.bodyType === 'star' ? body1 : body2;
    const planet = body1.bodyType === 'planet' ? body1 : body2;
    celestialBodies.splice(celestialBodies.indexOf(planet), 1);
    star.radius = calculateNewRadius(star.weight + planet.weight, star.radius, star.weight);
    star.weight += planet.weight;
  } 
  
  else if (body1.bodyType === 'star' && body2.bodyType === 'star') {
    // Case: Star collides with star
    // There is a very small chance of becoming a black hole, otherwise, one gains mass and the other is removed

    const chanceOfBlackHole = 0.05;
    if (Math.random() < chanceOfBlackHole) {
      celestialBodies.splice(celestialBodies.indexOf(body1), 1);
      celestialBodies.splice(celestialBodies.indexOf(body2), 1);
      celestialBodies.push(
        new CelestialBody({
          bodyType: 'blackHole',
          density: celestialBodyValues.blackHole.density,
          weight: body1.weight + body2.weight,
          x: (body1.x + body2.x) / 2,
          y: (body1.y + body2.y) / 2,
          dx: (body1.dx + body2.dx) / 2,
          dy: (body1.dy + body2.dy) / 2,
          color: { r: 0, g: 0, b: 0 },
          label: 'Black Hole ' + (celestialBodies.length + 1),
          trailColor: 'rgba(100, 100, 100, 0.5)',
          textColor: 'rgba(255, 255, 255, 0.9)'
        })
      );
    } 
    
    else {
      const survivor = body1.weight >= body2.weight ? body1 : body2;
      const removed = body1.weight < body2.weight ? body1 : body2;
      if(removed.weight > survivor.weight/10) {
        survivor.radius = calculateNewRadius(survivor.weight + removed.weight, survivor.radius, survivor.weight);
        survivor.weight += removed.weight/2;
        removed.radius = calculateNewRadius(removed.weight/2, removed.radius, removed.weight);
        removed.weight = removed.weight/2;
      }
      else {
        survivor.radius = calculateNewRadius(survivor.weight + removed.weight, survivor.radius, survivor.weight);
        survivor.weight += removed.weight;
        celestialBodies.splice(celestialBodies.indexOf(removed), 1);
      }
    }
  } 
  
  else if (body1.bodyType === 'planet' && body2.bodyType === 'planet') {
    // Case: Planet collides with a planet
    // Remove one planet and add its mass to the other

    const survivor = body1.weight >= body2.weight ? body1 : body2;
    const removed = body1.weight < body2.weight ? body1 : body2;
    if (removed.weight > survivor.weight / 10) {
      survivor.radius = calculateNewRadius(survivor.weight + removed.weight, survivor.radius, survivor.weight);
      survivor.weight += removed.weight / 2;
      removed.radius = calculateNewRadius(removed.weight / 2, removed.radius, removed.weight);
      removed.weight = removed.weight / 2;
    }
    else {
      survivor.radius = calculateNewRadius(survivor.weight + removed.weight, survivor.radius, survivor.weight);
      survivor.weight += removed.weight;
      celestialBodies.splice(celestialBodies.indexOf(removed), 1);
    }
  }
}

/**
 * Calculates the new radius of a celestial body after a mass change,
 * maintaining the appropriate density relationship.
 * @param {number} newWeight - The new mass of the body after collision
 * @param {number} originalRadius - The original radius before collision
 * @param {number} originalWeight - The original mass before collision
 * @returns {number} The new radius of the celestial body
 */
function calculateNewRadius(newWeight, originalRadius, originalWeight) {
  const constant = originalWeight / (originalRadius * originalRadius * originalRadius);
  return Math.cbrt(newWeight / constant);
}



// ----- functions/deltaTime.js -----


// Instructions and Theory:

// Delta time is a concept used in game development to keep track of the time that has passed between frames.
// This is useful for creating smooth animations and for making sure that the game runs at the same speed on different devices.

// Call this function at the beginning of your game loop and get the deltaTime value returned

// For Eg: Call this function at the beginning of the draw function, assign the value to a variable and multiply it 
// with any velocity you wish to follow consistently across different devices.

// function draw(){
//   const deltaTime = getDeltaTime();

//   object.x += object.velX * deltaTime;
//   object.y += object.velY * deltaTime;

//   requestAnimationFrame(draw);
// }
// draw();

let lastTime = Date.now();

function getDeltaTime() {
  let currentTime = Date.now();
  let deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  return deltaTime;
}



// ----- functions/fpsDisplay.js -----


let fps = 60;
let fpsInterval = 1000 / fps;
let lastFrameTime = Date.now();
let frameTimes = [];
let currentFps = 0;
let avgFps = 0;
let onePercentLowFps = 0;

/**
 * Draw FPS on canvas
 * @param {number} width - Width of canvas
 * @param {number} height - Height of canvas
 * @param {CanvasRenderingContext2D} context - 2D rendering context for the canvas
 */
const drawFPS = (width, height, context) => {
  let now = Date.now();
  let frameTime = now - lastFrameTime;
  lastFrameTime = now;

  // Update current FPS
  currentFps = Math.round(1000 / frameTime);

  // Store frame time for average and 1% low calculations
  frameTimes.push(frameTime);
  if (frameTimes.length > fps) {
    frameTimes.shift(); // Keep only the last second's worth of frames
  }

  // Calculate average FPS over the last second
  const totalFrameTime = frameTimes.reduce((a, b) => a + b, 0);
  avgFps = Math.round(1000 / (totalFrameTime / frameTimes.length));

  // Calculate 1% low FPS
  const sortedFrameTimes = [...frameTimes].sort((a, b) => b - a);
  const onePercentLowIndex = Math.ceil(sortedFrameTimes.length * 0.01);
  const onePercentLowTime = sortedFrameTimes.slice(0, onePercentLowIndex).reduce((a, b) => a + b, 0) / onePercentLowIndex;
  onePercentLowFps = Math.round(1000 / onePercentLowTime);

  // Draw FPS metrics on canvas
  context.clearRect(width - 80, 0, 80, 40); // Clear previous FPS display
  context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  context.fillRect(width - 80, 10, 80, 40);
  context.fillStyle = 'black';
  context.font = '11px sans-serif';
  context.fillText(`FPS: ${currentFps}`, width - 75, 22);
  context.fillText(`Avg FPS: ${avgFps}`, width - 75, 34);
  context.fillText(`1% Low: ${onePercentLowFps}`, width - 75, 46);
}



// ----- functions/cameraHelper.js -----



/**
 * Function to smoothly follow a target position with the camera.
 * Using a smoothed speed value to avoid jerky camera movement.
 * @param {number} targetX The target x position to follow
 * @param {number} targetY The target y position to follow
 * @param {CelestialBody} targetBody The target body to follow
 */
function smoothFollow(targetX, targetY, targetBody) {
  const targetDX = -targetBody.dx;
  const targetDY = -targetBody.dy;
  const targetSpeed = Math.sqrt(targetDX * targetDX + targetDY * targetDY);

  // Smooth the target speed to avoid jerky camera movement
  const smoothFactor = 0.1; // Lower value for smoother (slower) transitions
  smoothedSpeed = smoothedSpeed * (1 - smoothFactor) + targetSpeed * smoothFactor;

  // Calculate distance between camera and target
  const distanceX = targetX - camera.x;
  const distanceY = targetY - camera.y;
  const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Adjust speed based on both smoothed target speed and distance
  const speed = Math.min(distance * 0.01 + smoothedSpeed * 2, distance);

  const distanceThreshold = 0;
  const lockDistance = smoothedSpeed * 1.5;

  if (isCameraLockedOn || distance <= lockDistance) {
    // Follow exactly if locked or very close
    camera.x = targetX;
    camera.y = targetY;
    isCameraLockedOn = true;
  } else {
    // Smoothly move camera toward the target
    camera.x += distanceX * (speed / distance);
    camera.y += distanceY * (speed / distance);

    // Lock if within locking distance
    if (distance <= lockDistance) {
      isCameraLockedOn = true;
    }
  }

  // Unlock if the distance grows beyond a threshold
  if (distance > distanceThreshold) {
    isCameraLockedOn = false;
  }
}


/**
 * Update the camera position to follow the center of mass of all celestial bodies.
 * @returns {void}
 */
function updateCameraToFollowCenterOfMass() {
  if (celestialBodies.length === 0) return;

  let totalMass = 0;
  let centerX = 0;
  let centerY = 0;

  celestialBodies.forEach(body => {
    totalMass += body.weight;
    centerX += body.x * body.weight;
    centerY += body.y * body.weight;
  });

  centerX /= totalMass;
  centerY /= totalMass;

  // Set the target camera position
  targetCamera.x = centerX - canvas.width / 2;
  targetCamera.y = centerY - canvas.height / 2;

  // Smoothly move the camera towards the target
  camera.x += (targetCamera.x - camera.x) * cameraMoveSpeed;
  camera.y += (targetCamera.y - camera.y) * cameraMoveSpeed;
}



// ----- functions/showPrompts.js -----


const OPACITY_THRESHOLD = 0.4;

/**
 * @typedef {Object} PromptSettings
 * @property {string} text - The text to display
 * @property {number} y - The y position of the prompt
 * @property {number} x - The x position of the prompt
 * @property {number} vel - The velocity of the prompt
 * @property {number} time - The time the prompt has been displayed
 * @property {number} opacity - The opacity of the prompt
 * @property {string} color - The color of the prompt
 * @property {boolean} isOverRide - Whether this is an override prompt
 */

/** @type {PromptSettings[]} PromptQueue */
const promptQueue = [];

/** @type {PromptSettings[]} ActivePrompts */
const activePrompts = [];

/**
 * Adds a prompt to the queue with the specified settings.
 * @param {Object} settings - The settings for the prompt
 * @param {string} settings.text - The text to display
 * @param {number} settings.vel - The velocity of the prompt
 * @param {number} settings.time - The time the prompt has been displayed
 * @param {string} settings.color - The color of the prompt
 * @param {number} settings.x - The x position of the prompt
 * @param {number} settings.y - The y position of the prompt
 * @param {number} settings.textSize - The size of the text
 * @param {boolean} settings.isOverRide - Whether to show the prompt immediately
 * @returns {void}
 */
function prompt({
  text = "",
  vel = 1,
  time = 0.01,
  color = "255, 255, 255",
  x,
  y = canvas.height / 1.5,
  isOverRide = false,
  textSize = 28
}) {
  ctx.font = `${textSize}px Arial`;

  const promptData = {
    text,
    y,
    x: x || (canvas.width - ctx.measureText(text).width) / 2,
    opacity: 1,
    vel,
    time,
    color,
    isActive: false,
    textSize,
    isOverRide,
  };
  
  if (isOverRide) {
    // Immediately activate the override prompt
    promptData.isActive = true;
    activePrompts.push(promptData);
  } else {
    promptQueue.push(promptData);
    // If no prompts are active, start showing the first one
    if (activePrompts.length === 0) {
      activateNextPrompt();
    }
  }
}

/**
 * Activates the next prompt in the queue if conditions are met
 * @returns {void}
 */
function activateNextPrompt() {
  // Check if we have pending prompts and haven't reached max active prompts
  if (promptQueue.length > 0) {
    // Find the last non-override prompt
    const lastNormalPrompt = [...activePrompts].reverse().find(prompt => !prompt.isOverRide);
    
    // Check if we can add another prompt based on opacity of last normal prompt
    const canAddPrompt = !lastNormalPrompt || lastNormalPrompt.opacity <= OPACITY_THRESHOLD;

    if (canAddPrompt) {
      const nextPrompt = promptQueue.shift();
      nextPrompt.isActive = true;
      activePrompts.push(nextPrompt);
    }
  }
}

/**
 * Updates and renders all active prompts
 * @param {number} deltaTime - Time elapsed since last frame in seconds
 */
function showPrompts(deltaTime) {
  // Update and render all active prompts
  for (let i = activePrompts.length - 1; i >= 0; i--) {
    const prompt = activePrompts[i];
    
    // Render the prompt
    ctx.fillStyle = `rgba(${prompt.color}, ${prompt.opacity})`;
    ctx.font = `${prompt.textSize}px Arial`;
    ctx.fillText(prompt.text, prompt.x, prompt.y);

    // Update prompt position and opacity using deltaTime
    // vel is in pixels per second, so multiply by deltaTime (seconds)
    prompt.y -= prompt.vel * deltaTime;
    // time is fade rate per second, so multiply by deltaTime
    prompt.opacity -= prompt.time * deltaTime;

    // Remove prompt if it's completely faded out
    if (prompt.opacity <= 0) {
      activePrompts.splice(i, 1);
    }
  }

  // Check if we can activate the next prompt
  activateNextPrompt();
}

/**
 * Clears all prompts and the queue
 * @returns {void}
 */
function clearPrompts() {
  promptQueue.length = 0;
  activePrompts.length = 0;
}



// ----- functions/dragListeners.js -----



let isShiftPressed = false;
let isFirstDrag = true;

// Add shift key listeners
document.addEventListener('keydown', (e) => {
  // Check if user is typing in an input field
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.contentEditable === 'true'
  );
  
  if (isTyping) return;
  
  if (e.key === 'Shift') isShiftPressed = true;
});

document.addEventListener('keyup', (e) => {
  // Check if user is typing in an input field
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.contentEditable === 'true'
  );
  
  if (isTyping) return;
  
  if (e.key === 'Shift') isShiftPressed = false;
});

function startDragHandler(e) {
  // Only start drag on left-click (button 0)
  if (e.button !== 0) {
    return;
  }
  
  e.preventDefault();
  
  // Handle probe mode
  if (probeModeEnabled) {
    const worldCoords = screenToWorldCoordinates(e.clientX, e.clientY);
    
    // Check for Ctrl (Windows/Linux) or Command/Meta (Mac)
    const isModifierPressed = e.ctrlKey || e.metaKey;
    
    if (isModifierPressed && probe !== null) {
      // Ctrl/Cmd+click: add waypoint for smooth transition
      if (probe.isTransitioning) {
        // Already transitioning - add to waypoint queue
        probe.waypoints.push({ x: worldCoords.x, y: worldCoords.y });
      } else {
        // Start new transition
        probe.startX = probe.x;
        probe.startY = probe.y;
        probe.targetX = worldCoords.x;
        probe.targetY = worldCoords.y;
        probe.isTransitioning = true;
        probe.transitionProgress = 0;
      }
    } else {
      // Regular click: place/move probe instantly (clears any waypoints)
      probe = {
        x: worldCoords.x,
        y: worldCoords.y,
        startX: worldCoords.x,
        startY: worldCoords.y,
        targetX: worldCoords.x,
        targetY: worldCoords.y,
        isTransitioning: false,
        transitionProgress: 1,
        waypoints: []
      };
    }
    return; // Don't start body drag in probe mode
  }
  
  // Handle preset spawning (click to spawn)
  if(selectedPreset !== null) {
    spawnPreset(selectedPreset);
    selectedPreset = null; // Clear preset after spawning
    return; // Don't start drag
  }
  
  if(selectedBody !== '') {
    startDrag = screenToWorldCoordinates(e.clientX, e.clientY);
  } else {
    if (isFirstDrag) {
      prompt({
        text: 'Press (c) to camera follow a celestial body.',
        vel: 20,
        time: 0.1,
        y: canvas.height - 20,
        textSize: 20,
        isOverRide: true
      });
      isFirstDrag = false;
    }
    camera.lastMouseX = e.clientX;
    camera.lastMouseY = e.clientY;
  }
  canvas.addEventListener('mousemove', dragHandler);
  canvas.addEventListener('mouseup', endDragHandler);
  canvas.addEventListener('mousedown', rightClickCancelHandler);
  canvas.addEventListener('contextmenu', cancelDragHandler);
}

function spawnPreset(presetKey) {
  clearPrompts();
  
  switch(presetKey) {
    case '4': // Three Body Problem
      setupThreeBodyProblem();
      cameraFollow = followCam.checked = true;
      cameraFollowingIndex = -1;
      collideIsON = collision.checked = false;
      prompt({
        text: 'Three Body Problem spawned',
        y: canvas.height - 20,
        vel: 20,
        time: 0.3,
        textSize: 16,
        isOverRide: true
      });
      break;
      
    case '5': // Galaxy
      zoomFactor = 0.15;
      showVelocitiesIsON = showVelocities.checked = false;
      showStarsIsON = showStars.checked = false;
      collideIsON = collision.checked = false;
      celestialBodies.length = 0;
      spawnGalaxy();
      prompt({
        text: 'Galaxy spawned',
        y: canvas.height - 20,
        vel: 20,
        time: 0.3,
        textSize: 16,
        isOverRide: true
      });
      break;
      
    case '6': // Solar System
      spawnSolarSystem();
      prompt({
        text: 'Solar System spawned',
        y: canvas.height - 20,
        vel: 20,
        time: 0.3,
        textSize: 16,
        isOverRide: true
      });
      break;
      
    case '7': // Binary Star System
      spawnBinaryStarSystem();
      prompt({
        text: 'Binary Star System spawned',
        y: canvas.height - 20,
        vel: 20,
        time: 0.3,
        textSize: 16,
        isOverRide: true
      });
      break;
      
    case '8': // Meteor Shower
      spawnMeteorShower();
      prompt({
        text: 'Meteor Shower spawned',
        y: canvas.height - 20,
        vel: 20,
        time: 0.3,
        textSize: 16,
        isOverRide: true
      });
      break;
      
    case '9': // Stress Test (3000 planets)
      showTrailsIsON = showTrails.checked = false;
      showStarsIsON = showStars.checked = false;
      showVelocitiesIsON = showVelocities.checked = false;
      showLabelsIsON = showLabels.checked = false;
      showFPSIsON = showFPS.checked = true;
      spawnPlanetsNearMouse(3000);
      prompt({
        text: 'Stress Test: 3000 planets spawned',
        y: canvas.height - 20,
        vel: 20,
        time: 0.3,
        textSize: 16,
        isOverRide: true
      });
      break;
  }
}

function dragHandler(e) {
  e.preventDefault();
  if(selectedBody !== '') {
    endDrag = screenToWorldCoordinates(e.clientX, e.clientY);
  } else {
    // Calculate the difference from the last mouse position
    const deltaX = e.clientX - camera.lastMouseX;
    const deltaY = e.clientY - camera.lastMouseY;
    
    // Apply speed multiplier if shift is pressed
    const speedMultiplier = isShiftPressed ? 3 : 1;
    
    // Update camera position with speed multiplier
    camera.x -= (deltaX * speedMultiplier)/ Math.sqrt(zoomFactor);
    camera.y -= (deltaY * speedMultiplier) / Math.sqrt(zoomFactor);
    
    // Update last mouse position for next frame
    camera.lastMouseX = e.clientX;
    camera.lastMouseY = e.clientY;
  }
}

function predictFullSystemTrajectory(ghostBody, existingBodies, totalTime = 1000) {
    const ghostTrajectory = [];
    // Use a map to store trajectories for the top 5 bodies, keyed by their IDs
    const closestBodiesTrajectories = new Map();

    // 1. Create simulation bodies
    const simBodies = existingBodies.map(body => {
      const simBody = new CelestialBody({ ...body });
      // Preserve pinned status
      if (body.isPinned) {
        simBody.isPinned = true;
        simBody.pinnedX = body.x;
        simBody.pinnedY = body.y;
      }
      return simBody;
    });
    const ghostSimBody = new CelestialBody({ ...ghostBody });
    simBodies.push(ghostSimBody);

    // 2. Find the top 5 closest bodies
    const topClosestBodies = [];
    if (existingBodies.length > 0) {
        const distances = simBodies
            .filter(body => body.id !== ghostSimBody.id)
            .map(body => ({
                body,
                distSq: (body.x - ghostSimBody.x) ** 2 + (body.y - ghostSimBody.y) ** 2
            }));
        
        distances.sort((a, b) => a.distSq - b.distSq);
        const closestFive = distances.slice(0, 5);

        closestFive.forEach(item => {
            topClosestBodies.push(item.body);
            closestBodiesTrajectories.set(item.body.id, []); // Initialize trajectory arrays
        });
    }

    // 3. Run the temporary simulation
    const tempPhysics = new PhysicsSystem();
    let simulatedTime = 0;
    
    while (simulatedTime < totalTime) {
        tempPhysics.update(simBodies, false);

        // Adaptive timestep logic
        let maxForce = 0;
        for (const body of simBodies) {
            const forceMagnitude = Math.sqrt(body.ax ** 2 + body.ay ** 2);
            if (forceMagnitude > maxForce) {
                maxForce = forceMagnitude;
            }
        }
        
        const timeStep = Math.max(0.1, Math.min(5, 1 / (maxForce + 1e-5)));

        // Update positions (respecting pinned status)
        for (const body of simBodies) {
            if (body.isPinned) {
                // Keep pinned bodies at their pinned position
                body.x = body.pinnedX;
                body.y = body.pinnedY;
                body.dx = 0;
                body.dy = 0;
            } else {
                body.dx += body.ax * timeStep;
                body.dy += body.ay * timeStep;
                body.x += body.dx * timeStep;
                body.y += body.dy * timeStep;
            }
        }

        // 4. Record trajectories
        ghostTrajectory.push({ x: ghostSimBody.x, y: ghostSimBody.y });
        for (const body of topClosestBodies) {
            closestBodiesTrajectories.get(body.id).push({ x: body.x, y: body.y });
        }
        
        simulatedTime += timeStep;
    }

    return { ghostTrajectory, closestBodiesTrajectories };
}


function drawTrajectory(startX, startY, endX, endY) {
  // 1. Always draw the dotted launch indicator line
  const cameraAdjustedStartX = startX - camera.x;
  const cameraAdjustedStartY = startY - camera.y;
  const cameraAdjustedEndX = endX - camera.x;
  const cameraAdjustedEndY = endY - camera.y;

  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(cameraAdjustedStartX, cameraAdjustedStartY);
  ctx.lineTo(cameraAdjustedEndX, cameraAdjustedEndY);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Only run the full prediction if there are fewer than 10 bodies
  if (celestialBodies.length < 10) {
    // Calculate launch velocity
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxSpeed = 50;
    const launchSpeed = Math.min(0.05 * distance, maxSpeed);
    let launchVelocityX = (distance > 0) ? (dx / distance) * launchSpeed : 0;
    let launchVelocityY = (distance > 0) ? (dy / distance) * launchSpeed : 0;

    // Define the "ghost" body
    let bodyType = selectedBody.toLowerCase().replace(' ', '');
    if (bodyType === 'blackhole') bodyType = 'blackHole';
    const ghostBody = {
      bodyType,
      radius: celestialBodyValues[bodyType].radius,
      density: celestialBodyValues[bodyType].density,
      weight: 4 / 3 * Math.PI * Math.pow(celestialBodyValues[bodyType].radius, 3) * celestialBodyValues[bodyType].density,
      x: endX, y: endY, dx: -launchVelocityX, dy: -launchVelocityY, ax: 0, ay: 0,
      color: celestialBodyValues[bodyType].color, label: 'ghost'
    };
    
    // Run the prediction
    const { ghostTrajectory, closestBodiesTrajectories } = predictFullSystemTrajectory(ghostBody, celestialBodies);

    // Draw the ghost body's trajectory
    ctx.beginPath();
    ctx.moveTo(cameraAdjustedEndX, cameraAdjustedEndY);
    ghostTrajectory.forEach(point => {
        ctx.lineTo(point.x - camera.x, point.y - camera.y);
    });
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.stroke();

    // Draw trajectories for the 5 closest bodies with distinct colors
    const colors = [
        'rgba(100, 150, 255, 0.7)', // Blue
        'rgba(100, 255, 150, 0.7)', // Green
        'rgba(255, 150, 100, 0.7)', // Orange
        'rgba(200, 100, 255, 0.7)', // Purple
        'rgba(255, 255, 100, 0.7)'  // Yellow
    ];
    
    let colorIndex = 0;
    for (const trajectory of closestBodiesTrajectories.values()) {
        if (trajectory.length > 0) {
            ctx.beginPath();
            const firstPoint = trajectory[0];
            ctx.moveTo(firstPoint.x - camera.x, firstPoint.y - camera.y);
            trajectory.forEach(point => {
                ctx.lineTo(point.x - camera.x, point.y - camera.y);
            });
            ctx.strokeStyle = colors[colorIndex % colors.length];
            ctx.stroke();
            colorIndex++;
        }
    }
  }
}


function endDragHandler(e) {
  e.preventDefault();
  
  // Only spawn body on left-click (button 0), not right-click (button 2)
  if (e.button !== 0) {
    startDrag = null;
    endDrag = null;
    canvas.removeEventListener('mousemove', dragHandler);
    canvas.removeEventListener('mouseup', endDragHandler);
    canvas.removeEventListener('contextmenu', cancelDragHandler);
    return;
  }
  
  if (startDrag) {
    endDrag = screenToWorldCoordinates(e.clientX, e.clientY);

    const dx = endDrag.x - startDrag.x;
    const dy = endDrag.y - startDrag.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const maxSpeed = 50;
    const launchSpeed = Math.min(0.05 * distance, maxSpeed);

    let launchVelocityX = 0;
    let launchVelocityY = 0;

    if (launchSpeed > 0) {
      launchVelocityX = (dx / distance) * launchSpeed;
      launchVelocityY = (dy / distance) * launchSpeed;
    }

    if (selectedBody === 'Planet') {
      celestialBodies.push(
        new CelestialBody({
          bodyType: 'planet',
          radius: celestialBodyValues.planet.radius,
          density: celestialBodyValues.planet.density,
          x: endDrag.x,
          y: endDrag.y,
          dx: -launchVelocityX,
          dy: -launchVelocityY,
          color: celestialBodyValues.planet.color,
          label: 'Planet ' + (celestialBodies.length + 1)
        })
      );
    } else if (selectedBody === 'Star') {
      celestialBodies.push(
        new CelestialBody({
          bodyType: 'star',
          radius: celestialBodyValues.star.radius,
          density: celestialBodyValues.star.density,
          x: endDrag.x,
          y: endDrag.y,
          dx: -launchVelocityX,
          dy: -launchVelocityY,
          color: celestialBodyValues.star.color,
          label: 'Star ' + (celestialBodies.length + 1)
        })
      );
    } else if (selectedBody === 'Black Hole') {
      celestialBodies.push(
        new CelestialBody({
          bodyType: 'blackHole',
          radius: celestialBodyValues.blackHole.radius,
          density: celestialBodyValues.blackHole.density,
          x: endDrag.x,
          y: endDrag.y,
          dx: -launchVelocityX,
          dy: -launchVelocityY,
          color: celestialBodyValues.blackHole.color,
          label: 'Black Hole ' + (celestialBodies.length + 1),
          trailColor: 'rgba(100, 100, 100, 0.5)',
          textColor: 'rgba(255, 255, 255, 0.9)'
        })
      );
    }

    startDrag = null;
    endDrag = null;
    selectedBody = '';
  }
  canvas.removeEventListener('mousemove', dragHandler);
  canvas.removeEventListener('mouseup', endDragHandler);
  canvas.removeEventListener('mousedown', rightClickCancelHandler);
  canvas.removeEventListener('contextmenu', cancelDragHandler);
}

function rightClickCancelHandler(e) {
  // Cancel on right-click (button 2)
  if (e.button === 2) {
    e.preventDefault();
    
    // Cancel the drag operation
    if (startDrag) {
      prompt({
        text: 'Launch cancelled',
        y: canvas.height - 20,
        vel: 20,
        time: 0.1,
        textSize: 16,
        isOverRide: true
      });
    }
    
    startDrag = null;
    endDrag = null;
    
    canvas.removeEventListener('mousemove', dragHandler);
    canvas.removeEventListener('mouseup', endDragHandler);
    canvas.removeEventListener('mousedown', rightClickCancelHandler);
    canvas.removeEventListener('contextmenu', cancelDragHandler);
  }
}

function cancelDragHandler(e) {
  e.preventDefault();
  
  // Just prevent the context menu, the actual cancel is handled by rightClickCancelHandler
  startDrag = null;
  endDrag = null;
  
  canvas.removeEventListener('mousemove', dragHandler);
  canvas.removeEventListener('mouseup', endDragHandler);
  canvas.removeEventListener('mousedown', rightClickCancelHandler);
  canvas.removeEventListener('contextmenu', cancelDragHandler);
}



// ----- functions/spawnTemplates.js -----



/** 
 * Sets up a three-body problem with three planets in an equilateral triangle formation.
 * Each planet has a random distance from the center, random velocity, and random mass.
 * The planets are colored red, green, and blue, respectively.
 */
function setupThreeBodyProblem() {
  // Define the center of the screen
  const centerX = camera.x + canvas.width / 2;
  const centerY = camera.y + canvas.height / 2;

  // Define the base distance from the center for each planet
  const baseDistance = 200;

  // Create three planets in an equilateral triangle formation
  const planets = [
    {
      angle: 0,
      color: { r: 255, g: 0, b: 0 },
      label: 'Planet Red'
    },
    {
      angle: 2 * Math.PI / 3,
      color: { r: 0, g: 255, b: 0 },
      label: 'Planet Green'
    },
    {
      angle: 4 * Math.PI / 3,
      color: { r: 0, g: 0, b: 255 },
      label: 'Planet Blue'
    }
  ];

  planets.forEach((planet) => {
    // Add small random variations to distance and angle
    const distance = baseDistance + (Math.random() - 0.5) * 20; // +/- 10 units
    const angleVariation = (Math.random() - 0.5) * 0.1; // +/- 0.05 radians
    const adjustedAngle = planet.angle + angleVariation;

    const x = centerX + distance * Math.cos(adjustedAngle);
    const y = centerY + distance * Math.sin(adjustedAngle);

    // Calculate initial velocity perpendicular to the radius
    const baseSpeed = 1;
    const speedVariation = (Math.random() - 0.5) * 0.2; // +/- 10% speed variation
    const speed = baseSpeed + speedVariation;
    const velocityAngle = adjustedAngle + Math.PI / 2;
    const dx = speed * Math.cos(velocityAngle);
    const dy = speed * Math.sin(velocityAngle);

    // Add small random variations to mass (density)
    const baseDensity = 1;
    const densityVariation = (Math.random() - 0.5) * 0.2; // +/- 10% density variation
    const density = baseDensity + densityVariation;

    celestialBodies.push(
      new CelestialBody({
        bodyType: 'planet',
        radius: 10,
        density: density,
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        color: planet.color,
        label: planet.label
      })
    );
  });
}

/**
 * Spawns a specified number of planets near the mouse cursor in a circular area.
 * @param {number} numPlanets The number of planets to spawn
 */
function spawnPlanetsNearMouse(numPlanets) {
  const worldCoords = screenToWorldCoordinates(canvas.width / 2, canvas.height / 2);

  // Define an array of vibrant colors
  const colorVariations = [
    { r: 135, g: 206, b: 235 },  // Bright Sky Blue
    { r: 255, g: 99, b: 71 },    // Bright Tomato Red
    { r: 255, g: 215, b: 0 },    // Bright Gold/Yellow
    { r: 50, g: 205, b: 50 },    // Lime Green
    { r: 255, g: 105, b: 180 },  // Hot Pink
    { r: 173, g: 216, b: 230 },  // Light Blue
    { r: 255, g: 160, b: 122 }   // Light Salmon
  ];

  const maxSpawnRadius = 300 / zoomFactor; // Maximum spawn radius in world coordinates

  for (let i = 0; i < numPlanets; i++) {
    // Generate a random angle (0 to 2π) and radius (0 to maxSpawnRadius)
    const theta = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * maxSpawnRadius; // Square root for even distribution

    const randomXOffset = r * Math.cos(theta);
    const randomYOffset = r * Math.sin(theta);

    // Determine color: mostly white with some colorful variation
    let planetColor;
    if (Math.random() < 0.1) {  // 10% chance of being a colorful planet
      planetColor = colorVariations[Math.floor(Math.random() * colorVariations.length)];
    } else {
      // Slightly varied white to give a bit of natural variation
      const whiteVariation = 100;
      planetColor = { 
        r: 255 - Math.random() * whiteVariation, 
        g: 255 - Math.random() * whiteVariation, 
        b: 255 - Math.random() * whiteVariation 
      };
    }

    const newPlanet = new CelestialBody({
      bodyType: 'planet',
      radius: 4,
      density: 0.5,
      x: worldCoords.x + randomXOffset,
      y: worldCoords.y + randomYOffset,
      dx: Math.random() * 2 - 1,
      dy: Math.random() * 2 - 1,
      color: planetColor,
      label: 'Planet ' + (celestialBodies.length + 1)
    });

    celestialBodies.push(newPlanet);
  }
}

/**
 * Spawns a planet with a velocity ewual to 1/1000th the speed of light.
 */
function spawnPlanetWithLightSpeed() {
  const worldCoords = screenToWorldCoordinates(
    canvas.width * Math.random(),
    canvas.height * Math.random()
  );

  const newPlanet = new CelestialBody({
    bodyType: 'planet',
    radius: 4,
    density: 0.5,
    x: worldCoords.x,
    y: worldCoords.y,
    dx: 299792.458 / 1000,
    dy: 0,
    color: { r: 255, g: 255, b: 255 },
    label: 'Planet ' + (celestialBodies.length + 1)
  });

  celestialBodies.push(newPlanet);
}

/**
 * Spawns a solar system with the Sun and all eight planets.
 */
const spawnSolarSystem = () => {
  celestialBodies.push(
    new CelestialBody({
      bodyType: 'star',
      radius: 100,
      density: 15,
      x: -6000,
      y: 0,
      dx: 0,
      dy: 0,
      color: celestialBodyValues.star.color,
      label: 'Sun'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 2,
      density: 0.5,
      x: -4500,
      y: 0,
      dx: 0,
      dy: -60,
      color:  { r: 211, g: 211, b: 211 },
      label: 'Mercury'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 4,
      density: 1.5,
      x: -2500,
      y: 0,
      dx: 0,
      dy: -40,
      color:  { r: 255, g: 174, b: 66 },
      label: 'Venus'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 4.5,
      density: 1.5,
      x: -0,
      y: 0,
      dx: 0,
      dy: -30,
      color:  { r: 83, g: 196, b: 255 },
      label: 'Earth'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 5,
      density: 2,
      x: 3000,
      y: 0,
      dx: 0,
      dy: -24,
      color:  { r: 193, g: 68, b: 14 },
      label: 'Mars'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 40,
      density: 0.1,
      x: 9000,
      y: 0,
      dx: 0,
      dy: -20,
      color:  { r: 245, g: 245, b: 220 },
      label: 'Jupiter'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 25,
      density: 0.5,
      x: 18000,
      y: 0,
      dx: 0,
      dy: -15,
      color:  { r: 255, g: 198, b: 137 },
      label: 'Saturn'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 20,
      density: 1,
      x: 30000,
      y: 0,
      dx: 0,
      dy: -12,
      color:  { r: 172, g: 229, b: 238 },
      label: 'Uranus'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 20,
      density: 1,
      x: 42000,
      y: 0,
      dx: 0,
      dy: -10,
      color:  { r: 0, g: 147, b: 125 },
      label: 'Neptune'
    })
  );

  celestialBodies.push(
    new CelestialBody({
      bodyType: 'planet',
      radius: 1,
      density: 1,
      x: 54000,
      y: 0,
      dx: 0,
      dy: -10,
      color:  { r: 144, g: 144, b: 144 },
      label: 'Pluto'
    })
  );
}

function spawnGalaxy() {
  // Define the center of the galaxy
  const centerX = camera.x + canvas.width / 2;
  const centerY = camera.y + canvas.height / 2;

  // Spawn the black hole
  const blackHole = new CelestialBody({
    bodyType: 'blackHole',
    radius: 17,
    density: 100,
    x: centerX,
    y: centerY,
    dx: 0,
    dy: 0,
    color: celestialBodyValues.blackHole.color,
    trailColor: 'rgba(100, 100, 100, 0.5)',
    textColor: 'rgba(255, 255, 255, 0.9)',
    label: 'Black Hole'
  });
  celestialBodies.push(blackHole);

  // Spawn 100-200 planets orbiting the black hole
  const numPlanets = Math.floor(Math.random() * 100) + 100;
  const baseDistance = 1300;

  for (let i = 0; i < numPlanets; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = baseDistance + Math.random() * 500;
    const x = centerX + distance * Math.cos(angle);
    const y = centerY + distance * Math.sin(angle);

    const speed = 10 + Math.random() * 3; // Random speed between 10 and 15
    const dx = -speed * Math.sin(angle);
    const dy = speed * Math.cos(angle);

    const newPlanet = new CelestialBody({
      bodyType: 'planet',
      radius: 4 + Math.random() * 2, // Random radius between 4 and 6
      density: 0.5 + Math.random() * 0.5, // Random density between 0.5 and 1
      x: x,
      y: y,
      dx: dx,
      dy: dy,
      color: {
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
      },
      label: `Planet ${i + 1}`
    });

    celestialBodies.push(newPlanet);
  }
}

function spawnDeterministicTestSystem() {
  // Create central star first
  const centralStar = new CelestialBody({
    bodyType: 'star',
    radius: 40,
    density: 15,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    color: { r: 255, g: 200, b: 0 },
    label: 'T-Star'
  });
  celestialBodies.push(centralStar);

  // Calculate central star mass for orbital mechanics
  const centralMass = centralStar.weight;

  // Define planets with positions, calculate proper orbital velocities
  const planetDefinitions = [
    {
      bodyType: 'planet',
      radius: 6,
      density: 2,
      x: 1200,
      y: 0,
      color: { r: 180, g: 200, b: 255 },
      label: 'T-P1'
    },
    {
      bodyType: 'planet',
      radius: 5,
      density: 1.2,
      x: 0,
      y: -2000,
      color: { r: 255, g: 150, b: 150 },
      label: 'T-P2'
    },
    {
      bodyType: 'planet',
      radius: 4,
      density: 0.8,
      x: -1800,
      y: 800,
      color: { r: 200, g: 255, b: 200 },
      label: 'T-P3'
    },
  ];

  // Create planets with calculated orbital velocities
  planetDefinitions.forEach(def => {
    const distance = Math.sqrt(def.x * def.x + def.y * def.y);
    const orbitalSpeed = calculateOrbitalVelocity(centralMass, distance);
    const velocity = createOrbitalVelocity(0, 0, def.x, def.y, orbitalSpeed);

    celestialBodies.push(
      new CelestialBody({
        bodyType: def.bodyType,
        radius: def.radius,
        density: def.density,
        x: def.x,
        y: def.y,
        dx: velocity.dx,
        dy: velocity.dy,
        color: def.color,
        label: def.label
      })
    );
  });
}

/**
 * Spawns a binary star system with two stars orbiting each other in a stable, drift-free orbit,
 * and adds five planets orbiting the binary star system.
 */
function spawnBinaryStarSystem() {
  // Define the center of the binary star system
  const centerX = camera.x + canvas.width / 2;
  const centerY = camera.y + canvas.height / 2;

  // Set distance between the stars and the center
  const distanceFromCenter = 100;
  const orbitalSpeed = 5.8;
  
  // Set the mass and radius of each star
  const mass = 30;
  const radius = 10;

  // Define properties for each star
  const starProperties = [
    {
      label: 'Star A',
      color: { r: 255, g: 223, b: 0 }, // Yellow-ish color for Star A
      angle: 0
    },
    {
      label: 'Star B',
      color: { r: 0, g: 191, b: 255 }, // Blue color for Star B
      angle: Math.PI
    }
  ];

  starProperties.forEach((star) => {
    // Position each star at the specified distance from the center
    const x = centerX + distanceFromCenter * Math.cos(star.angle);
    const y = centerY + distanceFromCenter * Math.sin(star.angle);

    // Set the velocity perpendicular to the radius (90 degrees offset)
    const velocityAngle = star.angle + Math.PI / 2;
    const dx = orbitalSpeed * Math.cos(velocityAngle);
    const dy = orbitalSpeed * Math.sin(velocityAngle);

    // Create and add the star to the celestialBodies array
    celestialBodies.push(
      new CelestialBody({
        bodyType: 'star',
        radius: radius,
        density: mass,
        x: x,
        y: y,
        dx: dx,
        dy: dy,
        color: star.color,
        label: star.label
      })
    );
  });

  // Add five planets orbiting the binary star system
  const numPlanets = 0;
  const distance = 1500;
  const speed = 4.1;

  for (let i = 0; i < numPlanets; i++) {
    const angle = (i * 2 * Math.PI) / numPlanets; // Evenly distribute planets around the center

    // Calculate planet position
    const planetX = centerX + distance * Math.cos(angle);
    const planetY = centerY + distance * Math.sin(angle);

    const velocityAngle = angle + Math.PI / 2;
    const dx = speed * Math.cos(velocityAngle);
    const dy = speed * Math.sin(velocityAngle);

    // Create and add each planet to the celestialBodies array
    celestialBodies.push(
      new CelestialBody({
        bodyType: 'planet',
        radius: 5, // Increment radius for variety
        density: 1,
        x: planetX,
        y: planetY,
        dx: dx,
        dy: dy,
        color: { r: 100 + i * 30, g: 200 - i * 20, b: 255 - i * 10 }, // Vary color for each planet
        label: `Planet ${i + 1}`
      })
    );
  }
}

/**
 * Spawns a meteor shower with small meteors moving toward the center of the screen.
 * Each meteor has a random starting point off-screen, trajectory, speed, and color.
 */
function spawnMeteorShower() {
  // Define the target point (center of the screen)
  const targetX = camera.x + canvas.width / 2;
  const targetY = camera.y + canvas.height / 2;

  // Number of meteors in the shower
  const numMeteors = 50;

  for (let i = 0; i < numMeteors; i++) {
    const startX = (Math.random() < 0.5 ? -100 : canvas.width + 100) + camera.x;
    const startY = (Math.random() * canvas.height * 1.5) + camera.y;

    // Calculate the angle and velocity to move toward the target point
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const speed = 10 + Math.random() * 5; // Random speed between 10 and 15
    const dx = speed * Math.cos(angle);
    const dy = speed * Math.sin(angle);

    // Random color for each meteor, giving a fiery appearance
    const color = {
      r: 255,
      g: Math.floor(Math.random() * 156), // Random green component for variety
      b: 0
    };

    // Create each meteor with a small radius and high density
    const meteor = new CelestialBody({
      bodyType: 'meteor',
      radius: 1 + Math.random(), // Radius range 2-5
      density: 2, // High density to simulate meteors
      x: startX,
      y: startY,
      dx: dx,
      dy: dy,
      color: color,
      label: `Meteor ${i + 1}`
    });

    celestialBodies.push(meteor);
  }
}



// ----- index.js -----



// Create WebGL renderer for celestial body rendering
const webglRenderer = new WebGLRenderer(webglCanvas);

// Create gravity field renderer (shares the same WebGL canvas)
const gravityFieldRenderer = new GravityFieldRenderer(webglCanvas);

//resize canvas
window.addEventListener('resize', () => resizeCanvas(webglRenderer, gravityFieldRenderer));
resizeCanvas(webglRenderer, gravityFieldRenderer);

// Add event listeners to update celestial body values

PlanetRadius.addEventListener('input', function() {
  celestialBodyValues.planet.radius = parseInt(this.value);
});
PlanetDensity.addEventListener('input', function() {
  celestialBodyValues.planet.density = parseFloat(this.value);
});
PlanetColor.addEventListener('input', function() {
  celestialBodyValues.planet.color = hexToRGB(this.value);
});
StarRadius.addEventListener('input', function() {
  celestialBodyValues.star.radius = parseInt(this.value);
});
StarDensity.addEventListener('input', function() {
  celestialBodyValues.star.density = parseFloat(this.value);
});
StarColor.addEventListener('input', function() {
  celestialBodyValues.star.color = hexToRGB(this.value);
});
BlackHoleRadius.addEventListener('input', function() {
  celestialBodyValues.blackHole.radius = parseInt(this.value);
});
BlackHoleDensity.addEventListener('input', function() {
  celestialBodyValues.blackHole.density = parseFloat(this.value);
});
BlackHoleColor.addEventListener('input', function() {
  celestialBodyValues.blackHole.color = hexToRGB(this.value);
});
timeScaleInput.addEventListener('input', function() {
  timeScale = parseFloat(this.value);
});


// Add event listeners to camera settings

followCam.addEventListener('change', function() {
  cameraFollow = this.checked;
});
camSpeedElement.addEventListener('input', function() {
  camSpeed = parseInt(this.value);
});
prev.addEventListener('click', function() {
  cameraFollowingIndex = (cameraFollowingIndex - 1 + celestialBodies.length) % celestialBodies.length;
  cameraFollow = true;
  followCam.checked = true;
});
next.addEventListener('click', function() {
  cameraFollowingIndex = (cameraFollowingIndex + 1) % celestialBodies.length;
  cameraFollow = true;
  followCam.checked = true;
});
centerMass.addEventListener('click', function() {
  cameraFollowingIndex = -1;
  cameraFollow = true;
  followCam.checked = true;
});
zoomMinus.addEventListener('click', zoomIn);
zoomPlus.addEventListener('click', zoomOut);


// Add event listeners to toggle features

collision.addEventListener('change', function() {
  collideIsON = this.checked;
});
massTransfer.addEventListener('change', function() {
  massTransferEnabled = this.checked;
});
showVelocities.addEventListener('change', function() {
  showVelocitiesIsON = this.checked;
});
showLabels.addEventListener('change', function() {
  showLabelsIsON = this.checked;
});
showFPS.addEventListener('change', function() {
  showFPSIsON = this.checked;
});

// Dev mode toggles
devModeToggle.addEventListener('click', function() {
  devModeIsON = !devModeIsON;
  document.querySelectorAll('.dev-item').forEach(item => {
    item.style.display = devModeIsON ? 'flex' : 'none';
  });
  this.textContent = devModeIsON ? 'Disable Dev Mode (~)' : 'Enable Dev Mode (~)';
});

showBHNodes.addEventListener('change', function() {
  showBHNodesIsON = this.checked;
});

showBHCenterOfMass.addEventListener('change', function() {
  showBHCenterOfMassIsON = this.checked;
});

showTrailPoints.addEventListener('change', function() {
  showTrailPointsIsON = this.checked;
});

// Gravity field visualization event listeners
showGravityGrid.addEventListener('change', function() {
  showGravityGridIsON = this.checked;
});

showGravityVectors.addEventListener('change', function() {
  showGravityVectorsIsON = this.checked;
});

showGravityHeatmap.addEventListener('change', function() {
  showGravityHeatmapIsON = this.checked;
});

showGravityContours.addEventListener('change', function() {
  showGravityContoursIsON = this.checked;
});

gravityGridOpacity.addEventListener('input', function() {
  gravityFieldSettings.gridOpacity = parseFloat(this.value);
  gravityFieldRenderer.updateSettings({ gridOpacity: gravityFieldSettings.gridOpacity });
});

gravityHeatmapOpacity.addEventListener('input', function() {
  gravityFieldSettings.heatmapOpacity = parseFloat(this.value);
  gravityFieldRenderer.updateSettings({ heatmapOpacity: gravityFieldSettings.heatmapOpacity });
});

gravityVectorOpacity.addEventListener('input', function() {
  gravityFieldSettings.vectorOpacity = parseFloat(this.value);
  gravityFieldRenderer.updateSettings({ vectorOpacity: gravityFieldSettings.vectorOpacity });
});

gravityContourOpacity.addEventListener('input', function() {
  gravityFieldSettings.contourOpacity = parseFloat(this.value);
  gravityFieldRenderer.updateSettings({ contourOpacity: gravityFieldSettings.contourOpacity });
});

gravityWarpStrength.addEventListener('input', function() {
  gravityFieldSettings.warpStrength = parseFloat(this.value);
  gravityFieldRenderer.updateSettings({ warpStrength: gravityFieldSettings.warpStrength });
});

veloctyUnit.addEventListener('click', function() {
  if(velocityUnit === 'm/s'){
    velocityUnit = 'km/s';
  } else {
    velocityUnit = 'm/s';
  }
  veloctyUnit.textContent = velocityUnit;
});

threeBody.addEventListener('click', function() {
  celestialBodies.length = 0;
  setupThreeBodyProblem();
  cameraFollow = true;
  followCam.checked = true;
  cameraFollowingIndex = -1;
  collideIsON = false;
  collision.checked = false;
});

cluster.addEventListener('click', function() {
  spawnPlanetsNearMouse(15); 
});

lightSpeedP.addEventListener('click', function() {
  spawnPlanetWithLightSpeed();
  cameraFollow = true;
  followCam.checked = true;
});

deterministicTest.addEventListener('click', function() {
  celestialBodies.length = 0;
  spawnDeterministicTestSystem();
  prompt({
    text: 'Deterministic test system spawned',
    y: canvas.height - 20,
    vel: 0,
    time: 0.2,
    textSize: 16,
    isOverRide: true
  });
});

solarSystem.addEventListener('click', function() {
  celestialBodies.length = 0;
  zoomFactor = 0.02;
  velocityUnit = 'km/s';
  showTrailsIsON = showTrails.checked = false;
  showStarsIsON = showStars.checked = false;

  spawnSolarSystem();
});

galaxySpawn.addEventListener('click', function() {
  zoomFactor = 0.3;
  showVelocitiesIsON = showVelocities.checked = false;
  showStarsIsON = showStars.checked = false;
  collideIsON = collision.checked = false;
  celestialBodies.length = 0;

  spawnGalaxy();
});

reset.addEventListener('click', function() {
  resetEverything();
});

showControls.addEventListener('click', function() {
  document.getElementById('controlsModal').showPopover();
});

showTrails.addEventListener('change', function() {
  showTrailsIsON = this.checked;
  if(!showTrailsIsON){
    trailManager.clearAllTrails();
  }
  // Trails are now rendered via WebGL, no need to manage trailCanvas
});

function createBackgroundStars(numStars) {
  for (let i = 0; i < numStars; i++) {
    backgroundStars.push(new BackgroundStar());
  }
}

createBackgroundStars(1000);

// Modify the drawBackgroundStars function to apply distortion
function drawBackgroundStars() {
  backgroundStars.forEach(star => {
    star.draw();
  });
}
drawBackgroundStars();

showStars.addEventListener('change', function() {
  showStarsIsON = this.checked;
  if(showStarsIsON){
    starCanvas.style.display = 'block';
    backgroundStars.length = 0;
    createBackgroundStars(1500);
    drawBackgroundStars();
  } else {
    starCanvas.style.display = 'none';
    backgroundStars.length = 0;
    drawBackgroundStars();
  }
});

// Add event listener for when the settings menu/drawer is closed
settingsMenu.addEventListener('toggle', function(event) {
  // When the menu is hidden/closed, unfocus any active input elements
  if (!event.newState || event.newState === 'closed') {
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )) {
      activeElement.blur();
    }
  }
});

canvas.addEventListener('mousedown', startDragHandler);

// Prevent context menu on canvas
canvas.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

canvas.addEventListener('dblclick', function(event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  
  const closestBody = findClosestBody(clickX, clickY);
  
  if (closestBody) {
    cameraFollowingIndex = celestialBodies.indexOf(closestBody);
    cameraFollow = true;
    followCam.checked = true;
    
    prompt({
      text: `Now following ${closestBody.label}`,
      y: canvas.height - 20,
      vel: 20,
      time: 0.4,
      textSize: 16,
      isOverRide: true
    });
  } else {
    prompt({
      text: "No body nearby to follow",
      y: canvas.height - 20,
      vel: 20,
      time: 0.1,
      textSize: 16,
      isOverRide: true
    });
  }
});

document.addEventListener('keydown', function (event) {
  // Check if user is typing in an input field or other editable element
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.contentEditable === 'true'
  );
  
  // If user is typing, only allow certain keys (like Escape to unfocus)
  if (isTyping) {
    // Allow Escape key to unfocus the input
    if (event.key === 'Escape') {
      activeElement.blur();
    }
    return; // Skip all other keyboard shortcuts when typing
  }

  if (keys.hasOwnProperty(event.key)) {
    keys[event.key] = true;
  } 
  if (event.key === 'w'){
    keys.ArrowUp = true;
  } 
  if (event.key === 's'){
    keys.ArrowDown = true;
  }
  if (event.key === 'a'){
    keys.ArrowLeft = true;
  }
  if (event.key === 'd'){
    keys.ArrowRight = true;
  }

  if (event.code === 'Backspace') {
    // Delete probe if in probe mode and probe exists
    if (probeModeEnabled && probe !== null) {
      probe = null;
      clearPrompts();
      prompt({
        text: "Probe deleted",
        y: canvas.height - 20,
        vel: 20,
        time: 0.2,
        textSize: 16,
        isOverRide: true
      });
    } else if(cameraFollowingIndex !== -1 && celestialBodies.length > 0 && cameraFollow){
      const removedBody = celestialBodies.splice(cameraFollowingIndex, 1);
      trailManager.clearTrail(removedBody[0].id);
      cameraFollowingIndex = 0;
      cameraFollow = false;
      followCam.checked = false;
    } else {
      prompt({
        text: "No body to delete",
        y: canvas.height - 20,
        vel: 20,
        time: 0.1,
        textSize: 16,
        isOverRide: true
      });
    }
  }
  if (event.key === 'Shift') {
    camSpeed = 20;
    camSpeedElement.value = 20;
  }
  if(event.key === 'Control'){
    camSpeed = 1;
    camSpeedElement.value = 1;
  }

  if(event.key === ' '){
    isPaused = !isPaused;
    clearPrompts();
    prompt({
      text: isPaused ? 'Simulation Paused' : 'Simulation Resumed',
      y: canvas.height - 20,
      vel: 0,
      time: isPaused ? 0 : 0.4,
      textSize: 16,
      isOverRide: true
    });
  }

  if (event.key === 'Escape') {
    selectedBody = '';
    selectedPreset = null;
    startDrag = null;
    endDrag = null;
  }

  if (event.key === '0') {
    // Toggle probe mode
    probeModeEnabled = !probeModeEnabled;
    selectedBody = '';
    selectedPreset = null;
    startDrag = null;
    endDrag = null;
    
    clearPrompts();
    prompt({
      text: probeModeEnabled ? 'Probe Mode: ON (click to place probe)' : 'Probe Mode: OFF',
      y: canvas.height - 20,
      vel: 20,
      time: 0.3,
      textSize: 16,
      isOverRide: true
    });
  }
  
  if (event.key === '1' || event.key === '2' || event.key === '3') {
    switch (event.key) {
      case '1':
        selectedBody = 'Planet';
        break;
      case '2':
        selectedBody = 'Star';
        break;
      case '3':
        selectedBody = 'Black Hole';
        break;
    }
    probeModeEnabled = false; // Exit probe mode when selecting body
    selectedPreset = null; // Clear preset selection when selecting body type
    startDrag = null;
    endDrag = null;
  }

  // Handle cycling through celestial bodies using 'n' and 'm'
  if (event.key === 'e' || event.key === 'q') {
    const direction = event.key === 'e' ? 1 : -1;
    cameraFollowingIndex = (cameraFollowingIndex + direction + celestialBodies.length) % celestialBodies.length;
  }

  // Increase / Decrease Time Scale
  if (event.key === '-') {
    timeScale = Math.max(0.1, timeScale - 0.1);
    timeScaleInput.value = timeScale;
  }
  if (event.key === '=') {
    timeScale = Math.min(50, timeScale + 0.1);
    timeScaleInput.value = timeScale;
  }
  if (event.key === '<') {
    timeScale = Math.max(0.1, timeScale - 0.1);
    timeScaleInput.value = timeScale;
  }
  if (event.key === '>') {
    timeScale = Math.min(100, timeScale + 0.1);
    timeScaleInput.value = timeScale;
  }

  if (event.key === 'c') {
    
    if(celestialBodies.length === 0){
      prompt({
        text: "No bodies to follow",
        y: canvas.height - 20,
        vel: 20,
        time: 0.1,
        textSize: 16,
        isOverRide: true
      });
    } else {
      cameraFollow = !cameraFollow;
      followCam.checked = cameraFollow;
    }
  }

  if (event.key === 'r') {
    resetEverything();
  }

  if(event.key === 'x'){
    collideIsON = !collideIsON;
    collision.checked = collideIsON;
  }

  if(event.key === 'l'){
    clearPrompts();
    playInstructions();
  }

  if(event.key === '.'){
    clearPrompts();
  }

  if(event.key === 'z'){
    showDebugPoints = !showDebugPoints;
    clearPrompts();
    prompt({
      text: `Trail Debug Points: ${showDebugPoints ? 'ON' : 'OFF'}`,
      y: canvas.height - 20,
      vel: 20,
      time: 0.3,
      textSize: 16,
      isOverRide: true
    });
  }

  // Gravity field visualization toggles (g, h, j keys)
  if(event.key === 'g'){
    showGravityGridIsON = !showGravityGridIsON;
    showGravityGrid.checked = showGravityGridIsON;
    clearPrompts();
    prompt({
      text: `Gravity Grid: ${showGravityGridIsON ? 'ON' : 'OFF'}`,
      y: canvas.height - 20,
      vel: 20,
      time: 0.2,
      textSize: 16,
      isOverRide: true
    });
  }

  if(event.key === 'h'){
    showGravityHeatmapIsON = !showGravityHeatmapIsON;
    showGravityHeatmap.checked = showGravityHeatmapIsON;
    clearPrompts();
    prompt({
      text: `Gravity Heatmap: ${showGravityHeatmapIsON ? 'ON' : 'OFF'}`,
      y: canvas.height - 20,
      vel: 20,
      time: 0.2,
      textSize: 16,
      isOverRide: true
    });
  }

  if(event.key === 'j'){
    showGravityVectorsIsON = !showGravityVectorsIsON;
    showGravityVectors.checked = showGravityVectorsIsON;
    clearPrompts();
    prompt({
      text: `Gravity Vectors: ${showGravityVectorsIsON ? 'ON' : 'OFF'}`,
      y: canvas.height - 20,
      vel: 20,
      time: 0.2,
      textSize: 16,
      isOverRide: true
    });
  }

  if(event.key === 'k'){
    showGravityContoursIsON = !showGravityContoursIsON;
    showGravityContours.checked = showGravityContoursIsON;
    clearPrompts();
    prompt({
      text: `Gravity Contours: ${showGravityContoursIsON ? 'ON' : 'OFF'}`,
      y: canvas.height - 20,
      vel: 20,
      time: 0.2,
      textSize: 16,
      isOverRide: true
    });
  }

  // Preset selection (4-9 keys) - click to spawn after selecting
  if(event.key >= '4' && event.key <= '9'){
    const presetKey = event.key;
    if(presetDefinitions[presetKey]){
      if(selectedPreset === presetKey){
        // Deselect if pressing same key
        selectedPreset = null;
        clearPrompts();
        prompt({
          text: 'Preset deselected',
          y: canvas.height - 20,
          vel: 20,
          time: 0.2,
          textSize: 16,
          isOverRide: true
        });
      } else {
        selectedPreset = presetKey;
        selectedBody = ''; // Clear body selection when selecting preset
        clearPrompts();
        prompt({
          text: `Selected: ${presetDefinitions[presetKey].name} (click to spawn)`,
          y: canvas.height - 20,
          vel: 20,
          time: 0.3,
          textSize: 16,
          isOverRide: true
        });
      }
    }
  }

  // Dev mode toggle with backtick/tilde key
  if(event.key === '`' || event.key === '~'){
    devModeIsON = !devModeIsON;
    document.querySelectorAll('.dev-item').forEach(item => {
      item.style.display = devModeIsON ? 'flex' : 'none';
    });
    devModeToggle.textContent = devModeIsON ? 'Disable Dev Mode (~)' : 'Enable Dev Mode (~)';
    clearPrompts();
    prompt({
      text: devModeIsON ? 'Dev Mode: ON' : 'Dev Mode: OFF',
      y: canvas.height - 20,
      vel: 0,
      time: 0.15,
      textSize: 16,
      isOverRide: true
    });
  }

  // Toggle FPS display
  if(event.key === 'f'){
    showFPSIsON = !showFPSIsON;
    showFPS.checked = showFPSIsON;
    clearPrompts();
    prompt({
      text: showFPSIsON ? 'FPS: ON' : 'FPS: OFF',
      y: canvas.height - 20,
      vel: 0,
      time: 0.15,
      textSize: 16,
      isOverRide: true
    });
  }

  if(event.key === 'p'){
    // Pin/unpin the currently followed body
    if(cameraFollowingIndex !== -1 && celestialBodies.length > 0 && cameraFollow){
      const followedBody = celestialBodies[cameraFollowingIndex];
      followedBody.togglePin();
      
      clearPrompts();
      prompt({
        text: followedBody.isPinned ? 
          `${followedBody.label} is now PINNED` : 
          `${followedBody.label} is now UNPINNED`,
        y: canvas.height - 20,
        vel: 20,
        time: 0.15,
        textSize: 16,
        isOverRide: true
      });
    } else {
      clearPrompts();
      prompt({
        text: "No body being followed to pin/unpin",
        y: canvas.height - 20,
        vel: 20,
        time: 0.1,
        textSize: 16,
        isOverRide: true
      });
    }
  }
});

window.addEventListener('keyup', function(e) {
  // Check if user is typing in an input field or other editable element
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.contentEditable === 'true'
  );
  
  // Skip processing if user is typing
  if (isTyping) {
    return;
  }

  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
  }
  if (e.key === 'w'){
    keys.ArrowUp = false;
  }
  if (e.key === 's'){
    keys.ArrowDown = false;
  }
  if (e.key === 'a'){
    keys.ArrowLeft = false;
  }
  if (e.key === 'd'){
    keys.ArrowRight = false;
  }

  if (e.key === 'Shift') {
    camSpeed = 5;
    camSpeedElement.value = 5;
  }
  if(e.key === 'Control'){
    camSpeed = 5;
    camSpeedElement.value = 5;
  }
});

canvas.addEventListener('wheel', function(event) {
  event.preventDefault();
  if (event.deltaY < 0) {
    zoomIn();
  } else {
    zoomOut();
  }
});

canvas.addEventListener('mousemove', function(event) {
  camera.clientX = event.clientX;
  camera.clientY = event.clientY;
})

// Create a new trail manager instance
const trailManager = new TrailManager({ context: trailctx });

// Create a new physics system instance
const physicsSystem = new PhysicsSystem();

function draw() {
  const deltaTime = getDeltaTime();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Clear WebGL canvas
  webglRenderer.clear();

  if (!isPaused) {
    // Calculate effective timestep with time scaling and frame rate independence
    let effectiveTimeStep = deltaTime * timeScale;
    
    // Limit maximum timestep to prevent instability with very high time scales
    const maxTimeStep = 0.1; // Maximum timestep of 0.1 seconds
    if (effectiveTimeStep > maxTimeStep) {
      // If timestep is too large, subdivide it
      const numSubSteps = Math.ceil(effectiveTimeStep / maxTimeStep);
      const subTimeStep = effectiveTimeStep / numSubSteps;
      
      for (let i = 0; i < numSubSteps; i++) {
        // Update physics system (handles collisions and attraction forces between bodies using Barnes-Hut algorithm)
        physicsSystem.update(celestialBodies, collideIsON, subTimeStep);
        
        // Update all bodies with the sub-timestep
        for (let j = 0; j < celestialBodies.length; j++) {
          celestialBodies[j].update(subTimeStep);
        }
      }
    } else {
      // Normal single timestep update
      physicsSystem.update(celestialBodies, collideIsON, effectiveTimeStep);
      
      // Update all bodies with the effective timestep
      for (let j = 0; j < celestialBodies.length; j++) {
        celestialBodies[j].update(effectiveTimeStep);
      }
    }
  }

  if (keys.ArrowUp) camera.y -= (camSpeed / Math.sqrt(zoomFactor));
  if (keys.ArrowDown) camera.y += (camSpeed / Math.sqrt(zoomFactor));
  if (keys.ArrowLeft) camera.x -= (camSpeed / Math.sqrt(zoomFactor));
  if (keys.ArrowRight) camera.x += (camSpeed / Math.sqrt(zoomFactor));

  if (celestialBodies.length > 0 && cameraFollow) {
    if (cameraFollowingIndex === -1) {
      updateCameraToFollowCenterOfMass();
    } else if (cameraFollowingIndex < celestialBodies.length) {
      const followedBody = celestialBodies[cameraFollowingIndex];
      const targetX = followedBody.x - canvas.width / 2;
      const targetY = followedBody.y - canvas.height / 2;

      smoothFollow(targetX, targetY, followedBody);
    }
  }

  // Set up WebGL camera transformation
  webglRenderer.setCamera(camera.x, camera.y, zoomFactor);
  gravityFieldRenderer.setCamera(camera.x, camera.y, zoomFactor);

  // Calculate view bounds for gravity field rendering
  const halfW = canvas.width / 2;
  const halfH = canvas.height / 2;
  const gravityViewBounds = {
    minX: camera.x + halfW - halfW / zoomFactor,
    maxX: camera.x + halfW + halfW / zoomFactor,
    minY: camera.y + halfH - halfH / zoomFactor,
    maxY: camera.y + halfH + halfH / zoomFactor
  };

  // Draw gravity field visualizations (behind celestial bodies)
  if (celestialBodies.length > 0) {
    // Draw heatmap first (furthest back)
    if (showGravityHeatmapIsON) {
      gravityFieldRenderer.drawHeatmap(celestialBodies, gravityViewBounds, {
        opacity: gravityFieldSettings.heatmapOpacity
      });
    }
    
    // Draw contour lines (over heatmap, under grid)
    if (showGravityContoursIsON) {
      gravityFieldRenderer.drawContours(celestialBodies, gravityViewBounds, {
        opacity: gravityFieldSettings.contourOpacity
      });
    }
    
    // Draw warped grid
    if (showGravityGridIsON) {
      gravityFieldRenderer.drawWarpedGrid(celestialBodies, gravityViewBounds, {
        opacity: gravityFieldSettings.gridOpacity
      });
    }
    
    // Draw field vectors
    if (showGravityVectorsIsON) {
      gravityFieldRenderer.drawFieldVectors(celestialBodies, gravityViewBounds, {
        opacity: gravityFieldSettings.vectorOpacity
      });
    }
  }

  // Apply zoom and camera transformation for 2D canvas (for UI elements)
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(zoomFactor, zoomFactor);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  if(showStarsIsON) {
    if (camera.prevX !== camera.x || camera.prevY !== camera.y) {
      starCtx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackgroundStars();
    }
  } else {
    starCtx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Handle trails for all bodies
  if (showTrailsIsON) {
    for (let i = 0; i < celestialBodies.length; i++) {
      const body = celestialBodies[i];
      trailManager.initializeTrail(body.id, body.trailColor);
      trailManager.updateTrail(body.id, body.x, body.y, body.dx, body.dy);
    }
  }

  // Update physics for all bodies
  if (!isPaused) {
    for (let i = 0; i < celestialBodies.length; i++) {
      celestialBodies[i].update();
    }
  }
  
  // Draw ALL bodies in a single batched WebGL call (massive performance boost)
  const followedIndex = cameraFollow && cameraFollowingIndex !== -1 ? cameraFollowingIndex : -1;
  webglRenderer.drawAllBodies(celestialBodies, {
    followedBodyIndex: followedIndex,
    zoomFactor
  });
  
  // Draw labels on 2D canvas (text rendering)
  for (let i = 0; i < celestialBodies.length; i++) {
    const body = celestialBodies[i];
    const isFollowed = followedIndex === i;
    body.drawLabels(isFollowed);
  }

  // Draw trails using WebGL (much faster than Canvas 2D)
  if (showTrailsIsON && trailManager.trails.size > 0) {
    // Calculate view bounds in world space
    const halfW = canvas.width / 2;
    const halfH = canvas.height / 2;
    const viewBounds = {
      minX: camera.x + halfW - halfW / zoomFactor,
      maxX: camera.x + halfW + halfW / zoomFactor,
      minY: camera.y + halfH - halfH / zoomFactor,
      maxY: camera.y + halfH + halfH / zoomFactor
    };
    webglRenderer.drawTrails(trailManager.trails, camera, zoomFactor, viewBounds);
    
    // Draw debug trail points if enabled (either via 'z' key or dev mode checkbox)
    if (showDebugPoints || showTrailPointsIsON) {
      webglRenderer.drawTrailPoints(trailManager.trails, viewBounds, zoomFactor);
    }
  }

  // Draw trajectory if dragging
  if (startDrag && endDrag) {
    drawTrajectory(startDrag.x, startDrag.y, endDrag.x, endDrag.y, physicsSystem);
  }

  ctx.restore();

  // Draw Barnes-Hut tree visualization (after restore so it's in screen space)
  if (devModeIsON && (showBHNodesIsON || showBHCenterOfMassIsON)) {
    physicsSystem.drawTree(ctx, camera, zoomFactor, {
      showNodes: showBHNodesIsON,
      showCenterOfMass: showBHCenterOfMassIsON
    });
  }

  // Update last camera position
  camera.prevX = camera.x;
  camera.prevY = camera.y;

  updateUI(deltaTime);

  requestAnimationFrame(draw);
}

draw();

function updateUI(deltaTime) {
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.fillText(`(${camera.x.toFixed(2)}, ${camera.y.toFixed(2)})`, 10, canvas.height - 20);
  ctx.fillText(`Zoom Scale: ${zoomFactor}`, 10, canvas.height - 6);
  ctx.fillText(`Time Scale: ${timeScale.toFixed(1)}x`, 10, canvas.height - 34);
  
  // Draw probe mode indicator at top center
  if (probeModeEnabled) {
    const text = '[ PROBE MODE ACTIVE ]';
    ctx.font = 'bold 16px Arial';
    const textWidth = ctx.measureText(text).width;
    
    // Draw background pill
    ctx.fillStyle = 'rgba(0, 80, 80, 0.8)';
    const pillPadding = 12;
    const pillHeight = 28;
    ctx.beginPath();
    ctx.roundRect(
      canvas.width / 2 - textWidth / 2 - pillPadding,
      10,
      textWidth + pillPadding * 2,
      pillHeight,
      14
    );
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = 'rgba(0, 255, 255, 1)';
    ctx.fillText(text, canvas.width / 2 - textWidth / 2, 30);
    
    ctx.font = '14px Arial';
  }

  // Move selected body/preset and body count to bottom left
  if(probeModeEnabled){
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? 'Cmd' : 'Ctrl';
    const text = `Probe Mode (click to place, ${modKey}+click to transition)`;
    ctx.fillStyle = 'rgba(0, 255, 255, 1)';
    ctx.fillText(text, 10, canvas.height - 75);
    ctx.fillStyle = 'white';
  } else if(selectedBody){
    const text = `Selected Body: ${selectedBody}`;
    ctx.fillText(text, 10, canvas.height - 75);
  } else if(selectedPreset !== null && presetDefinitions[selectedPreset]){
    const text = `Selected Preset: ${presetDefinitions[selectedPreset].name} (click to spawn)`;
    ctx.fillStyle = 'rgba(100, 200, 255, 1)';
    ctx.fillText(text, 10, canvas.height - 75);
    ctx.fillStyle = 'white';
  }

  if(celestialBodies.length > 0){
    const text = `Bodies: ${celestialBodies.length}`;
    ctx.fillText(text, 10, canvas.height - 55);
  }

  // Only show following text for center of mass (not specific bodies)
  if(cameraFollow && cameraFollowingIndex === -1){
    const text = 'Following Center of Mass';
    ctx.fillStyle = 'white';
    ctx.fillText(text, canvas.width - ctx.measureText(text).width - 10, canvas.height - 6);
  }

  // Draw followed body info panel
  if (cameraFollow && cameraFollowingIndex !== -1 && cameraFollowingIndex < celestialBodies.length) {
    drawFollowedBodyInfo(celestialBodies[cameraFollowingIndex]);
  }
  
  // Draw probe and its info panel (if probe exists)
  if (probe) {
    drawProbe();
  }

  showPrompts(deltaTime);

  if (showFPSIsON) drawFPS(canvas.width, canvas.height, ctx);
}

/**
 * Calculates just the gravitational field strength at a point (optimized for null point search)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number} Field strength magnitude
 */
function getFieldStrengthAt(x, y) {
  const G = 0.1;
  const softening = 100;
  let totalAx = 0;
  let totalAy = 0;
  
  for (const body of celestialBodies) {
    const dx = body.x - x;
    const dy = body.y - y;
    const distanceSquared = dx * dx + dy * dy;
    const softenedDistance = Math.sqrt(distanceSquared + softening * softening);
    
    if (softenedDistance > 20) {
      const acceleration = (G * body.weight) / (softenedDistance * softenedDistance);
      totalAx += acceleration * (dx / softenedDistance);
      totalAy += acceleration * (dy / softenedDistance);
    }
  }
  
  return Math.sqrt(totalAx * totalAx + totalAy * totalAy);
}

/**
 * Finds the nearest gravitational null point (where field strength is minimal)
 * Uses gradient descent with multiple starting points
 * @param {number} startX - Starting X coordinate (probe position)
 * @param {number} startY - Starting Y coordinate (probe position)
 * @param {number} searchRadius - Maximum search radius
 * @returns {Object|null} Null point data or null if not found
 */
function findNearestNullPoint(startX, startY, searchRadius = 500) {
  if (celestialBodies.length < 2) {
    // Need at least 2 bodies for a meaningful null point
    return null;
  }
  
  let bestPoint = null;
  let bestStrength = Infinity;
  
  // Grid search to find candidate regions
  const gridSize = 20;
  const step = searchRadius / gridSize;
  
  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      const testX = startX + i * step;
      const testY = startY + j * step;
      const strength = getFieldStrengthAt(testX, testY);
      
      if (strength < bestStrength) {
        bestStrength = strength;
        bestPoint = { x: testX, y: testY };
      }
    }
  }
  
  if (!bestPoint) return null;
  
  // Refine with gradient descent from best grid point
  let currentX = bestPoint.x;
  let currentY = bestPoint.y;
  let currentStrength = bestStrength;
  let stepSize = step / 2;
  
  for (let iteration = 0; iteration < 50; iteration++) {
    // Check 8 directions plus current
    const directions = [
      [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    
    let improved = false;
    for (const [dx, dy] of directions) {
      const testX = currentX + dx * stepSize;
      const testY = currentY + dy * stepSize;
      const strength = getFieldStrengthAt(testX, testY);
      
      if (strength < currentStrength) {
        currentStrength = strength;
        currentX = testX;
        currentY = testY;
        improved = true;
      }
    }
    
    if (!improved) {
      stepSize *= 0.5;
      if (stepSize < 0.1) break;
    }
  }
  
  // Calculate distance from probe
  const distanceFromProbe = Math.sqrt(
    (currentX - startX) * (currentX - startX) + 
    (currentY - startY) * (currentY - startY)
  );
  
  // Determine stability classification
  let stability = 'Unstable';
  if (currentStrength < 0.0001) {
    stability = 'Strong Null';
  } else if (currentStrength < 0.001) {
    stability = 'Weak Null';
  } else if (currentStrength < 0.01) {
    stability = 'Near Null';
  } else {
    stability = 'Local Minimum';
  }
  
  return {
    x: currentX,
    y: currentY,
    fieldStrength: currentStrength,
    distanceFromProbe,
    stability
  };
}

/**
 * Calculates gravitational data at a specific point in space
 * @param {number} x - X coordinate of the point
 * @param {number} y - Y coordinate of the point
 * @returns {Object} Gravitational data at the point
 */
function calculateGravityAtPoint(x, y) {
  const G = 0.1; // Same gravitational constant as in PhysicsSystem
  const softening = 100; // Same softening parameter
  
  let totalAx = 0;
  let totalAy = 0;
  let totalPotential = 0;
  let nearestBody = null;
  let nearestDistance = Infinity;
  let dominantBody = null;
  let maxContribution = 0;
  
  for (const body of celestialBodies) {
    const dx = body.x - x;
    const dy = body.y - y;
    const distanceSquared = dx * dx + dy * dy;
    const distance = Math.sqrt(distanceSquared);
    const softenedDistance = Math.sqrt(distanceSquared + softening * softening);
    
    // Track nearest body
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestBody = body;
    }
    
    // Calculate gravitational acceleration contribution
    if (softenedDistance > 20) { // Minimum distance check
      const acceleration = (G * body.weight) / (softenedDistance * softenedDistance);
      const ax = acceleration * (dx / softenedDistance);
      const ay = acceleration * (dy / softenedDistance);
      
      totalAx += ax;
      totalAy += ay;
      
      // Track dominant gravitational source
      if (acceleration > maxContribution) {
        maxContribution = acceleration;
        dominantBody = body;
      }
    }
    
    // Calculate gravitational potential (negative, as convention)
    if (distance > 1) {
      totalPotential -= (G * body.weight) / distance;
    }
  }
  
  const accelerationMagnitude = Math.sqrt(totalAx * totalAx + totalAy * totalAy);
  const accelerationAngle = Math.atan2(totalAy, totalAx);
  
  // Calculate escape velocity at this point (v = sqrt(2 * |potential|))
  const escapeVelocity = Math.sqrt(2 * Math.abs(totalPotential));
  
  // Calculate orbital velocity for circular orbit at nearest body distance
  let orbitalVelocity = 0;
  if (nearestBody && nearestDistance > nearestBody.radius) {
    orbitalVelocity = Math.sqrt(G * nearestBody.weight / nearestDistance);
  }
  
  return {
    ax: totalAx,
    ay: totalAy,
    accelerationMagnitude,
    accelerationAngle,
    potential: totalPotential,
    nearestBody,
    nearestDistance,
    dominantBody,
    escapeVelocity,
    orbitalVelocity,
    fieldStrength: accelerationMagnitude
  };
}

/**
 * Updates probe position during smooth transition
 */
function updateProbeTransition() {
  if (probe && probe.isTransitioning) {
    probe.transitionProgress += probeTransitionSpeed;
    
    if (probe.transitionProgress >= 1) {
      // Reached current target
      probe.transitionProgress = 1;
      probe.x = probe.targetX;
      probe.y = probe.targetY;
      
      // Check if there are more waypoints in the queue
      if (probe.waypoints && probe.waypoints.length > 0) {
        // Start transition to next waypoint
        const nextWaypoint = probe.waypoints.shift();
        probe.startX = probe.x;
        probe.startY = probe.y;
        probe.targetX = nextWaypoint.x;
        probe.targetY = nextWaypoint.y;
        probe.transitionProgress = 0;
        // Keep isTransitioning = true
      } else {
        probe.isTransitioning = false;
      }
    } else {
      // Smooth easing function (ease-in-out)
      const t = probe.transitionProgress;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      // Linear interpolation from start to target using eased progress
      probe.x = probe.startX + (probe.targetX - probe.startX) * ease;
      probe.y = probe.startY + (probe.targetY - probe.startY) * ease;
    }
  }
}

/**
 * Draws the probe and its information panel
 */
function drawProbe() {
  if (!probe) return;
  
  // Update probe transition
  updateProbeTransition();
  
  // Calculate screen position
  const screenX = (probe.x - camera.x) * zoomFactor + canvas.width / 2 * (1 - zoomFactor);
  const screenY = (probe.y - camera.y) * zoomFactor + canvas.height / 2 * (1 - zoomFactor);
  
  // Find null point
  let nullPoint = null;
  if (celestialBodies.length >= 2) {
    nullPoint = findNearestNullPoint(probe.x, probe.y);
  }
  
  // Draw null point marker if found
  if (nullPoint) {
    const nullScreenX = (nullPoint.x - camera.x) * zoomFactor + canvas.width / 2 * (1 - zoomFactor);
    const nullScreenY = (nullPoint.y - camera.y) * zoomFactor + canvas.height / 2 * (1 - zoomFactor);
    
    // Draw line connecting probe to null point
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = 'rgba(180, 100, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(nullScreenX, nullScreenY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw null point marker (diamond shape)
    const nullSize = 10;
    ctx.strokeStyle = 'rgba(180, 100, 255, 0.9)';
    ctx.fillStyle = 'rgba(180, 100, 255, 0.3)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(nullScreenX, nullScreenY - nullSize);
    ctx.lineTo(nullScreenX + nullSize, nullScreenY);
    ctx.lineTo(nullScreenX, nullScreenY + nullSize);
    ctx.lineTo(nullScreenX - nullSize, nullScreenY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Inner glow effect based on stability
    let glowColor = 'rgba(255, 255, 255, 0.8)';
    if (nullPoint.stability === 'Strong Null') {
      glowColor = 'rgba(100, 255, 100, 1)';
    } else if (nullPoint.stability === 'Weak Null') {
      glowColor = 'rgba(200, 255, 100, 1)';
    } else if (nullPoint.stability === 'Near Null') {
      glowColor = 'rgba(255, 255, 100, 1)';
    }
    
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(nullScreenX, nullScreenY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Label
    ctx.font = '11px Arial';
    ctx.fillStyle = 'rgba(180, 100, 255, 1)';
    ctx.fillText('NULL', nullScreenX + nullSize + 4, nullScreenY + 4);
  }
  
  // Draw probe marker (crosshair style)
  const probeSize = 12;
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  
  // Outer circle
  ctx.beginPath();
  ctx.arc(screenX, screenY, probeSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner crosshair
  ctx.beginPath();
  ctx.moveTo(screenX - probeSize - 5, screenY);
  ctx.lineTo(screenX - probeSize / 2, screenY);
  ctx.moveTo(screenX + probeSize / 2, screenY);
  ctx.lineTo(screenX + probeSize + 5, screenY);
  ctx.moveTo(screenX, screenY - probeSize - 5);
  ctx.lineTo(screenX, screenY - probeSize / 2);
  ctx.moveTo(screenX, screenY + probeSize / 2);
  ctx.lineTo(screenX, screenY + probeSize + 5);
  ctx.stroke();
  
  // Inner dot
  ctx.fillStyle = 'rgba(0, 255, 255, 1)';
  ctx.beginPath();
  ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw transition line and queued waypoints if transitioning
  if (probe.isTransitioning || (probe.waypoints && probe.waypoints.length > 0)) {
    let lastX = screenX;
    let lastY = screenY;
    
    // Draw line to current target
    if (probe.isTransitioning) {
      const targetScreenX = (probe.targetX - camera.x) * zoomFactor + canvas.width / 2 * (1 - zoomFactor);
      const targetScreenY = (probe.targetY - camera.y) * zoomFactor + canvas.height / 2 * (1 - zoomFactor);
      
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(targetScreenX, targetScreenY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw target marker
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(targetScreenX, targetScreenY, probeSize / 2, 0, Math.PI * 2);
      ctx.stroke();
      
      lastX = targetScreenX;
      lastY = targetScreenY;
    }
    
    // Draw queued waypoints
    if (probe.waypoints && probe.waypoints.length > 0) {
      probe.waypoints.forEach((waypoint, index) => {
        const wpScreenX = (waypoint.x - camera.x) * zoomFactor + canvas.width / 2 * (1 - zoomFactor);
        const wpScreenY = (waypoint.y - camera.y) * zoomFactor + canvas.height / 2 * (1 - zoomFactor);
        
        // Draw connecting line (more faded for later waypoints)
        const alpha = Math.max(0.2, 0.5 - index * 0.1);
        ctx.setLineDash([3, 6]);
        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(wpScreenX, wpScreenY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw waypoint marker (smaller circles with numbers)
        ctx.strokeStyle = `rgba(0, 200, 255, ${alpha + 0.2})`;
        ctx.fillStyle = `rgba(0, 50, 60, 0.7)`;
        ctx.beginPath();
        ctx.arc(wpScreenX, wpScreenY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw waypoint number
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha + 0.3})`;
        ctx.font = '10px Arial';
        ctx.fillText(`${index + 1}`, wpScreenX - 3, wpScreenY + 3);
        
        lastX = wpScreenX;
        lastY = wpScreenY;
      });
    }
  }
  
  // Calculate and draw gravity data if there are celestial bodies
  if (celestialBodies.length > 0) {
    const gravityData = calculateGravityAtPoint(probe.x, probe.y);
    drawProbeInfoPanel(gravityData, nullPoint);
    
    // Draw gravity vector arrow at probe position
    if (gravityData.accelerationMagnitude > 0.0001) {
      const arrowLength = Math.min(50, gravityData.accelerationMagnitude * 500);
      const endX = screenX + Math.cos(gravityData.accelerationAngle) * arrowLength;
      const endY = screenY + Math.sin(gravityData.accelerationAngle) * arrowLength;
      
      // Arrow shaft
      ctx.strokeStyle = 'rgba(255, 100, 50, 0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Arrow head
      const headSize = 8;
      const angle = gravityData.accelerationAngle;
      ctx.fillStyle = 'rgba(255, 100, 50, 0.9)';
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headSize * Math.cos(angle - Math.PI / 6),
        endY - headSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        endX - headSize * Math.cos(angle + Math.PI / 6),
        endY - headSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();
    }
  } else {
    // Draw minimal info panel when no bodies exist
    drawProbeInfoPanel(null, null);
  }
}

/**
 * Draws the probe information panel
 * @param {Object|null} gravityData - Gravitational data at probe position
 * @param {Object|null} nullPoint - Nearest null point data
 */
function drawProbeInfoPanel(gravityData, nullPoint) {
  const padding = 15;
  const lineHeight = 18;
  const panelWidth = 250;
  const startX = canvas.width - panelWidth - padding;
  
  // Build info lines
  const infoLines = [
    `Position: (${probe.x.toFixed(1)}, ${probe.y.toFixed(1)})`
  ];
  
  if (gravityData) {
    infoLines.push(`Field Strength: ${gravityData.fieldStrength.toFixed(6)}`);
    infoLines.push(`Grav. Potential: ${gravityData.potential.toFixed(4)}`);
    infoLines.push(`Escape Velocity: ${(gravityData.escapeVelocity * (velocityUnit === 'm/s' ? 1000 : 1)).toFixed(2)} ${velocityUnit}`);
    
    if (gravityData.nearestBody) {
      infoLines.push(`Closest Source: ${gravityData.nearestBody.label}`);
      infoLines.push(`Distance: ${gravityData.nearestDistance.toFixed(2)}`);
      infoLines.push(`Orbital Vel: ${(gravityData.orbitalVelocity * (velocityUnit === 'm/s' ? 1000 : 1)).toFixed(2)} ${velocityUnit}`);
    }
    
    if (gravityData.dominantBody) {
      if (gravityData.dominantBody !== gravityData.nearestBody) {
        infoLines.push(`Dominant Source: ${gravityData.dominantBody.label}`);
      } else {
        infoLines.push(`Dominant Source: (same as closest)`);
      }
    }
    
    // Direction in degrees
    const directionDeg = (gravityData.accelerationAngle * 180 / Math.PI + 360) % 360;
    infoLines.push(`Pull Direction: ${directionDeg.toFixed(1)}°`);
  } else {
    infoLines.push('No bodies in simulation');
  }
  
  // Add null point info
  if (nullPoint) {
    infoLines.push('--- Null Point ---');
    infoLines.push(`Status: ${nullPoint.stability}`);
    infoLines.push(`Distance: ${nullPoint.distanceFromProbe.toFixed(1)}`);
    infoLines.push(`Field: ${nullPoint.fieldStrength.toExponential(2)}`);
  } else if (celestialBodies.length >= 2) {
    infoLines.push('--- Null Point ---');
    infoLines.push('Searching...');
  } else if (celestialBodies.length > 0) {
    infoLines.push('--- Null Point ---');
    infoLines.push('Need 2+ bodies');
  }
  
  if (probe.isTransitioning) {
    const waypointCount = probe.waypoints ? probe.waypoints.length : 0;
    if (waypointCount > 0) {
      infoLines.push(`Transitioning: ${(probe.transitionProgress * 100).toFixed(0)}% (+${waypointCount} queued)`);
    } else {
      infoLines.push(`Transitioning: ${(probe.transitionProgress * 100).toFixed(0)}%`);
    }
  }
  
  const panelHeight = (infoLines.length + 1.5) * lineHeight + padding * 2;
  const startY = canvas.height - panelHeight - padding;
  
  // Draw semi-transparent background
  ctx.fillStyle = 'rgba(0, 30, 40, 0.85)';
  ctx.fillRect(startX - padding, startY - padding, panelWidth, panelHeight);
  
  // Draw border
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX - padding, startY - padding, panelWidth, panelHeight);
  
  // Draw title
  ctx.fillStyle = 'rgba(0, 255, 255, 1)';
  ctx.font = 'bold 15px Arial';
  ctx.fillText('Space Probe', startX, startY);
  
  // Draw info lines
  ctx.font = '13px Arial';
  
  infoLines.forEach((line, index) => {
    const y = startY + (index + 1.5) * lineHeight;
    
    // Color coding for different properties
    if (line.startsWith('Field Strength:') || line.startsWith('Field:')) {
      ctx.fillStyle = 'rgba(255, 150, 50, 1)';
    } else if (line.startsWith('Grav. Potential:')) {
      ctx.fillStyle = 'rgba(150, 100, 255, 1)';
    } else if (line.startsWith('Escape Velocity:') || line.startsWith('Orbital Vel:')) {
      ctx.fillStyle = 'rgba(0, 255, 200, 1)';
    } else if (line.startsWith('Closest Source:') || line.startsWith('Dominant Source:')) {
      ctx.fillStyle = 'rgba(255, 255, 100, 1)';
    } else if (line.startsWith('Pull Direction:')) {
      ctx.fillStyle = 'rgba(255, 100, 100, 1)';
    } else if (line.startsWith('Transitioning:')) {
      ctx.fillStyle = 'rgba(100, 200, 255, 1)';
    } else if (line.startsWith('---')) {
      ctx.fillStyle = 'rgba(180, 100, 255, 0.8)';
    } else if (line.startsWith('Status:')) {
      // Color based on null point stability
      if (line.includes('Strong')) {
        ctx.fillStyle = 'rgba(100, 255, 100, 1)';
      } else if (line.includes('Weak')) {
        ctx.fillStyle = 'rgba(200, 255, 100, 1)';
      } else if (line.includes('Near')) {
        ctx.fillStyle = 'rgba(255, 255, 100, 1)';
      } else {
        ctx.fillStyle = 'rgba(255, 180, 100, 1)';
      }
    } else if (line.startsWith('Distance:') && infoLines[index - 1]?.startsWith('Status:')) {
      ctx.fillStyle = 'rgba(180, 100, 255, 1)';
    } else if (line === 'Need 2+ bodies' || line === 'Searching...') {
      ctx.fillStyle = 'rgba(150, 150, 150, 1)';
    } else {
      ctx.fillStyle = 'rgba(200, 200, 200, 1)';
    }
    
    ctx.fillText(line, startX, y);
  });
}

/**
 * Draws detailed information panel for the currently followed body
 * @param {CelestialBody} body - The followed celestial body
 */
function drawFollowedBodyInfo(body) {
  if (!body) return;

  const padding = 15;
  const lineHeight = 20;
  const panelWidth = 220;
  const startX = canvas.width - panelWidth - padding;

  // Calculate gravitational force being exerted on the body
  const accelerationMagnitude = Math.sqrt(body.ax * body.ax + body.ay * body.ay);
  const gravitationalForce = body.weight * accelerationMagnitude;
  
  // Calculate panel height based on content
  const infoLines = [
    `Name: ${body.label}`,
    `Type: ${body.bodyType}`,
    `Mass: ${body.weight.toFixed(2)}`,
    `Radius: ${body.radius.toFixed(2)}`,
    `Density: ${body.density.toFixed(2)}`,
    `Position: (${body.x.toFixed(1)}, ${body.y.toFixed(1)})`,
    `Velocity: ${(Math.sqrt(body.dx * body.dx + body.dy * body.dy)*(velocityUnit === 'm/s' ? 1000 : 1)).toFixed(2)} ${velocityUnit === 'm/s' ? 'm/s' : 'km/s'}`,
    `Grav. Force: ${gravitationalForce.toFixed(3)} N`,
  ];

  const panelHeight = infoLines.length * lineHeight + padding * 2;
  
  // Position at bottom right corner
  const startY = canvas.height - panelHeight - padding;

  // Draw semi-transparent background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(startX - padding, startY - padding, panelWidth, panelHeight);

  // Draw border
  ctx.strokeStyle = body.trailColor || 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX - padding, startY - padding, panelWidth, panelHeight);

  // Draw title
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Followed Body Info', startX, startY);

  // Draw direction circle with arrow
  const circleRadius = 15;
  const circleX = startX + panelWidth - circleRadius - 20;
  const circleY = startY + 5;
  
  // Calculate direction angle from velocity
  const velocityMagnitude = Math.sqrt(body.dx * body.dx + body.dy * body.dy);
  if (velocityMagnitude > 0.01) { // Only draw if there's significant movement
    const directionAngle = Math.atan2(body.dy, body.dx);
    
    // Draw circle background
    ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw circle border
    ctx.strokeStyle = body.trailColor || 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw direction arrow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    
    // Arrow body (line from center towards direction)
    const arrowLength = circleRadius * 0.6;
    const arrowEndX = circleX + Math.cos(directionAngle) * arrowLength;
    const arrowEndY = circleY + Math.sin(directionAngle) * arrowLength;
    
    ctx.beginPath();
    ctx.moveTo(circleX, circleY);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.stroke();
    
    // Arrow head (triangle)
    const arrowHeadSize = 4;
    const leftAngle = directionAngle + Math.PI * 0.75;
    const rightAngle = directionAngle - Math.PI * 0.75;
    
    ctx.beginPath();
    ctx.moveTo(arrowEndX, arrowEndY);
    ctx.lineTo(arrowEndX + Math.cos(leftAngle) * arrowHeadSize, arrowEndY + Math.sin(leftAngle) * arrowHeadSize);
    ctx.lineTo(arrowEndX + Math.cos(rightAngle) * arrowHeadSize, arrowEndY + Math.sin(rightAngle) * arrowHeadSize);
    ctx.closePath();
    ctx.fill();
  }

  // Draw info lines
  ctx.font = '14px Arial';
  ctx.fillStyle = 'rgba(200, 200, 200, 1)';
  
  infoLines.forEach((line, index) => {
    const y = startY + (index + 1.5) * lineHeight;
    
    // Special coloring for certain properties
    if (line.startsWith('Velocity:')) {
      ctx.fillStyle = 'rgba(0, 255, 255, 1)';
    } else if (line.startsWith('Grav. Force:')) {
      ctx.fillStyle = 'rgba(255, 128, 0, 1)'; // Orange for gravitational force
    } else if (line.startsWith('Type:')) {
      ctx.fillStyle = body.textColor || 'rgba(200, 200, 200, 1)';
    } else {
      ctx.fillStyle = 'rgba(200, 200, 200, 1)';
    }
    
    ctx.fillText(line, startX, y);
  });
}

// Reset all celestial bodies and settings
function resetEverything() {
  celestialBodies.length = 0;

  // Reset celestial body values
  PlanetRadius.value = celestialBodyValues.planet.radius = 4;
  PlanetDensity.value = celestialBodyValues.planet.density = 0.5;
  celestialBodyValues.planet.color = { r: 255, g: 255, b: 255 };
  PlanetColor.value = '#ffffff';
  StarRadius.value = celestialBodyValues.star.radius = 10;
  StarDensity.value = celestialBodyValues.star.density = 2;
  celestialBodyValues.star.color = { r: 255, g: 165, b: 0 };
  StarColor.value = '#ffa500';
  BlackHoleRadius.value = celestialBodyValues.blackHole.radius = 15;
  BlackHoleDensity.value = celestialBodyValues.blackHole.density = 30;
  celestialBodyValues.blackHole.color = { r: 0, g: 0, b: 0 };
  BlackHoleColor.value = '#000000';

  // Reset toggle settings
  collideIsON = collision.checked = true;
  showTrailsIsON = showTrails.checked = true;
  showStarsIsON = showStars.checked = true;
  showFPSIsON = showFPS.checked = false;
  showVelocitiesIsON = showVelocities.checked = true;
  showLabelsIsON = showLabels.checked = true;
  timeScaleInput.value = timeScale = 1;

  // Reset dev mode settings
  devModeIsON = false;
  document.querySelectorAll('.dev-item').forEach(item => {
    item.style.display = 'none';
  });
  devModeToggle.textContent = 'Enable Dev Mode (~)';
  showBHNodesIsON = showBHNodes.checked = false;
  showBHCenterOfMassIsON = showBHCenterOfMass.checked = false;
  showTrailPointsIsON = showTrailPoints.checked = false;
  
  // Reset probe mode
  probeModeEnabled = false;
  probe = null;

  // Reset gravity field visualization settings
  showGravityGridIsON = showGravityGrid.checked = false;
  showGravityVectorsIsON = showGravityVectors.checked = false;
  showGravityHeatmapIsON = showGravityHeatmap.checked = false;
  showGravityContoursIsON = showGravityContours.checked = false;
  gravityFieldSettings.gridOpacity = gravityGridOpacity.value = 1.0;
  gravityFieldSettings.heatmapOpacity = gravityHeatmapOpacity.value = 0.85;
  gravityFieldSettings.vectorOpacity = gravityVectorOpacity.value = 1.0;
  gravityFieldSettings.contourOpacity = gravityContourOpacity.value = 0.9;
  gravityFieldSettings.warpStrength = gravityWarpStrength.value = 1.0;
  gravityFieldRenderer.updateSettings(gravityFieldSettings);

  // Reset camera settings
  cameraFollow = followCam.checked = false;
  cameraFollowingIndex = 0;
  camera.x = 0;
  camera.y = 0;
  camera.prevX = 0;
  camera.prevY = 0;
  camSpeed = camSpeedElement.value = 5;
  zoomFactor = 1;

  // Clear the background stars and redraw them
  backgroundStars.length = 0;
  createBackgroundStars(1500);
  starCtx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackgroundStars();

  // Reset the trail canvas and clear all trails
  trailctx.clearRect(0, 0, canvas.width, canvas.height);
  trailManager.clearAllTrails();
  
  // Clear WebGL canvas
  webglRenderer.clear();
}

function playInstructions() {
  prompt({
    text: "Use number keys to select a celestial body",
    y: canvas.height - 50,
    vel: 140,
    time: 0.2
  });

  prompt({
    text: "Click to place a body or drag to launch it",
    y: canvas.height - 50,
    vel: 140,
    time: 0.2
  });

  prompt({
    text: "Use WASD to move camera and scroll to zoom in/out",
    y: canvas.height - 50,
    vel: 140,
    time: 0.2
  });

  prompt({
    text: "Press C to follow a body, E/Q to cycle through bodies",
    y: canvas.height - 50,
    vel: 140,
    time: 0.2
  });

  prompt({
    text: "Press P to pin/unpin followed body, Space to pause",
    y: canvas.height - 50,
    vel: 140,
    time: 0.2
  });

  prompt({
    text: "Press 0 for Probe Mode - analyze any point in space",
    y: canvas.height - 50,
    vel: 140,
    time: 0.2
  });

  prompt({
    text: "Use settings menu in top left to customize the simulation",
    y: canvas.height - 50,
    vel: 140,
    time: 0.2
  });

  prompt({
    text: "(L) to replay instructions. (.) to clear prompts",
    y: 60,
    x: 10,
    vel: 0,
    time: 0.05,
    textSize: 16,
    isOverRide: true,
  })
}

playInstructions();