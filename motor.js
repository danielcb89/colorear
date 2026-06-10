const colores = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', 
    '#6366f1', '#a855f7', '#ec4899', '#1e293b', '#b91c1c', '#ea580c', '#d97706', '#ca8a04', 
    '#16a34a', '#059669', '#0891b2', '#2563eb', '#4f46e5', '#9333ea', '#db2777', '#475569',
    '#fca5a5', '#fed7aa', '#fde68a', '#fef08a', '#a7f3d0', '#99f6e4', '#bae6fd', '#c7d2fe',
    '#ffffff', '#ffb7ce', '#ff007f'
];
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const linesCanvas = document.getElementById('linesCanvas');
const linesCtx = linesCanvas.getContext('2d');

let colorActual = '#ef4444';
let modoActual = 'pincel'; 
let pintando = false;
let dibujoActualSrc = null;
let grosorActual = 8;
let historialEstados = [];
const maxHistorial = 10;
const portfolioContainer = document.getElementById('portfolio-list');
const portfolioTitle = document.getElementById('portfolio-title');
const backButtonContainer = document.getElementById('back-button-container');

function guardarEstado() {
    if (historialEstados.length >= maxHistorial) { historialEstados.shift(); }
    historialEstados.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function deshacerPaso() {
    if (historialEstados.length > 0) {
        ctx.putImageData(historialEstados.pop(), 0, 0);
        autoGuardarProgreso();
    }
}

function cargarCategorias() {
    portfolioTitle.innerText = "📁 Categorías";
    portfolioContainer.innerHTML = "";
    backButtonContainer.innerHTML = "";
    fetch('./dibujos/')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');
        let carpetasEncontradas = false;
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('/') && href !== '../' && href !== './') {
                carpetasEncontradas = true;
                const nombreCarpeta = href.replace('/', '');
                const item = document.createElement('img');
                item.className = 'portfolio-item';
                item.src = "./dibujos/" + href + "icono.png";
                item.onerror = () => {
                    const textBtn = document.createElement('button');
                    textBtn.className = 'category-btn';
                    textBtn.innerText = nombreCarpeta.toUpperCase();
                    textBtn.onclick = () => cargarDibujosDeCategoria(nombreCarpeta);
                    item.replaceWith(textBtn);
                };
                item.onclick = () => {
                    localStorage.setItem('ultima_categoria', nombreCarpeta);
                    cargarDibujosDeCategoria(nombreCarpeta);
                };
                portfolioContainer.appendChild(item);
            }
        });
        const ultimaCat = localStorage.getItem('ultima_categoria');
        if (carpetasEncontradas && ultimaCat) {
            cargarDibujosDeCategoria(ultimaCat);
        } else if (!carpetasEncontradas) { 
            inicializarLienzoBlanco(700, 500); 
        }
    }).catch(() => { inicializarLienzoBlanco(700, 500); });
}

function cargarDibujosDeCategoria(categoria) {
    portfolioTitle.innerText = "🖼️ " + categoria;
    portfolioContainer.innerHTML = "";
    backButtonContainer.innerHTML = "";

    const btnBack = document.createElement('button');
    btnBack.className = 'btn-back-cats';
    btnBack.innerText = "⬅️ Categorías";
    btnBack.onclick = () => {
        localStorage.removeItem('ultima_categoria');
        cargarCategorias();
    };
    backButtonContainer.appendChild(btnBack);

    fetch("./dibujos/" + categoria + "/")
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a');
        let primero = true;
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.match(/\.(png|jpe?g|webp)$/i)) {
                if (href.toLowerCase() === 'icono.png') return;
                const imgUrl = "./dibujos/" + categoria + "/" + href;
                const imgThumb = document.createElement('img');
                imgThumb.className = 'portfolio-item';
                imgThumb.setAttribute('data-src', imgUrl);
                imgThumb.src = imgUrl; 

                imgThumb.onclick = () => { guardarEstado(); cargarDibujo(imgUrl); };
                portfolioContainer.appendChild(imgThumb);
                if (primero) { cargarDibujo(imgUrl); primero = false; }
                
                const dibujoGuardado = localStorage.getItem('save_' + imgUrl);
                if (dibujoGuardado) {
                    actualizarMiniaturaLista(imgThumb, imgUrl, dibujoGuardado);
                }
            }
        });
    });
}

