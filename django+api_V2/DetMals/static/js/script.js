document.addEventListener('DOMContentLoaded', () => {
    let uploadButton = document.createElement('button');
    uploadButton.id = 'uploadFileButton';
    uploadButton.textContent = 'Загрузить файл';
    uploadButton.classList.add('upload-button');
    let buttonContainer = document.getElementById("button-container");
    buttonContainer.appendChild(uploadButton);

    uploadButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';

        input.addEventListener('change', (event) => {
            if (event.target.files.length > 0) {
                const file = event.target.files[0];
                let existingProcessButton = document.getElementById('processButton');
                if (existingProcessButton) {
                    buttonContainer.removeChild(existingProcessButton);
                }

                let processButton = document.createElement('button');
                processButton.id = 'processButton';
                processButton.textContent = 'Отправить на обработку';
                processButton.classList.add('process-button');
                buttonContainer.appendChild(processButton);

                // Добавление кнопки перевыбора файла
                let reselectButton = document.createElement('button');

                // reselectButton.textContent = 'Выбрать другой файл';
                
                reselectButton.classList.add('reselect-button');
                buttonContainer.appendChild(reselectButton);

                reselectButton.addEventListener('click', () => {
                    buttonContainer.innerHTML = '';
                    buttonContainer.appendChild(uploadButton);
                });

                processButton.addEventListener('click', () => {
                    const formData = new FormData();
                    formData.append('file', file);

                    fetch('http://127.0.0.1:8000/process/', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRFToken': getCSRFToken(),
                        },
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status) {
                                // Перезагрузка страницы для отображения результата
                                window.location.reload();
                            } else {
                                buttonContainer.innerHTML = '';
                                const errorMessage = document.createElement('p');
                                errorMessage.textContent = `Ошибка: ${data.error}`;
                                buttonContainer.appendChild(errorMessage);
                                buttonContainer.appendChild(uploadButton);
                            }
                        })
                        .catch(error => {
                            console.error('Ошибка:', error);
                            buttonContainer.innerHTML = '';
                            const errorMessage = document.createElement('p');
                            errorMessage.textContent = 'Ошибка при отправке запроса';
                            buttonContainer.appendChild(errorMessage);
                            buttonContainer.appendChild(uploadButton);
                        });
                });
            }
        });

        input.click();
    });

    // Функция для получения CSRF-токена
    function getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('csrftoken=')) {
                return cookie.substring('csrftoken='.length, cookie.length);
            }
        }
        return '';
    }
});
