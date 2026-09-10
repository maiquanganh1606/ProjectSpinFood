const starterDishes = [
  { name: 'Lẩu Thái', meal: 'Tối', mood: 'spicy' },
  { name: 'Cơm tấm', meal: 'Trưa', mood: 'no' },
  { name: 'Bún bò', meal: 'Trưa', mood: 'spicy' },
  { name: 'Sushi', meal: 'Tối', mood: 'light' },
  { name: 'Trà sữa & bánh ngọt', meal: 'Ăn vặt', mood: 'light' },
  { name: 'Món mới chưa thử', meal: 'Tối', mood: 'new' }
];
const storageKey = 'spinfood-dishes-v1';
const historyKey = 'spinfood-history-v1';
let dishes = JSON.parse(localStorage.getItem(storageKey)) || starterDishes;
let history = JSON.parse(localStorage.getItem(historyKey)) || [];
let selectedDish = null;
let spinning = false;
const $ = (s) => document.querySelector(s);
const menuDialog = $('#menu-dialog'); const resultDialog = $('#result-dialog');
function persist() { localStorage.setItem(storageKey, JSON.stringify(dishes)); localStorage.setItem(historyKey, JSON.stringify(history)); }
function renderDishes() {
  $('#dish-count').textContent = dishes.length;
  $('#dish-list').innerHTML = dishes.length ? dishes.map((dish, i) => `<li><span>🍽️</span><strong>${escapeHtml(dish.name)}</strong><span class="tag">${dish.meal}</span><button type="button" data-remove="${i}" aria-label="Xóa ${escapeHtml(dish.name)}">×</button></li>`).join('') : '<li class="empty-state">Thực đơn đang trống, thêm một món đi nhé.</li>';
}
function renderHistory() {
  $('#history-list').innerHTML = history.length ? history.slice(0, 5).map(item => `<li><span>♡ ${escapeHtml(item.name)}</span><time>${item.date}</time></li>`).join('') : '<li class="empty-state">Chưa có kỷ niệm nào — quay một món đi thôi!</li>';
}
function escapeHtml(value) { const el = document.createElement('span'); el.textContent = value; return el.innerHTML; }
function eligibleDishes() {
  const meal = $('#meal-filter').value, mood = $('#mood-filter').value;
  return dishes.filter(d => (meal === 'all' || d.meal === meal) && (mood === 'all' || d.mood === mood));
}
function updateHint() { const list = eligibleDishes(); $('#spin-button').disabled = !list.length; $('#spin-hint').textContent = list.length ? `${list.length} món đang chờ được chọn ✦` : 'Chưa có món hợp với lựa chọn này — đổi bộ lọc hoặc thêm món nhé.'; }
function confetti() { const box = $('#confetti'); box.innerHTML = ''; ['#ff7e79','#ffd66e','#b8e4d3','#c9b9e9'].forEach((color, i) => { for(let j=0;j<10;j++){ const e=document.createElement('i'); e.className='confetto'; e.style.left=`${Math.random()*100}%`; e.style.background=color; e.style.setProperty('--drift',`${-110+Math.random()*220}px`); e.style.animationDelay=`${(i+j)*.02}s`; box.appendChild(e); }}); setTimeout(()=>box.innerHTML='',2200); }
function spin() {
  if (spinning) return; const choices = eligibleDishes(); if (!choices.length) return;
  spinning = true; $('#spin-button').disabled = true; selectedDish = choices[Math.floor(Math.random() * choices.length)];
  const wheel = $('#wheel'); const extraTurns = 5 + Math.floor(Math.random() * 3); const angle = extraTurns * 360 + Math.floor(Math.random() * 360); wheel.style.transform = `rotate(${angle}deg)`;
  $('#spin-hint').textContent = 'Định mệnh đang suy nghĩ...';
  setTimeout(() => { $('#result-title').textContent = selectedDish.name; $('#result-message').textContent = `Tối nay mình đi ăn ${selectedDish.name} nhé? Người kia được chọn chỗ ngồi ♡`; resultDialog.showModal(); confetti(); spinning = false; updateHint(); }, 4250);
}
$('#open-menu').addEventListener('click', () => menuDialog.showModal());
$('.close-button').addEventListener('click', () => menuDialog.close());
$('#dish-form').addEventListener('submit', (event) => { event.preventDefault(); const name = $('#dish-name').value.trim(); if (!name) return; dishes.push({name, meal: $('#dish-meal').value, mood: $('#dish-mood').value}); persist(); event.target.reset(); renderDishes(); updateHint(); });
$('#dish-list').addEventListener('click', (event) => { const index = event.target.dataset.remove; if (index === undefined) return; dishes.splice(Number(index), 1); persist(); renderDishes(); updateHint(); });
$('#spin-button').addEventListener('click', spin);
$('#reroll').addEventListener('click', () => { resultDialog.close(); spin(); });
$('#save-result').addEventListener('click', () => { if (selectedDish) { history.unshift({ name: selectedDish.name, date: new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit'}).format(new Date()) }); persist(); renderHistory(); } resultDialog.close(); });
$('#meal-filter').addEventListener('change', updateHint); $('#mood-filter').addEventListener('change', updateHint);
renderDishes(); renderHistory(); updateHint();
