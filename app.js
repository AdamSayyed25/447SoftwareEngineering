// app.js

// ----- Section Navigation -----
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('nav ul li a');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.id.replace('-link', '');
    showSection(target);
  });
});

function showSection(sectionId) {
  sections.forEach(sec => sec.classList.add('hidden'));
  sections.forEach(sec => sec.classList.remove('active'));
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.add('active');
    activeSection.classList.remove('hidden');
  }
}

// ----- Menu Buttons (from Home) -----
const menuButtons = document.querySelectorAll('.menu-btn');
menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    showSection('menu');
  });
});

// ----- Back Buttons -----
const backButtons = document.querySelectorAll('.back-btn');
backButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.closest('.section').id === 'menu') {
      showSection('home');
    } else if (btn.closest('.section').id === 'cart') {
      showSection('menu');
    } else if (btn.closest('.section').id === 'feedback') {
      showSection('home');
    }
  });
});

// ----- Cart Functionality -----
let cart = [];

const cartItemsDiv = document.getElementById('cart-items');

function renderCart() {
  cartItemsDiv.innerHTML = '';
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }
  cart.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <p>${item.name} - $${item.price}</p>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
    cartItemsDiv.appendChild(div);
  });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// ----- Menu Add to Cart Buttons -----
const menuItems = document.querySelectorAll('.menu-item button');
menuItems.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const menuItemDiv = btn.parentElement;
    const name = menuItemDiv.querySelector('h4').innerText;
    const price = parseFloat(menuItemDiv.querySelector('p').innerText.replace('$', ''));
    cart.push({ name, price });
    alert(`${name} added to cart!`);
    renderCart();
  });
});

// ----- Feedback Form -----
const feedbackForm = document.getElementById('feedback-form');
feedbackForm.addEventListener('submit', e => {
  e.preventDefault();
  const feedbackText = document.getElementById('feedback-text').value.trim();
  if (feedbackText === '') {
    alert('Please enter feedback before submitting.');
    return;
  }
  alert('Thank you for your feedback!');
  feedbackForm.reset();
});
