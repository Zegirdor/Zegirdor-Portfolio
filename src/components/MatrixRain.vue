<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref(null);
let animationFrameId = null;

onMounted(() => {
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');

  const motionPreference = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  )

	let viewportWidth = 0;
	let viewportHeight = 0;

	// Keep drawing coordinates in CSS pixels and scale the backing buffer.
	const resizeCanvas = () => {
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;
		const pixelRatio = window.devicePixelRatio || 1;

		canvas.width = Math.round(viewportWidth * pixelRatio);
		canvas.height = Math.round(viewportHeight * pixelRatio);
		ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	};
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Matrix characters configuration
  const katakana = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alphabet = katakana.split('');

  const fontSize = 16;
  // Calculate columns based on width and font size
  let columns = Math.floor(viewportWidth / fontSize);

  const randomStartingRow = () => -Math.floor(Math.random() * Math.ceil(viewportHeight / fontSize))
  
  // Array to track the y-coordinate of each rain drop per column
  let rainDrops = Array.from({ length: columns }, randomStartingRow)

  // Recalculate columns seamlessly if window size changes
  const updateColumns = () => {
    columns = Math.floor(viewportWidth / fontSize);
    const oldDrops = [...rainDrops];
    rainDrops = Array.from( { length: columns }, (_, i) => oldDrops[i] ?? randomStartingRow())
  };
  window.addEventListener('resize', updateColumns);

  // Render loop around 12 times per second max
  const frameInterval = 1000 / 12
  let lastDrawTime = 0
  const draw = (timestamp) => {
    // Limit animations per second
    animationFrameId = requestAnimationFrame(draw);
    if (timestamp - lastDrawTime < frameInterval) return;
	lastDrawTime = timestamp;
    // Semi-transparent black background creates the trailing fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    ctx.fillStyle = '#0F0'; // Matrix green
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < rainDrops.length; i++) {
      // Pick a random character
      const text = alphabet[Math.floor(Math.random() * alphabet.length)];
      
      // X-coordinate is column index * font size, Y-coordinate is tracked by rainDrops
      const x = i * fontSize;
      const y = rainDrops[i] * fontSize;

      ctx.fillText(text, x, y);

      // Reset drop to the top with a randomized delay once it hits the bottom
      if (y > viewportHeight && Math.random() > 0.975) {
        rainDrops[i] = 0;
      }
      
      // Move down the screen
      rainDrops[i]++;
    }
    
  };

  // Start the animation
  const applyMotionPreference = () => {
    if (motionPreference.matches) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
      ctx.clearRect(0, 0, viewportWidth, viewportHeight)
      return
    }

    if (animationFrameId == null) {
      lastDrawTime = 0
      animationFrameId = requestAnimationFrame(draw)
    }
  }

  motionPreference.addEventListener('change', applyMotionPreference)
  applyMotionPreference()

  // Cleanup event listeners and animation loop on unmount
  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('resize', updateColumns);
    motionPreference.removeEventListener('change', applyMotionPreference)
  });
});
</script>

<template>
	<canvas
		ref="canvasRef"
		class="matrix-canvas"
		aria-hidden="true"
	></canvas>
</template>

<style scoped>
.matrix-canvas {
	position: fixed;
	inset: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	pointer-events: none;
	background-color: #040805;
    opacity: 0.1;
}
</style>