// CampusKArt - Core Application Logic & State Management

// ==================== STATE MANAGEMENT ====================
const SUPABASE_URL = 'https://fmwyjacbituidkilijov.supabase.co';
const SUPABASE_KEY = 'sb_publishable_P64osVyCpezBoyCL9mfaCQ_4AYQ9KYa';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUser = null;

// Initial mockup data for CampusKArt listings
let listings = [
  {
    id: 1,
    title: 'Engineering Mathematics - III (T. Veerarajan)',
    category: 'Books',
    price: 450,
    condition: 'Like New',
    location: 'Adhiyaman Hostel',
    date: '2 hours ago',
    seller: 'Aditya Sharma',
    initials: 'AS',
    description:
      'Hardcopy textbook by T. Veerarajan, highly recommended for ME/ECE/CSE 3rd Semester. No highlighting, no bent pages, and covers are intact. Clean condition.',
    imageColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    iconType: 'book',
    imageSrc:
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 2,
    title: 'Hero Ranger Mountain Cycle (21-Speed)',
    category: 'Cycles',
    price: 3500,
    condition: 'Good',
    location: 'Paari Hostel',
    date: '1 day ago',
    seller: 'Rohan Verma',
    initials: 'RV',
    description:
      "Used for 1 year for commuting between hostel and tech park. Dual disk brakes, front suspension, 21-speed Shimano gears. Tires are in good shape. Selling since I'm graduating.",
    imageColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    iconType: 'cycle',
    imageSrc:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 3,
    title: 'Apple iPad Air (4th Gen) 64GB Wi-Fi',
    category: 'Electronics',
    price: 26000,
    condition: 'Like New',
    location: 'Tech Park',
    date: '3 hours ago',
    seller: 'Sneha Patel',
    initials: 'SP',
    description:
      'Space Grey color. Comes with the original box, charger, and a magnetic folio case. Screen guard has been installed since day one. Excellent for digital note-taking and lectures.',
    imageColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    iconType: 'tablet',
    imageSrc:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 4,
    title: 'SRM Lab Coat + Protective Goggles',
    category: 'Fashion',
    price: 250,
    condition: 'Brand New',
    location: 'Kaari Hostel',
    date: '5 hours ago',
    seller: 'Varun Sen',
    initials: 'VS',
    description:
      'Standard white lab coat required for Chemistry and Biotech labs. Size L. Never worn because I bought the wrong size. Safety goggles are scratch-free and included.',
    imageColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    iconType: 'apparel',
    imageSrc:
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 5,
    title: 'KENT Electric Kettle (1.8 Liters)',
    category: 'Hostel Essentials',
    price: 600,
    condition: 'Good',
    location: 'MGR Hostel',
    date: '1 day ago',
    seller: 'Priya Nair',
    initials: 'PN',
    description:
      'Works perfectly. Fast boiling (1500W), stainless steel body, auto shut-off, and boil-dry protection. Ideal for making late-night noodles, tea, or coffee in hostels.',
    imageColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    iconType: 'kettle',
    imageSrc:
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 6,
    title: 'Canon EOS 1500D DSLR Camera',
    category: 'Electronics',
    price: 18500,
    condition: 'Brand New',
    location: 'Tech Park',
    date: '4 days ago',
    seller: 'Manasij Nayak',
    initials: 'MN',
    description:
      'Brand new, sealed package. Won it in a college hackathon prize, but I already have a camera and do not need it. Standard 18-55mm IS II kit lens included. Original bill & warranty card inside.',
    imageColor: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    iconType: 'camera',
    imageSrc:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 7,
    title: 'HC Verma Physics Concepts (Vol 1 & 2)',
    category: 'Books',
    price: 300,
    condition: 'Fair',
    location: 'Senbagam Hostel',
    date: '3 days ago',
    seller: 'Riya Sharma',
    initials: 'RS',
    description:
      'Famous textbook set for physics. Has some pencil annotations and highlighted sections, but pages are fully readable and bindings are solid. Best for competitive prep.',
    imageColor: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    iconType: 'book',
    imageSrc:
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 8,
    title: 'Rechargeable LED Desk Lamp (3 Modes)',
    category: 'Hostel Essentials',
    price: 400,
    condition: 'Like New',
    location: 'Estancia',
    date: '12 hours ago',
    seller: 'Kabir Singh',
    initials: 'KS',
    description:
      'Eye-protection LED lamp with 3 brightness levels. Features touch controls, flexible gooseneck, and USB charging. Built-in battery lasts up to 6 hours on a single charge.',
    imageColor: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    iconType: 'lamp',
    imageSrc:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
  },
];