function inicializarLienzoBlanco(w, h) {
    canvas.width = w; canvas.height = h;
    linesCanvas.width = w; linesCanvas.height = h;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
    linesCtx.clearRect(0, 0, w, h);
    historialEstados = [];
}

const paletteContainer = document.getElementById('colors-palette');
colores.forEach((color, idx) => {
    const bubble = document.createElement('div');
    bubble.className = "color-bubble" + (idx === 0 ? " selected" : "");
    bubble.style.backgroundColor = color;
    if (color === '#ffffff') bubble.style.borderColor = '#cbd5e1';
    bubble.onclick = () => {
        colorActual = color;
        document.querySelectorAll('.color-bubble').forEach(b => b.classList.remove('selected'));
        bubble.classList.add('selected');
        if(modoActual === 'borrador') setMode('pincel');
    };
    paletteContainer.appendChild(bubble);
});

function setMode(modo) {
    modoActual = modo;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    document.getElementById("tool-" + modo).classList.add('active');
}

function setGrosor(num, id) {
    grosorActual = num;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    document.getElementById("size-" + id).className = "size-btn active";
}

// CORREGIDO AUTOMÁTICAMENTE: Adapta, encoge y alinea las pinturas viejas al formato nuevo sin perder nada
function cargarDibujo(src) {
    dibujoActualSrc = src;
    localStorage.setItem('ultimo_dibujo', src);
    const imgOriginal = new Image();
    imgOriginal.src = src;
    imgOriginal.onload = () => {
        const zonaCentral = document.querySelector('.canvas-area');
        const maxW = zonaCentral.clientWidth - 16;
        const maxH = zonaCentral.clientHeight - 16;
        
        canvas.width = maxW; canvas.height = maxH;
        linesCanvas.width = maxW; linesCanvas.height = maxH;
        
        let w = imgOriginal.width; let h = imgOriginal.height;
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.floor(w * ratio); h = Math.floor(h * ratio);
        
        let x = Math.floor((maxW - w) / 2);
        let y = Math.floor((maxH - h) / 2);
        
        linesCtx.clearRect(0, 0, maxW, maxH);
        linesCtx.drawImage(imgOriginal, x, y, w, h);
        
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, maxW, maxH);
        
        const dibujoGuardado = localStorage.getItem('save_' + src);
        if (dibujoGuardado) {
            const imgPintura = new Image();
            imgPintura.src = dibujoGuardado;
            imgPintura.onload = () => {
                // Si la pintura ya se guardó con el tamaño de pantalla completo nuevo, se dibuja directa
                if (imgPintura.width === maxW && imgPintura.height === maxH) {
                    ctx.drawImage(imgPintura, 0, 0, maxW, maxH);
                } else {
                    // MÁGICO: Si la pintura era del formato viejo, la encogemos y centramos al milímetro
                    ctx.drawImage(imgPintura, x, y, w, h);
                    autoGuardarProgreso(); // Guardamos el parche en la tablet de forma transparente
                }
            };
        }
    };
}

function reiniciarLienzo() {
    guardarEstado();
    if (dibujoActualSrc) {
        localStorage.removeItem('save_' + dibujoActualSrc);
        const mini = document.querySelector("img[src='" + dibujoActualSrc + "'], img[data-src='" + dibujoActualSrc + "']");
        if (mini) { mini.src = dibujoActualSrc; }
        cargarDibujo(dibujoActualSrc);
    } else {
        inicializarLienzoBlanco(canvas.width, canvas.height);
    }
}

cargarCategorias();
