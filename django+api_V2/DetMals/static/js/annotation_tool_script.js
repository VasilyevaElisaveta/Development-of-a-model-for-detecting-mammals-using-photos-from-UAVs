const imageCanvas = document.getElementById("image-layer");
const imageLayer = imageCanvas.getContext('2d');
const bboxCanvas = document.getElementById("bbox-layer");
const bboxLayer = bboxCanvas.getContext('2d');
const crosshairCanvas = document.getElementById("crosshair-layer");
const crosshairLayer = crosshairCanvas.getContext('2d');
const interactiveCanvas = document.getElementById("interactive-layer");
const interactiveLayer = interactiveCanvas.getContext('2d');
const bboxInfo = document.getElementById('bbox-info');
const bboxClass = document.getElementById('bbox-class');
const deleteButton = document.getElementById('delete-bbox');
const changeClassButton = document.getElementById('change-class');
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const horizontalSizeCoefficient = 0.55;
const verticalSizeCoefficient = 0.68;
const handleSize = 6;

let currentImageIndex = 0;
let currentImage = null;
let currentBboxes = null;
let currentBox = {
  startX: null,
  startY: null,
  width: null,
  height: null,
  link: null,
  index: null,
  handleIndex: null
}
let isDrawing = false;
let isDragging = false;
let scaleFactor = 1;


function drawImage(callback) {
  let currentImageData = imageData[String(currentImageIndex)];
  let imagePath = baseURL + '/' + currentImageData["image_path"];
  image = new Image();
  image.src = imagePath;
  currentImage = image;
  
  imageLayer.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
  image.onload = () => {

    let imageWidth = image.width;
    let imageHeight = image.height;

    if (imageWidth < imageHeight) {
      scaleFactor = (verticalSizeCoefficient * screenHeight) / imageHeight;
    } else {
      scaleFactor = (horizontalSizeCoefficient * screenWidth) / imageWidth;
    };

    let scaledWidth = imageWidth * scaleFactor;
    let scaledHeight = imageHeight * scaleFactor;

    let array = [imageCanvas, bboxCanvas, crosshairCanvas, interactiveCanvas];
    array.forEach((canvas) => {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      canvas.style.width = `${scaledWidth}px`;
      canvas.style.height = `${scaledHeight}px`;
    });

    imageLayer.drawImage(image, 0, 0, scaledWidth, scaledHeight);

    let container = document.getElementById('canvas-container');
    container.style.width = `${scaledWidth}px`;
    container.style.height = `${scaledHeight}px`;

    if (callback) callback();
  };
};

function drawBoundingBoxes() {
  let currentImageData = imageData[String(currentImageIndex)];
  let boundingBoxData = currentImageData["bbox"];

  bboxLayer.clearRect(0, 0, bboxCanvas.width, bboxCanvas.height);

  for (let bbox of boundingBoxData) {
    let [x, y, width, height] = bbox[0];
    bboxLayer.strokeStyle = 'red';
    bboxLayer.lineWidth = 2;
    bboxLayer.strokeRect(x*scaleFactor, y*scaleFactor, width*scaleFactor, height*scaleFactor);
  }

};

function drawHandles() {
  interactiveLayer.clearRect(0, 0, interactiveCanvas.width, interactiveCanvas.height);

  if (currentBox.link !== null) {
    interactiveLayer.fillStyle = 'blue';
    let [x, y, width, height] = currentBox.link[0];

    interactiveLayer.fillRect(x * scaleFactor - handleSize / 2, y * scaleFactor - handleSize / 2, handleSize, handleSize);
    interactiveLayer.fillRect((x + width) * scaleFactor - handleSize / 2, y  * scaleFactor - handleSize / 2, handleSize, handleSize);
    interactiveLayer.fillRect((x + width) * scaleFactor - handleSize / 2, (y + height)  * scaleFactor - handleSize / 2, handleSize, handleSize);
    interactiveLayer.fillRect(x * scaleFactor - handleSize / 2, (y + height) * scaleFactor - handleSize / 2, handleSize, handleSize);
  };
};

function drawCrosshair(event) {

  function drawLine(startX, startY, endX, endY) {
    let pattern = [20, 5]
    crosshairLayer.strokeStyle = 'white';
    crosshairLayer.beginPath();
    crosshairLayer.setLineDash(pattern);
    crosshairLayer.moveTo(startX, startY);
    crosshairLayer.lineTo(endX, endY);
    crosshairLayer.stroke();
  };

  crosshairLayer.clearRect(0, 0, crosshairCanvas.width, crosshairCanvas.height)
  let canvas = crosshairCanvas.getBoundingClientRect();
  let canvasXStart = canvas.left;
  let canvasXEnd = canvas.right;
  let canvasYStart = canvas.top;
  let canvasYEnd = canvas.bottom;
  let mouseX = event.clientX - canvasXStart;
  let mouseY = event.clientY - canvasYStart;

  drawLine(0, mouseY, mouseX, mouseY);
  drawLine(mouseX, mouseY, canvasXEnd, mouseY);
  drawLine(mouseX, 0, mouseX, mouseY);
  drawLine(mouseX, mouseY, mouseX, canvasYEnd);
};

