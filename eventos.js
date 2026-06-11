function obtenerPos(e) {
const rect = canvas.getBoundingClientRect();
const cX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
const cY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
return {
x: Math.floor((cX - rect.left) * (canvas.width / rect.width)),
y: Math.floor((cY - rect.top) * (canvas.height / rect.height))
};
}

const mapaDeSimbolos = {
sol: '☀', nube: '☁', lluvia: '🌧', luna: '🌙', estrella: '⭐',
destello: '✨', rayo: '⚡', arcoiris: '🌈', arbol: '🌳', pino: '🌲',
matorral: '🌿', flor: '🌸', tulipan: '🌷', hierba: '🌱', seta: '🍄',
montana: '⛰', ola: '🌊', pez: '🐟', cangrejo: '🦀', estrellaMar: '⭐',
caracola: '🐚', burbuja: '🫧', gota: '💧', ancla: '⚓', corazon: '❤',
mariposa: '🦋', sonrisa: '🙂', corona: '👑', globo: '🎈', nieve: '❄',
musica: '🎵', huella: '🐾', carroza: '🎠', espejo: '🪞', varita: '🪄'
};

const gridFormas = document.getElementById('shapes-palette');
if (gridFormas) {
gridFormas.innerHTML = "";
Object.keys(mapaDeSimbolos).forEach(id => {
const btn = document.createElement('button');
btn.className = 'shape-btn'; btn.id = 'shape-' + id;
btn.innerText = mapaDeSimbolos[id];
btn.onclick = () => seleccionarForma(id);
gridFormas.appendChild(btn);
});
}

const tempCanvas = document.getElementById('tempCanvas');
const tempCtx = tempCanvas.getContext('2d');
let formaX = 0, formaY = 0, formaEscala = 1.0, formaAngulo = 0;
let distInicialDedos = 0, anguloInicialDedos = 0;
let baseEscala = 1.0, baseAngulo = 0;
let formaColocadaInicialmente = false;

let ultimaX = 0;
let ultimaY = 0;

function limpiarLienzoTemporal() {
tempCanvas.width = canvas.width; tempCanvas.height = canvas.height;
tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
}

const orgCargarDibujo = window.cargarDibujo;
window.cargarDibujo = function(src) {
if (formaSeleccionada && typeof finalizarYEstamparForma === 'function' && formaColocadaInicialmente) {
finalizarYEstamparForma();
}
formaSeleccionada = null;
formaColocadaInicialmente = false;
document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('selected'));
limpiarLienzoTemporal();
if (typeof orgCargarDibujo === 'function') orgCargarDibujo(src);
};

function iniciarNuevaFormaFlotante(id) {
limpiarLienzoTemporal();
formaEscala = 1.0; formaAngulo = 0; baseEscala = 1.0; baseAngulo = 0;
formaColocadaInicialmente = false;
}

function dibujarFormaFlotante() {
tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
if (!formaSeleccionada || !mapaDeSimbolos[formaSeleccionada] || !formaColocadaInicialmente) return;
const txt = mapaDeSimbolos[formaSeleccionada]; const size = grosorActual * 5;
tempCtx.save(); tempCtx.translate(formaX, formaY); tempCtx.rotate(formaAngulo); tempCtx.scale(formaEscala, formaEscala);
tempCtx.font = `${size}px sans-serif`; tempCtx.textAlign = 'center'; tempCtx.textBaseline = 'middle';
tempCtx.fillStyle = colorActual; tempCtx.globalAlpha = 0.65; tempCtx.fillText(txt, 0, 0); tempCtx.restore();
}

