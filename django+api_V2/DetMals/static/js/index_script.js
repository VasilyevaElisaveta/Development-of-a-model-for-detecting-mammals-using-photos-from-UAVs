document.addEventListener('DOMContentLoaded', function() {
	const sections = {
		hero: document.getElementById('hero'),
		about: document.getElementById('about'),
		team: document.getElementById('team')
	};

	document.getElementById('detailsButton').addEventListener('click', function() {
		const advantagesSection = document.getElementById('advantages');
		if (advantagesSection) {
			advantagesSection.scrollIntoView({ behavior: 'smooth' }); 
		}
	});

	const allSectionsExist = Object.values(sections).every(section => section !== null);

	if (!allSectionsExist) {
		console.error("Один или несколько разделов не найдены!");
		return;
	};

	function scrollToSection(sectionId) {

		const currentSection = getCurrentSection();
		const targetSection = sections[sectionId];

		if (targetSection && targetSection !== currentSection) {
			targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
		};
	};

	function getCurrentSection() {

		let currentSection = null;
		const windowTop = window.scrollY;

		for (const sectionId in sections) {
			const section = sections[sectionId];
			const sectionTop = section.offsetTop;
			const sectionHeight = section.offsetHeight;

			if (windowTop >= sectionTop && windowTop < sectionTop + sectionHeight) {
				currentSection = section; 
				break; 
			};
		};
		return currentSection;
	};

	window.addEventListener('scroll', () => {
		const header = document.querySelector('header');
		const scrollPos = window.scrollY;
		if (scrollPos > 0) {
			header.classList.add('sticky');
		} else {
			header.classList.remove('sticky');
		};
	});

	document.getElementById('logo').addEventListener('click', function() {
		console.log('Click!');
		location.reload();
	});

	document.getElementById('detailsButton').addEventListener('click', function() {
		const advantagesSection = document.getElementById('advantages');
		const headerHeight = document.querySelector('header').offsetHeight; 
		if (advantagesSection) {
			const offset = 10; 
			const yOffset = advantagesSection.offsetTop - offset - headerHeight;
			window.scrollTo({ top: yOffset, behavior: 'smooth' });
		};
	});

	const menuLinks = document.querySelectorAll('nav a');
	menuLinks.forEach(link => {
		link.addEventListener('click', function(event) {
			const sectionId = this.getAttribute('data-section');
			if (sectionId) {
				event.preventDefault();
				scrollToSection(sectionId);
			};
		});
	});

	const recognizeLink = document.getElementById('recognizeLinkAfterAbout');
	if (recognizeLink) {
		recognizeLink.addEventListener('click', function(event) {
			console.log("Кнопка 'Распознать' нажата!");
		});
	};

}); 

const teamMembers = [
	{image: 'static/images/misha.jpg', role: 'Разработчик', name: 'Михаил Рябов', description: ''},
	{image: 'static/images/katya.jpg', role: 'Разработчик', name: 'Екатерина Еремина', description: ''},
	{image: 'static/images/liza.jpg', role: 'Тимлид', name: 'Елизавета Васильева', description: ''},
	{image: 'static/images/nikita.jpg', role: 'Разработчик', name: 'Никита Вагнер', description: ''},
	{image: 'static/images/alina.jpg', role: 'Аналитик', name: 'Алина Булатова', description: ''}
];

const teamMembersContainer = document.querySelector('.team-members');

teamMembers.forEach(member => {
	const teamMemberDiv = document.createElement('div');
	teamMemberDiv.classList.add('team-member');

	const img = document.createElement('img');
	img.src = member.image;
	img.alt = `${member.name}, ${member.role}`;
	teamMemberDiv.appendChild(img);

	const infoDiv = document.createElement('div');
	infoDiv.classList.add('team-info');

	const roleP = document.createElement('p');
	roleP.classList.add('team-role');
	roleP.textContent = member.role;
	infoDiv.appendChild(roleP);

	const nameH3 = document.createElement('h3');

	nameH3.textContent = member.name;
	infoDiv.appendChild(nameH3);

	const descriptionP = document.createElement('p');
	descriptionP.classList.add('team-description');
	descriptionP.textContent = member.description;
	infoDiv.appendChild(descriptionP);

	teamMemberDiv.appendChild(infoDiv);
	teamMembersContainer.appendChild(teamMemberDiv);
});

new ClipboardJS('.copyable-text');