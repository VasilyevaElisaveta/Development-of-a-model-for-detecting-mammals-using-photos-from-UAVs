class Environment {
  static #canvasContainer = document.getElementById('canvas-container');
  static #imageCanvas = document.getElementById("image-layer");
  static #imageLayer = document.getElementById("image-layer").getContext('2d');
  static #bBoxCanvas = document.getElementById("bbox-layer");
  static #bBoxLayer = document.getElementById("bbox-layer").getContext('2d');
  static #crosshairCanvas = document.getElementById("crosshair-layer");
  static #crosshairLayer = document.getElementById("crosshair-layer").getContext('2d');
  static #interactiveCanvas = document.getElementById("interactive-layer");
  static #interactiveLayer = document.getElementById("interactive-layer").getContext('2d');
  static #bboxInfo = document.getElementById('bbox-info');
  static #bboxClass = document.getElementById('bbox-class');
  static #deleteButton = document.getElementById('delete-bbox');
  static #changeClassButton = document.getElementById('change-class');
  static #nextButton = document.getElementById('next-button');
  static #previousButton = document.getElementById('previous-button');
  static #screenWidth = window.innerWidth;
  static #screenHeight = window.innerHeight;
  static #canvasWidht = null;
  static #canvasHeight = null;

  static getScreenSize() {
    return [this.#screenWidth, this.#screenHeight];
  };

  static get imageLayer() {
    return this.#imageLayer;
  };

  static get bBoxLayer() {
    return this.#bBoxLayer;
  };

  static get crosshairLayer() {
    return this.#crosshairLayer;
  };

  static get interactiveLayer() {
    return this.#interactiveLayer;
  };

  static get interactiveCanvas() {
    return this.#interactiveCanvas
  };

  static get deleteButton() {
    return this.#deleteButton;
  };

  static get changeClassButton() {
    return this.#changeClassButton;
  };

  static getAllCanvases() {
    return [this.#imageCanvas, this.#bBoxCanvas, this.#crosshairCanvas, this.#interactiveCanvas]
  };

  static getCanvasSize() {
    return [this.#canvasWidht, this.#canvasHeight]
  };

  static getCanvasCoordinates(left=true, right=true, top=true, bottom=true) {
    let coordinates = [];
    let canvas = Environment.#interactiveCanvas.getBoundingClientRect();
    if (left) {
      coordinates.push(canvas.left);
    };
    if (right) {
      coordinates.push(canvas.right);
    };
    if (top) {
      coordinates.push(canvas.top);
    };
    if (bottom) {
      coordinates.push(canvas.bottom);
    };

    return coordinates;
  };

  static setCanvasSize(width, height) {
    this.#canvasWidht = width;
    this.#canvasHeight = height;
  };

  static setCanvasContainerSize(width, height) {
    Environment.#canvasContainer.style.width = `${width}px`;
    Environment.#canvasContainer.style.height = `${height}px`;
  };

  static setNextButtonVisability(value) {
    Environment.#nextButton.style.display = value;
  };

  static setPreviousButtonVisability(value) {
    Environment.#previousButton.style.display = value;
  };

  static setBBoxInfoVisability(value) {
    Environment.#bboxInfo.style.display = value;
  };

  static setBBoxInfoText(value) {
    Environment.#bboxClass.textContent = value
  };

  static setImageNumber(current, all) {
    document.getElementById('current-image').textContent = current;
    document.getElementById('total-images').textContent = all;
  };

  static createSuccessPage(data, baseURL) {
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
  
  static createFailurePage() {
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
};

class Drawing {

  static #handleSize = 6;
  static #lineWidth = 2;
  static #boundingBoxColor = 'red';
  static #handleColor = 'blue';
  static #crosshairColor = 'white';
  static #crosshairPattern = [20, 5];

  static get handleSize() {
    return this.#handleSize;
  };

  static drawImage(imagePath, callback) {
    let image = new Image();
    let imageLayer = Environment.imageLayer;
    let [width, height] = Environment.getCanvasSize();
    
    image.src = imagePath;
    imageLayer.clearRect(0, 0, width, height);
    image.onload = () => {
  
      let imageWidth = image.width;
      let imageHeight = image.height;

      let [width, height] = Management.changeSize(imageWidth, imageHeight);
  
      imageLayer.drawImage(image, 0, 0, width, height);
  
      if (callback) callback();
    };
  };
  
  static drawBoundingBoxes(boundingBoxData, scaleFactor) {
    let bBoxLayer = Environment.bBoxLayer;
    let [width, height] = Environment.getCanvasSize();

    bBoxLayer.clearRect(0, 0, width, height);
    for (let bbox of boundingBoxData) {
      let [x, y, width, height] = bbox[0];
      bBoxLayer.strokeStyle = Drawing.#boundingBoxColor;
      bBoxLayer.lineWidth = Drawing.#lineWidth;
      bBoxLayer.strokeRect(x*scaleFactor, y*scaleFactor, width*scaleFactor, height*scaleFactor);
    }
  };

  static drawCurrentBoundingBox(x, y, width, height) {
    let bBoxLayer = Environment.bBoxLayer;
    bBoxLayer.strokeStyle = Drawing.#boundingBoxColor;
    bBoxLayer.lineWidth = Drawing.#lineWidth;
    bBoxLayer.strokeRect(x, y, width, height);
  };
  
  static drawHandles(currentBoundingBox, scaleFactor) {
    let interactiveLayer = Environment.interactiveLayer;
    let [width, height] = Environment.getCanvasSize();
    let handleSize = Drawing.#handleSize;

    interactiveLayer.clearRect(0, 0, width, height);
    if (currentBoundingBox !== null) {
      let [x, y, width, height] = currentBoundingBox[0];
      
      interactiveLayer.fillStyle = Drawing.#handleColor;
      interactiveLayer.fillRect(x * scaleFactor - handleSize / 2, y * scaleFactor - handleSize / 2, handleSize, handleSize);
      interactiveLayer.fillRect((x + width) * scaleFactor - handleSize / 2, y  * scaleFactor - handleSize / 2, handleSize, handleSize);
      interactiveLayer.fillRect((x + width) * scaleFactor - handleSize / 2, (y + height)  * scaleFactor - handleSize / 2, handleSize, handleSize);
      interactiveLayer.fillRect(x * scaleFactor - handleSize / 2, (y + height) * scaleFactor - handleSize / 2, handleSize, handleSize);
    };
  };
  
  static drawCrosshair(mouseX, mouseY) {
    
    let crosshairLayer = Environment.crosshairLayer;
    let [width, height] = Environment.getCanvasSize();
    let [canvasXEnd, canvasYEnd] = Environment.getCanvasCoordinates(false, true, false, true)

    crosshairLayer.clearRect(0, 0, width, height)
    drawLine(0, mouseY, mouseX, mouseY);
    drawLine(mouseX, mouseY, canvasXEnd, mouseY);
    drawLine(mouseX, 0, mouseX, mouseY);
    drawLine(mouseX, mouseY, mouseX, canvasYEnd);

    function drawLine(startX, startY, endX, endY) {
      crosshairLayer.strokeStyle = Drawing.#crosshairColor;
      crosshairLayer.beginPath();
      crosshairLayer.setLineDash(Drawing.#crosshairPattern);
      crosshairLayer.moveTo(startX, startY);
      crosshairLayer.lineTo(endX, endY);
      crosshairLayer.stroke();
    };
  };

  static cleanLayers(imageLayer=true, bBoxLayer=true, crosshairLayer=true, interactiveLayer=true) {
    let [width, height] = Environment.getCanvasSize();
    if (imageLayer) {
      let layer = Environment.imageLayer;
      layer.clearRect(0, 0, width, height);
    };
    if (bBoxLayer) {
      let layer = Environment.bBoxLayer;
      layer.clearRect(0, 0, width, height);
    };
    if (crosshairLayer) {
      let layer = Environment.crosshairLayer;
      layer.clearRect(0, 0, width, height);
    };
    if (interactiveLayer) {
      let layer = Environment.interactiveLayer;
      layer.clearRect(0, 0, width, height);
    };
  };
};

class Management {
  static #isDrawing = false;
  static #isDragging = false;
  static #scaleFactor = 1;
  static #horizontalSizeCoefficient = 0.55;
  static #verticalSizeCoefficient = 0.68;
  static #currentImageIndex = 0;
  static #totalImages = NewDjangoData.totalImages;
  static #classData = NewDjangoData.classData;
  static #imageData = NewDjangoData.imageData;
  static #baseURL = NewDjangoData.baseURL;
  static #apiURL = NewDjangoData.apiURL;
  static #currentBox = {
    startX: null,
    startY: null,
    width: null,
    height: null,
    link: null,
    index: null,
    handleIndex: null
  };

  static init() {
    Management.#attachEventListener();
    Management.#goToNextImage();
  }

  static changeSize(imageWidth, imageHeight) {
    let [screenWidth, screenHeight] = Environment.getScreenSize();
    if (imageWidth < imageHeight) {
      Management.#scaleFactor = (Management.#verticalSizeCoefficient * screenHeight) / imageHeight;
    } else {
      Management.#scaleFactor = (Management.#horizontalSizeCoefficient * screenWidth) / imageWidth;
    };

    let scaledWidth = imageWidth * Management.#scaleFactor;
    let scaledHeight = imageHeight * Management.#scaleFactor;

    let canvasesArray = Environment.getAllCanvases();
    canvasesArray.forEach((canvas) => {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      canvas.style.width = `${scaledWidth}px`;
      canvas.style.height = `${scaledHeight}px`;
    });

    Environment.setCanvasSize(scaledWidth, scaledHeight);
    Environment.setCanvasContainerSize(scaledWidth, scaledHeight);

    return [scaledWidth, scaledHeight]
  };

  static #getCurrentBBoxData() {
    let currentImageData = Management.#imageData[String(Management.#currentImageIndex)];
    let boundingBoxData = currentImageData["bbox"];
    return boundingBoxData
  };

  static #getImagePath() {
    let currentImageData = Management.#imageData[String(Management.#currentImageIndex)];
    let imagePath = Management.#baseURL + '/' + currentImageData["image_path"];
    return imagePath;
  }

  static #checkButtons() {
    Environment.setNextButtonVisability((Management.#currentImageIndex === Management.#totalImages) ? 'none' : 'block');
    Environment.setPreviousButtonVisability((Management.#currentImageIndex <= 1) ? 'none' : 'block')
  };
  
  static #updateBBoxInfo() {
    if (Management.#currentBox.link === null || Management.#isDrawing || Management.#isDragging) {
      Environment.setBBoxInfoVisability('none')
    } else {
      let text = `Класс: ${Management.#classData[String(Management.#currentBox.link[1])]}`
      Environment.setBBoxInfoVisability('block');
      Environment.setBBoxInfoText(text)
    };
  };
  
  static #goToNextImage() {
    if (Management.#currentImageIndex >= Management.#totalImages) return;
  
    Management.#currentImageIndex += 1;
    Management.#currentBox = {
      startX: null,
      startY: null,
      width: null,
      height: null,
      link: null,
      index: null,
      handleIndex: null
    }
    
    let image_path = Management.#getImagePath();
    let currentBBoxData = Management.#getCurrentBBoxData();
    Drawing.drawImage(image_path, () => {
      Drawing.drawBoundingBoxes(currentBBoxData, Management.#scaleFactor);
    });
    Management.#checkButtons();
    Management.#updateBBoxInfo();
  
    Environment.setImageNumber(Management.#currentImageIndex, Management.#totalImages);
  };
  
  static #goToPreviousImage() {
    if (Management.#currentImageIndex <= 1) return;
  
    Management.#currentImageIndex -= 1;
    Management.#currentBox = {
      startX: null,
      startY: null,
      width: null,
      height: null,
      link: null,
      index: null,
      handleIndex: null
    }
    
    let image_path = Management.#getImagePath();
    let currentBBoxData = Management.#getCurrentBBoxData();
    Drawing.drawImage(image_path, () => {
      Drawing.drawBoundingBoxes(currentBBoxData, Management.#scaleFactor);
    });
    Management.#checkButtons();
    Management.#updateBBoxInfo();
  
    Environment.setImageNumber(Management.#currentImageIndex, Management.#totalImages);
  };
  
  static #completeAnnotation() {
    let formData = new FormData();
    formData.append("image_data", JSON.stringify(Management.#imageData));
    formData.append("class_data", JSON.stringify(Management.#classData));
  
    let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    fetch(Management.#apiURL, {
      method: 'POST',
      body: formData,
      headers: {
          'X-CSRFToken': csrfToken
      }
    })
      .then((response) => response.json())
      .then((data) => {
        Environment.createSuccessPage(data, Management.#baseURL);
      })
      .catch((error) => {
        Environment.createFailurePage();
      });
  };
  
  static #processUserAnnotationClass(isNewAnnotation = true) {
  
    let boundingBoxData = Management.#getCurrentBBoxData();
    
    let text = 'Выберите id класса или напишите свой в формате:\n"Имя класса: id класса"\n';
    if (Object.keys(Management.#classData).length !== 0) {
      text += 'Текущие классы:\n'
      for (let key in Management.#classData) {
        text += `${Management.#classData[key]}: ${key}\n`
      };
    };
    
    while (true) {
      let input = prompt(text, '');
      if (input === '' || input === null) break;
      let result = processInput(input)
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

    function checkForNumber(array) {
      let numbers = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      for (let char of array) {
        if (!numbers.has(+char)) return false
      };
      return true
    };
  
    function processInput(input) {
      let colonIndex = input.indexOf(':')
      if (colonIndex == -1) {
        let number = input.trim()
        if (!checkForNumber(number)) return [false, 'Id не является числом. Попробуйте снова!'];
        if (input in Management.#classData) {
          return [true, +number];
        } else {
          return [false, 'Класса по данному id нет. Попробуйте снова!']
        };
      } else {
        if (colonIndex === 0) return [false, 'Название не может быть пустым. Попробуйте снова!'];
        let className = input.slice(0, colonIndex).trim()
        let classId = input.slice(colonIndex+1).trim()
        if (Object.values(Management.#classData).includes(className)) return [false, 'Данный класс уже занят. Попробуйте снова!'];
        if (checkForNumber(classId)) {
          if (classId in Management.#classData) {
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
      let classId;
      if (result.length === 2) {
        classId = result[1];
      } else {
        let className = result[1];
        classId = result[2];
        Management.#classData[String(classId)] = className;
      };
      normalizeBBox();
      boundingBoxData.push([[Management.#currentBox.startX, 
                            Management.#currentBox.startY, 
                            Management.#currentBox.width, 
                            Management.#currentBox.height], classId]);
      Management.#currentBox.link = boundingBoxData.at(-1);
      Management.#currentBox.index = boundingBoxData.length - 1;
    };

    function normalizeBBox() {
      let currentX = Management.#currentBox.startX;
      let currentY = Management.#currentBox.startY;
      let currentWidth = Management.#currentBox.width;
      let currentHeight = Management.#currentBox.height;
      let scaleFactor = Management.#scaleFactor;

      if (currentWidth < 0) {
        currentX = currentX + currentWidth;
        currentWidth = Math.abs(currentWidth);
      };

      if (currentHeight < 0) {
        currentY = currentY + currentHeight;
        currentHeight = Math.abs(currentHeight);
      };

      Management.#currentBox.startX = currentX / scaleFactor;
      Management.#currentBox.startY = currentY / scaleFactor;
      Management.#currentBox.width = currentWidth / scaleFactor;
      Management.#currentBox.height = currentHeight / scaleFactor;
    };
    
    function chageExistingAnnotation(result) {
      let currentBBoxData = Management.#currentBox.link
      let classId = null;
      if (result.length === 2) {
        classId = result[1]
      } else {
        let className = result[1];
        classId = result[2];
        Management.#classData[String(classId)] = className;
      };
    
      currentBBoxData[1] = classId;
    };
  };

  static #getMouseCoordinates(event) {
    let [left, right, top, bottom] = Environment.getCanvasCoordinates();

    let mouseX = event.clientX - left;
    let mouseY = event.clientY - top;

    return [mouseX, mouseY]
  }

  static #attachEventListener() {

    let interactiveCanvas = Environment.interactiveCanvas;
    let deleteButton = Environment.deleteButton;
    let changeClassButton = Environment.changeClassButton;

    interactiveCanvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
    
    interactiveCanvas.addEventListener('mousedown', (event) => {
    
      let [currentX, currentY] = Management.#getMouseCoordinates(event);
      Management.#currentBox.startX = currentX;
      Management.#currentBox.startY = currentY;
    
      if (event.button === 2) {
        checkBBoxes(currentX, currentY);
        Management.#updateBBoxInfo();
        Management.#isDrawing = false;
        Management.#isDragging = false;
        return;
      };
    
      if (Management.#currentBox.link !== null && checkHandles(currentX, currentY)) {
        Management.#isDragging = true;
        Management.#isDrawing = false;
        return;
      };
    
      Management.#isDragging = false;
      Management.#isDrawing = true;

      function checkBBoxes(userX, userY) {
    
        function calculateVectorLength(x1, y1, x2, y2) {
          return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        };
    
        let boundingBoxData = Management.#getCurrentBBoxData();
        let scaleFactor = Management.#scaleFactor
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
    
        Management.#currentBox.link = currentLink;
        Management.#currentBox.index = currentIndex;
      };
    
      function checkHandles(userX, userY) {
        if (Management.#currentBox.link === null || Management.#isDrawing) return false;
        let handleSize = Drawing.handleSize;
        let scaleFactor = Management.#scaleFactor;
        let [x, y, width, height] = Management.#currentBox.link[0];
    
        if (userX >= x * scaleFactor - handleSize / 2 &&
            userX <= x * scaleFactor + handleSize / 2 && 
            userY >= y * scaleFactor - handleSize / 2 && 
            userY <= y * scaleFactor + handleSize / 2) {
          Management.#currentBox.handleIndex = 1; 
          return true;
        };
        if (userX >= (x + width) * scaleFactor - handleSize / 2 && 
            userX <= (x + width) * scaleFactor + handleSize / 2 && 
            userY >= y * scaleFactor - handleSize / 2 && 
            userY <= y * scaleFactor + handleSize / 2) {
          Management.#currentBox.handleIndex = 2;
          return true;
        };
        if (userX >= x * scaleFactor - handleSize / 2 && 
            userX <= x * scaleFactor + handleSize / 2 && 
            userY >= (y + height) * scaleFactor - handleSize / 2 && 
            userY <= (y + height) * scaleFactor + handleSize / 2) {
          Management.#currentBox.handleIndex = 3;
          return true;
        };
        if (userX >= (x + width) * scaleFactor - handleSize / 2 && 
            userX <= (x + width) * scaleFactor + handleSize / 2 && 
            userY >= (y + height) * scaleFactor - handleSize / 2 && 
            userY <= (y + height) * scaleFactor + handleSize / 2) {
          Management.#currentBox.handleIndex = 4;
          return true;
        };
    
        return false;
      };
    });
    
    interactiveCanvas.addEventListener('mousemove', (event) => {
      
      Management.#updateBBoxInfo();
      if (Management.#isDrawing) {
        processDrawing(event);
      } else if (Management.#isDragging) {
        processDragging(event)
      } else {
        let [mouseX, mouseY] = Management.#getMouseCoordinates(event);
        Drawing.drawCrosshair(mouseX, mouseY);
      };

      function processDrawing(event) {
        let boundingBoxData = Management.#getCurrentBBoxData();
        let scaleFactor = Management.#scaleFactor;
        Drawing.cleanLayers(false, false, true, true);
        Drawing.drawBoundingBoxes(boundingBoxData, scaleFactor);

        let [currentX, currentY] = Management.#getMouseCoordinates(event);
        Management.#currentBox.width = currentX - Management.#currentBox.startX;
        Management.#currentBox.height = currentY - Management.#currentBox.startY;
        
        Drawing.drawCurrentBoundingBox(Management.#currentBox.startX, Management.#currentBox.startY, 
                                      Management.#currentBox.width, Management.#currentBox.height)
      };
    
      function processDragging(event) {
        Drawing.cleanLayers(false, false, true, true);
    
        let [mouseX, mouseY] = Management.#getMouseCoordinates(event);
        let scaleFactor = Management.#scaleFactor;
        let [x, y, width, height] = Management.#currentBox.link[0]
        switch (Management.#currentBox.handleIndex) {
          case 1:
            Management.#currentBox.link[0][0] = mouseX / scaleFactor;
            Management.#currentBox.link[0][1] = mouseY / scaleFactor;
            Management.#currentBox.link[0][2] = ((width + x) * scaleFactor - mouseX) / scaleFactor;
            Management.#currentBox.link[0][3] = ((height + y) * scaleFactor - mouseY) / scaleFactor;
            break;
          case 2:
            Management.#currentBox.link[0][1] = mouseY / scaleFactor;
            Management.#currentBox.link[0][2] = (mouseX - x * scaleFactor) / scaleFactor;
            Management.#currentBox.link[0][3] = ((height + y) * scaleFactor - mouseY) / scaleFactor;
            break;
          case 3:
            Management.#currentBox.link[0][0] = mouseX / scaleFactor;
            Management.#currentBox.link[0][2] = ((width + x) * scaleFactor - mouseX) / scaleFactor;
            Management.#currentBox.link[0][3] = (mouseY - y * scaleFactor) / scaleFactor;
            break;
          case 4:
            Management.#currentBox.link[0][2] = (mouseX - x * scaleFactor) / scaleFactor;
            Management.#currentBox.link[0][3] = (mouseY - y * scaleFactor) / scaleFactor;
            break;
        };
        
        let boundingBoxData = Management.#getCurrentBBoxData();
        Drawing.drawBoundingBoxes(boundingBoxData, scaleFactor);
        Drawing.drawHandles(Management.#currentBox.link, scaleFactor);
      };
    });
    
    interactiveCanvas.addEventListener('mouseup', (event) => {
    
      if (event.button === 2){
        Management.#isDrawing = false;
        Management.#isDragging = false;
        Drawing.drawHandles(Management.#currentBox.link, Management.#scaleFactor);
        Management.#updateBBoxInfo();
        return;
      };
    
      if (checkClick(event)) {
        Management.#isDrawing = false;
        Management.#isDragging = false;
        return;
      };
    
      if (Management.#isDrawing) {
        Management.#processUserAnnotationClass();
      };
    
      Management.#isDragging = false;
      Management.#isDrawing = false;

      let boundingBoxData = Management.#getCurrentBBoxData();
      let currentBoundingBox = Management.#currentBox.link;
      let scaleFactor = Management.#scaleFactor;
      Drawing.drawBoundingBoxes(boundingBoxData, scaleFactor);
      Drawing.drawHandles(currentBoundingBox, scaleFactor);
      Management.#updateBBoxInfo();

      function checkClick(event) {
        let [currentX, currentY] = Management.#getMouseCoordinates(event);
        if (Management.#currentBox.startX === currentX && Management.#currentBox.startY === currentY) return true;
        return false;
      };
    });
    
    deleteButton.addEventListener('click', () => {
      Management.#imageData[String(Management.#currentImageIndex)]["bbox"].splice(Management.#currentBox.index, 1);
      Management.#currentBox = {
        startX: null,
        startY: null,
        width: null,
        height: null,
        link: null,
        index: null,
        handleIndex: null
      };
      let boundingBoxData = Management.#getCurrentBBoxData();
      let currentBoundingBox = Management.#currentBox.link;
      let scaleFactor = Management.#scaleFactor;
      Management.#updateBBoxInfo();
      Drawing.drawBoundingBoxes(boundingBoxData, scaleFactor);
      Drawing.drawHandles(currentBoundingBox, scaleFactor);
    });
    
    changeClassButton.addEventListener('click', () => {
      Management.#processUserAnnotationClass(false);
      Management.#updateBBoxInfo();
    });
    
    document.getElementById('previous-button').addEventListener('click', Management.#goToPreviousImage);
    document.getElementById('next-button').addEventListener('click', Management.#goToNextImage);
    document.getElementById('complete-button').addEventListener('click', Management.#completeAnnotation);
  }
}


Management.init();