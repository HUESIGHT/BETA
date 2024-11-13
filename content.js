// Matrices de transformación para cada tipo de daltonismo
const matricesDaltonismo = {
    protanopia: [
        [0.567, 0.433, 0],
        [0.558, 0.442, 0],
        [0, 0.242, 0.758]
    ],
    deuteranopia: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7]
    ],
    tritanopia: [
        [0.95, 0.05, 0],
        [0, 0.433, 0.567],
        [0, 0.475, 0.525]
    ]
};

// Ajuste personalizado de matriz
function ajustarMatriz(matriz, ajuste) {
    return matriz.map(row => row.map(value => value * ajuste));
}

// Corrección de color usando IA simulada
function ajustarColorConAI(rgb, tipoDaltonismo) {
    const ajuste = tipoDaltonismo === 'protanopia' ? 1.1 : 1;
    const matrizAjustada = ajustarMatriz(matricesDaltonismo[tipoDaltonismo], ajuste);
    return corregirColor(rgb, matrizAjustada);
}

// Función para corregir color RGB mediante una matriz de transformación
function corregirColor(rgb, matriz) {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    const newR = Math.min(Math.round(r * matriz[0][0] + g * matriz[0][1] + b * matriz[0][2]), 255);
    const newG = Math.min(Math.round(r * matriz[1][0] + g * matriz[1][1] + b * matriz[1][2]), 255);
    const newB = Math.min(Math.round(r * matriz[2][0] + g * matriz[2][1] + b * matriz[2][2]), 255);
    return `rgb(${newR}, ${newG}, ${newB})`;
}

// Aplicar filtro IA a los estilos de color de un elemento
function aplicarFiltroAElementoAI(element, matriz, tipoDaltonismo) {
    const style = window.getComputedStyle(element);
    const backgroundColor = style.backgroundColor;
    if (backgroundColor && backgroundColor !== "rgba(0, 0, 0, 0)" && backgroundColor !== "transparent") {
        element.style.backgroundColor = ajustarColorConAI(backgroundColor, tipoDaltonismo);
    }
    const color = style.color;
    if (color && color !== "rgba(0, 0, 0, 0)" && color !== "transparent") {
        element.style.color = ajustarColorConAI(color, tipoDaltonismo);
    }
    const borderColor = style.borderColor;
    if (borderColor && borderColor !== "rgba(0, 0, 0, 0)" && borderColor !== "transparent") {
        element.style.borderColor = ajustarColorConAI(borderColor, tipoDaltonismo);
    }
}

