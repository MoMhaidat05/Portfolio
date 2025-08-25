const links = document.querySelectorAll('.nav-item');

links.forEach(link => {
    link.addEventListener('click', () => {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active')
    });
})