const categories = [
  'All',
  'Books',
  'Electronics',
  'Cycles',
  'Hostel Essentials',
  'Fashion',
  'Others',
];

// Filter configurations
let activeFilters = {
  search: '',
  category: 'All',
  locations: [],
  conditions: [],
  sort: 'newest',
};

let selectedNewListingImage = null;
let activeChatTimeout = null;

// ==================== APP INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts();

  // Set initial position of auth sliding tab indicator
  const tabSlider = document.querySelector('.tab-slider');
  const activeTab = document.querySelector('.tab-btn.active');
  if (tabSlider && activeTab) {
    tabSlider.style.width = `${activeTab.offsetWidth}px`;
    tabSlider.style.left = `${activeTab.offsetLeft}px`;
  }
});

// ==================== AUTH / TAB TOGLE NAVIGATION ====================
function switchAuthTab(tab) {
  const tabSlider = document.querySelector('.tab-slider');
  const signinBtn = document.getElementById('tab-signin-btn');
  const registerBtn = document.getElementById('tab-register-btn');
  const signinForm = document.getElementById('signin-form');
  const registerForm = document.getElementById('register-form');
  const authTitle = document.getElementById('auth-title-text');
  const authDesc = document.getElementById('auth-desc-text');
  const authPrompt = document.getElementById('toggle-auth-prompt');

  if (tab === 'signin') {
    signinBtn.classList.add('active');
    registerBtn.classList.remove('active');
    signinForm.classList.add('active');
    registerForm.classList.remove('active');

    // Position slider
    tabSlider.style.width = `${signinBtn.offsetWidth}px`;
    tabSlider.style.left = `${signinBtn.offsetLeft}px`;

    authTitle.textContent = 'Sign in';
    authDesc.textContent =
      'Buy and sell within campus. Verified students only.';
    authPrompt.innerHTML =
      'New to CampusKArt? <a href="#" onclick="switchAuthTab(\'register\'); return false;">Create account</a>';
  } else {
    signinBtn.classList.remove('active');
    registerBtn.classList.add('active');
    signinForm.classList.remove('active');
    registerForm.classList.add('active');

    // Position slider
    tabSlider.style.width = `${registerBtn.offsetWidth}px`;
    tabSlider.style.left = `${registerBtn.offsetLeft}px`;

    authTitle.textContent = 'Register';
    authDesc.textContent = 'Join the SRM campus market. Sign up in 30 seconds.';
    authPrompt.innerHTML =
      'Already have an account? <a href="#" onclick="switchAuthTab(\'signin\'); return false;">Sign in</a>';
  }
}

function togglePasswordVisibility(fieldId) {
  const passwordField = document.getElementById(fieldId);
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
  } else {
    passwordField.type = 'password';
  }
}

function mockForgotPassword(e) {
  e.preventDefault();
  alert(
    'Password reset instructions have been sent to your SRM NetID student portal.'
  );
}

