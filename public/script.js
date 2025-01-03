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

// Captura a foto
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

// Avança para a próxima foto
nextButton.addEventListener("click", () => {
  const photoType = photoTypeSelect.value;

  // Salva a foto capturada
  const image = photoCanvas.toDataURL("image/png");
  capturedPhotos[photoType] = image;
  alert(`Foto ${photoType} salva com sucesso!`);

  // Verifica se todas as fotos foram capturadas
  checkAllPhotosCaptured();

  // Encontra o próximo tipo de foto que ainda não foi capturado
  const nextPhotoType = currentDocumentPhotos.find(
    (type) => !capturedPhotos[type]
  );

  // Se não houver mais fotos para capturar, exibe o botão de enviar
  if (nextPhotoType) {
    // Atualiza o seletor de tipo de foto para o próximo
    photoTypeSelect.value = nextPhotoType;
    updateOverlay(nextPhotoType); // Atualiza o overlay conforme o tipo de foto
    startCamera(nextPhotoType === "selfie" ? "user" : "environment"); // Muda a câmera se for selfie ou outro tipo
  } else {
    // Caso todas as fotos tenham sido tiradas, mostra o botão de enviar
    submitButton.style.display = "block";
  }

  // Atualiza a exibição dos formulários
  photoPreview.style.display = "none";
  photoForm.style.display = "block";
});

// Verifica se todas as fotos foram tiradas e exibe o botão "Enviar"
function checkAllPhotosCaptured() {
  const allCaptured = currentDocumentPhotos.every((photo) => capturedPhotos[photo]);
  submitButton.style.display = allCaptured ? "block" : "none";
}
