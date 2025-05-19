 const menu = document.querySelector('#mobile-menu');
 const menuLinks = document.querySelector('.navbar-menu');

 if (menu && menuLinks) {
	menu.addEventListener('click', function () {
      menu.classList.toggle('is-active');
      menuLinks.classList.toggle('active');
    });
  }

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".main-img-card");
 
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
          observer.unobserve(entry.target); // Optional: animate only once
        }
      });
    }, {
      threshold: 0.1, // Adjust this for when to trigger the animation
    });
 
    cards.forEach(card => {
      observer.observe(card);
    });
  });