// ==================== SCREEN SWITCHING ====================
function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.remove('active');
  });

  const targetScreen = document.getElementById(screenId);
  targetScreen.classList.add('active');

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== MARKETPLACE CATEGORIES ====================
function renderCategories() {
  const container = document.getElementById('categories-list');
  if (!container) return;

  container.innerHTML = categories
    .map((cat) => {
      const isActive = activeFilters.category === cat ? 'active' : '';
      return `<button class="category-pill ${isActive}" onclick="handleCategorySelect('${cat}')">${cat}</button>`;
    })
    .join('');
}

function handleCategorySelect(cat) {
  activeFilters.category = cat;
  renderCategories();
  renderProducts();
}

// ==================== FILTERING & SEARCHING ====================
function handleSearch(query) {
  activeFilters.search = query.toLowerCase().trim();
  renderProducts();
}

function handleLocationFilter() {
  const checkedLocations = Array.from(
    document.querySelectorAll('input[name="location"]:checked')
  ).map((el) => el.value);
  activeFilters.locations = checkedLocations;
  renderProducts();
}

function handleConditionFilter() {
  const checkedConditions = Array.from(
    document.querySelectorAll('input[name="condition"]:checked')
  ).map((el) => el.value);
  activeFilters.conditions = checkedConditions;
  renderProducts();
}

function handleSort(sortVal) {
  activeFilters.sort = sortVal;
  renderProducts();
}

function resetFilters() {
  activeFilters = {
    search: '',
    category: 'All',
    locations: [],
    conditions: [],
    sort: 'newest',
  };

  // Reset search box
  document.getElementById('search-input').value = '';

  // Uncheck filter boxes
  document
    .querySelectorAll('input[name="location"]:checked')
    .forEach((el) => (el.checked = false));
  document
    .querySelectorAll('input[name="condition"]:checked')
    .forEach((el) => (el.checked = false));

  // Reset sort dropdown
  document.getElementById('sort-select').value = 'newest';

  renderCategories();
  renderProducts();
  showToast('Filters reset successfully');
}

