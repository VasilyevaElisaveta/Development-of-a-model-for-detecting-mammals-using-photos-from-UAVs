function submitForm(event) {
  event.preventDefault();

  let fileInput = document.getElementById('file-input');
  let file = fileInput.files[0];
  if (!file) {
    alert('Пожалуйста, выберите файл!');
    return;
  }

  let selectedElement = document.getElementById("class-type")
  let classType = selectedElement.value

  let formData = new FormData();
  formData.append('file', file);
  formData.append('class', classType)

  let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

  createLoading();
  fetch(djangoDetectionURL, {
    method: 'POST',
    body: formData,
    headers: {
        'X-CSRFToken': csrfToken
    }
  })
  .then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('Ошибка при обработке файла');
      }
    })
    .then((html) => {
      document.open();
      document.write(html);
      document.close();
    })
    .catch((error) => {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при загрузке файла.');
    });
};

function initializeSelectionForm() {
  let selectionElement = document.getElementById('class-type');

  classData.forEach(element => {
    let option = document.createElement('option');
    option.value = element["value"];
    option.textContent = element["text"];
    option.selected = element["is_selected"];

    selectionElement.appendChild(option);
  });
};

function createLoading() {
  let container = document.getElementById('button-container');
  container.innerHTML = '';

  let paragraph = document.createElement('p');
  let text = document.createTextNode('Идет обработка. Пожалуйста, подождите');
  paragraph.appendChild(text);

  container.appendChild(paragraph);
};

initializeSelectionForm();

document.getElementById('submit-button').addEventListener('click', submitForm);