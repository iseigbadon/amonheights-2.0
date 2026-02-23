/* ============================================
   ADMIN DASHBOARD - JAVASCRIPT
   ============================================ */

// ============================================
// STATE & GLOBALS
// ============================================

let currentProperties = [];
let editingPropertyId = null;
let selectedImageFile = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadProperties();
});

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Tab switching
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.currentTarget.dataset.tab;
            switchTab(tabName);
        });
    });

    // Form submission
    document.getElementById('propertyForm').addEventListener('submit', handleFormSubmit);

    // Image upload
    const imageInput = document.getElementById('propertyImage');
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
    }

    // Remove image button
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-image-btn')) {
            selectedImageFile = null;
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('propertyImage').value = '';
        }
    });

    // Delete button
    document.getElementById('deleteBtn').addEventListener('click', openDeleteModal);

    // Modal delete confirm
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
    document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);

    // Modal overlay close
    document.querySelector('.modal-overlay').addEventListener('click', closeDeleteModal);

    // Property filter
    const filterInput = document.getElementById('propertyFilter');
    if (filterInput) {
        filterInput.addEventListener('input', filterProperties);
    }

    // Reset form button
    document.addEventListener('click', (e) => {
        if (e.target.textContent.includes('Reset')) {
            resetForm();
        }
    });
}

// ============================================
// TAB MANAGEMENT
// ============================================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Mark nav item as active
    const navBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }

    // Reset form when switching to add property
    if (tabName === 'add-property') {
        resetForm();
    }
}

// ============================================
// PROPERTIES LOADING & DISPLAY
// ============================================

async function loadProperties() {
    try {
        const response = await fetch('/api/admin/properties', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = '/admin';
            return;
        }

        if (!response.ok) throw new Error('Failed to load properties');

        currentProperties = await response.json();
        displayProperties(currentProperties);
    } catch (error) {
        console.error('Error loading properties:', error);
        showMessage('Error loading properties', 'error');
    }
}

