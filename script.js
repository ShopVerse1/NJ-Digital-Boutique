// DOM Elements
const cartIcon = document.getElementById('cartIcon');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const overlay = document.getElementById('overlay');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
const cartItems = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const buyNowButtons = document.querySelectorAll('.buy-now');
const newsletterForm = document.getElementById('newsletterForm');
const newsletterMessage = document.getElementById('newsletterMessage');
const trackOrderForm = document.getElementById('trackOrderForm');
const trackOrderResult = document.getElementById('trackOrderResult');
const contactForm = document.getElementById('contactForm');

// Cart Data
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateCartDisplay();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (mobileMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
});

// Toggle Cart Modal
cartIcon.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
overlay.addEventListener('click', function() {
    if (cartModal.classList.contains('active')) {
        toggleCart();
    }
    if (mobileMenu.classList.contains('active')) {
        toggleMobileMenu();
    }
});

// Toggle Mobile Menu
hamburger.addEventListener('click', toggleMobileMenu);
closeMenu.addEventListener('click', toggleMobileMenu);

// Add to Cart Functionality
addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const image = this.getAttribute('data-image');
        
        addToCart(id, name, price, image);
        showNotification(`${name} added to cart!`);
    });
});

// Buy Now Functionality
buyNowButtons.forEach(button => {
    button.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const name = this.getAttribute('data-name');
        const price = parseFloat(this.getAttribute('data-price'));
        const image = this.getAttribute('data-image');
        
        // Clear cart and add only this item
        cart = [];
        addToCart(id, name, price, image);
        
        // Open cart and scroll to it
        if (!cartModal.classList.contains('active')) {
            toggleCart();
        }
        
        // Scroll to cart
        setTimeout(() => {
            cartModal.scrollTop = 0;
        }, 300);
    });
});

// Newsletter Form Submission
newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    
    // Show success message
    newsletterMessage.textContent = `Thank you for subscribing with ${email}! We'll keep you updated with our latest offers.`;
    newsletterMessage.className = 'newsletter-message success';
    newsletterMessage.style.display = 'block';
    
    // Reset form
    this.reset();
    
    // Hide message after 5 seconds
    setTimeout(() => {
        newsletterMessage.style.display = 'none';
    }, 5000);
});

// Track Order Form Submission
trackOrderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const orderId = document.getElementById('orderId').value.trim();
    
    // Simulate order tracking (in real app, this would call your backend)
    if (orderId.toUpperCase().startsWith('NJ')) {
        const statuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        trackOrderResult.innerHTML = `
            <h4>Order Found: ${orderId.toUpperCase()}</h4>
            <p><strong>Status:</strong> ${randomStatus}</p>
            <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
            ${randomStatus === 'Delivered' ? 
                '<p class="success-message">Your order has been delivered successfully!</p>' : 
                '<p>We\'ll notify you when your order status changes.</p>'
            }
        `;
        trackOrderResult.className = 'track-result success';
    } else {
        trackOrderResult.innerHTML = `
            <h4>Order Not Found</h4>
            <p>We couldn't find an order with ID: ${orderId}</p>
            <p>Please check your order ID and try again.</p>
        `;
        trackOrderResult.className = 'track-result error';
    }
});

// Contact Form Submission
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const name = this.querySelector('input[type="text"]').value;
    
    // Show success message
    showNotification(`Thank you ${name}! Your message has been sent. We'll get back to you soon.`);
    
    // Reset form
    this.reset();
});

// Checkout Button
checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Your cart is empty. Add some products first!');
        return;
    }
    
    // In a real application, this would redirect to the payment page
    alert('Redirecting to payment page...\n\nIn a real application, this would integrate with Razorpay or another payment gateway.');
    
    // For demo purposes, we'll simulate a successful order
    const orderId = 'NJ' + Date.now();
    showNotification(`Order placed successfully! Your order ID is: ${orderId}`);
    
    // Clear cart after successful order
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    toggleCart();
});

// Functions
function toggleCart() {
    cartModal.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = cartModal.classList.contains('active') ? 'hidden' : 'auto';
}

function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : 'auto';
}

function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            price,
            image,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    updateCartDisplay();
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

function updateCartDisplay() {
    // Clear current items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
        cartSubtotal.textContent = '$0.00';
        cartTotal.textContent = '$5.00';
        return;
    }
    
    // Calculate totals
    let subtotal = 0;
    
    // Add each item to the cart display
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-img">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <div class="quantity-btn decrease" data-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </div>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <div class="quantity-btn increase" data-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </div>
                    <div class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItemElement);
    });
    
    // Update totals
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    cartTotal.textContent = `$${(subtotal + 5).toFixed(2)}`;
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.increase').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            updateQuantity(id, 1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            updateQuantity(id, -1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateCartDisplay();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateCartDisplay();
    showNotification('Item removed from cart');
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'var(--success)';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = 'var(--shadow)';
    notification.style.zIndex = '2000';
    notification.style.transition = 'var(--transition)';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.maxWidth = '300px';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add some sample orders for demonstration
function addSampleOrders() {
    const sampleOrders = [
        {
            id: 'NJ12345',
            date: '2023-11-15',
            total: 129.99,
            status: 'Delivered',
            items: ['Designer Handbag']
        },
        {
            id: 'NJ12346',
            date: '2023-11-20',
            total: 199.99,
            status: 'Shipped',
            items: ['Wireless Headphones']
        }
    ];
    
    // Store sample orders in localStorage for demo
    if (!localStorage.getItem('sampleOrders')) {
        localStorage.setItem('sampleOrders', JSON.stringify(sampleOrders));
    }
}

// Initialize sample orders on page load
addSampleOrders();