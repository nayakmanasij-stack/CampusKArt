// CampusKArt - Core Application Logic & State Management

// ==================== STATE MANAGEMENT ====================
const SUPABASE_URL = 'https://fmwyjacbituidkilijov.supabase.co';
const SUPABASE_KEY = 'sb_publishable_P64osVyCpezBoyCL9mfaCQ_4AYQ9KYa';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
let currentUser = null;

// Initial mockup data for CampusKArt listings
let listings = [];

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
async function handleSearch(query) {
  activeFilters.search = query.toLowerCase().trim();

  if (!activeFilters.search) {
    // If search is empty, load all listings
    await loadListingsFromSupabase();
    return;
  }

  // Search directly in Supabase
  const { data, error } = await db
    .from('listings')
    .select('*, users(name, verified)')
    .eq('status', 'active')
    .or(
      `title.ilike.%${activeFilters.search}%,description.ilike.%${activeFilters.search}%`
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Search error:', error);
    return;
  }

  // Update listings array with search results
  listings = (data || []).map((item) => ({
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
    user_id: item.user_id,
    user_id: item.user_id,
    verified: item.users?.verified || false,
    views: item.views || 0,
  }));

  renderProducts();
  console.log(
    `✅ Found ${listings.length} results for "${activeFilters.search}"`
  );
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
${
  item.verified
    ? `<span style="
  font-size:0.65rem; color:#10b981; font-weight:700;
  background:rgba(16,185,129,0.1); padding:1px 6px;
  border-radius:20px; border:1px solid rgba(16,185,129,0.2);
">✓</span>`
    : ''
}
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
  // Increment view counter
  db.from('listings')
    .update({ views: (item.views || 0) + 1 })
    .eq('id', item.id)
    .then(() => console.log('View counted'));
  checkIfSaved(item.id);
  // Populate elements
  document.getElementById('modal-badge-category').textContent = item.category;
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-price').textContent = `₹${item.price}`;
  document.getElementById('modal-condition').textContent = item.condition;
  document.getElementById('modal-location').textContent = item.location;
  document.getElementById('modal-description').textContent = item.description;
  document.getElementById('modal-date').textContent = item.date;
  document.getElementById('modal-date').textContent = item.date;
  const viewsEl = document.getElementById('modal-views');
  if (viewsEl) viewsEl.textContent = (item.views || 0) + 1 + ' views';
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

async function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Show preview immediately
  const reader = new FileReader();
  reader.onload = function (e) {
    document.getElementById('image-preview-element').src = e.target.result;
    document.getElementById('upload-zone-content').style.display = 'none';
    document.getElementById('upload-zone-preview').style.display = 'block';
  };
  reader.readAsDataURL(file);

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

  const { data, error } = await db.storage
    .from('listing-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Image upload error:', error);
    alert('Image upload failed: ' + error.message);
    return;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = db.storage.from('listing-images').getPublicUrl(fileName);

  selectedNewListingImage = publicUrl;
  console.log('✅ Image uploaded:', publicUrl);
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
async function openMyListings() {
  closeProfileDropdown();

  const { data, error } = await db
    .from('listings')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading listings:', error);
    return;
  }

  const existingModal = document.getElementById('my-listings-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'my-listings-modal';
  modal.className = 'modal-backdrop active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  const items = data || [];

  modal.innerHTML = `
    <div onclick="event.stopPropagation()" style="
      width: 90%; max-width: 680px;
      background: rgba(13, 18, 30, 0.95);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,0.6);
      max-height: 85vh;
      display: flex;
      flex-direction: column;
    ">
      <!-- Header -->
      <div style="
        padding: 24px 28px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(139,92,246,0.04);
      ">
        <div>
          <h2 style="font-size:1.25rem; font-weight:700; color:#f3f4f6; letter-spacing:-0.02em;">My Listings</h2>
          <p style="font-size:0.8rem; color:#9ca3af; margin-top:2px;">${items.length} item${items.length !== 1 ? 's' : ''} posted</p>
        </div>
        <button onclick="document.getElementById('my-listings-modal').remove()" style="
          width:36px; height:36px; border-radius:50%;
          background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.08);
          color:#9ca3af; cursor:pointer; font-size:1.1rem;
          display:flex; align-items:center; justify-content:center;
          transition: all 0.2s;
        ">✕</button>
      </div>

      <!-- Body -->
      <div style="overflow-y:auto; padding:20px 28px; flex:1;">
        ${
          items.length === 0
            ? `
          <div style="text-align:center; padding:60px 0;">
            <div style="font-size:3rem; margin-bottom:12px;">📦</div>
            <h3 style="color:#f3f4f6; font-size:1rem; margin-bottom:8px;">No listings yet</h3>
            <p style="color:#9ca3af; font-size:0.85rem;">Post your first item to get started</p>
          </div>
        `
            : items
                .map(
                  (item) => `
          <div style="
            display:flex; gap:16px; align-items:center;
            padding:16px; margin-bottom:12px;
            background:rgba(255,255,255,0.02);
            border:1px solid rgba(255,255,255,0.06);
            border-radius:14px;
            transition: all 0.2s;
          ">
            <!-- Image -->
            <div style="
              width:72px; height:72px; border-radius:10px; overflow:hidden; flex-shrink:0;
              background:linear-gradient(135deg,#8b5cf6,#3d3f98);
              display:flex; align-items:center; justify-content:center;
            ">
              ${
                item.images?.[0]
                  ? `<img src="${item.images[0]}" style="width:100%;height:100%;object-fit:cover;">`
                  : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`
              }
            </div>

            <!-- Info -->
            <div style="flex:1; min-width:0;">
              <h4 style="
                font-size:0.95rem; font-weight:600; color:#f3f4f6;
                margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
              ">${item.title}</h4>
              <p style="font-size:1rem; font-weight:700; color:#8b5cf6; margin-bottom:4px;">₹${item.price}</p>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="
                  font-size:0.75rem; color:#9ca3af;
                  background:rgba(255,255,255,0.04);
                  padding:2px 8px; border-radius:20px;
                  border:1px solid rgba(255,255,255,0.06);
                ">${item.condition}</span>
                <span style="
                  font-size:0.75rem; font-weight:600;
                  color:${item.status === 'sold' ? '#ef4444' : '#10b981'};
                  background:${item.status === 'sold' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'};
                  padding:2px 8px; border-radius:20px;
                  border:1px solid ${item.status === 'sold' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'};
                ">${item.status === 'sold' ? '● Sold' : '● Active'}</span>
              </div>
            </div>

            <!-- Actions -->
            <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
              <button onclick="editListing('${item.id}')" style="
                padding:7px 16px; border-radius:8px; font-size:0.8rem; font-weight:600;
                border:1px solid rgba(139,92,246,0.4);
                background:rgba(139,92,246,0.1); color:#8b5cf6;
                cursor:pointer; transition:all 0.2s; white-space:nowrap;
              ">✏️ Edit</button>
              ${
                item.status !== 'sold'
                  ? `
              <button onclick="markAsSold('${item.id}')" style="
                padding:7px 16px; border-radius:8px; font-size:0.8rem; font-weight:600;
                border:1px solid rgba(16,185,129,0.4);
                background:rgba(16,185,129,0.1); color:#10b981;
                cursor:pointer; transition:all 0.2s; white-space:nowrap;
              ">✅ Mark Sold</button>`
                  : ''
              }
              <button onclick="deleteListing('${item.id}')" style="
                padding:7px 16px; border-radius:8px; font-size:0.8rem; font-weight:600;
                border:1px solid rgba(239,68,68,0.3);
                background:rgba(239,68,68,0.08); color:#ef4444;
                cursor:pointer; transition:all 0.2s; white-space:nowrap;
              ">🗑️ Delete</button>
            </div>
          </div>
        `
                )
                .join('')
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);
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
async function showMainApp() {
  // Ensure user exists in users table
  const { data: existingUser } = await db
    .from('users')
    .select('id')
    .eq('id', currentUser.id)
    .single();

  if (!existingUser) {
    await db.from('users').insert({
      id: currentUser.id,
      name: currentUser.email.split('@')[0],
      email: currentUser.email,
    });
  }

  // Hide auth screen
  document.getElementById('auth-screen').classList.remove('active');

  // Show marketplace screen
  document.getElementById('marketplace-screen').classList.add('active');

  const userNameEl = document.getElementById('user-name');
  if (userNameEl && currentUser) {
    userNameEl.textContent = currentUser.email.split('@')[0];
  }
  // Update dropdown with real user info
  const dropdownName = document.getElementById('dropdown-name');
  const dropdownEmail = document.getElementById('dropdown-email');
  const userInitials = document.getElementById('user-initials');

  if (dropdownName) dropdownName.textContent = currentUser.email.split('@')[0];
  if (dropdownEmail) dropdownEmail.textContent = currentUser.email;
  if (userInitials)
    userInitials.textContent = getInitials(currentUser.email.split('@')[0]);

  loadListingsFromSupabase();
  checkUnreadMessages();
  // Check for new messages every 30 seconds
  setInterval(checkUnreadMessages, 30000);
  console.log('✅ Logged in as:', currentUser.email);
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
    .select('*, users(name, verified)')
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
let activeRealtimeChannel = null;

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
          <span style="font-size:0.65rem; opacity:0.5; display:block; margin-top:2px;">
            ${new Date(msg.sent_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      `;
    });
  }

  container.scrollTop = container.scrollHeight;

  // Mark messages as read
  await db
    .from('messages')
    .update({ read: true })
    .eq('listing_id', listingId)
    .eq('receiver_id', currentUser.id);

  // Unsubscribe from previous channel
  if (activeRealtimeChannel) {
    db.removeChannel(activeRealtimeChannel);
  }

  // Subscribe to real-time updates
  activeRealtimeChannel = db
    .channel(`messages:${listingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `listing_id=eq.${listingId}`,
      },
      (payload) => {
        const msg = payload.new;
        // Only show if it's for this conversation
        if (
          msg.sender_id === currentUser.id ||
          msg.receiver_id === currentUser.id
        ) {
          const isMine = msg.sender_id === currentUser.id;
          // Avoid duplicate messages
          const container = document.getElementById('chat-messages-container');
          if (container) {
            container.innerHTML += `
            <div class="msg ${isMine ? 'user-msg' : 'seller-msg'}">
              ${msg.message}
              <span style="font-size:0.65rem; opacity:0.5; display:block; margin-top:2px;">
                ${new Date(msg.sent_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          `;
            container.scrollTop = container.scrollHeight;
          }
        }
      }
    )
    .subscribe();

  console.log('✅ Real-time chat started for listing:', listingId);
}

async function sendRealMessage(event, listingId, sellerId) {
  event.preventDefault();
  const input = document.getElementById('chat-input-field');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';

  const { error } = await db.from('messages').insert({
    sender_id: currentUser.id,
    receiver_id: sellerId,
    listing_id: listingId,
    message: message,
  });

  if (error) {
    console.error('Message error:', error);
    input.value = message; // restore on error
    return;
  }
  // Realtime will handle displaying the message
}
// ==================== SAVED ITEMS PAGE ====================
async function openSavedItems() {
  closeProfileDropdown();

  const { data, error } = await db
    .from('saved_items')
    .select('*, listings(*, users(name, verified))')
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
// ==================== LISTING MANAGEMENT ====================

async function markAsSold(listingId) {
  if (!confirm('Mark this item as sold?')) return;

  const { error } = await db
    .from('listings')
    .update({ status: 'sold' })
    .eq('id', listingId)
    .eq('user_id', currentUser.id);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  showToast('Item marked as sold!');
  loadListingsFromSupabase();
  openMyListings();
}

async function deleteListing(listingId) {
  if (
    !confirm(
      'Are you sure you want to delete this listing? This cannot be undone.'
    )
  )
    return;

  const { error } = await db
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', currentUser.id);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  showToast('Listing deleted!');
  loadListingsFromSupabase();
  openMyListings();
}

async function editListing(listingId) {
  const { data: item, error } = await db
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (error || !item) {
    alert('Could not load listing');
    return;
  }

  document.getElementById('my-listings-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'edit-listing-modal';
  modal.className = 'modal-backdrop active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.innerHTML = `
    <div onclick="event.stopPropagation()" style="
      width:90%; max-width:500px;
      background:rgba(13,18,30,0.95);
      backdrop-filter:blur(24px);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:20px; overflow:hidden;
      box-shadow:0 32px 80px rgba(0,0,0,0.6);
    ">
      <!-- Header -->
      <div style="
        padding:22px 28px 18px;
        border-bottom:1px solid rgba(255,255,255,0.06);
        display:flex; justify-content:space-between; align-items:center;
        background:rgba(139,92,246,0.04);
      ">
        <div>
          <h2 style="font-size:1.1rem; font-weight:700; color:#f3f4f6;">Edit Listing</h2>
          <p style="font-size:0.78rem; color:#9ca3af; margin-top:2px;">Update your listing details</p>
        </div>
        <button onclick="document.getElementById('edit-listing-modal').remove()" style="
          width:34px; height:34px; border-radius:50%;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          color:#9ca3af; cursor:pointer; font-size:1rem;
        ">✕</button>
      </div>

      <!-- Form -->
      <div style="padding:24px 28px; display:flex; flex-direction:column; gap:18px;">
        <div>
          <label style="font-size:0.78rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Title</label>
          <input id="edit-title" value="${item.title}" style="
            width:100%; margin-top:6px; padding:11px 14px;
            background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
            border-radius:10px; color:#f3f4f6; font-size:0.9rem; font-family:inherit;
            outline:none; transition:border 0.2s;
          ">
        </div>
        <div>
          <label style="font-size:0.78rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Price (₹)</label>
          <input id="edit-price" type="number" value="${item.price}" style="
            width:100%; margin-top:6px; padding:11px 14px;
            background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
            border-radius:10px; color:#f3f4f6; font-size:0.9rem; font-family:inherit;
            outline:none;
          ">
        </div>
        <div>
          <label style="font-size:0.78rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Description</label>
          <textarea id="edit-description" rows="3" style="
            width:100%; margin-top:6px; padding:11px 14px;
            background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
            border-radius:10px; color:#f3f4f6; font-size:0.9rem; font-family:inherit;
            outline:none; resize:vertical;
          ">${item.description || ''}</textarea>
        </div>
        <div>
          <label style="font-size:0.78rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Condition</label>
          <select id="edit-condition" style="
            width:100%; margin-top:6px; padding:11px 14px;
            background:rgba(17,24,39,0.9); border:1px solid rgba(255,255,255,0.08);
            border-radius:10px; color:#f3f4f6; font-size:0.9rem; font-family:inherit;
            outline:none;
          ">
            <option ${item.condition === 'Brand New' ? 'selected' : ''}>Brand New</option>
            <option ${item.condition === 'Like New' ? 'selected' : ''}>Like New</option>
            <option ${item.condition === 'Good' ? 'selected' : ''}>Good</option>
            <option ${item.condition === 'Fair' ? 'selected' : ''}>Fair</option>
          </select>
        </div>
        <button onclick="saveEditedListing('${item.id}')" style="
          padding:13px; border-radius:12px; font-size:0.95rem; font-weight:700;
          background:linear-gradient(135deg,#8b5cf6,#3d3f98);
          color:white; border:none; cursor:pointer;
          box-shadow:0 4px 20px rgba(139,92,246,0.3);
          transition:all 0.2s; font-family:inherit;
        ">Save Changes</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}
async function saveEditedListing(listingId) {
  const title = document.getElementById('edit-title').value.trim();
  const price = parseInt(document.getElementById('edit-price').value);
  const description = document.getElementById('edit-description').value.trim();
  const condition = document.getElementById('edit-condition').value;

  if (!title || !price) {
    alert('Title and price are required!');
    return;
  }

  const { error } = await db
    .from('listings')
    .update({ title, price, description, condition })
    .eq('id', listingId)
    .eq('user_id', currentUser.id);

  if (error) {
    alert('Error saving: ' + error.message);
    return;
  }

  showToast('Listing updated successfully!');
  document.getElementById('edit-listing-modal')?.remove();
  loadListingsFromSupabase();
}
// ==================== USER PROFILE ====================
async function openProfile() {
  closeProfileDropdown();

  // Fetch user data from users table
  const { data: userData } = await db
    .from('users')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  // Fetch user's listing count
  const { count: listingCount } = await db
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', currentUser.id);

  // Fetch saved items count
  const { count: savedCount } = await db
    .from('saved_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', currentUser.id);

  const user = userData || {};
  const name = user.name || currentUser.email.split('@')[0];
  const initials = getInitials(name);

  const existingModal = document.getElementById('profile-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'profile-modal';
  modal.className = 'modal-backdrop active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.innerHTML = `
    <div onclick="event.stopPropagation()" style="
      width:90%; max-width:520px;
      background:rgba(13,18,30,0.97);
      backdrop-filter:blur(24px);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:24px; overflow:hidden;
      box-shadow:0 32px 80px rgba(0,0,0,0.7);
    ">
      <!-- Cover + Avatar -->
      <div style="
        height:110px;
        background:linear-gradient(135deg,#8b5cf6 0%,#3d3f98 50%,#1e1b4b 100%);
        position:relative;
      ">
        <!-- Close button -->
        <button onclick="document.getElementById('profile-modal').remove()" style="
          position:absolute; top:14px; right:14px;
          width:32px; height:32px; border-radius:50%;
          background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.15);
          color:white; cursor:pointer; font-size:0.9rem;
          display:flex; align-items:center; justify-content:center;
        ">✕</button>

        <!-- Avatar -->
        <div style="
          position:absolute; bottom:-40px; left:28px;
          width:80px; height:80px; border-radius:50%;
          border:3px solid rgba(13,18,30,0.97);
          overflow:hidden; cursor:pointer;
          background:linear-gradient(135deg,#8b5cf6,#3d3f98);
          display:flex; align-items:center; justify-content:center;
        " onclick="document.getElementById('avatar-upload').click()">
          ${
            user.avatar_url
              ? `<img src="${user.avatar_url}" style="width:100%;height:100%;object-fit:cover;">`
              : `<span style="font-size:1.8rem;font-weight:700;color:white;">${initials}</span>`
          }
          <div style="
            position:absolute; inset:0; background:rgba(0,0,0,0.4);
            display:flex; align-items:center; justify-content:center;
            opacity:0; transition:opacity 0.2s;
            border-radius:50%;
          " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
            <span style="font-size:1.2rem;">📷</span>
          </div>
        </div>
        <input type="file" id="avatar-upload" accept="image/*" style="display:none" onchange="uploadAvatar(event)">
      </div>

      <!-- Profile Info -->
      <div style="padding:52px 28px 28px;">
        <!-- Name & Email -->
        <div style="margin-bottom:20px;">
          <h2 style="font-size:1.3rem; font-weight:700; color:#f3f4f6; margin-bottom:4px;">${name}</h2>
          <p style="font-size:0.85rem; color:#8b5cf6;">${currentUser.email}</p>
          <div style="display:flex; align-items:center; gap:6px; margin-top:6px;">
            <span style="
              font-size:0.75rem; color:#10b981; font-weight:600;
              background:rgba(16,185,129,0.1); padding:3px 10px;
              border-radius:20px; border:1px solid rgba(16,185,129,0.2);
            ">✓ SRM Verified</span>
          </div>
        </div>

        <!-- Stats -->
        <div style="
          display:grid; grid-template-columns:1fr 1fr;
          gap:12px; margin-bottom:24px;
        ">
          <div style="
            padding:16px; border-radius:14px;
            background:rgba(139,92,246,0.08);
            border:1px solid rgba(139,92,246,0.15);
            text-align:center;
          ">
            <p style="font-size:1.8rem; font-weight:800; color:#8b5cf6;">${listingCount || 0}</p>
            <p style="font-size:0.78rem; color:#9ca3af; margin-top:2px;">Listings Posted</p>
          </div>
          <div style="
            padding:16px; border-radius:14px;
            background:rgba(16,185,129,0.08);
            border:1px solid rgba(16,185,129,0.15);
            text-align:center;
          ">
            <p style="font-size:1.8rem; font-weight:800; color:#10b981;">${savedCount || 0}</p>
            <p style="font-size:0.78rem; color:#9ca3af; margin-top:2px;">Items Saved</p>
          </div>
        </div>

        <!-- Edit Form -->
        <div style="display:flex; flex-direction:column; gap:14px;">
          <div>
            <label style="font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Full Name</label>
            <input id="profile-name" value="${name}" style="
              width:100%; margin-top:6px; padding:11px 14px;
              background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
              border-radius:10px; color:#f3f4f6; font-size:0.9rem; font-family:inherit;
              outline:none;
            ">
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Hostel Block</label>
            <input id="profile-hostel" value="${user.hostel_block || ''}" placeholder="e.g. Adhiyaman Block C" style="
              width:100%; margin-top:6px; padding:11px 14px;
              background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
              border-radius:10px; color:#f3f4f6; font-size:0.9rem; font-family:inherit;
              outline:none;
            ">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div>
              <label style="font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Year</label>
              <select id="profile-year" style="
                width:100%; margin-top:6px; padding:11px 14px;
                background:rgba(17,24,39,0.9); border:1px solid rgba(255,255,255,0.08);
                border-radius:10px; color:#f3f4f6; font-size:0.9rem; font-family:inherit;
                outline:none;
              ">
                <option value="">Select</option>
                <option ${user.year === '1st Year' ? 'selected' : ''}>1st Year</option>
                <option ${user.year === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                <option ${user.year === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                <option ${user.year === '4th Year' ? 'selected' : ''}>4th Year</option>
              </select>
            </div>
            <div>
              <label style="font-size:0.75rem; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em;">Branch</label>
              <input id="profile-branch" value="${user.branch || ''}" placeholder="e.g. CSE" style="
                width:100%; margin-top:6px; padding:11px 14px;
                background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
                border-radius:10px; color:#f3f4f6; font-size:0.9rem; font-family:inherit;
                outline:none;
              ">
            </div>
          </div>
          <button onclick="saveProfile()" style="
            padding:13px; border-radius:12px; font-size:0.95rem; font-weight:700;
            background:linear-gradient(135deg,#8b5cf6,#3d3f98);
            color:white; border:none; cursor:pointer;
            box-shadow:0 4px 20px rgba(139,92,246,0.3);
            font-family:inherit; margin-top:4px;
          ">Save Profile</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

async function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const hostel_block = document.getElementById('profile-hostel').value.trim();
  const year = document.getElementById('profile-year').value;
  const branch = document.getElementById('profile-branch').value.trim();

  const { error } = await db
    .from('users')
    .update({ name, hostel_block, year, branch })
    .eq('id', currentUser.id);

  if (error) {
    alert('Error saving profile: ' + error.message);
    return;
  }

  // Update navbar
  document.getElementById('dropdown-name').textContent = name;
  document.getElementById('user-initials').textContent = getInitials(name);

  showToast('Profile updated successfully!');
  document.getElementById('profile-modal').remove();
}

async function uploadAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileExt = file.name.split('.').pop();
  const fileName = `avatars/${currentUser.id}.${fileExt}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await db.storage
    .from('listing-images')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    alert('Upload failed: ' + uploadError.message);
    return;
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = db.storage.from('listing-images').getPublicUrl(fileName);

  // Save to users table
  await db
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', currentUser.id);

  // Update UI
  showToast('Profile photo updated!');
  openProfile(); // Refresh profile modal
}
// ==================== SELLER PROFILE ====================
async function viewSellerProfile() {
  if (!currentActiveListing) return;

  const sellerId = currentActiveListing.user_id;
  if (!sellerId) {
    showToast('Seller info not available');
    return;
  }

  // Fetch seller data
  const { data: seller, error } = await db
    .from('users')
    .select('*')
    .eq('id', sellerId)
    .single();

  if (error || !seller) {
    showToast('Could not load seller profile');
    return;
  }

  // Fetch seller's active listings count
  const { count: listingCount } = await db
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', sellerId)
    .eq('status', 'active');

  const name = seller.name || seller.email.split('@')[0];
  const initials = getInitials(name);

  const existingModal = document.getElementById('seller-profile-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'seller-profile-modal';
  modal.className = 'modal-backdrop active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.innerHTML = `
    <div onclick="event.stopPropagation()" style="
      width:90%; max-width:420px;
      background:rgba(13,18,30,0.97);
      backdrop-filter:blur(24px);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:24px; overflow:hidden;
      box-shadow:0 32px 80px rgba(0,0,0,0.7);
    ">
      <!-- Cover -->
      <div style="
        height:90px;
        background:linear-gradient(135deg,#8b5cf6 0%,#3d3f98 50%,#1e1b4b 100%);
        position:relative;
      ">
        <button onclick="document.getElementById('seller-profile-modal').remove()" style="
          position:absolute; top:12px; right:12px;
          width:30px; height:30px; border-radius:50%;
          background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.15);
          color:white; cursor:pointer; font-size:0.85rem;
        ">✕</button>

        <!-- Avatar -->
        <div style="
          position:absolute; bottom:-36px; left:24px;
          width:72px; height:72px; border-radius:50%;
          border:3px solid rgba(13,18,30,0.97);
          overflow:hidden;
          background:linear-gradient(135deg,#8b5cf6,#3d3f98);
          display:flex; align-items:center; justify-content:center;
        ">
          ${
            seller.avatar_url
              ? `<img src="${seller.avatar_url}" style="width:100%;height:100%;object-fit:cover;">`
              : `<span style="font-size:1.6rem;font-weight:700;color:white;">${initials}</span>`
          }
        </div>
      </div>

      <!-- Info -->
      <div style="padding:44px 24px 24px;">
        <div style="margin-bottom:20px;">
          <h2 style="font-size:1.2rem; font-weight:700; color:#f3f4f6; margin-bottom:4px;">${name}</h2>
          <p style="font-size:0.82rem; color:#8b5cf6; margin-bottom:8px;">${seller.email}</p>
          <span style="
            font-size:0.75rem; color:#10b981; font-weight:600;
            background:rgba(16,185,129,0.1); padding:3px 10px;
            border-radius:20px; border:1px solid rgba(16,185,129,0.2);
          ">✓ SRM Verified</span>
        </div>

        <!-- Details Grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
          <div style="
            padding:14px; border-radius:12px;
            background:rgba(255,255,255,0.03);
            border:1px solid rgba(255,255,255,0.06);
          ">
            <p style="font-size:0.72rem; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Hostel</p>
            <p style="font-size:0.9rem; font-weight:600; color:#f3f4f6;">${seller.hostel_block || 'Not set'}</p>
          </div>
          <div style="
            padding:14px; border-radius:12px;
            background:rgba(255,255,255,0.03);
            border:1px solid rgba(255,255,255,0.06);
          ">
            <p style="font-size:0.72rem; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Year</p>
            <p style="font-size:0.9rem; font-weight:600; color:#f3f4f6;">${seller.year || 'Not set'}</p>
          </div>
          <div style="
            padding:14px; border-radius:12px;
            background:rgba(255,255,255,0.03);
            border:1px solid rgba(255,255,255,0.06);
          ">
            <p style="font-size:0.72rem; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Branch</p>
            <p style="font-size:0.9rem; font-weight:600; color:#f3f4f6;">${seller.branch || 'Not set'}</p>
          </div>
          <div style="
            padding:14px; border-radius:12px;
            background:rgba(139,92,246,0.08);
            border:1px solid rgba(139,92,246,0.15);
          ">
            <p style="font-size:0.72rem; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:4px;">Active Listings</p>
            <p style="font-size:1.4rem; font-weight:800; color:#8b5cf6;">${listingCount || 0}</p>
          </div>
        </div>

        <!-- Message Button -->
        <button onclick="document.getElementById('seller-profile-modal').remove(); startRealChat(currentModalListingId, '${sellerId}')" style="
          width:100%; padding:13px; border-radius:12px;
          background:linear-gradient(135deg,#8b5cf6,#3d3f98);
          color:white; border:none; cursor:pointer;
          font-size:0.95rem; font-weight:700; font-family:inherit;
          box-shadow:0 4px 20px rgba(139,92,246,0.3);
        ">
          💬 Message ${name.split(' ')[0]}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}
// ==================== MESSAGES INBOX ====================
async function openInbox() {
  closeProfileDropdown();

  // Get all conversations for current user
  const { data: messages, error } = await db
    .from('messages')
    .select(
      '*, listings(title, images), sender:users!messages_sender_id_fkey(name, email), receiver:users!messages_receiver_id_fkey(name, email)'
    )
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Inbox error:', error);
    return;
  }

  // Group by listing_id to get unique conversations
  const conversations = {};
  (messages || []).forEach((msg) => {
    if (!conversations[msg.listing_id]) {
      const isMe = msg.sender_id === currentUser.id;
      const otherUser = isMe ? msg.receiver : msg.sender;
      conversations[msg.listing_id] = {
        listingId: msg.listing_id,
        listingTitle: msg.listings?.title || 'Unknown Item',
        listingImage: msg.listings?.images?.[0] || null,
        otherUser: otherUser,
        otherId: isMe ? msg.receiver_id : msg.sender_id,
        lastMessage: msg.message,
        lastTime: msg.sent_at,
        unread: !msg.read && msg.receiver_id === currentUser.id,
      };
    }
  });

  const convList = Object.values(conversations);

  const existingModal = document.getElementById('inbox-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'inbox-modal';
  modal.className = 'modal-backdrop active';
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };

  modal.innerHTML = `
    <div onclick="event.stopPropagation()" style="
      width:90%; max-width:520px;
      background:rgba(13,18,30,0.97);
      backdrop-filter:blur(24px);
      border:1px solid rgba(255,255,255,0.07);
      border-radius:24px; overflow:hidden;
      box-shadow:0 32px 80px rgba(0,0,0,0.7);
      max-height:85vh; display:flex; flex-direction:column;
    ">
      <!-- Header -->
      <div style="
        padding:22px 24px 18px;
        border-bottom:1px solid rgba(255,255,255,0.06);
        display:flex; justify-content:space-between; align-items:center;
        background:rgba(139,92,246,0.04);
      ">
        <div>
          <h2 style="font-size:1.15rem; font-weight:700; color:#f3f4f6;">Messages</h2>
          <p style="font-size:0.78rem; color:#9ca3af; margin-top:2px;">${convList.length} conversation${convList.length !== 1 ? 's' : ''}</p>
        </div>
        <button onclick="document.getElementById('inbox-modal').remove()" style="
          width:32px; height:32px; border-radius:50%;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
          color:#9ca3af; cursor:pointer; font-size:1rem;
        ">✕</button>
      </div>

      <!-- Conversations -->
      <div style="overflow-y:auto; flex:1; padding:12px;">
        ${
          convList.length === 0
            ? `
          <div style="text-align:center; padding:60px 0;">
            <div style="font-size:3rem; margin-bottom:12px;">💬</div>
            <h3 style="color:#f3f4f6; font-size:1rem; margin-bottom:8px;">No messages yet</h3>
            <p style="color:#9ca3af; font-size:0.85rem;">Start a conversation by clicking "Chat with Seller" on any listing</p>
          </div>
        `
            : convList
                .map(
                  (conv) => `
          <div onclick="openConversation('${conv.listingId}', '${conv.otherId}')" style="
            display:flex; gap:14px; align-items:center;
            padding:14px; border-radius:14px; margin-bottom:8px;
            background:${conv.unread ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)'};
            border:1px solid ${conv.unread ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)'};
            cursor:pointer; transition:all 0.2s;
          ">
            <!-- Item Image -->
            <div style="
              width:52px; height:52px; border-radius:10px; flex-shrink:0; overflow:hidden;
              background:linear-gradient(135deg,#8b5cf6,#3d3f98);
              display:flex; align-items:center; justify-content:center;
            ">
              ${
                conv.listingImage
                  ? `<img src="${conv.listingImage}" style="width:100%;height:100%;object-fit:cover;">`
                  : '🛍️'
              }
            </div>

            <!-- Info -->
            <div style="flex:1; min-width:0;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <h4 style="font-size:0.9rem; font-weight:600; color:#f3f4f6; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">
                  ${conv.listingTitle}
                </h4>
                <span style="font-size:0.72rem; color:#9ca3af; flex-shrink:0; margin-left:8px;">
                  ${new Date(conv.lastTime).toLocaleDateString('en-IN')}
                </span>
              </div>
              <p style="font-size:0.8rem; color:#9ca3af; margin-bottom:3px;">
                with ${conv.otherUser?.name || conv.otherUser?.email?.split('@')[0] || 'Student'}
              </p>
              <p style="font-size:0.82rem; color:${conv.unread ? '#f3f4f6' : '#6b7280'}; 
                white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:${conv.unread ? '600' : '400'}">
                ${conv.lastMessage}
              </p>
            </div>

            ${
              conv.unread
                ? `
              <div style="width:8px; height:8px; border-radius:50%; background:#8b5cf6; flex-shrink:0;"></div>
            `
                : ''
            }
          </div>
        `
                )
                .join('')
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

async function openConversation(listingId, otherId) {
  document.getElementById('inbox-modal')?.remove();

  // Find the listing and open its modal
  const { data: listing } = await db
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();

  if (listing) {
    // Add to listings array temporarily if not there
    const exists = listings.find((l) => l.id === listingId);
    if (!exists) {
      listings.push({
        id: listing.id,
        title: listing.title,
        description: listing.description || '',
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
        location: listing.hostel_block || 'SRM Campus',
        date: new Date(listing.created_at).toLocaleDateString('en-IN'),
        seller: 'SRM Student',
        initials: 'SS',
        imageSrc: listing.images?.[0] || null,
        iconType: listing.category.toLowerCase(),
        imageColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        user_id: listing.user_id,
      });
    }
    openProductModal(listingId);
    setTimeout(() => startRealChat(listingId, otherId), 500);
  }
}

// Check unread messages count
async function checkUnreadMessages() {
  if (!currentUser) return;

  const { count } = await db
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', currentUser.id)
    .eq('read', false);

  const badge = document.getElementById('unread-badge');
  if (badge) {
    if (count > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = count;
    } else {
      badge.style.display = 'none';
    }
  }
}
