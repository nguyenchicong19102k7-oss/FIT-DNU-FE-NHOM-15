/**
 * utils.js — Utility Functions
 * Validation, formatting, and error display helpers
 */

/**
 * Validate whether a string is a valid URL
 */
function isValidUrl(str) {
    if (!str || typeof str !== 'string') return false;
    try {
        var url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
}

/**
 * Validate the artwork form data
 * @returns {Object} { valid: boolean, errors: { fieldName: errorMessage } }
 */
function validateForm(formData) {
    var errors = {};

    if (!formData.title || formData.title.trim() === '') {
        errors.title = 'Tiêu đề không được để trống';
    }

    if (!formData.artist || formData.artist.trim() === '') {
        errors.artist = 'Tên nghệ sĩ không được để trống';
    }

    if (!formData.imageUrl || formData.imageUrl.trim() === '') {
        errors.imageUrl = 'URL hình ảnh không được để trống';
    } else if (!isValidUrl(formData.imageUrl)) {
        errors.imageUrl = 'URL hình ảnh không hợp lệ';
    }

    return {
        valid: Object.keys(errors).length === 0,
        errors: errors
    };
}

/**
 * Show an inline error message below a form field
 */
function showInlineError(fieldId, message) {
    var field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('is-invalid');

    var existingError = field.parentElement.querySelector('.inline-error');
    if (existingError) {
        existingError.textContent = message;
        return;
    }

    var errorEl = document.createElement('div');
    errorEl.className = 'inline-error';
    errorEl.textContent = message;
    field.parentElement.appendChild(errorEl);
}

/**
 * Remove all inline error messages and invalid classes
 */
function clearErrors() {
    document.querySelectorAll('.inline-error').forEach(function (el) { el.remove(); });
    document.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
}

/**
 * Get a working image URL — use provided URL if valid, else use picsum placeholder
 */
function getImageUrl(imageUrl, id) {
    if (imageUrl && imageUrl.indexOf('ibb.co/example') === -1 && isValidUrl(imageUrl)) {
        return imageUrl;
    }
    return 'https://picsum.photos/seed/art' + id + '/600/800';
}
