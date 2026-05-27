/**
 * api.js — Centralized API Module
 * All MockAPI fetch calls (GET/POST/PUT/DELETE)
 * Assigned to window.API for global access
 */

const API_BASE = 'https://69fa35c8c509a40d3aa4125a.mockapi.io/api/v1';
const LOCAL_ARTWORKS_KEY = 'artgallery_local_artworks';

function getLocalArtworks() {
    const stored = localStorage.getItem(LOCAL_ARTWORKS_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveLocalArtworks(artworks) {
    localStorage.setItem(LOCAL_ARTWORKS_KEY, JSON.stringify(artworks));
}

function mergeArtworks(remote, local) {
    if (!Array.isArray(remote)) {
        remote = [];
    }
    if (!Array.isArray(local)) {
        local = [];
    }
    return remote.concat(local.filter(function (item) {
        return !remote.some(function (remoteItem) {
            return String(remoteItem.id) === String(item.id);
        });
    }));
}

function createLocalArtwork(data) {
    var local = getLocalArtworks();
    var newArtwork = Object.assign({
        id: 'local_' + Date.now(),
        likes: 0,
        status: data.status || 'approved'
    }, data);
    local.push(newArtwork);
    saveLocalArtworks(local);
    return newArtwork;
}

function updateLocalArtwork(id, data) {
    var local = getLocalArtworks();
    var updatedArtwork = null;
    for (var i = 0; i < local.length; i++) {
        if (String(local[i].id) === String(id)) {
            local[i] = Object.assign({}, local[i], data);
            updatedArtwork = local[i];
            break;
        }
    }
    if (updatedArtwork) {
        saveLocalArtworks(local);
    }
    return updatedArtwork;
}

function deleteLocalArtwork(id) {
    var local = getLocalArtworks();
    var originalLength = local.length;
    local = local.filter(function (item) {
        return String(item.id) !== String(id);
    });
    if (local.length !== originalLength) {
        saveLocalArtworks(local);
        return { id: id };
    }
    return null;
}

window.API = {

    /**
     * GET /ArtGallery — Fetch all artworks
     * @returns {Promise<Array>} Array of artwork objects
     */
    getArtworks: function () {
        return fetch(API_BASE + '/ArtGallery')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch artworks: ' + response.status);
                }
                return response.json();
            })
            .then(function (remoteData) {
                return mergeArtworks(remoteData, getLocalArtworks());
            })
            .catch(function (error) {
                console.warn('API.getArtworks fallback to local storage:', error);
                return Promise.resolve(getLocalArtworks());
            });
    },

    /**
     * GET /ArtGallery/:id — Fetch a single artwork
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    getArtwork: function (id) {
        return fetch(API_BASE + '/ArtGallery/' + id)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch artwork ' + id + ': ' + response.status);
                }
                return response.json();
            })
            .catch(function (error) {
                console.error('API.getArtwork error:', error);
                throw error;
            });
    },

    /**
     * POST /ArtGallery — Create a new artwork
     * @param {Object} data - Artwork data
     * @returns {Promise<Object>} Created artwork
     */
    createArtwork: function (data) {
        return fetch(API_BASE + '/ArtGallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to create artwork: ' + response.status);
                }
                return response.json();
            })
            .catch(function (error) {
                console.warn('API.createArtwork fallback to local storage:', error);
                return Promise.resolve(createLocalArtwork(data));
            });
    },

    /**
     * PUT /ArtGallery/:id — Update an existing artwork
     * @param {string|number} id
     * @param {Object} data - Updated fields
     * @returns {Promise<Object>} Updated artwork
     */
    updateArtwork: function (id, data) {
        return fetch(API_BASE + '/ArtGallery/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to update artwork ' + id + ': ' + response.status);
                }
                return response.json();
            })
            .catch(function (error) {
                console.warn('API.updateArtwork fallback to local storage:', error);
                var updated = updateLocalArtwork(id, data);
                if (updated) {
                    return Promise.resolve(updated);
                }
                return Promise.reject(error);
            });
    },

    /**
     * DELETE /ArtGallery/:id — Delete an artwork
     * @param {string|number} id
     * @returns {Promise<Object>}
     */
    deleteArtwork: function (id) {
        return fetch(API_BASE + '/ArtGallery/' + id, {
            method: 'DELETE'
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to delete artwork ' + id + ': ' + response.status);
                }
                return response.json();
            })
            .catch(function (error) {
                console.warn('API.deleteArtwork fallback to local storage:', error);
                var deleted = deleteLocalArtwork(id);
                if (deleted) {
                    return Promise.resolve(deleted);
                }
                return Promise.reject(error);
            });
    },

    /**
     * GET /artists — Fetch all artists
     * @returns {Promise<Array>}
     */
    getArtists: function () {
        return fetch(API_BASE + '/artists')
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Failed to fetch artists: ' + response.status);
                }
                return response.json();
            })
            .catch(function (error) {
                console.error('API.getArtists error:', error);
                throw error;
            });
    }
};
