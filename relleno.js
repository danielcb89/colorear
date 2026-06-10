function algoritmoRelleno(startX, startY, colorHex) {
    const linesCtx = document.getElementById('linesCanvas').getContext('2d');
    const dataImgLines = linesCtx.getImageData(startX, startY, 1, 1).data;
    
    // Si hace clic justo encima de una línea negra del dibujo, frena para no borrarla
    if (dataImgLines[0] < 60 && dataImgLines[1] < 60 && dataImgLines[2] < 60 && dataImgLines[3] > 0) return;

    const dataImgPaint = ctx.getImageData(startX, startY, 1, 1).data;
    const tR = dataImgPaint[0]; const tG = dataImgPaint[1]; const tB = dataImgPaint[2];

    const r = parseInt(colorHex.slice(1,3), 16);
    const g = parseInt(colorHex.slice(3,5), 16);
    const b = parseInt(colorHex.slice(5,7), 16);
    if (Math.abs(tR-r)<10 && Math.abs(tG-g)<10 && Math.abs(tB-b)<10) return;

    const imageDataPaint = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelsPaint = imageDataPaint.data;
    
    const imageDataLines = linesCtx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelsLines = imageDataLines.data;

    const filaWidth = canvas.width * 4;
    const pixelStack = [[startX, startY]];

    while (pixelStack.length > 0) {
        const newPos = pixelStack.pop();
        const x = newPos[0]; let y = newPos[1];
        let pixelPos = (y * canvas.width + x) * 4;

        // MEJORADO: El cubo avanza si el píxel de arriba está blanco O es totalmente transparente (fuera del folio)
        while (y >= 0 && 
              (pixelsLines[pixelPos+3] === 0 || (pixelsLines[pixelPos] > 60 || pixelsLines[pixelPos+1] > 60 || pixelsLines[pixelPos+2] > 60)) &&
              Math.abs(pixelsPaint[pixelPos]-tR)<45 && Math.abs(pixelsPaint[pixelPos+1]-tG)<45 && Math.abs(pixelsPaint[pixelPos+2]-tB)<45) {
            y--; pixelPos -= filaWidth;
        }
        pixelPos += filaWidth; y++;

        let reachLeft = false; let reachRight = false;
        
        while (y < canvas.height && 
              (pixelsLines[pixelPos+3] === 0 || (pixelsLines[pixelPos] > 60 || pixelsLines[pixelPos+1] > 60 || pixelsLines[pixelPos+2] > 60)) &&
              Math.abs(pixelsPaint[pixelPos]-tR)<45 && Math.abs(pixelsPaint[pixelPos+1]-tG)<45 && Math.abs(pixelsPaint[pixelPos+2]-tB)<45) {
            
            pixelsPaint[pixelPos] = r; pixelsPaint[pixelPos+1] = g; pixelsPaint[pixelPos+2] = b; pixelsPaint[pixelPos+3] = 255;
            
            if (x > 0) {
                let pLeft = pixelPos - 4;
                if ((pixelsLines[pLeft+3] === 0 || (pixelsLines[pLeft] > 60 || pixelsLines[pLeft+1] > 60 || pixelsLines[pLeft+2] > 60)) &&
                    Math.abs(pixelsPaint[pLeft]-tR)<45 && Math.abs(pixelsPaint[pLeft+1]-tG)<45 && Math.abs(pixelsPaint[pLeft+2]-tB)<45) {
                    if (!reachLeft) { pixelStack.push([x - 1, y]); reachLeft = true; }
                } else if (reachLeft) { reachLeft = false; }
            }
            if (x < canvas.width - 1) {
                let pRight = pixelPos + 4;
                if ((pixelsLines[pRight+3] === 0 || (pixelsLines[pRight] > 60 || pixelsLines[pRight+1] > 60 || pixelsLines[pRight+2] > 60)) &&
                    Math.abs(pixelsPaint[pRight]-tR)<45 && Math.abs(pixelsPaint[pRight+1]-tG)<45 && Math.abs(pixelsPaint[pRight+2]-tB)<45) {
                    if (!reachRight) { pixelStack.push([x + 1, y]); reachRight = true; }
                } else if (reachRight) { reachRight = false; }
            }
            y++; pixelPos += filaWidth;
        }
    }
    ctx.putImageData(imageDataPaint, 0, 0);
}