function checkButtons() {
  let nextButton = document.getElementById('next-button');
  nextButton.style.display = (currentImageIndex === totalImages) ? 'none' : 'block';

  let previousButton = document.getElementById('previous-button');
  previousButton.style.display = (currentImageIndex <= 1) ? 'none' : 'block';
};

function updateBBoxInfo() {
  if (currentBox.link === null || isDrawing || isDragging) {
    bboxInfo.style.display = 'none'
  } else {
    bboxInfo.style.display = 'block';
    bboxClass.textContent = `Класс: ${classData[String(currentBox.link[1])]}`
  };
};

function goToNextImage() {
  if (currentImageIndex >= totalImages) return;

  currentImageIndex += 1;
  currentBox = {
    startX: null,
    startY: null,
    width: null,
    height: null,
    link: null,
    index: null,
    handleIndex: null
  }

  drawImage(() => {
    drawBoundingBoxes();
  });
  checkButtons();
  updateBBoxInfo();

  document.getElementById('current-image').textContent = currentImageIndex;
  document.getElementById('total-images').textContent = totalImages;
};

function goToPreviousImage() {
  if (currentImageIndex <= 1) return;

  currentImageIndex -= 1;
  currentBox = {
    startX: null,
    startY: null,
    width: null,
    height: null,
    link: null,
    index: null,
    handleIndex: null
  }

  drawImage(() => {
    drawBoundingBoxes();
  });
  checkButtons();
  updateBBoxInfo();

  document.getElementById('current-image').textContent = currentImageIndex;
  document.getElementById('total-images').textContent = totalImages;
};

function completeAnnotation() {
  let formData = new FormData();
  formData.append("image_data", JSON.stringify(imageData));
  formData.append("class_data", JSON.stringify(classData));

  let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
  fetch(apiURL, {
    method: 'POST',
    body: formData,
    headers: {
        'X-CSRFToken': csrfToken
    }
  })
    .then((response) => response.json())
    .then((data) => {
      createSuccessPage(data);
    })
    .catch((error) => {
      createFailurePage();
    });
};

function createSuccessPage(data) {
  let annotationTool = document.getElementById('annotation-tool');
  annotationTool.innerHTML = '';

  let actionContainer = document.createElement('div');
  actionContainer.style.textAlign = 'center';
  actionContainer.style.marginTop = '20px';

  const downloadButton = document.createElement('button');
  downloadButton.innerText = 'Скачать архив';
  downloadButton.classList.add('btn', 'btn-primary');
  downloadButton.style.marginRight = '10px';

  downloadButton.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = baseURL + '/' + data.file_path;
      link.download = 'archive.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  });

  let editButton = document.createElement('button');
  editButton.innerText = 'Редактировать другую разметку';
  editButton.classList.add('btn', 'btn-secondary');
  editButton.onclick = () => {window.location.href = window.location.href;}; 

  actionContainer.appendChild(downloadButton);
  actionContainer.appendChild(editButton);

  annotationTool.appendChild(actionContainer);
};

function createFailurePage() {
  let annotationTool = document.getElementById('annotation-tool');
  annotationTool.innerHTML = '';

  let actionContainer = document.createElement('div');
  actionContainer.style.textAlign = 'center';
  actionContainer.style.marginTop = '20px';

  let paragraph = document.createElement('p')
  let text = document.createTextNode('An error occurred while saving annotations')
  paragraph.appendChild(text)

  let editButton = document.createElement('button');
  editButton.innerText = 'Редактировать другую разметку';
  editButton.classList.add('btn', 'btn-secondary');
  editButton.onclick = () => {window.location.href = window.location.href;};
  
  actionContainer.appendChild(paragraph)
  actionContainer.appendChild(editButton);

  annotationTool.appendChild(actionContainer);
};

interactiveCanvas.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

