// API Base URL
const API_BASE_URL = 'https://fakestoreapi.com';

// State management
let currentCategory = 'all';
let allProducts = [];
let cartCount = parseInt(localStorage.getItem('cartCount') || '0');

// DOM Elements
const categoriesContainer = document.getElementById('categoriesContainer');
const productsContainer = document.getElementById('productsContainer');
const cartCountElement = document.querySelector('.cart-count');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchAllProducts();
    updateCartCount();
    
    // Create modal if it doesn't exist (safety check)
    if (!document.getElementById('productModal')) {
        createModal();
    }
});

// Function to create modal if it doesn't exist (backup)
function createModal() {
    const modalHTML = `
        <dialog id="productModal" class="modal">
            <div class="modal-box w-11/12 max-w-3xl p-0">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10">✕</button>
                </form>
                <div id="modalContent" class="p-6"></div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Fetch all categories from API
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/categories`);
        const categories = await response.json();
        displayCategories(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        categoriesContainer.innerHTML = '<p class="text-error text-center w-full">Failed to load categories. Please refresh the page.</p>';
    }
}

// Display categories as buttons
function displayCategories(categories) {
    categoriesContainer.innerHTML = ''; // Remove loading spinner
    
    // Add "All" button (active by default)
    const allButton = createCategoryButton('All', true);
    allButton.addEventListener('click', () => {
        setActiveCategory('all');
        filterProductsByCategory('all');
    });
    categoriesContainer.appendChild(allButton);
    
    // Add category buttons from API
    categories.forEach(category => {
        const button = createCategoryButton(category, false);
        button.addEventListener('click', () => {
            setActiveCategory(category);
            filterProductsByCategory(category);
        });
        categoriesContainer.appendChild(button);
    });
}

// Create a category button element
function createCategoryButton(category, isActive = false) {
    const button = document.createElement('button');
    button.className = `px-6 py-3 rounded-full font-medium text-sm md:text-base transition-all duration-300 ${
        isActive 
            ? 'bg-primary text-white shadow-md hover:shadow-lg' 
            : 'bg-base-200 text-base-content hover:bg-primary hover:text-white'
    }`;
    
    // Format category name for display
    button.textContent = formatCategoryName(category);
    button.dataset.category = category.toLowerCase();
    
    return button;
}

// Format category name for display (capitalize, replace hyphens)
function formatCategoryName(category) {
    if (category === 'All' || category === 'all') return 'All';
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Set active category button
function setActiveCategory(category) {
    const buttons = categoriesContainer.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.dataset.category === category.toLowerCase() || 
            (category === 'all' && button.dataset.category === 'all')) {
            button.className = 'px-6 py-3 rounded-full bg-primary text-white font-medium text-sm md:text-base shadow-md hover:shadow-lg transition-all duration-300';
        } else {
            button.className = 'px-6 py-3 rounded-full bg-base-200 text-base-content font-medium text-sm md:text-base hover:bg-primary hover:text-white transition-all duration-300';
        }
    });
    currentCategory = category;
}

