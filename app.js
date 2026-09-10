const starterDishes = [
  { name: 'Lẩu Thái', meal: 'Tối', mood: 'spicy', photo: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cơm tấm', meal: 'Trưa', mood: 'no', photo: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Bún bò', meal: 'Trưa', mood: 'spicy', photo: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80' },
  { name: 'Sushi', meal: 'Tối', mood: 'new', photo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Trà sữa & bánh ngọt', meal: 'Ăn vặt', mood: 'new', photo: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=600&q=80' },
  { name: 'Món mới chưa thử', meal: 'Tối', mood: 'new', photo: '' }
];
const hanoiDishes = [
  { name: 'Phở bò Hà Nội', meal: 'Sáng', mood: 'broth', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ph%E1%BB%9F_b%C3%B2%2C_C%E1%BA%A7u_Gi%E1%BA%A5y%2C_H%C3%A0_N%E1%BB%99i.jpg?width=800' },
  { name: 'Phở gà Hà Nội', meal: 'Sáng', mood: 'broth', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pho-ga-ha-noi.jpg?width=800' },
  { name: 'Bún chả Hà Nội', meal: 'Trưa', mood: 'no', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bun_cha_Hanoi.jpg?width=800' },
  { name: 'Chả cá Lã Vọng', meal: 'Tối', mood: 'new', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Turmeric_and_oil_-_Cha_Ca_La_Vong.jpg?width=800' },
  { name: 'Bánh cuốn nóng', meal: 'Sáng', mood: 'new', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Banh_cuon.jpg?width=800' },
  { name: 'Bún đậu mắm tôm', meal: 'Trưa', mood: 'no', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%BAn_%C4%91%E1%BA%ADu_m%E1%BA%AFm_t%C3%B4m_3_ch%E1%BB%8B_em_Nguy%E1%BB%85n_S%C6%A1n_n%C4%83m_2016_%283%29.jpg?width=800' },
  { name: 'Bún thang', meal: 'Sáng', mood: 'broth', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%BAn_thang.JPG?width=800' },
  { name: 'Bún ốc Hà Nội', meal: 'Trưa', mood: 'broth', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Street_food_in_Hanoi.jpg?width=800' },
  { name: 'Bánh tôm Hồ Tây', meal: 'Ăn vặt', mood: 'new', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%A1nh_t%C3%B4m.jpg?width=800' },
  { name: 'Cà phê trứng', meal: 'Ăn vặt', mood: 'new', photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/C%C3%A0_ph%C3%AA_tr%E1%BB%A9ng.jpg?width=800' }
];
const storageKey = 'spinfood-dishes-v2';
const oldStorageKey = 'spinfood-dishes-v1';
const historyKey = 'spinfood-history-v1';
const hanoiMenuKey = 'spinfood-hanoi-menu-v2';
const $ = (selector) => document.querySelector(selector);
const storedDishes = JSON.parse(localStorage.getItem(storageKey)) || JSON.parse(localStorage.getItem(oldStorageKey));
let dishes = storedDishes
  ? storedDishes.map((dish) => ({ ...dish, photo: dish.photo || starterDishes.find((starter) => starter.name === dish.name)?.photo || '' }))
  : starterDishes;
const legacyMoodNames = new Set(['Sushi', 'Trà sữa & bánh ngọt', 'Bánh cuốn nóng', 'Cà phê trứng']);
dishes = dishes.map((dish) => {
  if (dish.mood !== 'light') return dish;
  return { ...dish, mood: legacyMoodNames.has(dish.name) ? 'new' : 'broth' };
});
if (!localStorage.getItem(hanoiMenuKey)) {
  dishes = [...dishes, ...hanoiDishes.filter((hanoiDish) => !dishes.some((dish) => dish.name === hanoiDish.name))];
  localStorage.setItem(storageKey, JSON.stringify(dishes));
  localStorage.setItem(hanoiMenuKey, 'true');
}
let history = JSON.parse(localStorage.getItem(historyKey)) || [];
let dealtDishes = [];
let selectedDish = null;
let pendingPhoto = '';

const menuDialog = $('#menu-dialog');
const resultDialog = $('#result-dialog');
const moodNames = { no: 'ăn no', broth: 'món nước', spicy: 'ăn cay', new: 'thử món mới' };

function escapeHtml(value) {
  const el = document.createElement('span');
  el.textContent = value;
  return el.innerHTML;
}
function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(dishes));
  localStorage.setItem(historyKey, JSON.stringify(history));
}
function eligibleDishes() {
  const meal = $('#meal-filter').value;
  const mood = $('#mood-filter').value;
  return dishes.filter((dish) => (meal === 'all' || dish.meal === meal) && (mood === 'all' || dish.mood === mood));
}
function imageMarkup(dish) {
  return dish.photo
    ? `<img class="dish-image" src="${escapeAttribute(dish.photo)}" alt="${escapeAttribute(dish.name)}" />`
    : '<div class="image-fallback" aria-hidden="true">🍽️</div>';
}
function renderDishes() {
  $('#dish-count').textContent = dishes.length;
  $('#dish-list').innerHTML = dishes.length
    ? dishes.map((dish, index) => `<li><span>${dish.photo ? '📸' : '🍽️'}</span><strong>${escapeHtml(dish.name)}</strong><span class="tag">${dish.meal}</span><button type="button" data-remove="${index}" aria-label="Xóa ${escapeAttribute(dish.name)}">×</button></li>`).join('')
    : '<li class="empty-state">Thực đơn đang trống, thêm một món đi nhé.</li>';
}
function renderHistory() {
  $('#history-list').innerHTML = history.length
    ? history.slice(0, 5).map((item) => `<li><span>♡ ${escapeHtml(item.name)}</span><time>${item.date}</time></li>`).join('')
    : '<li class="empty-state">Chưa có kỷ niệm nào — khui một hộp đi thôi!</li>';
}
function updateHint() {
  const choices = eligibleDishes();
  $('#deal-button').disabled = choices.length === 0;
  $('#spin-hint').textContent = choices.length
    ? `${choices.length} món phù hợp đang chờ được khui ✦`
    : 'Chưa có món hợp với lựa chọn này — đổi bộ lọc hoặc thêm món nhé.';
}
function renderDeck() {
  const deck = $('#date-deck');
  if (!dealtDishes.length) {
    deck.innerHTML = '<div class="deck-placeholder"><span>🎁</span><strong>Ba món bí mật đang chờ</strong><small>Khui hộp để xem ảnh món ăn nhé!</small></div>';
    return;
  }
  deck.innerHTML = dealtDishes.map((dish, index) => `
    <article class="meal-card" data-card="${index}" aria-label="Hộp bất ngờ ${index + 1}">
      <div class="card-inner">
        <div class="card-face card-back"><strong>HỘP BÍ MẬT<br />Chạm để mở ♡</strong></div>
        <div class="card-face card-front">
          ${imageMarkup(dish)}
          <div class="card-content"><span>${escapeHtml(dish.meal)} · ${moodNames[dish.mood] || 'món ngon'}</span><strong>${escapeHtml(dish.name)}</strong><button class="choose-dish" type="button" data-choose="${index}">Chọn món này ♡</button></div>
        </div>
      </div>
    </article>`).join('');
}
function dealDishes() {
  const choices = eligibleDishes();
  if (!choices.length) return;
  dealtDishes = [...choices].sort(() => Math.random() - 0.5).slice(0, Math.min(3, choices.length));
  renderDeck();
  $('#deal-button').textContent = 'Khui 3 hộp khác! ✦';
  $('#spin-hint').textContent = 'Chạm từng hộp để lật thẻ, rồi chốt món trông ngon nhất nhé.';
}
function createConfetti() {
  const box = $('#confetti');
  box.innerHTML = '';
  ['#ff7e79', '#ffd66e', '#b8e4d3', '#c9b9e9'].forEach((color, colorIndex) => {
    for (let index = 0; index < 10; index += 1) {
      const piece = document.createElement('i');
      piece.className = 'confetto';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = color;
      piece.style.setProperty('--drift', `${-110 + Math.random() * 220}px`);
      piece.style.animationDelay = `${(colorIndex + index) * 0.02}s`;
      box.appendChild(piece);
    }
  });
  setTimeout(() => { box.innerHTML = ''; }, 2200);
}
function chooseDish(index) {
  selectedDish = dealtDishes[index];
  if (!selectedDish) return;
  $('#result-title').textContent = selectedDish.name;
  $('#result-message').textContent = `Hôm nay mình ăn ${selectedDish.name} nhé? Người kia được chọn chỗ ngồi ♡`;
  resultDialog.showModal();
  createConfetti();
}
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maximum = 720;
        const ratio = Math.min(1, maximum / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

$('#open-menu').addEventListener('click', () => menuDialog.showModal());
$('.close-button').addEventListener('click', () => menuDialog.close());
$('#deal-button').addEventListener('click', dealDishes);
$('#meal-filter').addEventListener('change', () => { dealtDishes = []; renderDeck(); updateHint(); });
$('#mood-filter').addEventListener('change', () => { dealtDishes = []; renderDeck(); updateHint(); });
$('#date-deck').addEventListener('click', (event) => {
  const chooseButton = event.target.closest('[data-choose]');
  if (chooseButton) { chooseDish(Number(chooseButton.dataset.choose)); return; }
  const card = event.target.closest('[data-card]');
  if (card) card.classList.add('is-flipped');
});
$('#dish-photo-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    pendingPhoto = await compressImage(file);
    $('.upload-label').childNodes[0].textContent = '✓ Đã chọn ảnh';
  } catch {
    pendingPhoto = '';
    $('.upload-label').childNodes[0].textContent = '📷 Chọn ảnh từ máy';
  }
});
$('#dish-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#dish-name').value.trim();
  if (!name) return;
  const url = $('#dish-photo-url').value.trim();
  dishes.push({ name, meal: $('#dish-meal').value, mood: $('#dish-mood').value, photo: pendingPhoto || url });
  saveData();
  event.target.reset();
  pendingPhoto = '';
  $('.upload-label').childNodes[0].textContent = '📷 Chọn ảnh từ máy';
  renderDishes();
  updateHint();
});
$('#dish-list').addEventListener('click', (event) => {
  const index = event.target.dataset.remove;
  if (index === undefined) return;
  dishes.splice(Number(index), 1);
  saveData();
  renderDishes();
  updateHint();
});
$('#reroll').addEventListener('click', () => { resultDialog.close(); dealDishes(); });
$('#save-result').addEventListener('click', () => {
  if (selectedDish) {
    history.unshift({ name: selectedDish.name, date: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(new Date()) });
    saveData();
    renderHistory();
  }
  resultDialog.close();
});

renderDishes();
renderHistory();
renderDeck();
updateHint();
