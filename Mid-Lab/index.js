const profileImg = document.getElementById('profileImg');
const objectivePopup = document.getElementById('objectivePopup');

profileImg.addEventListener('mouseenter', () => {
    objectivePopup.classList.add('show');
});


profileImg.addEventListener('mouseleave', () => {
    objectivePopup.classList.remove('show');
});


profileImg.addEventListener('touchstart', (e) => {
    e.preventDefault();
    objectivePopup.classList.toggle('show');
});

