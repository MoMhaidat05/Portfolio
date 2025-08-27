const navLinks = document.querySelectorAll('.nav-item');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const removeActive = () => {
      navLinks.forEach(l => l.classList.remove('active'));
      cleanup();
    };
    
    const cleanup = () => {
      window.removeEventListener('scroll', removeActive);
      window.removeEventListener('mousemove', removeActive);
      window.removeEventListener('touchstart', removeActive);
      document.removeEventListener('click', documentClickHandler);
    };
    
    const documentClickHandler = (event) => {
      if (!event.target.closest('.nav-item')) {
        removeActive();
      }
    };
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.addEventListener('scroll', removeActive, { once: true });
        window.addEventListener('mousemove', removeActive, { once: true });
        window.addEventListener('touchstart', removeActive, { once: true });
        document.addEventListener('click', documentClickHandler, { once: true });
      });
    });
  });
});