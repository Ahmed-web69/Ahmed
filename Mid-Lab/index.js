const profileImg = document.getElementById('profileImg');
const objectivePopup = document.getElementById('objectivePopup');

// Show popup on mouse enter
profileImg.addEventListener('mouseenter', () => {
    objectivePopup.classList.add('show');
});

// Hide popup on mouse leave
profileImg.addEventListener('mouseleave', () => {
    objectivePopup.classList.remove('show');
});

// Toggle popup on touch for mobile devices
profileImg.addEventListener('touchstart', (e) => {
    e.preventDefault();
    objectivePopup.classList.toggle('show');
});

// Optional: Close popup when clicking outside
document.addEventListener('click', (e) => {
    if (!profileImg.contains(e.target) && !objectivePopup.contains(e.target)) {
        objectivePopup.classList.remove('show');
    }
});