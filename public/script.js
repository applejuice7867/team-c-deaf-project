const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle-button');

// Function to set the theme
function setTheme(theme) {
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    themeToggleBtn.textContent = '☀️'; // Change button text to sun for light mode
    themeToggleBtn.style.backgroundColor = '#1a1a1a'; // Dark gray to match page background
    themeToggleBtn.style.color = 'white'; // White text for dark button
  } else { // theme === 'light'
    body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    themeToggleBtn.textContent = '🌙'; // Change button text to moon for dark mode
    themeToggleBtn.style.backgroundColor = 'white'; // White for light mode button
    themeToggleBtn.style.color = 'black'; // Black text for white button
  }
}

// Event listener for the theme toggle button
themeToggleBtn?.addEventListener('click', () => {
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    setTheme('light');
  } else {
    setTheme('dark');
  }
});

// Apply the saved theme on page load
const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme || 'light'); // Default to light if no theme is saved

// Original navigation listeners
document.getElementById('btn-mtr')?.addEventListener('click', () => {
  window.location.href = '/home/applejuice/team-c-deaf-project/public/mtr.html';
});

document.getElementById('btn-minibus')?.addEventListener('click', () => {
  window.location.href = '/home/applejuice/team-c-deaf-project/public/minibus.html';
});
document.getElementById('btn-bus')?.addEventListener('click', () => {
  window.location.href = '/home/applejuice/team-c-deaf-project/public/bus.html';
});