// ==================== PRODUCT RENDERER ====================
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const emptyState = document.getElementById('empty-state');
  const resultsCount = document.getElementById('results-count');
  const feedTitle = document.getElementById('listings-title');

  if (!grid) return;

  // Filter listings
  let filtered = listings.filter((item) => {
    // 1. Search filter
    const matchesSearch =
      item.title.toLowerCase().includes(activeFilters.search) ||
      item.description.toLowerCase().includes(activeFilters.search) ||
      item.seller.toLowerCase().includes(activeFilters.search);

    // 2. Category filter
    const matchesCategory =
      activeFilters.category === 'All' ||
      item.category === activeFilters.category;

    // 3. Location filter (Check if location matches groups, OR specific string matching)
    let matchesLocation = true;
    if (activeFilters.locations.length > 0) {
      matchesLocation = activeFilters.locations.some((loc) => {
        if (loc === 'Hostels') {
          return item.location.includes('Hostel');
        }
        return item.location.includes(loc);
      });
    }

    // 4. Condition filter
    const matchesCondition =
      activeFilters.conditions.length === 0 ||
      activeFilters.conditions.includes(item.condition);

    return (
      matchesSearch && matchesCategory && matchesLocation && matchesCondition
    );
  });

  // Sort listings
  if (activeFilters.sort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (activeFilters.sort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else {
    // default: newest (by id desc, assuming higher id means newer)
    filtered.sort((a, b) => b.id - a.id);
  }

  // Update counts
  resultsCount.textContent = `Showing ${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;
  feedTitle.textContent =
    activeFilters.category === 'All'
      ? 'Active Listings'
      : `${activeFilters.category} Listings`;

  // Render Grid
  if (filtered.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'flex';
  } else {
    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    grid.innerHTML = filtered
      .map((item) => {
        // Pick SVG symbol based on type
        const icon = getCategoryIconSvg(item.iconType);
        const isCustomImage = item.imageSrc ? true : false;

        return `
        <article class="product-card" onclick="openProductModal('${item.id}')">
          <div class="product-card-image" style="background: ${item.imageColor || 'var(--card-bg)'}">
            ${
              isCustomImage
                ? `<img src="${item.imageSrc}" alt="${item.title}" class="card-img-element">`
                : icon
            }
            <span class="card-badge category">${item.category}</span>
            <span class="card-badge condition">${item.condition}</span>
          </div>
          <div class="product-card-body">
            <h3 class="product-title" title="${item.title}">${item.title}</h3>
            <div class="product-pricing">
              <span class="price">₹${item.price}</span>
              <span class="location-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loc-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${item.location}
              </span>
            </div>
            <div class="product-footer">
              <div class="seller-bubble">
                <div class="avatar-mini">${item.initials}</div>
                <span class="seller-name">${item.seller}</span>
              </div>
              <span class="card-time">${item.date}</span>
            </div>
          </div>
        </article>
      `;
      })
      .join('');
  }
}

// ==================== PRODUCT DETAILS DRAWERS ====================
let currentActiveListing = null;

function openProductModal(id) {
  const item = listings.find((l) => l.id == id || l.id === id);
  if (!item) return;

  currentActiveListing = item;
  currentModalListingId = item.id;
  checkIfSaved(item.id);
  // Populate elements
  document.getElementById('modal-badge-category').textContent = item.category;
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-price').textContent = `₹${item.price}`;
  document.getElementById('modal-condition').textContent = item.condition;
  document.getElementById('modal-location').textContent = item.location;
  document.getElementById('modal-description').textContent = item.description;
  document.getElementById('modal-seller-name').textContent = item.seller;
  document.getElementById('modal-seller-avatar').textContent = item.initials;

  // Custom image or gradient render
  const imgPanel = document.getElementById('modal-image-panel');
  if (item.imageSrc) {
    imgPanel.style.background = 'var(--body-bg)';
    imgPanel.innerHTML = `<img src="${item.imageSrc}" alt="${item.title}" class="detail-main-img">`;
  } else {
    imgPanel.style.background = item.imageColor;
    imgPanel.innerHTML = getCategoryIconSvg(item.iconType, true);
  }

  // Update classes
  document.getElementById('modal-condition').className =
    `detail-condition ${item.condition.toLowerCase().replace(' ', '-')}`;

  // Hide chat box initially
  document.getElementById('sim-chat-box').classList.remove('active');
  document.getElementById('chat-messages-container').innerHTML = `
    <div class="msg system-msg">You are initiating secure campus contact. Be safe and meet in public areas.</div>
    <div class="msg seller-msg" id="chat-intro-msg">Hi! The ${item.title.split(' ')[0]} is still available. When would you like to collect it?</div>
  `;
  document.getElementById('chat-seller-name').textContent =
    item.seller.split(' ')[0];

  // Show modal
  const modal = document.getElementById('product-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // disable scroll
}

function closeProductModal(event = null) {
  if (activeChatTimeout) clearTimeout(activeChatTimeout);

  const modal = document.getElementById('product-modal');
  modal.classList.remove('active');
  document.body.style.overflow = ''; // enable scroll
  currentActiveListing = null;
}

// ==================== SIMULATED CHAT MODULE ====================
function startSimulatedChat() {
  const chatBox = document.getElementById('sim-chat-box');
  chatBox.classList.add('active');

  // Smooth scroll chat into view
  setTimeout(() => {
    chatBox.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
}

function sendChatMessage(event) {
  event.preventDefault();
  const inputField = document.getElementById('chat-input-field');
  const msgText = inputField.value.trim();
  if (!msgText || !currentActiveListing) return;

  const chatContainer = document.getElementById('chat-messages-container');

  // Render user message
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'msg user-msg';
  userMsgEl.textContent = msgText;
  chatContainer.appendChild(userMsgEl);

  // Reset input field
  inputField.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Clear previous pending responses
  if (activeChatTimeout) clearTimeout(activeChatTimeout);

  // Set typing indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'msg seller-msg typing-msg';
  typingEl.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

  activeChatTimeout = setTimeout(() => {
    chatContainer.appendChild(typingEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    activeChatTimeout = setTimeout(() => {
      // Remove typing dot
      typingEl.remove();

      // Auto-replies mapping based on listing type
      let reply = 'Hey! That works for me. When can you meet on campus?';
      const lowerMsg = msgText.toLowerCase();

      if (
        lowerMsg.includes('price') ||
        lowerMsg.includes('negotiate') ||
        lowerMsg.includes('discount')
      ) {
        const discountedPrice = Math.round(currentActiveListing.price * 0.9);
        reply = `I can drop the price slightly to ₹${discountedPrice} if you pick it up today. Let me know!`;
      } else if (
        lowerMsg.includes('where') ||
        lowerMsg.includes('meet') ||
        lowerMsg.includes('pickup')
      ) {
        reply = `We can meet outside ${currentActiveListing.location} or at the Tech Park Food Court. Let me know what time works!`;
      } else if (
        lowerMsg.includes('time') ||
        lowerMsg.includes('tomorrow') ||
        lowerMsg.includes('today')
      ) {
        reply =
          "I'm free after my lab classes end at 4:00 PM. We can meet up then near the library.";
      } else if (
        lowerMsg.includes('condition') ||
        lowerMsg.includes('working') ||
        lowerMsg.includes('damage')
      ) {
        reply = `It's in ${currentActiveListing.condition.toLowerCase()} condition as described. You can inspect it thoroughly when we meet before paying.`;
      }

      const sellerMsgEl = document.createElement('div');
      sellerMsgEl.className = 'msg seller-msg';
      sellerMsgEl.textContent = reply;
      chatContainer.appendChild(sellerMsgEl);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 1500);
  }, 500);
}

