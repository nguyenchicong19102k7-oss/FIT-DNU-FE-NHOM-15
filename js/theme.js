/**
 * theme.js — Light/Dark Theme Management for ArtGallery
 * Persists theme preference in localStorage and toggles CSS class
 */

(function () {
    // 1. Get initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    let theme = 'light'; // Default theme

    if (savedTheme) {
        theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
    }

    // 2. Immediately apply theme to HTML tag to prevent flash of light mode
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    // Make functions globally available
    window.ThemeModule = {
        getCurrentTheme: function () {
            return document.documentElement.getAttribute('data-bs-theme') || 'light';
        },
        
        setTheme: function (newTheme) {
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateToggleIcons(newTheme);
        },

        toggleTheme: function () {
            const current = this.getCurrentTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            this.setTheme(next);
        },

        updateToggleIcons: function (currentTheme) {
            const icons = document.querySelectorAll('.theme-toggle-icon');
            icons.forEach(icon => {
                if (currentTheme === 'dark') {
                    // In dark mode, show Sun icon to switch to light
                    icon.className = 'bi bi-sun-fill theme-toggle-icon';
                } else {
                    // In light mode, show Moon icon to switch to dark
                    icon.className = 'bi bi-moon-stars-fill theme-toggle-icon';
                }
            });
        }
    };

    // 3. Set up event listeners once DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        const currentTheme = window.ThemeModule.getCurrentTheme();
        window.ThemeModule.updateToggleIcons(currentTheme);

        // Find all elements with class 'theme-toggle-btn' and bind toggle action
        const toggles = document.querySelectorAll('.theme-toggle-btn');
        toggles.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                window.ThemeModule.toggleTheme();
            });
        });
    });
})();
