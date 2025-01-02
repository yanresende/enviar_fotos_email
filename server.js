const documentStep = document.getElementById("documentStep");
const chooseCNH = document.getElementById("chooseCNH");
const chooseRG = document.getElementById("chooseRG");
const photoForm = document.getElementById("photoForm");
const photoTypeSelect = document.getElementById("photoType");
const captureButton = document.getElementById("capture");
const canvas = document.getElementById("snapshot");
const context = canvas.getContext("2d");
const photos = {};

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

let currentStream = null;

function updatePhotoOptions(options) {
  photoTypeSelect.innerHTML = "";
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.text;
    photoTypeSelect.appendChild(opt);
  });
}

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

function updateOverlay(type) {
  const overlay = document.getElementById("overlay");
  overlay.className = ""; // Remove todas as classes existentes
  if (type === "selfie") {
    overlay.classList.add("overlay", "oval");
  } else {
    overlay.classList.add("overlay", "rectangle");
  }
}

chooseCNH.addEventListener("click", () => {
  documentStep.style.display = "none";
  photoForm.style.display = "block";
  updatePhotoOptions(photoOptions.CNH);
  startCamera("environment");
  updateOverlay(photoTypeSelect.value);
});

chooseRG.addEventListener("click", () => {
  documentStep.style.display = "none";
  photoForm.style.display = "block";
  updatePhotoOptions(photoOptions.RG);
  startCamera("environment");
  updateOverlay(photoTypeSelect.value);
});

photoTypeSelect.addEventListener("change", () => {
  const selectedOption = photoTypeSelect.value;
  if (selectedOption === "selfie") {
    startCamera("user");
  } else {
    startCamera("environment");
  }
  updateOverlay(selectedOption);
});

captureButton.addEventListener("click", () => {
  const video = document.getElementById("camera");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const image = canvas.toDataURL("image/png");
  const photoType = photoTypeSelect.value;
  photos[photoType] = image;
  alert(`Foto ${photoType} capturada com sucesso!`);
});

photoForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData();
  for (const type in photos) {
    const imageBlob = await fetch(photos[type]).then((res) => res.blob());
    formData.append(type, imageBlob, `${type}.png`);
  }
  try {
    const response = await fetch("/upload", { method: "POST", body: formData });
    alert(
      response.ok ? "Fotos enviadas com sucesso!" : "Erro ao enviar as fotos."
    );
  } catch (error) {
    alert("Erro ao enviar as fotos.");
  }
});