// ==================== NEW LISTING SYSTEM ====================
function openSellModal() {
  if (!currentUser) {
    showToast('Please sign in to list items.');
    switchScreen('auth-screen');
    return;
  }
  document.getElementById('sell-form').reset();
  removeImageSelect();
  const modal = document.getElementById('sell-modal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSellModal(event = null) {
  const modal = document.getElementById('sell-modal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function triggerFileInput() {
  document.getElementById('sell-image-file').click();
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    selectedNewListingImage = e.target.result;
    document.getElementById('image-preview-element').src =
      selectedNewListingImage;
    document.getElementById('upload-zone-content').style.display = 'none';
    document.getElementById('upload-zone-preview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function removeImageSelect(event = null) {
  if (event) event.stopPropagation(); // prevent triggering upload trigger
  selectedNewListingImage = null;
  document.getElementById('sell-image-file').value = '';
  document.getElementById('upload-zone-content').style.display = 'flex';
  document.getElementById('upload-zone-preview').style.display = 'none';
}

async function handleNewListing(event) {
  event.preventDefault();
  const title = document.getElementById('sell-title').value.trim();
  const category = document.getElementById('sell-category').value;
  const price = parseInt(document.getElementById('sell-price').value);
  const condition = document.getElementById('sell-condition').value;
  const location = document.getElementById('sell-location').value;
  const description = document.getElementById('sell-description').value.trim();

  // Show loading
  const btn = event.target.querySelector('.primary-btn');
  if (btn) {
    btn.textContent = 'Publishing...';
    btn.disabled = true;
  }

  // Save to Supabase
  const { data, error } = await db
    .from('listings')
    .insert({
      title: title,
      category: category,
      price: price,
      condition: condition,
      hostel_block: location,
      description: description,
      status: 'active',
      user_id: currentUser.id,
      images: selectedNewListingImage ? [selectedNewListingImage] : [],
    })
    .select();

  if (error) {
    console.error('Error saving listing:', error);
    alert('Failed to publish listing: ' + error.message);
    if (btn) {
      btn.textContent = 'Publish Listing';
      btn.disabled = false;
    }
    return;
  }

  console.log('✅ Listing saved to Supabase:', data);
  closeSellModal();

  // Reload listings from Supabase
  await loadListingsFromSupabase();
  showToast('Listing published successfully!');
}

// ==================== OTHER HELPERS ====================
function openMyListings() {
  closeProfileDropdown();

  // Set search filter to currentUser name
  activeFilters.search = currentUser.name.toLowerCase();

  // Highlight search or update text
  document.getElementById('search-input').value = currentUser.name;

  renderProducts();
  showToast('Showing your listings');
}

function getInitials(name) {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function toggleProfileDropdown() {
  const dropdown = document.getElementById('profile-dropdown');
  dropdown.classList.toggle('active');
}

function closeProfileDropdown() {
  const dropdown = document.getElementById('profile-dropdown');
  if (dropdown) dropdown.classList.remove('active');
}

// Close dropdown on click outside
window.addEventListener('click', (e) => {
  const avatar = document.getElementById('user-profile-btn');
  const dropdown = document.getElementById('profile-dropdown');
  if (
    avatar &&
    dropdown &&
    !avatar.contains(e.target) &&
    !dropdown.contains(e.target)
  ) {
    closeProfileDropdown();
  }
});

// Toast Notifications System
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toast-icon">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // Animate slide-in
  setTimeout(() => toast.classList.add('active'), 10);

  // Remove after 3s
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// Map category key to inline HTML SVGs
function getCategoryIconSvg(type, isLarge = false) {
  const size = isLarge ? 'large-icon' : 'grid-icon';
  switch (type) {
    case 'book':
      return `<svg class="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5v-15z"></path></svg>`;
    case 'cycle':
      return `<svg class="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle><path d="M15 13.5L9 9l4-4.5"></path><path d="M12 9H6.5L3 13.5"></path><polyline points="12 9 16 9 18 13.5"></polyline></svg>`;
    case 'tablet':
      return `<svg class="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" transform="rotate(180 12 12)"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    case 'apparel':
      return `<svg class="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.62 2V12a8 8 0 0 0 16 0V5.46a2 2 0 0 0-1.62-2z"></path></svg>`;
    case 'kettle':
    case 'lamp':
      return `<svg class="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h-2M6.34 17.66l-1.41 1.41M12 22v-2M17.66 17.66l1.41 1.41M2 12h2M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path></svg>`;
    default:
      return `<svg class="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`;
  }
}
// Test Supabase connection
// Check if user is already logged in when page loads
async function initApp() {
  const {
    data: { session },
  } = await db.auth.getSession();

  if (session) {
    // User is already logged in
    currentUser = session.user;
    showMainApp();
    console.log('✅ Already logged in as:', currentUser.email);
  } else {
    // No session, show auth screen
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('marketplace-screen').classList.remove('active');
    console.log('No session, showing login');
  }
}

// Run when page loads
initApp();
// ==================== AUTH FUNCTIONS ====================

async function handleSignIn(event) {
  event.preventDefault();

  const emailPrefix = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const email = emailPrefix + '@srmist.edu.in';

  const btn = event.target.querySelector('.submit-btn');
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  const { data, error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Login failed: ' + error.message);
    btn.textContent = 'Sign in to CampusKArt';
    btn.disabled = false;
    return;
  }

  currentUser = data.user;
  showMainApp();
}

async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('reg-name').value.trim();
  const emailPrefix = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const email = emailPrefix + '@srmist.edu.in';
  const btn = event.target.querySelector('.submit-btn');
  if (!emailPrefix) {
    alert('Please enter your SRM email prefix');
    return;
  }

  // Prevent entering full email or non-SRM domain
  if (emailPrefix.includes('@')) {
    alert(
      'Please enter only your NetID prefix, not the full email.\n\nExample: if your email is mn1234@srmist.edu.in, just type mn1234'
    );
    btn.textContent = 'Create Account';
    btn.disabled = false;
    return;
  }

  // Validate prefix format (only letters and numbers)
  if (!/^[a-zA-Z0-9.]+$/.test(emailPrefix)) {
    alert('Invalid email prefix. Only letters, numbers and dots allowed.');
    btn.textContent = 'Create Account';
    btn.disabled = false;
    return;
  }

  btn.textContent = 'Creating account...';
  btn.disabled = true;

  const { data, error } = await db.auth.signUp({ email, password });

  if (error) {
    alert('Registration failed: ' + error.message);
    btn.textContent = 'Create Account';
    btn.disabled = false;
    return;
  }

  await db.from('users').insert({
    id: data.user.id,
    name: name,
    email: email,
  });

  alert(
    'Account created! \n\nA verification link has been sent to your SRM email inbox.\n\nPlease check your email and click the link to activate your account before signing in.'
  );
  btn.textContent = 'Create Account';
  btn.disabled = false;
  switchAuthTab('signin');
}
function showMainApp() {
  // Hide auth screen
  document.getElementById('auth-screen').classList.remove('active');

  // Show marketplace screen
  document.getElementById('marketplace-screen').classList.add('active');

  // Update user name in navbar if it exists
  const userNameEl = document.getElementById('user-name');
  if (userNameEl && currentUser) {
    userNameEl.textContent = currentUser.email.split('@')[0];
  }

  console.log('✅ Logged in as:', currentUser.email);
  loadListingsFromSupabase();
}
async function handleLogout() {
  const { error } = await db.auth.signOut();

  if (error) {
    console.error('Logout error:', error);
    return;
  }

  // Reset current user
  currentUser = null;

  // Hide marketplace, show auth
  document.getElementById('marketplace-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');

  console.log('✅ Logged out successfully');
}
// ==================== SUPABASE LISTINGS ====================
async function loadListingsFromSupabase() {
  const { data, error } = await db
    .from('listings')
    .select('*, users(name)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading listings:', error);
    return;
  }

  if (data && data.length > 0) {
    // Convert Supabase data to match your existing listing format
    listings = data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      price: item.price,
      category: item.category,
      condition: item.condition,
      location: item.hostel_block || 'SRM Campus',
      date: new Date(item.created_at).toLocaleDateString('en-IN'),
      seller: item.users?.name || 'SRM Student',
      initials: getInitials(item.users?.name || 'SRM Student'),
      imageSrc: item.images?.[0] || null,
      iconType: item.category.toLowerCase(),
      imageColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }));

    renderProducts();
    console.log('✅ Loaded', listings.length, 'listings from Supabase');
  } else {
    console.log('No listings yet in database');
    renderProducts(); // will show empty state
  }
}
// ==================== SAVED ITEMS ====================
let currentModalListingId = null;

