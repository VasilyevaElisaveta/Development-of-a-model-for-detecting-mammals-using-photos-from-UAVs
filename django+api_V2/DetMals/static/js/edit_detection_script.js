function submitForm(event) {
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
  
    createLoading();
    fetch(detectionEditingURL, {
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
  
function createLoading() {
  let container = document.getElementById('form-container');
  container.innerHTML = '';

  let paragraph = document.createElement('p');
  let text = document.createTextNode('Идет обработка. Пожалуйста, подождите');
  paragraph.appendChild(text);

  container.appendChild(paragraph);
};

document.getElementById('submit-button').addEventListener('click', submitForm);
