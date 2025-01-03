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

// Inicia a câmera
async function startCamera(facingMode = "environment") {
  const video = document.getElementById("camera");
  if (currentStream) {
    currentStream.getTracks().forEach((track) => track.stop());
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
    });
    video.srcObject = stream;
    currentStream = stream;
  } catch (err) {
    console.error("Erro ao acessar a câmera: ", err);
    alert("Erro ao acessar a câmera: " + err.message + " (" + err.name + ")");
  }
}

// Atualiza o overlay da câmera
function updateOverlay(type) {
  const overlay = document.getElementById("overlay");
  overlay.classList.remove("rectangle", "oval");
  if (type === "selfie") {
    overlay.classList.add("oval");
  } else {
    overlay.classList.add("rectangle");
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

// Captura o clique no botão CNH
chooseCNH.addEventListener("click", () => {
  documentStep.style.display = "none";
  photoForm.style.display = "block";
  updatePhotoOptions(photoOptions.CNH);
  startCamera("environment");
  updateOverlay(photoTypeSelect.value);
});

// Captura o clique no botão RG
chooseRG.addEventListener("click", () => {
  documentStep.style.display = "none";
  photoForm.style.display = "block";
  updatePhotoOptions(photoOptions.RG);
  startCamera("environment");
  updateOverlay(photoTypeSelect.value);
});

// Atualiza a câmera ao trocar o tipo de foto
photoTypeSelect.addEventListener("change", () => {
  const selectedOption = photoTypeSelect.value;
  if (selectedOption === "selfie") {
    startCamera("user");
    updateOverlay("selfie");
  } else {
    startCamera("environment");
    updateOverlay("other");
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

// Salva a foto e continua
nextButton.addEventListener("click", () => {
  const image = photoCanvas.toDataURL("image/png");
  const photoType = photoTypeSelect.value;
  capturedPhotos[photoType] = image;
  alert(`Foto ${photoType} salva com sucesso!`);

  photoPreview.style.display = "none";
  photoForm.style.display = "block";

  checkAllPhotosCaptured();
});