function processUserAnnotationClass(isNewAnnotation = true) {

function checkForNumber(array) {
  let numbers = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (let char of array) {
    if (!numbers.has(+char)) return false
  };
  return true
};

function processInput(input) {
  colonIndex = input.indexOf(':')
  if (colonIndex == -1) {
    let numbers = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    number = input.trim()
    if (!checkForNumber(number)) return [false, 'Id не является числом. Попробуйте снова!'];
    if (input in classData) {
      return [true, +number];
    } else {
      return [false, 'Класса по данному id нет. Попробуйте снова!']
    };
  } else {
    if (colonIndex === 0) return [false, 'Название не может быть пустым. Попробуйте снова!'];
    className = input.slice(0, colonIndex).trim()
    classId = input.slice(colonIndex+1).trim()
    if (Object.values(classData).includes(className)) return [false, 'Данный класс уже занят. Попробуйте снова!'];
    if (checkForNumber(classId)) {
      if (classId in classData) {
        return [false, 'Данный id уже занят'];
      } else {
        return [true, className, +classId];
      };
    } else {
      return [false, 'Id не является числом. Попробуйте снова!'];
    };
  };
};

function addNewAnnotation(result) {
  if (result.length === 2) {
    boundingBoxData.push([[currentBox.startX / scaleFactor, 
                          currentBox.startY / scaleFactor, 
                          currentBox.width / scaleFactor, 
                          currentBox.height / scaleFactor], result[1]]);
  } else {
    let className = result[1];
    let classId = result[2];
    classData[String(classId)] = className;
    boundingBoxData.push([[currentBox.startX / scaleFactor, 
                          currentBox.startY / scaleFactor, 
                          currentBox.width / scaleFactor, 
                          currentBox.height / scaleFactor], classId]);
  };

  currentBox.link = boundingBoxData.at(-1);
  currentBox.index = boundingBoxData.length - 1;
};

function chageExistingAnnotation(result) {
  let currentBBoxData = currentBox.link
  let classId = null;
  if (result.length === 2) {
    classId = result[1]
  } else {
    let className = result[1];
    classId = result[2];
    classData[String(classId)] = className;
  };

  currentBBoxData[1] = classId;
};

let currentImageData = imageData[String(currentImageIndex)];
let boundingBoxData = currentImageData["bbox"];

let text = 'Выберите id класса или напишите свой в формате:\n"Имя класса: id класса"\n';
if (classData.length !== 0) {
  text += 'Текущие классы:\n'
  for (let key in classData) {
    text += `${classData[key]}: ${key}\n`
  };
};

while (true) {
  input = prompt(text, '');
  if (input === '' || input === null) break;
  result = processInput(input)
  if (result[0]) {
    if (isNewAnnotation) {
      addNewAnnotation(result);
    } else {
      chageExistingAnnotation(result);
    };
    break;
  } else {
    alert(result[1]);
  };
};
};

