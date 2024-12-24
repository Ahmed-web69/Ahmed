async function handleWishlist(button) {
    try {
        const productId = button.dataset.productId;
        
        const response = await fetch('/wishlist/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        });
        
        const data = await response.json();
        
        if (response.status === 401) {
            if (confirm('Please login first to add items to wishlist. Would you like to login now?')) {
                window.location.href = '/admin/login';
            }
            return;
        }
        
        if (data.success) {
            button.textContent = '✓ Added to Wishlist';
            button.disabled = true;
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding to wishlist');
    }
} 