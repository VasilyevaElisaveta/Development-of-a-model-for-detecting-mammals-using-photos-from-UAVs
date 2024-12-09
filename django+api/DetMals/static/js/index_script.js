// Обработчик события DOMContentLoaded.  Этот код выполнится после полной загрузки страницы.
document.addEventListener('DOMContentLoaded', function() {
// Создаем объект sections, содержащий ссылки на элементы с id "hero", "about" и "team".
const sections = {
    hero: document.getElementById('hero'),
    about: document.getElementById('about'),
    team: document.getElementById('team')
};
 // Добавляем обработчик события клика к кнопке с id "detailsButton".
document.getElementById('detailsButton').addEventListener('click', function() {
        // Находим элемент с id "advantages".
        const advantagesSection = document.getElementById('advantages');
        // Если элемент существует, то плавно прокручиваем страницу к нему.
        if (advantagesSection) {
        // Метод scrollIntoView() прокручивает страницу, чтобы элемент стал видимым.
        // Опция behavior: 'smooth' обеспечивает плавную прокрутку.
        advantagesSection.scrollIntoView({ behavior: 'smooth' }); // Плавная прокрутка
        }
    });

// Проверка на существование всех секций
const allSectionsExist = Object.values(sections).every(section => section !== null);

if (!allSectionsExist) {
    console.error("Один или несколько разделов не найдены!");
    return; // Прерываем выполнение, если секции не найдены
}

// Функция для плавной прокрутки к определенному разделу страницы.
function scrollToSection(sectionId) {
    // Получаем текущий видимый раздел страницы.
    const currentSection = getCurrentSection();
    // Получаем целевой раздел страницы по его ID из объекта sections.
    const targetSection = sections[sectionId];

    // Проверяем, существует ли целевой раздел и отличается ли он от текущего.
    // Если целевой раздел существует и не совпадает с текущим, то выполняем прокрутку.
    if (targetSection && targetSection !== currentSection) {
        // Метод scrollIntoView() прокручивает страницу к элементу.
        // behavior: 'smooth' обеспечивает плавную прокрутку.
        // block: 'start' выравнивает прокрутку к началу целевого блока.
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Функция для определения текущего видимого раздела страницы.
function getCurrentSection() {
    // Начальное значение - null, если ни один раздел не виден.
    let currentSection = null;
    // Получаем текущую позицию прокрутки страницы.
    const windowTop = window.scrollY;

    // Перебираем все разделы страницы в объекте sections.
    for (const sectionId in sections) {
        // Получаем элемент раздела.
        const section = sections[sectionId];
        // Получаем позицию элемента сверху страницы.
        const sectionTop = section.offsetTop;
        // Получаем высоту элемента.
        const sectionHeight = section.offsetHeight;

        // Проверяем, находится ли верхняя граница окна прокрутки внутри текущего раздела.
        // Если да, то это текущий видимый раздел.
        if (windowTop >= sectionTop && windowTop < sectionTop + sectionHeight) {
            currentSection = section; // Запоминаем текущий раздел.
            break; // Прерываем цикл, так как текущий раздел найден.
        }
    }
    // Возвращаем ссылку на текущий видимый раздел или null, если ни один не найден.
    return currentSection;
}

// Добавляем обработчик события прокрутки страницы.
window.addEventListener('scroll', () => {
    // Получаем элемент header.
    const header = document.querySelector('header');
    // Получаем текущую позицию прокрутки.
    const scrollPos = window.scrollY;
    // Если позиция прокрутки больше 0 (страница прокручена), добавляем класс "sticky" к header.
    if (scrollPos > 0) {
        header.classList.add('sticky');
    } else {
        // Иначе, убираем класс "sticky".
        header.classList.remove('sticky');
    }
});

// Добавляем обработчик события клика на логотип.
document.getElementById('logo').addEventListener('click', function() {
    console.log('Click!'); // Выводим сообщение в консоль.
    location.reload(); // Перезагружаем страницу.
});
// Добавляем обработчик события клика для кнопки с id "detailsButton".
document.getElementById('detailsButton').addEventListener('click', function() {
    // Находим элемент с id "advantages".
    const advantagesSection = document.getElementById('advantages');
    // Получаем высоту элемента header.
    const headerHeight = document.querySelector('header').offsetHeight; 
    // Если элемент advantagesSection существует, то выполняем прокрутку.
    if (advantagesSection) {
        // Смещение в пикселях для регулировки позиции прокрутки.
        const offset = 10; 
        // Вычисляем позицию прокрутки, учитывая высоту header и смещение.
        const yOffset = advantagesSection.offsetTop - offset - headerHeight;
        // Выполняем плавную прокрутку к рассчитанной позиции.
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
});


// Находим все ссылки внутри элемента nav.
const menuLinks = document.querySelectorAll('nav a');
// Перебираем все найденные ссылки.
menuLinks.forEach(link => {
    // Добавляем обработчик события клика для каждой ссылки.
    link.addEventListener('click', function(event) {
        // Получаем значение атрибута data-section из ссылки.
        const sectionId = this.getAttribute('data-section');
        // Если атрибут data-section существует, то выполняем действия.
        if (sectionId) {
            // Предотвращаем стандартное поведение ссылки (переход по адресу).
            event.preventDefault();
            // Вызываем функцию scrollToSection для плавной прокрутки к нужному разделу.
            scrollToSection(sectionId);
        }
    });
});

// Находим кнопку "Распознать" с id "recognizeLinkAfterAbout".
const recognizeLink = document.getElementById('recognizeLinkAfterAbout');
// Если кнопка существует, добавляем к ней обработчик события клика.
if (recognizeLink) {
    recognizeLink.addEventListener('click', function(event) {
        console.log("Кнопка 'Распознать' нажата!"); // Выводим сообщение в консоль при нажатии кнопки.
    });
}
}); // Закрывающая скобка для document.addEventListener

// Массив данных о членах команды.  Каждый объект в массиве описывает одного человека.
const teamMembers = [
    { image: 'static/images/Миша.jpg', role: 'Разработчик', name: 'Михаил Рябов', description: '' },
    { image: 'static/images/Катя.jpg', role: 'Разработчик', name: 'Екатерина Еремина', description: '' },
    { image: 'static/images/Лиза.jpg', role: 'Тимлид', name: 'Елизавета Васильева', description: '' },
    { image: 'static/images/Никита.jpg', role: 'Разработчик', name: 'Никита Вагнер', description: '' },
    { image: 'static/images/Алина.jpg', role: 'Аналитик', name: 'Алина Булатова', description: '' }
];

// Находим контейнер на странице, куда будем добавлять информацию о членах команды.
const teamMembersContainer = document.querySelector('.team-members');

// Перебираем массив teamMembers с помощью метода forEach.
teamMembers.forEach(member => {
    // Создаем div для каждого члена команды.
    const teamMemberDiv = document.createElement('div');
    // Добавляем CSS-класс для стилизации.
    teamMemberDiv.classList.add('team-member');

    // Создаем элемент img для фотографии.
    const img = document.createElement('img');
    // Устанавливаем путь к фотографии.
    img.src = member.image;
    // Устанавливаем alt-текст для фотографии.
    img.alt = `${member.name}, ${member.role}`;
    // Добавляем фотографию в div teamMemberDiv.
    teamMemberDiv.appendChild(img);

    // Создаем div для информации о члене команды.
    const infoDiv = document.createElement('div');
    // Добавляем CSS-класс для стилизации.
    infoDiv.classList.add('team-info');

    // Создаем элемент p для роли.
    const roleP = document.createElement('p');
    // Добавляем CSS-класс для стилизации.
    roleP.classList.add('team-role');
    // Устанавливаем текст роли.
    roleP.textContent = member.role;
    // Добавляем элемент p в div infoDiv.
    infoDiv.appendChild(roleP);

    // Создаем элемент h3 для имени.
    const nameH3 = document.createElement('h3');
    // Устанавливаем текст имени.
    nameH3.textContent = member.name;
    // Добавляем элемент h3 в div infoDiv.
    infoDiv.appendChild(nameH3);

    // Создаем элемент p для описания (пустое в данном случае).
    const descriptionP = document.createElement('p');
    // Добавляем CSS-класс для стилизации.
    descriptionP.classList.add('team-description');
    // Устанавливаем текст описания.
    descriptionP.textContent = member.description;
    // Добавляем элемент p в div infoDiv.
    infoDiv.appendChild(descriptionP);

    // Добавляем div infoDiv в div teamMemberDiv.
    teamMemberDiv.appendChild(infoDiv);
    // Добавляем div teamMemberDiv в контейнер teamMembersContainer.
    teamMembersContainer.appendChild(teamMemberDiv);
});

// Инициализация библиотеки ClipboardJS для элементов с классом copyable-text.

new ClipboardJS('.copyable-text');