interactiveCanvas.addEventListener('mousedown', (event) => {

  function checkBBoxes(userX, userY) {

    function calculateVectorLength(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    let boundingBoxData = imageData[String(currentImageIndex)]["bbox"]
    let currentLink = null;
    let currentIndex = null;
    let minDistance = Infinity;

    for (let i = 0; i < boundingBoxData.length; i++) {
      let [x, y, width, height] = boundingBoxData[i][0];

      if (userX >= x * scaleFactor && userX <= (x + width) * scaleFactor && userY >= y * scaleFactor && userY <= (y + height) * scaleFactor) {
        let distance = calculateVectorLength(userX, userY, (x + width / 2) * scaleFactor, (y + height / 2) * scaleFactor);
        if (distance < minDistance) {
          minDistance = distance;
          currentLink = boundingBoxData[i];
          currentIndex = i;
        };
      };
    };

    currentBox.link = currentLink;
    currentBox.index = currentIndex;
  };

  function checkHandles(userX, userY) {
    if (currentBox.link === null || isDrawing) return false;

    let [x, y, width, height] = currentBox.link[0]

    if (userX >= x * scaleFactor - handleSize / 2 &&
        userX <= x * scaleFactor + handleSize / 2 && 
        userY >= y * scaleFactor - handleSize / 2 && 
        userY <= y * scaleFactor + handleSize / 2) {
      currentBox.handleIndex = 1; 
      return true;
    };
    if (userX >= (x + width) * scaleFactor - handleSize / 2 && 
        userX <= (x + width) * scaleFactor + handleSize / 2 && 
        userY >= y * scaleFactor - handleSize / 2 && 
        userY <= y * scaleFactor + handleSize / 2) {
      currentBox.handleIndex = 2;
      return true;
    };
    if (userX >= x * scaleFactor - handleSize / 2 && 
        userX <= x * scaleFactor + handleSize / 2 && 
        userY >= (y + height) * scaleFactor - handleSize / 2 && 
        userY <= (y + height) * scaleFactor + handleSize / 2) {
      currentBox.handleIndex = 3;
      return true;
    };
    if (userX >= (x + width) * scaleFactor - handleSize / 2 && 
        userX <= (x + width) * scaleFactor + handleSize / 2 && 
        userY >= (y + height) * scaleFactor - handleSize / 2 && 
        userY <= (y + height) * scaleFactor + handleSize / 2) {
      currentBox.handleIndex = 4;
      return true;
    };

    return false;
  };

  let canvas = interactiveCanvas.getBoundingClientRect();
  let currentX = event.clientX - canvas.left;
  let currentY = event.clientY - canvas.top;
  currentBox.startX = currentX;
  currentBox.startY = currentY;

  if (event.button === 2) {
    checkBBoxes(currentX, currentY);
    updateBBoxInfo();
    isDrawing = false;
    isDragging = false;
    return;
  };

  if (currentBox.link !== null && checkHandles(currentX, currentY)) {
    isDragging = true;
    isDrawing = false;
    return;
  };

  isDragging = false;
  isDrawing = true;
});

interactiveCanvas.addEventListener('mousemove', (event) => {

  function getMouseCoordinates(event) {
    let canvas = bboxCanvas.getBoundingClientRect();
    let mouseX = event.clientX - canvas.left;
    let mouseY = event.clientY - canvas.top;

    return [mouseX, mouseY]
  }

  function processDrawing(event) {
    crosshairLayer.clearRect(0, 0, crosshairCanvas.width, crosshairCanvas.height);
    interactiveLayer.clearRect(0, 0, interactiveCanvas.width, interactiveCanvas.height);

    drawBoundingBoxes();
    let [currentX, currentY] = getMouseCoordinates(event);
    currentBox.width = currentX - currentBox.startX;
    currentBox.height = currentY - currentBox.startY;

    bboxLayer.strokeStyle = 'red';
    bboxLayer.lineWidth = 2;
    bboxLayer.strokeRect(currentBox.startX, currentBox.startY, currentBox.width, currentBox.height);
  };

  function processDragging(event) {
    crosshairLayer.clearRect(0, 0, crosshairCanvas.width, crosshairCanvas.height);

    let [mouseX, mouseY] = getMouseCoordinates(event);
    
    let [x, y, width, height] = currentBox.link[0]
    switch (currentBox.handleIndex) {
      case 1:
        currentBox.link[0][0] = mouseX / scaleFactor;
        currentBox.link[0][1] = mouseY / scaleFactor;
        currentBox.link[0][2] = ((width + x) * scaleFactor - mouseX) / scaleFactor;
        currentBox.link[0][3] = ((height + y) * scaleFactor - mouseY) / scaleFactor;
        break;
      case 2:
        currentBox.link[0][1] = mouseY / scaleFactor;
        currentBox.link[0][2] = (mouseX - x * scaleFactor) / scaleFactor;
        currentBox.link[0][3] = ((height + y) * scaleFactor - mouseY) / scaleFactor;
        break;
      case 3:
        currentBox.link[0][0] = mouseX / scaleFactor;
        currentBox.link[0][2] = ((width + x) * scaleFactor - mouseX) / scaleFactor;
        currentBox.link[0][3] = (mouseY - y * scaleFactor) / scaleFactor;
        break;
      case 4:
        currentBox.link[0][2] = (mouseX - x * scaleFactor) / scaleFactor;
        currentBox.link[0][3] = (mouseY - y * scaleFactor) / scaleFactor;
        break;
    };

    drawBoundingBoxes();
    drawHandles();
  };
  
  updateBBoxInfo();
  if (isDrawing) {
    processDrawing(event);
  } else if (isDragging) {
    processDragging(event)
  } else {
    drawCrosshair(event);
  };
});

interactiveCanvas.addEventListener('mouseup', (event) => {

  function checkClick(event) {
    let canvas = interactiveCanvas.getBoundingClientRect();
    let currentX = event.clientX - canvas.left;
    let currentY = event.clientY - canvas.top;
    if (currentBox.startX === currentX && currentBox.startY === currentY) return true;
    return false;
  };

  if (event.button === 2){
    isDrawing = false;
    isDragging = false;
    drawHandles();
    updateBBoxInfo();
    return;
  };

  if (checkClick(event)) {
    isDrawing = false;
    isDragging = false;
    return;
  };

  if (isDrawing) {
    processUserAnnotationClass();
  };

  isDragging = false;
  isDrawing = false;
  drawBoundingBoxes();
  drawHandles();
  updateBBoxInfo();
});

deleteButton.addEventListener('click', () => {
  imageData[String(currentImageIndex)]["bbox"].splice(currentBox.index, 1);
  currentBox = {
    startX: null,
    startY: null,
    width: null,
    height: null,
    link: null,
    index: null,
    handleIndex: null
  };
  updateBBoxInfo();
  drawBoundingBoxes();
  drawHandles();
});

changeClassButton.addEventListener('click', () => {
  processUserAnnotationClass(isNewAnnotation=false);
  updateBBoxInfo();
});


goToNextImage();

document.getElementById('previous-button').addEventListener('click', goToPreviousImage);
document.getElementById('next-button').addEventListener('click', goToNextImage);
document.getElementById('complete-button').addEventListener('click', completeAnnotation);