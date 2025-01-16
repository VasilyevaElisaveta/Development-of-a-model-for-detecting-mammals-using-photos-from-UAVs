class EnvironmentProcessing {

  static init() {
    EnvironmentProcessing.#attachEventListeners();
  };

  static #attachEventListeners() {
    document.getElementById('submit-button').addEventListener('click', EnvironmentProcessing.#submitForm);
    document.getElementById('file-input').addEventListener('change', function(event) {
      const fileNameDisplay = document.getElementById('file-name-display');
      const file = event.target.files[0];
      fileNameDisplay.textContent = file ? file.name : 'Файл не выбран';
    }); 
  };

  static #submitForm(event) {
    event.preventDefault();
  
    let fileInput = document.getElementById('file-input');
    let file = fileInput.files[0];
    if (!file) {
      alert('Пожалуйста, выберите файл!');
      return;
    }
  
    let formData = new FormData();
    formData.append('file', file);
  
    let csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let url = DjangoData.detectionEditingURL;
  
    EnvironmentProcessing.#createLoading();
    fetch(url, {
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
        window.location.reload();
      });
  };
  
  static #createLoading() {
    let container = document.getElementById('form-container');
    container.innerHTML = '';

    let paragraph = document.createElement('p');
    let text = document.createTextNode('Идет обработка. Пожалуйста, подождите');
    paragraph.appendChild(text);

    container.appendChild(paragraph);
  };
};

EnvironmentProcessing.init();