function finalizarYEstamparForma() {
if (!formaSeleccionada || !mapaDeSimbolos[formaSeleccionada] || !formaColocadaInicialmente) return;
guardarEstado(); const txt = mapaDeSimbolos[formaSeleccionada]; const size = grosorActual * 5;
ctx.save(); ctx.translate(formaX, formaY); ctx.rotate(formaAngulo); ctx.scale(formaEscala, formaEscala);
ctx.font = `${size}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
ctx.fillStyle = colorActual; ctx.globalCompositeOperation = 'source-over'; ctx.fillText(txt, 0, 0); ctx.restore();
autoGuardarProgreso(); limpiarLienzoTemporal();
}

canvas.parentElement.addEventListener('touchstart', (e) => {
if (!formaSeleccionada) return; const rect = canvas.getBoundingClientRect();
if (e.touches.length === 1) {
pintando = true;
const pX = Math.floor((e.touches[0].clientX - rect.left) * (canvas.width / rect.width));
const pY = Math.floor((e.touches[0].clientY - rect.top) * (canvas.height / rect.height));
formaX = pX;
formaY = pY;
if (!formaColocadaInicialmente) {
formaColocadaInicialmente = true;
}
dibujarFormaFlotante();
} else if (e.touches.length === 2 && formaColocadaInicialmente) {
pintando = false;
const dx = e.touches[0].clientX - e.touches[1].clientX;
const dy = e.touches[0].clientY - e.touches[1].clientY;
distInicialDedos = Math.sqrt(dx*dx + dy*dy); anguloInicialDedos = Math.atan2(dy, dx);
baseEscala = formaEscala; baseAngulo = formaAngulo;
}
});

canvas.parentElement.addEventListener('touchmove', (e) => {
if (!formaSeleccionada || !formaColocadaInicialmente) return; e.preventDefault(); const rect = canvas.getBoundingClientRect();
if (e.touches.length === 1 && pintando) {
formaX = Math.floor((e.touches[0].clientX - rect.left) * (canvas.width / rect.width));
formaY = Math.floor((e.touches[0].clientY - rect.top) * (canvas.height / rect.height));
dibujarFormaFlotante();
} else if (e.touches.length === 2) {
const dx = e.touches[0].clientX - e.touches[1].clientX;
const dy = e.touches[0].clientY - e.touches[1].clientY;
const nDist = Math.sqrt(dx*dx + dy*dy); const nAng = Math.atan2(dy, dx);
if (distInicialDedos > 0) { formaEscala = baseEscala * (nDist / distInicialDedos); if (formaEscala < 0.2) formaEscala = 0.2; if (formaEscala > 6.0) formaEscala = 6.0; }
formaAngulo = baseAngulo + (nAng - anguloInicialDedos); dibujarFormaFlotante();
}
}, { passive: false });

canvas.parentElement.addEventListener('touchend', () => { pintando = false; });

canvas.addEventListener('pointerdown', (e) => {
if (formaSeleccionada) return; const pos = obtenerPos(e); guardarEstado(); pintando = true;
ctx.globalCompositeOperation = 'source-over';
if (modoActual === 'relleno') { algoritmoRelleno(pos.x, pos.y, colorActual); pintando = false; autoGuardarProgreso(); }
else {
ultimaX = pos.x;
ultimaY = pos.y;
ctx.beginPath(); ctx.moveTo(ultimaX, ultimaY);
ctx.strokeStyle = modoActual === 'borrador' ? '#ffffff' : colorActual;
ctx.lineWidth = modoActual === 'borrador' ? (grosorActual * 4) : grosorActual;
ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineTo(pos.x, pos.y); ctx.stroke();
}
});

canvas.addEventListener('pointermove', (e) => { 
if (!pintando || modoActual === 'relleno' || formaSeleccionada) return; 
const pos = obtenerPos(e); 

if (modoActual === 'arcoiris') {
ctx.beginPath();
ctx.moveTo(ultimaX, ultimaY);
ctx.lineTo(pos.x, pos.y);
ctx.strokeStyle = colorActual;
ctx.lineWidth = grosorActual;
ctx.lineCap = 'round'; ctx.lineJoin = 'round';
ctx.stroke();
} else {
ctx.lineTo(pos.x, pos.y);
ctx.strokeStyle = modoActual === 'borrador' ? '#ffffff' : colorActual;
ctx.lineWidth = modoActual === 'borrador' ? (grosorActual * 4) : grosorActual;
ctx.lineCap = 'round'; ctx.lineJoin = 'round';
ctx.stroke();
}

ultimaX = pos.x;
ultimaY = pos.y;
});

canvas.addEventListener('pointerup', () => { if (pintando && modoActual !== 'relleno') { autoGuardarProgreso(); } pintando = false; });
canvas.addEventListener('pointerleave', () => { if (pintando && modoActual !== 'relleno') { autoGuardarProgreso(); } pintando = false; });