// Fetch all products
async function fetchAllProducts() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/products`);
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        productsContainer.innerHTML = '<p class="text-error text-center col-span-full py-12">Failed to load products. Please refresh the page.</p>';
    }
}

// Display products in grid
function displayProducts(products) {
    if (products.length === 0) {
        productsContainer.innerHTML = '<p class="text-center text-base-content/50 col-span-full py-12">No products found in this category.</p>';
        return;
    }
    
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300';
    
    card.innerHTML = `
        <figure class="px-4 pt-4">
            <img 
                src="${product.image}" 
                alt="${product.title}"
                class="rounded-xl h-48 w-full object-contain bg-white"
                onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'"
            />
        </figure>
        <div class="card-body p-4">
            <!-- Category and Rating Row -->
            <div class="flex justify-between items-center mb-1">
                <span class="badge badge-outline text-xs">${formatCategoryName(product.category)}</span>
                <div class="flex items-center gap-1">
                    <span class="text-sm font-semibold">${product.rating.rate}</span>
                    <div class="rating rating-xs">
                        <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-orange-400" ${product.rating.rate >= 1 ? 'checked' : 'disabled'} />
                        <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-orange-400" ${product.rating.rate >= 2 ? 'checked' : 'disabled'} />
                        <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-orange-400" ${product.rating.rate >= 3 ? 'checked' : 'disabled'} />
                        <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-orange-400" ${product.rating.rate >= 4 ? 'checked' : 'disabled'} />
                        <input type="radio" name="rating-${product.id}" class="mask mask-star-2 bg-orange-400" ${product.rating.rate >= 5 ? 'checked' : 'disabled'} />
                    </div>
                    <span class="text-xs text-base-content/50">(${product.rating.count})</span>
                </div>
            </div>
            
            <!-- Product Title (truncated) -->
            <h3 class="font-semibold text-base line-clamp-2 min-h-[3rem]">
                ${product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title}
            </h3>
            
            <!-- Price -->
            <div class="mt-2">
                <span class="text-2xl font-bold text-primary">$${product.price.toFixed(2)}</span>
            </div>
            
            <!-- Action Buttons Row -->
            <div class="grid grid-cols-2 gap-2 mt-3">
                <button class="btn btn-outline btn-primary btn-sm details-btn" data-product='${JSON.stringify(product).replace(/'/g, "&apos;")}'>
                    Details
                </button>
                <button class="btn btn-primary btn-sm add-to-cart" data-product-id="${product.id}">
                    Add
                </button>
            </div>
        </div>
    `;
    
    // Add event listener to Details button
    const detailsBtn = card.querySelector('.details-btn');
    detailsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const productData = JSON.parse(detailsBtn.dataset.product.replace(/&apos;/g, "'"));
        showProductModal(productData);
    });
    
    // Add event listener to Add to Cart button
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(product);
    });
    
    return card;
}

// Show product details in modal
function showProductModal(product) {
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Product Image -->
            <div class="flex justify-center items-center bg-white p-4 rounded-xl">
                <img 
                    src="${product.image}" 
                    alt="${product.title}"
                    class="max-h-64 md:max-h-80 object-contain"
                    onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'"
                />
            </div>
            
            <!-- Product Info -->
            <div>
                <!-- Header with ID and Category -->
                <div class="flex justify-between items-start mb-3">
                    <span class="badge badge-primary">ID: ${product.id}</span>
                    <span class="badge badge-outline">${formatCategoryName(product.category)}</span>
                </div>
                
                <!-- Title -->
                <h3 class="text-xl md:text-2xl font-bold mb-3">${product.title}</h3>
                
                <!-- Rating with stars -->
                <div class="flex items-center gap-2 mb-3">
                    <div class="rating rating-sm">
                        ${Array(5).fill().map((_, i) => `
                            <input type="radio" name="modal-rating" class="mask mask-star-2 bg-orange-400" ${i < Math.round(product.rating.rate) ? 'checked' : 'disabled'} />
                        `).join('')}
                    </div>
                    <span class="font-semibold">${product.rating.rate}</span>
                    <span class="text-sm text-base-content/50">(${product.rating.count} reviews)</span>
                </div>
                
                <!-- Price -->
                <div class="mb-4">
                    <span class="text-3xl font-bold text-primary">$${product.price.toFixed(2)}</span>
                </div>
                
                <!-- Description -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-2">Description:</h4>
                    <p class="text-base-content/70 leading-relaxed">
                        ${product.description}
                    </p>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex gap-3">
                    <button class="btn btn-primary flex-1 modal-add-to-cart" data-product-id="${product.id}">
                        <i class="fa-solid fa-cart-plus mr-2"></i> Add to Cart
                    </button>
                    <form method="dialog">
                        <button class="btn btn-outline">Close</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Show the modal
    modal.showModal();
    
    // Add event listener to the Add to Cart button inside modal
    const modalAddBtn = modalContent.querySelector('.modal-add-to-cart');
    modalAddBtn.addEventListener('click', () => {
        addToCart(product);
        
        // Optional: Show a small notification
        const toast = document.createElement('div');
        toast.className = 'alert alert-success fixed bottom-4 right-4 w-auto z-50 shadow-lg';
        toast.innerHTML = `<span>${product.title} added to cart!</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    });
}

// Filter products by category
function filterProductsByCategory(category) {
    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filteredProducts = allProducts.filter(product => product.category === category);
        displayProducts(filteredProducts);
    }
}

// Show loading spinner
function showLoading() {
    productsContainer.innerHTML = `
        <div class="text-center col-span-full py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
    `;
}

// Cart functionality
function addToCart(product) {
    cartCount++;
    localStorage.setItem('cartCount', cartCount);
    updateCartCount();
}

function updateCartCount() {
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Hide badge if count is 0
        if (cartCount === 0) {
            cartCountElement.classList.add('hidden');
        } else {
            cartCountElement.classList.remove('hidden');
        }
    }
}

// Optional: Add to cart from product cards (if you want to use event delegation)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
        const button = e.target.closest('.add-to-cart');
        const productId = button.dataset.productId;
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (product) {
            addToCart(product);
        }
    }
});