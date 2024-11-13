document.getElementById("applyFilter").addEventListener("click", () => {
    const filterType = document.getElementById("filterType").value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: aplicarFiltroEnPagina,
        args: [filterType]
      });
    });
  });
  
  document.getElementById("removeFilter").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: removerFiltroEnPagina
      });
    });
  });
  
  // Función para aplicar filtro en el contexto de la página activa
  function aplicarFiltroEnPagina(filterType) {
    if (window.location.href.endsWith(".pdf")) {
      renderizarPDFConFiltro(filterType);
    } else {
      aplicarFiltroCorrectivoConAI(filterType);
    }
  }
  
  // Función para remover el filtro en el contexto de la página activa
  function removerFiltroEnPagina() {
    removerFiltro();
  }
  