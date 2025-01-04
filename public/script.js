const documentStep = document.getElementById("documentStep");
const chooseCNH = document.getElementById("chooseCNH");
const chooseRG = document.getElementById("chooseRG");
const photoForm = document.getElementById("photoForm");
const photoTypeSelect = document.getElementById("photoType");
const photoPreview = document.getElementById("photoPreview");
const photoCanvas = document.getElementById("photoCanvas");
const photoCanvasContext = photoCanvas.getContext("2d");
const captureButton = document.getElementById("capture");
const retakeButton = document.getElementById("retake");
const nextButton = document.getElementById("next");
const submitButton = document.getElementById("submitButton");

const photoOptions = {
  CNH: [
    { value: "identityFront", text: "CNH (Frente)" },
    { value: "selfie", text: "Selfie" },
  ],
  RG: [
    { value: "identityFront", text: "RG (Frente)" },
    { value: "identityBack", text: "RG (Verso)" },
    { value: "selfie", text: "Selfie" },
  ],
};

let currentDocumentPhotos = [];
let capturedPhotos = {};
let currentStream = null;

// Atualiza as opções de tipo de foto
function updatePhotoOptions(options) {
  photoTypeSelect.innerHTML = "";
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.text;
    photoTypeSelect.appendChild(opt);
  });
  currentDocumentPhotos = options.map((option) => option.value);
}

// Função para inicializar a câmera
async function startCamera(facingMode = "environment") {
  const video = document.getElementById("camera");

  // Interrompe o stream atual, se existir
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }

  try {
    // Solicita o acesso à câmera
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
    });
    video.srcObject = stream;
    currentStream = stream; // Atualiza o stream atual
  } catch (err) {
    console.error("Erro ao acessar a câmera:", err);
    alert("Erro ao acessar a câmera: " + err.message + " (" + err.name + ")");
  }
}

let currentDocument = null; // Define qual documento está em uso

// Atualiza o overlay baseado no tipo de foto e documento atual
function updateOverlay(photoType) {
  const overlay = document.getElementById("overlay");
  overlay.classList.remove("rectangle-horizontal", "rectangle-vertical", "oval");

  if (photoType === "selfie") {
    overlay.classList.add("oval");
  } else if (photoType === "identityFront" && currentDocument === "CNH") {
    overlay.classList.add("rectangle-vertical");
  } else if (photoType === "identityFront" && currentDocument === "RG") {
    overlay.classList.add("rectangle-horizontal");
  } else if (photoType === "identityBack" && currentDocument === "RG") {
    overlay.classList.add("rectangle-horizontal");
  }
}


// Verifica se todas as fotos foram tiradas
function checkAllPhotosCaptured() {
  const allCaptured = currentDocumentPhotos.every(
    (photo) => capturedPhotos[photo]
  );
  if (allCaptured) {
    submitButton.style.display = "block";
  }
}

// Eventos para selecionar CNH ou RG
chooseCNH.addEventListener("click", () => {
  currentDocument = "CNH";
  documentStep.style.display = "none";
  photoForm.style.display = "block";
  updatePhotoOptions(photoOptions.CNH);
  startCamera("environment");
  updateOverlay(photoTypeSelect.value);
});

chooseRG.addEventListener("click", () => {
  currentDocument = "RG";
  documentStep.style.display = "none";
  photoForm.style.display = "block";
  updatePhotoOptions(photoOptions.RG);
  startCamera("environment");
  updateOverlay(photoTypeSelect.value);
});

// Evento para alterar o tipo de foto
photoTypeSelect.addEventListener("change", () => {
  const selectedOption = photoTypeSelect.value;

  if (selectedOption === "selfie") {
    startCamera("user"); // Ativa a câmera frontal
    updateOverlay("selfie");
  } else {
    startCamera("environment"); // Ativa a câmera traseira
    updateOverlay(selectedOption);
  }
});

// Evento para a captura da selfie
captureButton.addEventListener("click", () => {
  const video = document.getElementById("camera");
  photoCanvas.width = video.videoWidth;
  photoCanvas.height = video.videoHeight;
  photoCanvasContext.drawImage(
    video,
    0,
    0,
    photoCanvas.width,
    photoCanvas.height
  );

  photoPreview.style.display = "block";
  photoForm.style.display = "none";
});

// Refaz a foto
retakeButton.addEventListener("click", () => {
  photoPreview.style.display = "none";
  photoForm.style.display = "block";
  startCamera(photoTypeSelect.value === "selfie" ? "user" : "environment");
});

// Evento para ir para a próxima página (Termos de Serviço)
nextButton.addEventListener("click", () => {
  const image = photoCanvas.toDataURL("image/png");
  const photoType = photoTypeSelect.value;
  capturedPhotos[photoType] = image;
  alert(`Foto ${photoType} salva com sucesso!`);

  checkAllPhotosCaptured();

  const nextPhotoType = currentDocumentPhotos.find(
    (type) => !capturedPhotos[type]
  );

  // Se houver mais fotos para capturar
  if (nextPhotoType) {
    photoTypeSelect.value = nextPhotoType;
    updateOverlay(nextPhotoType);
    startCamera(nextPhotoType === "selfie" ? "user" : "environment");
  } else {
    checkAllPhotosCaptured(); // Verifica se todas as fotos foram capturadas
  }

  photoPreview.style.display = "none";
  photoForm.style.display = "block";
});


// Verifica se todas as fotos foram tiradas e exibe o botão "Enviar"
function checkAllPhotosCaptured() {
  const allCaptured = currentDocumentPhotos.every((photo) => capturedPhotos[photo]);
  submitButton.style.display = allCaptured ? "block" : "none";
}

submitButton.addEventListener("click", async (e) => {
  e.preventDefault(); // Evita o comportamento padrão.

  const formData = new FormData();

  // Adiciona cada foto capturada ao FormData
  Object.entries(capturedPhotos).forEach(([photoType, photoData]) => {
    const blob = dataURItoBlob(photoData); // Converte Base64 para Blob
    formData.append(photoType, blob, `${photoType}.png`);
  });

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Fotos enviadas com sucesso!");
      window.location.href = "terms.html";
    } else {
      const errorText = await response.text();
      alert(`Erro no envio: ${errorText}`);
    }
  } catch (error) {
    console.error("Erro ao enviar as fotos:", error);
    alert("Erro ao enviar as fotos. Verifique sua conexão ou tente novamente.");
  }
});

// Função para converter Base64 para Blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}