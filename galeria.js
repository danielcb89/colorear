function autoGuardarProgreso() {
    if (!dibujoActualSrc) return;
    try {
        const datosPintura = canvas.toDataURL();
        localStorage.setItem('save_' + dibujoActualSrc, datosPintura);

        const lienzoFantasma = document.createElement('canvas');
        lienzoFantasma.width = canvas.width;
        lienzoFantasma.height = canvas.height;
        const ctxFantasma = lienzoFantasma.getContext('2d');

        // Limpieza estricta de inicio
        ctxFantasma.clearRect(0, 0, lienzoFantasma.width, lienzoFantasma.height);
        ctxFantasma.drawImage(canvas, 0, 0);
        ctxFantasma.globalCompositeOperation = 'multiply';
        ctxFantasma.drawImage(linesCanvas, 0, 0);

        const fotoFinalCombinada = lienzoFantasma.toDataURL();
        const mini = document.querySelector("img[src='" + dibujoActualSrc + "'], img[data-src='" + dibujoActualSrc + "']");
        if (mini) { mini.src = fotoFinalCombinada; }
    } catch (e) {
        console.log("Error al guardar.");
    }
}

function actualizarMiniaturaLista(imgThumb, imgUrl, dibujoGuardado) {
    if (!dibujoGuardado) return;
    const imgOriginal = new Image();
    imgOriginal.src = imgUrl;
    imgOriginal.onload = () => {
        const lienzoFantasma = document.createElement('canvas');
        lienzoFantasma.width = imgOriginal.width;
        lienzoFantasma.height = imgOriginal.height;
        const ctxFantasma = lienzoFantasma.getContext('2d');
        
        // CORREGIDO: Vaciamos por completo el lienzo fantasma para que no duplique el fondo en el canvas principal
        ctxFantasma.clearRect(0, 0, lienzoFantasma.width, lienzoFantasma.height);
        
        const imgPintura = new Image();
        imgPintura.src = dibujoGuardado;
        imgPintura.onload = () => {
            // Si las dimensiones no coinciden por el cambio de formato, centramos la pintura
            if (imgPintura.width === imgOriginal.width && imgPintura.height === imgOriginal.height) {
                ctxFantasma.drawImage(imgPintura, 0, 0);
            } else {
                ctxFantasma.fillStyle = "#ffffff";
                ctxFantasma.fillRect(0, 0, lienzoFantasma.width, lienzoFantasma.height);
                ctxFantasma.drawImage(imgPintura, 0, 0, lienzoFantasma.width, lienzoFantasma.height);
            }
            ctxFantasma.globalCompositeOperation = 'multiply';
            ctxFantasma.drawImage(imgOriginal, 0, 0);
            imgThumb.src = lienzoFantasma.toDataURL();
        };
    };
}