async function toggleSaveListing() {
  if (!currentUser) {
    alert('Please sign in first');
    return;
  }

  const btn = document.getElementById('modal-save-btn');

  // Check if already saved
  const { data: existing } = await db
    .from('saved_items')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('listing_id', currentModalListingId)
    .single();

  if (existing) {
    // Unsave
    await db
      .from('saved_items')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('listing_id', currentModalListingId);
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Save Item`;
    showToast('Removed from saved items');
  } else {
    // Save
    await db.from('saved_items').insert({
      user_id: currentUser.id,
      listing_id: currentModalListingId,
    });
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Saved ✓`;
    showToast('Item saved successfully!');
  }
}

async function checkIfSaved(listingId) {
  if (!currentUser) return;

  const { data } = await db
    .from('saved_items')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('listing_id', listingId)
    .single();

  const btn = document.getElementById('modal-save-btn');
  if (btn) {
    if (data) {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Saved ✓`;
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg> Save Item`;
    }
  }
}

// ==================== REAL MESSAGING ====================
async function startRealChat(listingId, sellerId) {
  if (!currentUser) {
    alert('Please sign in first');
    return;
  }
  if (currentUser.id === sellerId) {
    alert("You can't message yourself!");
    return;
  }

  document.getElementById('sim-chat-box').style.display = 'flex';

  // Load existing messages
  const { data: messages } = await db
    .from('messages')
    .select('*')
    .eq('listing_id', listingId)
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    .order('sent_at', { ascending: true });

  const container = document.getElementById('chat-messages-container');
  container.innerHTML = `
    <div class="msg system-msg">
      Secure campus chat. Be safe and meet in public areas.
    </div>
  `;

  if (messages && messages.length > 0) {
    messages.forEach((msg) => {
      const isMine = msg.sender_id === currentUser.id;
      container.innerHTML += `
        <div class="msg ${isMine ? 'user-msg' : 'seller-msg'}">
          ${msg.message}
        </div>
      `;
    });
  }

  container.scrollTop = container.scrollHeight;
}