// Procesar imágenes, iconos SVG y fondos CSS con verificación de CORS
function aplicarFiltroAImagenesYIconos(matriz, tipoDaltonismo) {
    // Procesar imágenes con src o data-src
    document.querySelectorAll("img").forEach(img => {
        const imgSrc = img.getAttribute('src') || img.getAttribute('data-src');
        if (!imgSrc) return;

        // Intentar cargar la imagen para aplicar el filtro directo, si falla, aplicar CSS
        const image = new Image();
        image.src = imgSrc;
        image.crossOrigin = "Anonymous"; // Intentar evitar problemas de CORS
        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) {
                    [data[i], data[i + 1], data[i + 2]] = [
                        Math.min(Math.round(data[i] * matriz[0][0] + data[i + 1] * matriz[0][1] + data[i + 2] * matriz[0][2]), 255),
                        Math.min(Math.round(data[i] * matriz[1][0] + data[i + 1] * matriz[1][1] + data[i + 2] * matriz[1][2]), 255),
                        Math.min(Math.round(data[i] * matriz[2][0] + data[i + 1] * matriz[2][1] + data[i + 2] * matriz[2][2]), 255)
                    ];
                }
            }
            ctx.putImageData(imageData, 0, 0);
            img.src = canvas.toDataURL();
        };
        image.onerror = () => {
            // Si hay problemas de CORS, aplicar un filtro CSS
            img.style.filter = `contrast(1.2) brightness(1.1) hue-rotate(${tipoDaltonismo === 'protanopia' ? 15 : tipoDaltonismo === 'deuteranopia' ? 335 : 45}deg)`;
        };
    });

    // Procesar iconos SVG
    document.querySelectorAll("svg").forEach(svg => {
        svg.querySelectorAll("path, circle, rect, polygon").forEach(shape => {
            const fill = window.getComputedStyle(shape).fill;
            if (fill && fill !== "none" && fill !== "transparent") {
                shape.style.fill = corregirColor(fill, matriz);
            }
            const stroke = window.getComputedStyle(shape).stroke;
            if (stroke && stroke !== "none" && stroke !== "transparent") {
                shape.style.stroke = corregirColor(stroke, matriz);
            }
        });
    });

    // Procesar fondos de imagen en CSS
    document.querySelectorAll("*").forEach(element => {
        const backgroundImage = window.getComputedStyle(element).backgroundImage;
        if (backgroundImage && backgroundImage !== "none") {
            const urlMatch = backgroundImage.match(/url\(["']?([^"']*)["']?\)/);
            if (urlMatch && urlMatch[1]) {
                const imageUrl = urlMatch[1];
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                const image = new Image();
                image.src = imageUrl;
                image.crossOrigin = "Anonymous";
                image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    ctx.drawImage(image, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i + 3] > 0) {
                            [data[i], data[i + 1], data[i + 2]] = [
                                Math.min(Math.round(data[i] * matriz[0][0] + data[i + 1] * matriz[0][1] + data[i + 2] * matriz[0][2]), 255),
                                Math.min(Math.round(data[i] * matriz[1][0] + data[i + 1] * matriz[1][1] + data[i + 2] * matriz[1][2]), 255),
                                Math.min(Math.round(data[i] * matriz[2][0] + data[i + 1] * matriz[2][1] + data[i + 2] * matriz[2][2]), 255)
                            ];
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);
                    element.style.backgroundImage = `url(${canvas.toDataURL()})`;
                };
                image.onerror = () => {
                    // Si falla, aplicar un filtro CSS en el fondo
                    element.style.filter = `contrast(1.2) brightness(1.1) hue-rotate(${tipoDaltonismo === 'protanopia' ? 15 : tipoDaltonismo === 'deuteranopia' ? 335 : 45}deg)`;
                };
            }
        }
    });
}

// Procesar videos aplicando filtro mediante CSS
function aplicarFiltroAVideos() {
    document.querySelectorAll("video, iframe").forEach(video => {
        video.style.filter = "contrast(1.2) brightness(1.1) hue-rotate(15deg)";
    });
}

// Función principal para aplicar el filtro correctivo en toda la página con IA
function aplicarFiltroCorrectivoConAI(tipoDaltonismo) {
    const matriz = matricesDaltonismo[tipoDaltonismo];
    document.querySelectorAll("*").forEach(element => aplicarFiltroAElementoAI(element, matriz, tipoDaltonismo));
    aplicarFiltroAImagenesYIconos(matriz, tipoDaltonismo);
    aplicarFiltroAVideos();
}

// Función para remover todos los filtros aplicados
function removerFiltro() {
    document.querySelectorAll("*").forEach(element => {
        element.style.filter = "";
        element.style.backgroundColor = "";
        element.style.color = "";
        element.style.borderColor = "";
    });
    document.querySelectorAll("img").forEach(img => {
        img.src = img.src;
    });
    document.querySelectorAll("svg").forEach(svg => {
        svg.querySelectorAll("path, circle, rect, polygon").forEach(shape => {
            shape.style.fill = "";
            shape.style.stroke = "";
        });
    });
    document.querySelectorAll("video, iframe").forEach(video => {
        video.style.filter = "";
    });
}

// Escuchar mensajes desde el popup para aplicar o quitar el filtro
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "applyFilter") {
        aplicarFiltroCorrectivoConAI(request.tipoDaltonismo);
        sendResponse({ status: "Filtro AI aplicado: " + request.tipoDaltonismo });
    } else if (request.action === "removeFilter") {
        removerFiltro();
        sendResponse({ status: "Filtro AI eliminado" });
    }
});