function displayProperties(properties) {
    const tbody = document.getElementById('propertiesTableBody');
    const emptyState = document.getElementById('emptyState');

    if (properties.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = properties.map(prop => `
        <tr>
            <td><strong>${prop.name}</strong></td>
            <td>${prop.location}</td>
            <td>${capitalize(prop.category)}</td>
            <td>${prop.price}</td>
            <td>
                <span class="property-status ${prop.visible !== false ? 'status-visible' : 'status-hidden'}">
                    ${prop.visible !== false ? 'Visible' : 'Hidden'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn" onclick="editProperty(${prop.id})">Edit</button>
                    <button class="action-btn delete" onclick="startDelete(${prop.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterProperties(e) {
    const query = e.target.value.toLowerCase();
    const filtered = currentProperties.filter(prop =>
        prop.name.toLowerCase().includes(query) ||
        prop.location.toLowerCase().includes(query)
    );
    displayProperties(filtered);
}

// ============================================
// FORM HANDLING
// ============================================

function resetForm() {
    document.getElementById('propertyForm').reset();
    document.getElementById('propertyId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Property';
    document.getElementById('deleteBtn').style.display = 'none';
    document.getElementById('formMessage').textContent = '';
    document.getElementById('formMessage').className = 'form-message';
    selectedImageFile = null;
    document.getElementById('imagePreview').style.display = 'none';
    editingPropertyId = null;
}

async function editProperty(propertyId) {
    const property = currentProperties.find(p => p.id === propertyId);
    if (!property) return;

    // Switch to form tab
    switchTab('add-property');

    // Populate form
    document.getElementById('propertyId').value = property.id;
    document.getElementById('propertyName').value = property.name;
    document.getElementById('propertyLocation').value = property.location;
    document.getElementById('propertyCategory').value = property.category;
    document.getElementById('propertyPrice').value = property.price;
    document.getElementById('propertyDescription').value = property.description;
    document.getElementById('propertyFullDescription').value = property.fullDescription || '';
    document.getElementById('propertyVideo').value = property.video || '';
    document.getElementById('propertyAmenities').value = (property.amenities || []).join(', ');
    document.getElementById('propertyVisible').checked = property.visible !== false;

    // Show image preview
    if (property.image) {
        document.getElementById('previewImg').src = property.image;
        document.getElementById('imagePreview').style.display = 'block';
    }

    // Update form title and show delete button
    document.getElementById('formTitle').textContent = 'Edit Property';
    document.getElementById('deleteBtn').style.display = 'block';
    editingPropertyId = propertyId;

    // Scroll to form
    document.getElementById('propertyForm').scrollIntoView({ behavior: 'smooth' });
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    selectedImageFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('previewImg').src = event.target.result;
        document.getElementById('imagePreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const propertyId = document.getElementById('propertyId').value;
    let imageUrl = null;

    // If editing and image changed, upload new image
    // If adding, upload image
    if (selectedImageFile) {
        const formData = new FormData();
        formData.append('image', selectedImageFile);

        try {
            const uploadRes = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Image upload failed');

            const uploadData = await uploadRes.json();
            imageUrl = uploadData.url;
        } catch (error) {
            console.error('Image upload error:', error);
            showMessage('Failed to upload image', 'error');
            return;
        }
    } else if (!propertyId) {
        // New property without image
        showMessage('Please select an image', 'error');
        return;
    }

    // Prepare property data
    const propertyData = {
        name: document.getElementById('propertyName').value,
        location: document.getElementById('propertyLocation').value,
        category: document.getElementById('propertyCategory').value,
        price: document.getElementById('propertyPrice').value,
        description: document.getElementById('propertyDescription').value,
        fullDescription: document.getElementById('propertyFullDescription').value,
        video: document.getElementById('propertyVideo').value,
        amenities: document.getElementById('propertyAmenities').value
            .split(',')
            .map(a => a.trim())
            .filter(a => a),
        visible: document.getElementById('propertyVisible').checked
    };

    // Add image URL if provided
    if (imageUrl) {
        propertyData.image = imageUrl;
    }

    try {
        let response;

        if (propertyId) {
            // Update existing property
            response = await fetch(`/api/admin/properties/${propertyId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(propertyData)
            });
        } else {
            // Create new property
            if (!imageUrl) {
                showMessage('Please upload an image', 'error');
                return;
            }

            response = await fetch('/api/admin/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...propertyData,
                    image: imageUrl
                })
            });
        }

        if (response.status === 401) {
            window.location.href = '/admin';
            return;
        }

        if (!response.ok) throw new Error('Failed to save property');

        const data = await response.json();
        showMessage(
            propertyId ? 'Property updated successfully' : 'Property added successfully',
            'success'
        );

        // Reset and reload
        resetForm();
        loadProperties();
        switchTab('properties');
    } catch (error) {
        console.error('Error saving property:', error);
        showMessage('Error saving property', 'error');
    }
}

// ============================================
// DELETE FUNCTIONALITY
// ============================================

function startDelete(propertyId) {
    editingPropertyId = propertyId;
    openDeleteModal();
}

function openDeleteModal() {
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    editingPropertyId = null;
}

async function confirmDelete() {
    if (!editingPropertyId) return;

    try {
        const response = await fetch(`/api/admin/properties/${editingPropertyId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = '/admin';
            return;
        }

        if (!response.ok) throw new Error('Failed to delete property');

        showMessage('Property deleted successfully', 'success');
        closeDeleteModal();
        resetForm();
        loadProperties();
    } catch (error) {
        console.error('Error deleting property:', error);
        showMessage('Error deleting property', 'error');
    }
}

// ============================================
// MESSAGES
// ============================================

function showMessage(message, type) {
    const msgEl = document.getElementById('formMessage');
    msgEl.textContent = message;
    msgEl.className = `form-message show ${type}`;

    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            msgEl.classList.remove('show');
        }, 3000);
    }
}

// ============================================
// AUTHENTICATION
// ============================================

async function logout() {
    try {
        await fetch('/api/admin/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/admin';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/admin';
    }
}

// ============================================
// UTILITIES
// ============================================

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