async function sendRealMessage(event, listingId, sellerId) {
  event.preventDefault();
  const input = document.getElementById('chat-input-field');
  const message = input.value.trim();
  if (!message) return;

  const { error } = await db.from('messages').insert({
    sender_id: currentUser.id,
    receiver_id: sellerId,
    listing_id: listingId,
    message: message,
  });

  if (error) {
    console.error('Message error:', error);
    return;
  }

  // Add message to UI
  const container = document.getElementById('chat-messages-container');
  container.innerHTML += `
    <div class="msg user-msg">${message}</div>
  `;
  container.scrollTop = container.scrollHeight;
  input.value = '';
}
// ==================== SAVED ITEMS PAGE ====================
async function openSavedItems() {
  closeProfileDropdown();

  const { data, error } = await db
    .from('saved_items')
    .select('*, listings(*, users(name))')
    .eq('user_id', currentUser.id)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error loading saved items:', error);
    return;
  }

  // Build modal to show saved items
  const existingModal = document.getElementById('saved-items-modal');
  if (existingModal) existingModal.remove();

  const savedModal = document.createElement('div');
  savedModal.id = 'saved-items-modal';
  savedModal.className = 'modal-backdrop active';
  savedModal.onclick = (e) => {
    if (e.target === savedModal) savedModal.remove();
  };

  const items = data || [];

  savedModal.innerHTML = `
    <div class="modal-content" onclick="event.stopPropagation()" style="max-width:600px; width:90%; padding:24px; border-radius:16px; background:var(--card-bg); max-height:80vh; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="font-size:1.3rem;">🔖 Saved Items (${items.length})</h2>
        <button onclick="document.getElementById('saved-items-modal').remove()" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:1.5rem;">✕</button>
      </div>
      ${
        items.length === 0
          ? `<p style="text-align:center; color:var(--text-secondary); padding:40px 0;">No saved items yet.<br>Click the bookmark icon on any listing!</p>`
          : items
              .map(
                (item) => `
          <div style="display:flex; gap:16px; padding:16px; border:1px solid var(--card-border); border-radius:12px; margin-bottom:12px; cursor:pointer;" 
               onclick="document.getElementById('saved-items-modal').remove(); openProductModal('${item.listing_id}')">
            <div style="width:60px; height:60px; border-radius:8px; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              ${
                item.listings?.images?.[0]
                  ? `<img src="${item.listings.images[0]}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
                  : '🛍️'
              }
            </div>
            <div style="flex:1;">
              <h4 style="margin:0 0 4px; font-size:0.95rem;">${item.listings?.title || 'Item'}</h4>
              <p style="margin:0; color:var(--primary); font-weight:600;">₹${item.listings?.price || 0}</p>
              <p style="margin:4px 0 0; font-size:0.8rem; color:var(--text-secondary);">${item.listings?.condition || ''} • ${item.listings?.hostel_block || 'SRM Campus'}</p>
            </div>
          </div>
        `
              )
              .join('')
      }
    </div>
  `;

  document.body.appendChild(savedModal);
}
