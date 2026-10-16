/* PujaConnect SPA – vanilla JS */
const LOCATIONS = {
  'Andaman and Nicobar Islands': ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
  'Andhra Pradesh': [
    'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla', 'Chittoor',
    'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Krishna',
    'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam',
    'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam',
    'Vizianagaram', 'West Godavari', 'YSR Kadapa'
  ],
  'Arunachal Pradesh': [
    'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang', 'Itanagar', 'Kamle',
    'Kra Daadi', 'Kurung Kumey', 'Leparada', 'Lohit', 'Longding', 'Lower Dibang Valley',
    'Lower Siang', 'Lower Subansiri', 'Namsai', 'Pakke Kessang', 'Papum Pare', 'Shi Yomi',
    'Siang', 'Tawang', 'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
  ],
  'Assam': [
    'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo', 'Chirang', 'Darrang',
    'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi',
    'Hojai', 'Jorhat', 'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar',
    'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar', 'Sonitpur',
    'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
  ],
  'Bihar': [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar',
    'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur',
    'Katihar', 'Khagaria', 'Kishanganj', 'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger',
    'Muzaffarpur', 'Nalanda', 'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur',
    'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali', 'West Champaran'
  ],
  'Chandigarh': ['Chandigarh'],
  'Chhattisgarh': [
    'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur',
    'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurela Pendra Marwahi', 'Janjgir Champa',
    'Jashpur', 'Kabirdham', 'Kanker', 'Khairagarh', 'Kondagaon', 'Korba', 'Korea', 'Mahasamund',
    'Manendragarh', 'Mohla Manpur', 'Mungeli', 'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon',
    'Sakti', 'Sarangarh', 'Sukma', 'Surajpur', 'Surguja'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
  'Delhi': [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
  ],
  'Goa': ['North Goa', 'South Goa'],
  'Gujarat': [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad',
    'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath',
    'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada',
    'Navsari', 'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
    'Tapi', 'Vadodara', 'Valsad'
  ],
  'Haryana': [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar',
    'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal',
    'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'
  ],
  'Himachal Pradesh': [
    'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Lahaul and Spiti',
    'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'
  ],
  'Jammu and Kashmir': [
    'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua',
    'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi',
    'Samba', 'Shopian', 'Srinagar', 'Udhampur'
  ],
  'Jharkhand': [
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih',
    'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga',
    'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahibganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
  ],
  'Karnataka': [
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar',
    'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada',
    'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar',
    'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi',
    'Uttara Kannada', 'Vijayapura', 'Yadgir'
  ],
  'Kerala': [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam',
    'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ],
  'Ladakh': ['Kargil', 'Leh'],
  'Lakshadweep': ['Lakshadweep'],
  'Madhya Pradesh': [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
    'Ratlam', 'Rewa', 'Katni', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind',
    'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Khargone',
    'Neemuch', 'Hoshangabad', 'Sehore', 'Betul', 'Seoni', 'Datia'
  ],
  'Maharashtra': [
    'Ahmednagar', 'Akola', 'Amravati', 'Chhatrapati Sambhajinagar', 'Beed', 'Bhandara',
    'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna',
    'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
    'Nashik', 'Dharashiv', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri',
    'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
  ],
  'Manipur': [
    'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam',
    'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
  ],
  'Meghalaya': [
    'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'North Garo Hills',
    'Ri Bhoi', 'South Garo Hills', 'South West Garo Hills', 'South West Khasi Hills',
    'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'
  ],
  'Mizoram': ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip'],
  'Nagaland': [
    'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon',
    'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu', 'Tuensang', 'Wokha', 'Zunheboto'
  ],
  'Odisha': [
    'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh',
    'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi',
    'Kandhamal', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj',
    'Nabarangpur', 'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
  ],
  'Puducherry': ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'],
  'Punjab': [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Ferozepur',
    'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Malerkotla', 'Mansa',
    'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'SAS Nagar (Mohali)', 'Sangrur',
    'SBS Nagar (Nawanshahr)', 'Tarn Taran'
  ],
  'Rajasthan': [
    'Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner',
    'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur',
    'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur',
    'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'
  ],
  'Sikkim': ['Gangtok', 'Gyalshing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'],
  'Tamil Nadu': [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul',
    'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai',
    'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni',
    'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
    'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ],
  'Telangana': [
    'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally',
    'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad',
    'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal Malkajgiri', 'Mulugu',
    'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli',
    'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad',
    'Wanaparthy', 'Warangal', 'Hanamkonda', 'Yadadri Bhuvanagiri'
  ],
  'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Ayodhya', 'Azamgarh',
    'Baghpat', 'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki', 'Bareilly', 'Basti',
    'Bhadohi', 'Bijnor', 'Budaun', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah',
    'Etawah', 'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad',
    'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras', 'Jalaun',
    'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar', 'Kasganj', 'Kaushambi',
    'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow', 'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura',
    'Mau', 'Meerut', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh',
    'Prayagraj', 'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar', 'Shahjahanpur',
    'Shamli', 'Shravasti', 'Siddharthnagar', 'Sitapur', 'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
  ],
  'Uttarakhand': [
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital',
    'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'
  ],
  'West Bengal': [
    'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling',
    'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong', 'Kolkata', 'Malda',
    'Murshidabad', 'Nadia', 'North 24 Parganas', 'Paschim Bardhaman', 'Paschim Medinipur',
    'Purba Bardhaman', 'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
  ]
};
const DEFAULT_SLOTS = ['08:00 AM - 11:00 AM', '04:00 PM - 07:00 PM'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const S = {
  user: JSON.parse(localStorage.getItem('pc_user') || 'null'),
  token: localStorage.getItem('pc_token') || '',
  pujas: [],
  pujaTab: 'Short',
  filters: { state: 'Odisha', district: '', service: '' },
  view: 'home'
};

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const today = () => new Date().toISOString().slice(0, 10);
const dayName = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
const opts = (arr, sel, ph) => (ph !== undefined ? `<option value="">${esc(ph)}</option>` : '') + arr.map((a) => `<option ${a === sel ? 'selected' : ''}>${esc(a)}</option>`).join('');

function toast(msg, isErr) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' error' : '');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.className = 'toast'), 3600);
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });
  let data = null;
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok) throw new Error((data && data.error) || 'Request failed (' + res.status + ')');
  return data;
}

function saveSession(user, token) {
  S.user = user; S.token = token || '';
  if (user) { localStorage.setItem('pc_user', JSON.stringify(user)); localStorage.setItem('pc_token', S.token); }
  else { localStorage.removeItem('pc_user'); localStorage.removeItem('pc_token'); }
  renderNav();
}

/* ---------- modal ---------- */
function openModal(title, html, onMount, wide = false) {
  $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="modalBackdrop"><div class="modal ${wide ? 'modal-wide' : ''}"><div class="modal-head"><h3>${esc(title)}</h3><button data-action="closeModal" aria-label="Close"><span class="material-icons">close</span></button></div><div class="modal-body">${html}</div></div></div>`;
  if (onMount) onMount($('#modal-root .modal'));
}
const closeModal = () => ($('#modal-root').innerHTML = '');

/* ---------- navigation ---------- */
function renderNav() {
  const u = S.user;
  const roleLabel = !u ? '' : u.role === 'admin' ? 'Super Admin' : u.role === 'pandit' ? 'Verified Pandit' : 'Devotee Account';
  const html = `
    <button class="btn btn-gold" data-action="bookCta"><span class="material-icons">self_improvement</span> Book a Puja</button>
    ${u && u.role === 'pandit' ? '' : `<button class="btn btn-outline" data-action="panditRegister"><span class="material-icons">badge</span> Pandit Registration</button>`}
    ${u
      ? `<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span class="role-badge">${roleLabel}</span><small style="color:#ffd166">${esc(u.name)}</small></div>
         <button class="btn btn-outline" data-action="nav" data-view="dashboard"><span class="material-icons">dashboard</span> ${u.role === 'pandit' ? 'Pandit Dashboard' : 'My Account / Dashboard'}</button>
         <button class="btn btn-outline" data-action="logout" title="Logout"><span class="material-icons">logout</span> Logout</button>`
      : `<button class="btn btn-outline" data-action="login"><span class="material-icons">account_circle</span> Login / My Account</button>`}
  `;

  const drawerEl = $('#drawer-nav-actions');
  if (drawerEl) drawerEl.innerHTML = html;
  const navActions = $('#nav-actions');
  if (navActions) navActions.innerHTML = html;
}

function showView(name) {
  if (name === 'dashboard' && !S.user) { openAuth(); return; }
  S.view = name;

  // Close nav drawer if open
  const drawer = $('#nav-drawer');
  if (drawer) drawer.classList.remove('open');

  document.querySelectorAll('.view-section').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  document.querySelectorAll('.drawer-link').forEach((a) => a.classList.toggle('active', a.dataset.view === name));
  document.querySelectorAll('.nav-links a').forEach((a) => a.classList.toggle('active', a.dataset.view === name));
  document.querySelectorAll('.mobile-nav-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.view === name || (name === 'dashboard' && S.dashTab === 'profile' && b.dataset.action === 'openProfile'));
  });

  history.replaceState(null, '', '#' + name);
  window.scrollTo({ top: 0 });
  if (name === 'home') renderHomePandits();
  if (name === 'pandits') renderPandits();
  if (name === 'pujas') renderPujas();
  if (name === 'long') renderLongForm();
  if (name === 'dashboard') renderDashboard();
}

async function renderHomePandits() {
  const grid = $('#home-pandits-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="empty">Finding verified Vedic Pandits…</div>';
  try {
    const list = await api('/pandits?verified=true');
    grid.innerHTML = list.length ? list.slice(0, 6).map(panditCard).join('') : '<div class="empty">No verified Pandits listed yet.</div>';
  } catch (e) {
    grid.innerHTML = `<div class="empty">${esc(e.message)}</div>`;
  }
}

/* ---------- catalog ---------- */
async function loadPujas() {
  try { S.pujas = await api('/pujas'); } catch (e) { S.pujas = []; toast(e.message, true); }
}
function pujaCard(p, withTags) {
  const isLong = p.type === 'Long';
  return `<div class="card"><div class="thumb" style="background-image:url('${esc(p.image)}')"></div><div class="body">
    <h3>${esc(p.name)}</h3><p class="muted" style="margin:0 0 8px">${esc(p.desc)}</p>
    ${withTags ? `<p style="font-size:13px;margin:0 0 8px">${esc(p.longDesc)}</p><div>${(p.benefits || []).map((b) => `<span class="badge">✦ ${esc(b)}</span>`).join('')}</div>` : ''}
    <div class="row"><span class="price">${isLong ? esc(p.price) : 'From ' + inr(p.baseFee)}</span>
    <button class="btn btn-dark btn-sm" data-action="${isLong ? 'planLong' : 'findFor'}" data-name="${esc(p.name)}">${isLong ? 'Customize' : 'Book Pandit'}</button></div></div></div>`;
}
function renderHomePujas() {
  const el = $('#home-pujas');
  if (!el) return;
  const list = S.pujas.filter((p) => p.type === 'Short').slice(0, 3);
  el.innerHTML = list.length ? list.map((p) => pujaCard(p)).join('') : '<div class="empty">Loading pujas…</div>';
}
function renderPujas() {
  document.querySelectorAll('#view-pujas .tab').forEach((t) => t.classList.toggle('active', t.dataset.type === S.pujaTab));
  const list = S.pujas.filter((p) => p.type === S.pujaTab);
  $('#puja-list').innerHTML = list.length ? list.map((p) => pujaCard(p, true)).join('') : '<div class="empty">No pujas in this category yet.</div>';
}

/* ---------- hero filter ---------- */
function setupHeroFilter() {
  const st = $('#f-state'), di = $('#f-district'), pu = $('#f-puja');
  if (!st || !di || !pu) return;
  st.innerHTML = opts(Object.keys(LOCATIONS), S.filters.state);
  const fillDistricts = () => (di.innerHTML = opts(LOCATIONS[st.value] || [], '', 'Any District'));
  fillDistricts();
  pu.innerHTML = '<option value="">Any Puja</option>' + S.pujas.filter((p) => p.type === 'Short').map((p) => `<option>${esc(p.name)}</option>`).join('');
  st.onchange = fillDistricts;
  const form = $('#hero-filter');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      S.filters = { state: st.value, district: di.value, service: pu.value };
      showView('pandits');
    };
  }
}

/* ---------- pandits directory ---------- */
function renderPanditFilters() {
  const f = S.filters;
  $('#pandit-filters').innerHTML = `
    <select id="pf-state">${opts(Object.keys(LOCATIONS), f.state)}</select>
    <select id="pf-district">${opts(LOCATIONS[f.state] || [], f.district, 'Any District')}</select>
    <select id="pf-service">${opts(S.pujas.filter((p) => p.type === 'Short').map((p) => p.name), f.service, 'Any Puja')}</select>`;
  $('#pf-state').onchange = (e) => { S.filters = { state: e.target.value, district: '', service: $('#pf-service').value }; renderPandits(); };
  $('#pf-district').onchange = (e) => { S.filters.district = e.target.value; renderPandits(); };
  $('#pf-service').onchange = (e) => { S.filters.service = e.target.value; renderPandits(); };
}

async function renderPandits() {
  renderPanditFilters();
  const list = $('#pandit-list');
  list.innerHTML = '<div class="empty">Finding Pandits…</div>';
  const f = S.filters;
  const q = new URLSearchParams({ verified: 'true' });
  if (f.state) q.set('state', f.state);
  if (f.district) q.set('district', f.district);
  if (f.service) q.set('service', f.service);
  try {
    const pandits = await api('/pandits?' + q);
    S.pandits = pandits;
    list.innerHTML = pandits.length ? pandits.map(panditCard).join('') : '<div class="empty">No verified Pandits found for these filters. Try another district or puja.</div>';
  } catch (e) { list.innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
}

function panditCard(p) {
  const exp = p.experience >= 10 ? `${p.experience}+ Years Vedic Knowledge` : `${p.experience}+ Years Experience`;
  const selectedDistrict = S.filters.district;
  const prices = p.districtPrices || {};
  const hasDistrictPrices = Object.keys(prices).length > 0;

  let priceHtml = '';
  if (selectedDistrict && prices[selectedDistrict]) {
    priceHtml = `<span class="price">${inr(prices[selectedDistrict])}<small class="muted" style="font-weight:400"> /puja in ${esc(selectedDistrict)}</small></span>`;
  } else if (hasDistrictPrices) {
    const nums = Object.values(prices).map(Number).filter((n) => !isNaN(n) && n > 0);
    const minP = nums.length ? Math.min(...nums) : (p.fee || 1500);
    const maxP = nums.length ? Math.max(...nums) : (p.fee || 1500);
    if (minP === maxP) {
      priceHtml = `<span class="price">${inr(minP)}<small class="muted" style="font-weight:400"> /puja</small></span>`;
    } else {
      priceHtml = `<span class="price">${inr(minP)} - ${inr(maxP)}<small class="muted" style="font-weight:400"> by district</small></span>`;
    }
  } else {
    priceHtml = `<span class="price">${inr(p.fee || 1500)}<small class="muted" style="font-weight:400"> /puja</small></span>`;
  }

  let districtFeesSnippet = '';
  if (hasDistrictPrices) {
    districtFeesSnippet = `
      <div class="district-pricing-block">
        <div class="district-pricing-header">
          <span class="material-icons" style="font-size:15px;color:var(--ochre)">payments</span>
          <b>District-wise Dakshina:</b>
        </div>
        <div class="district-fee-tags">
          ${Object.entries(prices).map(([dist, fee]) => `
            <span class="district-fee-chip ${dist === selectedDistrict ? 'active-dist' : ''}">
              <span class="chip-dist-name">${esc(dist)}</span>: <b class="chip-dist-price">${inr(fee)}</b>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    districtFeesSnippet = `
      <p class="muted" style="font-size:13px;margin:6px 0 10px">
        <span class="material-icons" style="font-size:14px;vertical-align:middle;color:var(--ochre)">place</span>
        Serves: <b>${esc((p.workingDistricts || [p.district]).join(', '))}</b>
      </p>
    `;
  }

  return `<div class="card pandit-card"><div class="head"><img src="${esc(p.photo)}" alt="" onerror="this.style.visibility='hidden'">
    <div><h3>${esc(p.name)} <span class="material-icons" style="font-size:16px;vertical-align:middle" title="Verified">verified</span></h3><small>${esc(p.location || p.district)}</small></div></div>
    <div class="body"><div><span class="badge">${esc(exp)}</span><span class="badge green"><span class="material-icons">verified</span>Verified</span><span class="badge">🗣 Sanskrit, Odia, Hindi</span></div>
    <p style="margin:6px 0;font-size:14px"><strong>${esc(p.specialty)}</strong><br><span class="muted">${esc(p.bio)}</span></p>
    ${districtFeesSnippet}
    <div class="row" style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)"><span class="price-wrap">${priceHtml}</span>
    <button class="btn btn-gold btn-sm" data-action="bookPandit" data-id="${esc(p._id)}">Book Pandit</button></div></div></div>`;
}

/* ---------- booking flow ---------- */
function requireLogin(thenAction) {
  if (S.user && S.user.role !== 'pandit') return true;
  if (S.user && S.user.role === 'pandit') { toast('Please log in as a Devotee to book a puja.', true); return false; }
  S.afterLogin = thenAction;
  openAuth();
  return false;
}

async function openBooking(id) {
  const p = (S.pandits || []).find((x) => x._id === id);
  if (!p) return;
  if (!requireLogin(() => openBooking(id))) return;
  const u = S.user;
  const services = p.services && p.services.length ? p.services : S.pujas.filter((x) => x.type === 'Short').map((x) => x.name);
  const districts = p.workingDistricts && p.workingDistricts.length ? p.workingDistricts : [p.district];
  const sel = { date: '', time: '' };
  let booked = [];
  openModal('Book ' + p.name, `
    <div><label>Puja / Ritual</label><select id="b-service">${opts(services, S.filters.service)}</select></div>
    <div><label>District</label><select id="b-district">${opts(districts, S.filters.district)}</select></div>
    <div><label>Date</label><input type="date" id="b-date" min="${today()}"></div>
    <div><label>Time Slot</label><div id="b-slots" class="checks"><span class="muted">Select a date to see live slots.</span></div></div>
    <div><label>Address / Venue</label><textarea id="b-address" rows="2" placeholder="House no., locality, landmark"></textarea></div>
    <div><label>Contact Phone</label><input id="b-phone" value="${esc(u.phone || '')}"></div>
    <div class="cost-box"><div class="row"><span>Dakshina</span><b id="b-fee">${inr(p.fee)}</b></div>
      <label class="check" style="margin-top:10px"><input type="checkbox" id="b-adv"> Pay 25% advance now (demo – no real payment is taken)</label></div>
    <button class="btn btn-gold" id="b-submit">Confirm Booking</button>`, (m) => {
    const feeFor = () => (p.districtPrices && p.districtPrices[$('#b-district', m).value]) || p.fee;
    const paintFee = () => {
      const dist = $('#b-district', m).value;
      const f = feeFor();
      const hasCustom = p.districtPrices && p.districtPrices[dist];
      $('#b-fee', m).innerHTML = `${inr(f)} ${hasCustom ? `<small class="muted" style="font-size:12px;font-weight:400">(${esc(dist)} Rate)</small>` : ''}`;
    };
    const drawSlots = () => {
      const d = $('#b-date', m).value;
      const box = $('#b-slots', m);
      sel.time = '';
      if (!d) return;
      const dn = dayName(d);
      if (!(p.availableDays || DAYS).includes(dn)) { box.innerHTML = `<span class="muted">Pandit is not available on ${dn}s.</span>`; return; }
      const slots = (p.daySlots && p.daySlots[dn] && p.daySlots[dn].length ? p.daySlots[dn] : p.timeSlots) || DEFAULT_SLOTS;
      const taken = booked.filter((b) => b.date === d && ['Confirmed', 'In Progress'].includes(b.status)).map((b) => b.time);
      box.innerHTML = slots.map((s) => `<button type="button" class="slot ${taken.includes(s) ? 'booked' : ''}" data-slot="${esc(s)}" ${taken.includes(s) ? 'disabled' : ''}>${esc(s)}</button>`).join('');
    };
    api('/bookings?panditEmail=' + encodeURIComponent(p.email)).then((b) => { booked = b; drawSlots(); }).catch(() => {});
    $('#b-date', m).onchange = drawSlots;
    $('#b-district', m).onchange = paintFee;
    $('#b-slots', m).onclick = (e) => {
      const b = e.target.closest('.slot');
      if (!b || b.disabled) return;
      m.querySelectorAll('.slot').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      sel.time = b.dataset.slot;
    };
    $('#b-submit', m).onclick = async (e) => {
      const date = $('#b-date', m).value;
      if (!date) return toast('Please choose a date', true);
      if (!sel.time) return toast('Please choose a time slot', true);
      const fee = feeFor();
      e.target.disabled = true;
      try {
        const bk = await api('/bookings', { method: 'POST', body: {
          userEmail: u.email, userName: u.name, phone: $('#b-phone', m).value,
          service: $('#b-service', m).value, district: $('#b-district', m).value, date, time: sel.time,
          address: $('#b-address', m).value, panditEmail: p.email, fee,
          advanceAmount: $('#b-adv', m).checked ? Math.round(fee * 0.25) : 0
        } });
        closeModal();
        toast(`Booked! ID ${bk.bookingId}. Confirmation email sent.`);
        showView('dashboard');
      } catch (err) { toast(err.message, true); e.target.disabled = false; }
    };
  });
}

/* ---------- admin direct portal (passwordless) ---------- */
async function openAdminDirect() {
  try {
    const r = await api('/auth/admin-direct', { method: 'POST' });
    saveSession(r.user, r.token);
    toast('Welcome, Super Admin! 🛡️ Access granted without password.');
    showView('dashboard');
  } catch (e) {
    saveSession({ name: 'Super Admin', email: 'admin@pujaconnect.com', phone: '0000000000', role: 'admin' }, 'super_admin_token');
    toast('Access granted: Admin Dashboard');
    showView('dashboard');
  }
}

/* ---------- auth ---------- */
function openAuth(mode = 'login') {
  const isLogin = mode === 'login';
  if (isLogin) {
    // Side-by-Side Dual Login: Left Devotee, Right Pandit
    openModal('Login / My Account', `
      <div class="dual-auth-container">
        <!-- Devotee Column -->
        <div class="auth-column" style="background:#fffcf5;border:1.5px solid #ebd9be;border-radius:14px;padding:22px;display:flex;flex-direction:column;gap:14px">
          <div style="text-align:center;border-bottom:1px solid #ebd9be;padding-bottom:12px">
            <span style="font-size:32px;display:block">🙏</span>
            <h3 style="margin:6px 0 4px;color:var(--mahogany);font-size:18px">Devotee Login</h3>
            <span class="muted" style="font-size:12px">No password or OTP needed. Just enter your registered email.</span>
          </div>
          <div>
            <label style="font-weight:600">Registered Email</label>
            <input id="devotee-email" type="email" autocomplete="email" placeholder="devotee@example.com" style="margin-top:4px">
          </div>
          <button class="btn btn-gold" id="devotee-submit" style="width:100%;padding:10px;font-size:14px">
            <span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:4px">login</span> Login as Devotee
          </button>
          <div style="text-align:center;margin-top:auto;padding-top:12px;border-top:1px dashed #ebd9be">
            <span class="muted" style="font-size:12px">New to PujaConnect?</span><br>
            <a href="#" data-action="showRegister" style="color:var(--ochre);font-weight:700;font-size:13px;text-decoration:none">Create Devotee Account →</a>
          </div>
        </div>

        <!-- Pandit Column -->
        <div class="auth-column" style="background:#fffcf5;border:1.5px solid #ebd9be;border-radius:14px;padding:22px;display:flex;flex-direction:column;gap:14px">
          <div style="text-align:center;border-bottom:1px solid #ebd9be;padding-bottom:12px">
            <span style="font-size:32px;display:block">🕉️</span>
            <h3 style="margin:6px 0 4px;color:var(--mahogany);font-size:18px">Pandit Login</h3>
            <span class="muted" style="font-size:12px">Secure login via one-time verification code (OTP) sent to your email.</span>
          </div>
          <div>
            <label style="font-weight:600">Registered Pandit Email</label>
            <div style="display:flex;gap:8px;margin-top:4px">
              <input id="pandit-email" type="email" autocomplete="email" placeholder="pandit@example.com" style="flex:1">
              <button type="button" class="btn btn-outline dark btn-sm" id="btn-send-otp" style="white-space:nowrap;padding:0 12px;font-weight:600">Send OTP</button>
            </div>
          </div>
          <div id="pandit-otp-box" style="display:none;background:#fbf3e4;padding:12px;border-radius:8px;border:1px dashed var(--ochre)">
            <label style="font-weight:600">Enter 6-Digit Email OTP</label>
            <input id="pandit-otp" type="text" maxlength="6" placeholder="• • • • • •" style="letter-spacing:6px;font-size:20px;text-align:center;font-weight:700;margin-top:4px">
            <small id="pandit-otp-msg" class="muted" style="display:block;margin-top:4px;font-size:11px"></small>
          </div>
          <button class="btn btn-gold" id="pandit-submit" style="width:100%;padding:10px;font-size:14px" disabled>
            <span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:4px">verified_user</span> Verify OTP &amp; Login
          </button>
          <div style="text-align:center;margin-top:auto;padding-top:12px;border-top:1px dashed #ebd9be">
            <span class="muted" style="font-size:12px">Are you a Vedic Pandit?</span><br>
            <a href="#" data-action="panditRegister" style="color:var(--ochre);font-weight:700;font-size:13px;text-decoration:none">Register as Pandit →</a>
          </div>
        </div>
      </div>`, (m) => {
      // Devotee Login Handler (No password, no OTP - Email only)
      $('#devotee-submit', m).onclick = async () => {
        const email = $('#devotee-email', m).value.trim();
        if (!email) return toast('Please enter your registered devotee email', true);
        try {
          const r = await api('/auth/devotee-login', { method: 'POST', body: { email } });
          afterAuth(r);
        } catch (e) { toast(e.message, true); }
      };

      // Pandit Send OTP Handler
      let sentEmail = '';
      $('#btn-send-otp', m).onclick = async () => {
        const email = $('#pandit-email', m).value.trim();
        if (!email) return toast('Please enter your registered Pandit email first', true);
        const btn = $('#btn-send-otp', m);
        btn.disabled = true;
        btn.textContent = 'Sending…';
        try {
          const res = await api('/auth/pandit/send-otp', { method: 'POST', body: { email } });
          sentEmail = email;
          $('#pandit-otp-box', m).style.display = 'block';
          $('#pandit-submit', m).disabled = false;
          btn.textContent = 'Resend OTP';
          btn.disabled = false;
          $('#pandit-otp-msg', m).innerHTML = 'A 6-digit verification code was sent to <b>' + esc(email) + '</b>.<br><span style="font-size:12px;color:var(--muted)">Please check your inbox or spam folder.</span>';
          toast('Verification code sent to your email! 🙏 Check inbox/spam.');
        } catch (e) {
          btn.disabled = false;
          btn.textContent = 'Send OTP';
          toast(e.message, true);
        }
      };

      // Pandit Verify & Login Handler
      $('#pandit-submit', m).onclick = async () => {
        const email = sentEmail || $('#pandit-email', m).value.trim();
        const otp = $('#pandit-otp', m).value.trim();
        if (!email) return toast('Please enter your Pandit email', true);
        if (!otp || otp.length < 4) return toast('Please enter the verification code sent to your email', true);
        try {
          const r = await api('/auth/pandit/verify-otp', { method: 'POST', body: { email, otp } });
          afterAuth(r);
        } catch (e) { toast(e.message, true); }
      };
    }, true);
  } else {
    // Devotee Registration: All States of India, NO PASSWORD required
    openModal('Create Devotee Account', `
      <div style="background:#fffcf5;border:1px solid #ebd9be;border-radius:10px;padding:12px;margin-bottom:6px;text-align:center">
        <span class="muted" style="font-size:12px">No password required. You will be able to log in instantly with your registered email!</span>
      </div>
      <div><label style="font-weight:600">Full Name</label><input id="r-name" placeholder="Devotee Full Name"></div>
      <div><label style="font-weight:600">Email Address (used for login)</label><input id="r-email" type="email" placeholder="devotee@example.com"></div>
      <div><label style="font-weight:600">Phone Number</label><input id="r-phone" type="tel" placeholder="10-digit mobile number"></div>
      <div class="form-grid" style="padding:0">
        <div><label style="font-weight:600">State</label><select id="r-state">${opts(Object.keys(LOCATIONS), 'Odisha')}</select></div>
        <div><label style="font-weight:600">District</label><select id="r-district"></select></div>
      </div>
      <button class="btn btn-gold" id="r-submit" style="margin-top:10px;width:100%"><span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:4px">person_add</span> Create Account &amp; Login</button>
      <p class="muted" style="text-align:center;margin:8px 0 0">Already registered? <a href="#" data-action="showLogin" style="color:var(--ochre);font-weight:600">Login here</a></p>`, (m) => {
      const updateRegDistricts = () => {
        const ds = LOCATIONS[$('#r-state', m).value] || [];
        $('#r-district', m).innerHTML = opts(ds, ds[0] || '', 'Select District');
      };
      updateRegDistricts();
      $('#r-state', m).onchange = updateRegDistricts;

      $('#r-submit', m).onclick = async () => {
        const name = $('#r-name', m).value.trim();
        const email = $('#r-email', m).value.trim();
        const phone = $('#r-phone', m).value.trim();
        const state = $('#r-state', m).value;
        const district = $('#r-district', m).value;
        if (!name || !email || !phone) return toast('Name, email and phone are required', true);
        if (!district) return toast('Please select your district', true);
        try {
          const r = await api('/auth/register', { method: 'POST', body: { name, email, phone, state, district } });
          afterAuth(r);
        } catch (e) { toast(e.message, true); }
      };
    });
  }
}
function afterAuth(r) {
  saveSession(r.user, r.token);
  closeModal();
  toast('Namaste, ' + r.user.name + ' 🙏');
  const next = S.afterLogin; S.afterLogin = null;
  if (next) next(); else showView('dashboard');
}

/* ---------- pandit registration ---------- */
function openPanditRegister() {
  const shorts = S.pujas.map((p) => p.name);
  openModal('Pandit Registration', `
    <div class="form-grid" style="padding:0">
      <div><label>Full Name</label><input id="p-name" placeholder="Pt. Name"></div>
      <div><label>Email</label><input id="p-email" type="email" placeholder="pandit@example.com"></div>
      <div><label>Phone (used to log in)</label><input id="p-phone" type="tel" placeholder="10-digit mobile"></div>
      <div><label>Experience (years)</label><input id="p-exp" type="number" min="0" value="5"></div>
      <div><label>State</label><select id="p-state">${opts(Object.keys(LOCATIONS), 'Odisha')}</select></div>
      <div><label>Home District</label><select id="p-district"></select></div>
      <div><label>City</label><input id="p-city" placeholder="e.g. Bhubaneswar"></div>
      <div><label>Base Dakshina per puja (₹)</label><input id="p-fee" type="number" min="0" value="1500"></div>
      <div class="full"><label>Pujas you perform</label><div class="checks">${shorts.map((n) => `<label class="check"><input type="checkbox" name="p-svc" value="${esc(n)}">${esc(n)}</label>`).join('')}</div></div>
      <div class="full"><label>Specialty</label><input id="p-spec" placeholder="e.g. Rudrabhishek & Griha Pravesh"></div>
      <div class="full"><label>Short Bio</label><textarea id="p-bio" rows="2" placeholder="Tell devotees about your Vedic background and rituals."></textarea></div>
      <div class="full">
        <label>Upload Pandit Photo (Direct Photo Upload)</label>
        <div style="border: 2px dashed var(--ochre); border-radius: 12px; padding: 18px; text-align: center; background: #fffcf5;">
          <input type="file" id="p-photo-file" accept="image/*" style="display:none">
          <button type="button" class="btn btn-outline dark btn-sm" id="p-photo-btn"><span class="material-icons" style="font-size:16px;vertical-align:middle;margin-right:4px">add_a_photo</span> Choose Photo from Device</button>
          <div id="p-photo-name" class="muted" style="margin-top:8px;font-size:13px">No photo selected (JPG, PNG, WebP)</div>
          <div id="p-photo-preview-wrap" style="display:none;margin-top:12px">
            <img id="p-photo-preview" src="" alt="Pandit Preview" style="width:110px;height:110px;object-fit:cover;border-radius:50%;border:3px solid var(--ochre);box-shadow:0 4px 14px rgba(0,0,0,0.12)">
          </div>
        </div>
      </div>
    </div>
    <button class="btn btn-gold" id="p-submit" style="margin-top:16px;width:100%"><span class="material-icons">send</span> Submit Registration</button>`, (m) => {
    let photoDataUrl = '';
    const paint = () => {
      const ds = LOCATIONS[$('#p-state', m).value] || [];
      $('#p-district', m).innerHTML = opts(ds, ds[0] || '', 'Select District');
    };
    paint();
    $('#p-state', m).onchange = paint;

    const fileInput = $('#p-photo-file', m);
    $('#p-photo-btn', m).onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      $('#p-photo-name', m).textContent = file.name + ' (' + Math.round(file.size / 1024) + ' KB)';
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoDataUrl = ev.target.result;
        $('#p-photo-preview', m).src = photoDataUrl;
        $('#p-photo-preview-wrap', m).style.display = 'block';
      };
      reader.readAsDataURL(file);
    };

    $('#p-submit', m).onclick = async () => {
      const checked = (n) => [...m.querySelectorAll(`input[name="${n}"]:checked`)].map((i) => i.value);
      const home = $('#p-district', m).value;
      if (!home) return toast('Please select your home district', true);
      const body = {
        name: $('#p-name', m).value,
        email: $('#p-email', m).value,
        phone: $('#p-phone', m).value,
        state: $('#p-state', m).value,
        workingState: $('#p-state', m).value,
        district: home,
        city: $('#p-city', m).value,
        workingDistricts: [home],
        experience: $('#p-exp', m).value,
        fee: $('#p-fee', m).value,
        services: checked('p-svc'),
        specialty: $('#p-spec', m).value || undefined,
        bio: $('#p-bio', m).value || undefined,
        photo: photoDataUrl || undefined
      };
      if (!body.name || !body.email || !body.phone) return toast('Name, email and phone are required', true);
      if (!body.services.length) return toast('Select at least one puja', true);
      try {
        await api('/pandits/register', { method: 'POST', body });
        closeModal();
        toast('Registration submitted! Welcome to PujaConnect 🙏');
      } catch (e) { toast(e.message, true); }
    };
  });
}

/* ---------- multi-day customizer ---------- */
function renderLongForm() {
  const longs = S.pujas.filter((p) => p.type === 'Long');
  const f = $('#long-form');
  const pre = S.longPreset || (longs[0] && longs[0].name);
  f.innerHTML = `
    <div class="full"><label>Puja / Mahayajna</label><select id="l-puja">${opts(longs.map((p) => p.name), pre)}</select></div>
    <div><label>Start Date</label><input type="date" id="l-from" min="${today()}" required></div>
    <div><label>End Date</label><input type="date" id="l-to" min="${today()}" required></div>
    <div><label>Daily Duration (hours)</label><input type="number" id="l-hours" min="1" max="12" value="4"></div>
    <div><label>Pandits Required</label><input type="number" id="l-count" min="1" max="21" value="1"></div>
    <div><label>State</label><select id="l-state">${opts(Object.keys(LOCATIONS), 'Odisha')}</select></div>
    <div><label>District</label><select id="l-district"></select></div>
    <div class="full cost-box"><div class="row"><span id="l-breakdown" class="muted">Pick your dates to see the estimate.</span><b id="l-cost">₹0</b></div>
      <label class="check" style="margin-top:10px"><input type="checkbox" id="l-adv"> Pay 25% advance deposit now (demo – no real payment is taken)</label></div>
    <div class="full"><button class="btn btn-gold" type="submit">Submit Request</button></div>`;
  const calc = () => {
    const p = longs.find((x) => x.name === $('#l-puja').value);
    const from = $('#l-from').value, to = $('#l-to').value;
    if (!p || !from || !to || to < from) { $('#l-cost').textContent = inr(0); return null; }
    const days = Math.round((new Date(to) - new Date(from)) / 86400000) + 1;
    const hrs = Math.max(1, +$('#l-hours').value || 1), n = Math.max(1, +$('#l-count').value || 1);
    const total = days * hrs * n * (p.perHourFee || 500);
    $('#l-breakdown').textContent = `${days} day(s) × ${hrs} hr × ${n} Pandit(s) × ${inr(p.perHourFee || 500)}/hr`;
    $('#l-cost').textContent = inr(total);
    return total;
  };
  const fillD = () => ($('#l-district').innerHTML = opts(LOCATIONS[$('#l-state').value] || []));
  fillD();
  ['l-puja', 'l-from', 'l-to', 'l-hours', 'l-count'].forEach((id) => ($('#' + id).oninput = calc));
  $('#l-state').onchange = fillD;
  f.onsubmit = async (e) => {
    e.preventDefault();
    if (!requireLogin(() => f.requestSubmit())) return;
    const total = calc();
    if (total === null) return toast('Please choose valid start and end dates', true);
    try {
      const r = await api('/long-puja-requests', { method: 'POST', body: {
        userEmail: S.user.email, userName: S.user.name, phone: S.user.phone, pujaName: $('#l-puja').value,
        district: $('#l-district').value, fromDate: $('#l-from').value, toDate: $('#l-to').value,
        dailyHours: +$('#l-hours').value, requiredPandits: +$('#l-count').value,
        advanceAmount: $('#l-adv').checked ? Math.round(total * 0.25) : 0
      } });
      toast(`Request ${r.id} submitted. Confirmation email sent.`);
      showView('dashboard');
    } catch (err) { toast(err.message, true); }
  };
}

/* ---------- dashboards ---------- */
const statusBadge = (s) => `<span class="badge ${['Completed', 'Confirmed', 'Verified', 'Assigned', 'Accepted'].includes(s) ? 'green' : ['Cancelled', 'Rejected', 'Declined'].includes(s) ? 'red' : 'amber'}">${esc(s)}</span>`;

async function renderDashboard() {
  const root = $('#dashboard-root');
  if (!S.user) return;
  root.innerHTML = '<div class="empty">Loading your dashboard…</div>';
  try {
    if (S.user.role === 'admin') await adminDash(root);
    else if (S.user.role === 'pandit') await panditDash(root);
    else await userDash(root);
  } catch (e) {
    if (/Authentication|Admin access/.test(e.message)) { saveSession(null); showView('home'); toast('Session expired. Please log in again.', true); }
    else root.innerHTML = `<div class="empty">${esc(e.message)}</div>`;
  }
}

async function userDash(root) {
  const e = encodeURIComponent(S.user.email);
  const [bookings, longs] = await Promise.all([
    api('/bookings?userEmail=' + e).catch(() => []),
    api('/long-puja-requests?userEmail=' + e).catch(() => [])
  ]);
  S.bookings = bookings;
  const tab = S.dashTab || 'bookings';
  const upcoming = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'In Progress').length;
  const initial = (S.user.name || 'D').charAt(0).toUpperCase();

  root.innerHTML = `
    <div class="dash-banner">
      <div class="dash-user-info">
        <div class="dash-avatar">${initial}</div>
        <div class="dash-title-wrap">
          <h2>Namaste, ${esc(S.user.name)} 🙏</h2>
          <p>${esc(S.user.email)} · ${esc(S.user.phone || 'No phone')} · <span class="badge green" style="margin:0">Devotee Account</span></p>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-gold btn-sm" data-action="dashTab" data-tab="explore"><span class="material-icons">spa</span> Explore All Pujas</button>
        <button class="btn btn-outline btn-sm" data-action="nav" data-view="home"><span class="material-icons">home</span> Home</button>
        <button class="btn btn-outline btn-sm" data-action="logout" title="Logout"><span class="material-icons">logout</span> Logout</button>
      </div>
    </div>

    <div class="stats">
      <div class="stat"><b>${bookings.length}</b><span>Total Bookings</span></div>
      <div class="stat"><b>${upcoming}</b><span>Upcoming Rituals</span></div>
      <div class="stat"><b>${longs.length}</b><span>Multi-Day Requests</span></div>
    </div>

    <!-- Devotee Subtabs -->
    <div class="dash-subtabs">
      <button class="subtab ${tab === 'bookings' ? 'active' : ''}" data-action="dashTab" data-tab="bookings">
        <span class="material-icons">event</span> My Bookings <span class="subtab-badge">${bookings.length}</span>
      </button>
      <button class="subtab ${tab === 'payments' ? 'active' : ''}" data-action="dashTab" data-tab="payments">
        <span class="material-icons">payments</span> Payment Tracking
      </button>
      <button class="subtab ${tab === 'explore' ? 'active' : ''}" data-action="dashTab" data-tab="explore">
        <span class="material-icons">spa</span> Explore All Pujas
      </button>
      <button class="subtab ${tab === 'long' ? 'active' : ''}" data-action="dashTab" data-tab="long">
        <span class="material-icons">event_note</span> Multi-Day Yajnas <span class="subtab-badge">${longs.length}</span>
      </button>
      <button class="subtab ${tab === 'profile' ? 'active' : ''}" data-action="dashTab" data-tab="profile">
        <span class="material-icons">account_circle</span> My Profile
      </button>
    </div>

    <div id="dash-tab-content">
      ${tab === 'bookings' ? renderDevoteeBookingsTab(bookings) : ''}
      ${tab === 'payments' ? renderDevoteePaymentTrackingTab(bookings) : ''}
      ${tab === 'explore' ? renderDevoteeExploreTab() : ''}
      ${tab === 'long' ? renderDevoteeLongTab(longs) : ''}
      ${tab === 'profile' ? renderDevoteeProfileTab(bookings.length) : ''}
    </div>
  `;
}

function renderDevoteePaymentTrackingTab(bookings) {
  if (!bookings.length) {
    return `
      <div class="panel empty" style="padding:48px 20px">
        <span class="material-icons" style="font-size:48px;color:var(--ochre)">payments</span>
        <h3 style="margin:12px 0 6px">No Payment Records Yet</h3>
        <p class="muted">Book a ritual with a verified Pandit to track your Dakshina payments and receipts.</p>
        <button class="btn btn-gold" data-action="bookCta" style="margin-top:8px"><span class="material-icons">search</span> Find a Pandit</button>
      </div>
    `;
  }

  return `
    <div style="display:flex;flex-direction:column;gap:16px">
      ${bookings.map((b) => {
        const fee = b.fee || 1500;
        const advance = b.advanceAmount || 0;
        const isPaid = b.paymentStatus === 'Paid';
        const isVerifying = b.paymentStatus === 'Verification Pending';
        const remaining = Math.max(0, isPaid ? 0 : fee - (b.advancePaid ? advance : 0));
        const isPanditApproved = b.status === 'Confirmed' || b.status === 'In Progress' || b.panditApproval === 'Approved';

        let statusSnippet = '';
        if (isPaid) {
          statusSnippet = `<span class="badge green"><span class="material-icons" style="font-size:14px">check_circle</span> Paid &amp; Verified</span>`;
        } else if (isVerifying) {
          statusSnippet = `<span class="badge amber"><span class="material-icons" style="font-size:14px">hourglass_top</span> Payment Verification Pending</span>`;
        } else if (b.status === 'Cancelled') {
          statusSnippet = `<span class="badge red">Ceremony Cancelled</span>`;
        } else {
          statusSnippet = `<span class="badge amber">Payment Pending</span>`;
        }

        let actionButton = '';
        if (isPaid) {
          actionButton = `
            <button class="btn btn-gold btn-sm" data-action="viewBill" data-id="${esc(b.bookingId)}">
              <span class="material-icons">receipt_long</span> View / Print Bill
            </button>
          `;
        } else if (isVerifying) {
          actionButton = `
            <div style="display:flex;align-items:center;gap:6px;color:var(--ochre);font-weight:600;font-size:13px">
              <span class="material-icons">pending_actions</span> Proof Submitted (Ref: ${esc(b.paymentProof || 'Submitted')})
            </div>
          `;
        } else if (b.status !== 'Cancelled') {
          if (isPanditApproved) {
            actionButton = `
              <button class="btn btn-gold btn-sm" data-action="payBooking" data-id="${esc(b.bookingId)}">
                <span class="material-icons">account_balance_wallet</span> Pay Remaining Dakshina (${inr(remaining)})
              </button>
            `;
          } else {
            actionButton = `
              <span class="muted" style="font-size:13px">
                <span class="material-icons" style="font-size:15px;vertical-align:middle">schedule</span> Awaiting Pandit Confirmation before payment
              </span>
            `;
          }
        }

        return `
          <div class="payment-card">
            <div class="payment-card-header">
              <div>
                <span class="booking-id-tag">${esc(b.bookingId)}</span>
                <b style="font-size:17px;color:var(--mahogany);margin-left:8px">${esc(b.service)}</b>
              </div>
              <div>${statusSnippet}</div>
            </div>

            <div class="payment-details-grid">
              <div class="payment-detail-item">
                <label>Assigned Pandit</label>
                <b>${esc(b.panditName)}</b>
                <small class="muted">${esc(b.panditEmail)}</small>
              </div>
              <div class="payment-detail-item">
                <label>Ceremony Date &amp; Slot</label>
                <b>${esc(b.date)}</b>
                <small class="muted">${esc(b.time || '10:00 AM')}</small>
              </div>
              <div class="payment-detail-item">
                <label>Total Dakshina</label>
                <b style="color:var(--ochre)">${inr(fee)}</b>
              </div>
              <div class="payment-detail-item">
                <label>Advance Paid</label>
                <b>${inr(b.advancePaid ? advance : 0)}</b>
              </div>
              <div class="payment-detail-item">
                <label>Remaining to Pay</label>
                <b style="color:${remaining > 0 ? 'var(--red)' : 'var(--green)'}">${inr(remaining)}</b>
              </div>
            </div>

            <div class="row" style="margin-top:4px;padding-top:10px;border-top:1px solid var(--border);align-items:center">
              <div style="font-size:13px;color:var(--muted)">
                ${b.address ? `<span class="material-icons" style="font-size:14px;vertical-align:middle">place</span> ${esc(b.address)}` : ''}
              </div>
              <div>${actionButton}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderDevoteeBookingsTab(bookings) {
  if (!bookings.length) {
    return `
      <div class="panel empty" style="padding:48px 20px">
        <span class="material-icons" style="font-size:48px;color:var(--ochre)">self_improvement</span>
        <h3 style="margin:12px 0 6px">No rituals booked yet</h3>
        <p class="muted">Connect with verified Vedic Pandits for authentic home pujas and blessings.</p>
        <button class="btn btn-gold" data-action="bookCta" style="margin-top:8px"><span class="material-icons">search</span> Find a Pandit</button>
      </div>
    `;
  }
  return `
    <div class="booking-cards-grid">
      ${bookings.map((b) => `
        <div class="booking-card">
          <div>
            <div class="booking-card-top">
              <span class="booking-id-tag">${esc(b.bookingId)}</span>
              ${statusBadge(b.status)}
            </div>
            <h4>${esc(b.service)}</h4>
            <div class="booking-meta-row" style="margin-top:8px">
              <span class="material-icons">person</span>
              <span><strong>${esc(b.panditName)}</strong></span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">schedule</span>
              <span>${esc(b.date)} at <b>${esc(b.time || '10:00 AM')}</b></span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">place</span>
              <span>${esc(b.address || b.district)}</span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">payments</span>
              <span>Dakshina: <b>${inr(b.fee)}</b> <small class="muted">(${esc(b.paymentStatus || 'Pending')})</small></span>
            </div>
          </div>
          <div class="booking-card-footer">
            <button class="btn btn-dark btn-sm" data-action="slip" data-id="${esc(b.bookingId)}"><span class="material-icons">print</span> Slip</button>
            <div style="display:flex;gap:6px">
              ${['Confirmed', 'In Progress'].includes(b.status) ? `
                <button class="btn btn-outline dark btn-sm" data-action="reschedule" data-id="${esc(b.bookingId)}">Reschedule</button>
                <button class="btn btn-red btn-sm" data-action="cancelBooking" data-id="${esc(b.bookingId)}">Cancel</button>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDevoteeExploreTab() {
  const shortPujas = S.pujas.filter((p) => p.type === 'Short');
  const longPujas = S.pujas.filter((p) => p.type === 'Long');
  return `
    <div class="panel" style="margin-bottom:20px">
      <div class="row" style="flex-wrap:wrap;gap:12px">
        <div>
          <h3 style="margin:0"><span class="material-icons" style="vertical-align:middle;color:var(--ochre)">spa</span> Explore Sacred Vedic Pujas</h3>
          <p class="muted" style="margin:4px 0 0">Browse through authentic home rituals and multi-day ceremonies conducted by verified Pandits.</p>
        </div>
        <button class="btn btn-gold btn-sm" data-action="bookCta"><span class="material-icons">person_search</span> Find a Pandit</button>
      </div>
    </div>

    <h3 style="margin:24px 0 14px;color:var(--mahogany);display:flex;align-items:center;gap:8px">
      <span class="material-icons" style="color:var(--ochre)">home</span> Popular Home Pujas
    </h3>
    <div class="grid" style="margin-bottom:32px">
      ${shortPujas.map((p) => `
        <div class="card">
          <div class="thumb" style="background-image:url('${esc(p.image)}')"></div>
          <div class="body">
            <h3>${esc(p.name)}</h3>
            <p class="muted" style="margin:0 0 8px;font-size:13.5px">${esc(p.desc)}</p>
            <div>${(p.benefits || []).map((b) => `<span class="badge">✦ ${esc(b)}</span>`).join('')}</div>
            <div class="row" style="margin-top:14px">
              <span class="price">${inr(p.baseFee)}</span>
              <button class="btn btn-dark btn-sm" data-action="findFor" data-name="${esc(p.name)}">Book Pandit</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <h3 style="margin:24px 0 14px;color:var(--mahogany);display:flex;align-items:center;gap:8px">
      <span class="material-icons" style="color:var(--ochre)">auto_stories</span> Multi-Day Mahayajnas
    </h3>
    <div class="grid">
      ${longPujas.map((p) => `
        <div class="card">
          <div class="thumb" style="background-image:url('${esc(p.image)}')"></div>
          <div class="body">
            <h3>${esc(p.name)}</h3>
            <p class="muted" style="margin:0 0 8px;font-size:13.5px">${esc(p.desc)}</p>
            <div>${(p.benefits || []).map((b) => `<span class="badge">✦ ${esc(b)}</span>`).join('')}</div>
            <div class="row" style="margin-top:14px">
              <span class="price">${esc(p.price || 'From ' + inr(p.perHourFee) + '/hr')}</span>
              <button class="btn btn-gold btn-sm" data-action="planLong" data-name="${esc(p.name)}">Customize</button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDevoteeLongTab(longs) {
  if (!longs.length) {
    return `
      <div class="panel empty" style="padding:48px 20px">
        <span class="material-icons" style="font-size:48px;color:var(--ochre)">event_note</span>
        <h3 style="margin:12px 0 6px">No multi-day ritual requests yet</h3>
        <p class="muted">Planning a multi-day ceremony like Chandi Path, Bhagavat Katha, or Mahayajna?</p>
        <button class="btn btn-gold" data-action="nav" data-view="long" style="margin-top:8px"><span class="material-icons">add</span> Customize Multi-Day Puja</button>
      </div>
    `;
  }
  return `
    <div class="booking-cards-grid">
      ${longs.map((l) => `
        <div class="booking-card">
          <div>
            <div class="booking-card-top">
              <span class="booking-id-tag">${esc(l.id)}</span>
              ${statusBadge(l.status)}
            </div>
            <h4>${esc(l.pujaName)}</h4>
            <div class="booking-meta-row" style="margin-top:8px">
              <span class="material-icons">calendar_today</span>
              <span>${esc(l.fromDate)} → ${esc(l.toDate)} <small class="muted">(${l.totalDays} days × ${l.dailyHours}h/day)</small></span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">place</span>
              <span>District: <b>${esc(l.district)}</b></span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">groups</span>
              <span>Pandits: <b>${l.assignedPandits.length}/${l.requiredPandits} assigned</b></span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">payments</span>
              <span>Estimated Dakshina: <b>${inr(l.estimatedCost)}</b> ${l.advancePaid ? '<span class="badge green">Advance Paid</span>' : ''}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderDevoteeProfileTab(totalBookings) {
  const u = S.user;
  const initial = (u.name || 'D').charAt(0).toUpperCase();
  return `
    <div class="profile-card">
      <div class="profile-hero">
        <div class="profile-avatar-lg">${initial}</div>
        <div style="flex:1">
          <h3 style="margin:0 0 6px;color:var(--gold);font-size:24px">${esc(u.name)}</h3>
          <span class="role-badge" style="background:#fffcf5;color:#351605">Devotee Account</span>
          <p style="margin:8px 0 0;color:#f1d9aa;font-size:13.5px">Registered Devotee · PujaConnect Blessed Member 🙏</p>
        </div>
        <button class="btn btn-gold btn-sm" data-action="editDevoteeProfile"><span class="material-icons">edit</span> Edit Profile</button>
      </div>
      <div class="profile-grid-details">
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">person</span> Full Name</div>
          <div class="profile-field-value">${esc(u.name)}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">email</span> Registered Email</div>
          <div class="profile-field-value">${esc(u.email)} <span class="badge green" style="font-size:10px;padding:1px 6px">Verified</span></div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">phone</span> Contact Phone</div>
          <div class="profile-field-value">${esc(u.phone || 'Not set')}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">map</span> State &amp; District</div>
          <div class="profile-field-value">${esc(u.district || '')}${u.state ? ', ' + esc(u.state) : (u.district ? '' : 'Not set')}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">location_city</span> City / Town</div>
          <div class="profile-field-value">${esc(u.city || 'Not set')}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">self_improvement</span> Rituals Booked</div>
          <div class="profile-field-value"><b>${totalBookings}</b> completed/scheduled</div>
        </div>
      </div>
    </div>
  `;
}

async function panditDash(root) {
  const email = S.user.email;
  const [plist, bookings, longs] = await Promise.all([
    api('/pandits?email=' + encodeURIComponent(email)).catch(() => []),
    api('/bookings?panditEmail=' + encodeURIComponent(email)).catch(() => []),
    api('/long-puja-requests?panditEmail=' + encodeURIComponent(email)).catch(() => [])
  ]);
  const me = plist[0];
  if (!me) { root.innerHTML = '<div class="empty">Pandit profile not found. Please ensure you are registered.</div>'; return; }
  S.me = me;
  const tab = S.dashTab || 'ceremonies';
  const earned = bookings.filter((b) => b.status === 'Completed').reduce((s, b) => s + (b.fee || 0), 0);
  const pending = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'In Progress').reduce((s, b) => s + (b.fee || 0), 0);

  root.innerHTML = `
    <div class="dash-banner">
      <div class="dash-user-info">
        <img src="${esc(me.photo || 'https://images.unsplash.com/photo-1544168190-79c15427015f?auto=format&fit=crop&q=80&w=200')}" class="dash-avatar" alt="Pandit">
        <div class="dash-title-wrap">
          <h2>Pranam, ${esc(me.name)} ${statusBadge(me.status)}</h2>
          <p>${esc(me.district || me.location || 'Odisha')} · ${esc(me.exp || me.experience + ' Years Exp')} · Base Fee: <b>${inr(me.fee)}</b></p>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-gold btn-sm" data-action="editPanditProfile"><span class="material-icons">edit</span> Edit Profile</button>
        <button class="btn btn-outline btn-sm" data-action="nav" data-view="home"><span class="material-icons">home</span> Home</button>
        <button class="btn btn-outline btn-sm" data-action="logout" title="Logout"><span class="material-icons">logout</span> Logout</button>
      </div>
    </div>

    ${me.verified ? '' : '<div class="panel" style="background:#fffcf5;border-left:4px solid var(--ochre)"><strong>Your profile is under Admin KYC verification.</strong> Once approved, your profile will be actively listed in the verified pandits directory.</div>'}

    <div class="stats">
      <div class="stat"><b>${inr(earned)}</b><span>Dakshina Earned</span></div>
      <div class="stat"><b>${inr(pending)}</b><span>Upcoming Dakshina</span></div>
      <div class="stat"><b>${bookings.length}</b><span>Total Ceremonies</span></div>
    </div>

    <!-- Pandit Subtabs -->
    <div class="dash-subtabs">
      <button class="subtab ${tab === 'ceremonies' ? 'active' : ''}" data-action="dashTab" data-tab="ceremonies">
        <span class="material-icons">notifications</span> Ceremony Requests <span class="subtab-badge">${bookings.length}</span>
      </button>
      <button class="subtab ${tab === 'long' ? 'active' : ''}" data-action="dashTab" data-tab="long">
        <span class="material-icons">event_note</span> Multi-Day Assignments <span class="subtab-badge">${longs.length}</span>
      </button>
      <button class="subtab ${tab === 'avail' ? 'active' : ''}" data-action="dashTab" data-tab="avail">
        <span class="material-icons">schedule</span> Availability &amp; Dakshina
      </button>
      <button class="subtab ${tab === 'profile' ? 'active' : ''}" data-action="dashTab" data-tab="profile">
        <span class="material-icons">account_circle</span> My Profile
      </button>
    </div>

    <div id="dash-tab-content">
      ${tab === 'ceremonies' ? renderPanditCeremoniesTab(bookings) : ''}
      ${tab === 'long' ? renderPanditLongTab(longs, email) : ''}
      ${tab === 'avail' ? renderPanditAvailTab(me) : ''}
      ${tab === 'profile' ? renderPanditProfileTab(me) : ''}
    </div>
  `;
  if (tab === 'avail') {
    setupAvailTabListeners(me);
  }
}

function renderPanditCeremoniesTab(bookings) {
  if (!bookings.length) {
    return `<div class="panel empty" style="padding:48px 20px"><span class="material-icons" style="font-size:48px;color:var(--ochre)">event</span><p>No ceremony bookings assigned yet.</p></div>`;
  }
  return `
    <div class="booking-cards-grid">
      ${bookings.map((b) => `
        <div class="booking-card">
          <div>
            <div class="booking-card-top">
              <span class="booking-id-tag">${esc(b.bookingId)}</span>
              ${statusBadge(b.status)}
            </div>
            <h4>${esc(b.service)}</h4>
            <div class="booking-meta-row" style="margin-top:8px">
              <span class="material-icons">person</span>
              <span>Devotee: <b>${esc(b.userName)}</b> · 📞 ${esc(b.phone || 'N/A')}</span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">schedule</span>
              <span>${esc(b.date)} at <b>${esc(b.time || '10:00 AM')}</b></span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">place</span>
              <span>${esc(b.address || b.district)}</span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">payments</span>
              <span>Dakshina: <b>${inr(b.fee)}</b></span>
            </div>
          </div>
          <div class="booking-card-footer">
            ${b.status === 'Confirmed' ? `
              <button class="btn btn-green btn-sm" data-action="setStatus" data-id="${esc(b.bookingId)}" data-status="In Progress">Accept</button>
              <button class="btn btn-red btn-sm" data-action="setStatus" data-id="${esc(b.bookingId)}" data-status="Cancelled">Decline</button>
            ` : ''}
            ${b.status === 'In Progress' ? `
              <button class="btn btn-dark btn-sm" data-action="setStatus" data-id="${esc(b.bookingId)}" data-status="Completed">Mark Completed ✅</button>
            ` : ''}
            ${['Completed', 'Cancelled'].includes(b.status) ? `<small class="muted">Ceremony ${esc(b.status)}</small>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPanditLongTab(longs, email) {
  if (!longs.length) {
    return `<div class="panel empty" style="padding:48px 20px"><span class="material-icons" style="font-size:48px;color:var(--ochre)">event_note</span><p>No multi-day Mahayajna assignments yet.</p></div>`;
  }
  return `
    <div class="booking-cards-grid">
      ${longs.map((l) => {
        const st = (l.panditStatuses || {})[email] || 'Assigned';
        return `
          <div class="booking-card">
            <div>
              <div class="booking-card-top">
                <span class="booking-id-tag">${esc(l.id)}</span>
                ${statusBadge(st)}
              </div>
              <h4>${esc(l.pujaName)}</h4>
              <div class="booking-meta-row" style="margin-top:8px">
                <span class="material-icons">calendar_today</span>
                <span>${esc(l.fromDate)} → ${esc(l.toDate)} (${l.dailyHours}h/day)</span>
              </div>
              <div class="booking-meta-row">
                <span class="material-icons">place</span>
                <span>District: <b>${esc(l.district)}</b></span>
              </div>
            </div>
            <div class="booking-card-footer">
              ${st === 'Assigned' ? `
                <button class="btn btn-green btn-sm" data-action="longResp" data-id="${esc(l.id)}" data-resp="Accepted">Accept Assignment</button>
                <button class="btn btn-red btn-sm" data-action="longResp" data-id="${esc(l.id)}" data-resp="Declined">Decline</button>
              ` : `<small class="muted">Status: <b>${esc(st)}</b></small>`}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderPanditAvailTab(me) {
  const isApproved = Boolean(me.verified || me.status === 'Verified');
  const curState = me.workingState || me.state || 'Odisha';

  return `
    <!-- KYC Stage Tracker -->
    <div class="kyc-stage-tracker ${isApproved ? 'approved' : 'pending'}">
      <div class="stage-tracker-header">
        <div class="stage-tracker-badge">
          <span class="material-icons">${isApproved ? 'verified' : 'pending_actions'}</span>
          <span>${isApproved ? 'Verification Status: All Stages Approved' : 'Verification Status: Review in Progress'}</span>
        </div>
        <span class="stage-badge-pill ${isApproved ? 'green' : 'amber'}">${isApproved ? 'Active &amp; Verified' : 'Under Review'}</span>
      </div>
      <div class="stages-timeline">
        <div class="stage-step completed">
          <div class="stage-step-icon"><span class="material-icons">check</span></div>
          <div class="stage-step-info">
            <b>Stage 1: Registration</b>
            <span>Credentials &amp; Profile submitted</span>
          </div>
        </div>
        <div class="stage-step ${isApproved ? 'completed' : 'active'}">
          <div class="stage-step-icon"><span class="material-icons">${isApproved ? 'check' : 'hourglass_top'}</span></div>
          <div class="stage-step-info">
            <b>Stage 2: Admin Lineage &amp; KYC</b>
            <span>${isApproved ? 'ID and Vedic lineage approved' : 'Admin reviewing credentials'}</span>
          </div>
        </div>
        <div class="stage-step ${isApproved ? 'completed' : ''}">
          <div class="stage-step-icon"><span class="material-icons">${isApproved ? 'check' : 'lock'}</span></div>
          <div class="stage-step-info">
            <b>Stage 3: District Pricing</b>
            <span>${isApproved ? 'Multi-district pricing activated' : 'Unlocks upon approval'}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Working Districts & District-wise Fees Section -->
    <div class="panel-section-box">
      <div class="section-box-header">
        <div class="box-icon"><span class="material-icons">place</span></div>
        <div style="flex:1">
          <h4>Working Districts &amp; District-wise Dakshina Fees</h4>
          <p class="muted">Select your state, choose the districts you serve, and set your custom ritual Dakshina fee for each district.</p>
        </div>
        ${isApproved ? '<span class="badge green"><span class="material-icons">check_circle</span> Approved for Districts</span>' : '<span class="badge amber">Pending Admin Approval</span>'}
      </div>

      <div style="margin-top:16px">
        <label for="av-state" style="font-weight:600">Working State</label>
        <select id="av-state" style="max-width:320px;margin-top:4px">
          ${opts(Object.keys(LOCATIONS), curState)}
        </select>
      </div>

      <div style="margin-top:18px">
        <div class="row" style="margin-bottom:6px">
          <label style="margin:0;font-weight:600">Select Districts You Serve in <span id="cur-state-name" style="color:var(--mahogany)">${esc(curState)}</span>:</label>
          <div style="display:flex;gap:6px">
            <button type="button" class="btn btn-outline dark btn-sm" id="btn-select-all-dist">Select All</button>
            <button type="button" class="btn btn-outline dark btn-sm" id="btn-clear-dist">Clear</button>
          </div>
        </div>
        <div class="district-selection-grid" id="district-checkboxes"></div>
      </div>

      <div style="margin-top:24px;border-top:1px solid var(--border);padding-top:18px">
        <div class="row" style="margin-bottom:12px;flex-wrap:wrap;gap:10px">
          <div>
            <h4 style="margin:0;font-size:15px;color:var(--mahogany)">Per-District Dakshina Fees (₹)</h4>
            <small class="muted">Enter custom Dakshina for each selected district</small>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="number" id="quick-fill-fee" placeholder="Amount (e.g. 1500)" style="width:140px;padding:6px 10px;font-size:13px">
            <button type="button" class="btn btn-gold btn-sm" id="btn-apply-all-fees">Apply to All</button>
          </div>
        </div>
        <div id="district-fee-table" class="district-fees-container"></div>
      </div>
    </div>

    <!-- Modern Manage Working Availability & Time Slots -->
    <div class="panel-section-box">
      <div class="section-box-header">
        <div class="box-icon"><span class="material-icons">schedule</span></div>
        <div>
          <h4>Manage Working Availability &amp; Ritual Time Slots</h4>
          <p class="muted">Choose your available days and manage interactive time slots for puja bookings.</p>
        </div>
      </div>

      <!-- Weekly Available Days Toggle Pills -->
      <label style="margin-top:16px;display:block;font-weight:600">Available Days of the Week</label>
      <div class="day-pills-wrap" id="av-days">
        ${DAYS.map((d) => `
          <label class="day-toggle-pill">
            <input type="checkbox" value="${d}" ${(me.availableDays || []).includes(d) ? 'checked' : ''}>
            <span class="day-pill-text">${d}</span>
          </label>
        `).join('')}
      </div>

      <!-- Active Time Slots Chips Manager -->
      <div style="margin-top:22px">
        <div class="row" style="margin-bottom:10px;flex-wrap:wrap;gap:8px">
          <label style="margin:0;font-weight:600">Configured Ritual Time Slots</label>
          <div class="slot-preset-group">
            <button type="button" class="btn btn-outline dark btn-sm" id="preset-all-slots">All Standard Slots</button>
            <button type="button" class="btn btn-outline dark btn-sm" id="preset-morning">Morning Only</button>
            <button type="button" class="btn btn-outline dark btn-sm" id="preset-evening">Evening Only</button>
          </div>
        </div>

        <div class="active-slots-grid" id="slots-container"></div>

        <div class="add-slot-bar">
          <div class="add-slot-input-group">
            <span class="material-icons">access_time</span>
            <input type="text" id="new-slot-input" placeholder="e.g. 06:30 AM - 09:30 AM" class="slot-text-input">
          </div>
          <button type="button" class="btn btn-gold btn-sm" id="btn-add-slot">
            <span class="material-icons">add</span> Add Custom Slot
          </button>
        </div>
      </div>

      <!-- Default Base Fee Fallback -->
      <div style="margin-top:20px;border-top:1px solid var(--border);padding-top:16px">
        <label style="font-weight:600" for="av-fee">Default Base Dakshina (₹)</label>
        <input id="av-fee" type="number" value="${me.fee || 1500}" style="max-width:240px;margin-top:4px" placeholder="1500">
        <small class="muted" style="display:block;margin-top:4px">Standard Dakshina applied if a district doesn't have a custom rate set.</small>
      </div>
    </div>

    <!-- Pandit Bank & UPI Payout Details Section -->
    <div class="panel-section-box">
      <div class="section-box-header">
        <div class="box-icon"><span class="material-icons">account_balance</span></div>
        <div style="flex:1">
          <h4>Bank &amp; UPI Payout Details (For Devotee Payments)</h4>
          <p class="muted">After ceremony approval, devotees will pay their Dakshina directly to these bank/UPI details.</p>
        </div>
      </div>

      <div class="form-grid" style="padding:16px 0 0">
        <div>
          <label style="font-weight:600">Bank Account Number</label>
          <input type="text" id="p-bank-acc" value="${esc(me.bankAccount || '')}" placeholder="e.g. 123456789012">
        </div>
        <div>
          <label style="font-weight:600">IFSC Code</label>
          <input type="text" id="p-bank-ifsc" value="${esc(me.ifscCode || '')}" placeholder="e.g. SBIN0001234" style="text-transform:uppercase">
        </div>
        <div>
          <label style="font-weight:600">UPI ID / Number (UI Number)</label>
          <input type="text" id="p-bank-upi" value="${esc(me.upiId || '')}" placeholder="e.g. 9876543210@upi or yourname@okaxis">
        </div>
        <div>
          <label style="font-weight:600">Bank Name</label>
          <input type="text" id="p-bank-name" value="${esc(me.bankName || '')}" placeholder="e.g. State Bank of India">
        </div>
        <div>
          <label style="font-weight:600">Account Holder Name</label>
          <input type="text" id="p-bank-holder" value="${esc(me.accountHolder || me.name)}" placeholder="As per bank passbook">
        </div>
        <div>
          <label style="font-weight:600">QR Code Image (Optional)</label>
          <input type="file" id="p-qr-file" accept="image/*" style="font-size:12px;padding:6px">
          <input type="hidden" id="p-qr-val" value="${esc(me.qrCode || '')}">
          <div id="p-qr-preview-wrap" style="${me.qrCode ? 'display:block;' : 'display:none;'}margin-top:8px">
            <img id="p-qr-preview" src="${esc(me.qrCode || '')}" style="width:100px;height:100px;object-fit:contain;border-radius:8px;border:1px solid var(--border)">
          </div>
        </div>
      </div>
    </div>

    <!-- Prominent Save Action -->
    <div style="margin:20px 0 36px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <button class="btn btn-gold btn-lg" id="btn-save-all-avail" data-action="saveAvail">
        <span class="material-icons">save</span> Save Availability, Districts &amp; Bank Details
      </button>
    </div>
  `;
}

function setupAvailTabListeners(me) {
  const container = $('#dash-tab-content');
  if (!container) return;

  let curState = me.workingState || me.state || 'Odisha';
  let curDistricts = new Set(
    Array.isArray(me.workingDistricts) && me.workingDistricts.length
      ? me.workingDistricts
      : [me.district || (LOCATIONS[curState] && LOCATIONS[curState][0]) || 'Khordha']
  );
  let curPrices = { ...(me.districtPrices || {}) };
  let slots = [...(me.timeSlots && me.timeSlots.length ? me.timeSlots : DEFAULT_SLOTS)];

  const stateSelect = $('#av-state', container);
  const stateLabel = $('#cur-state-name', container);
  const checkboxesWrap = $('#district-checkboxes', container);
  const feeTableWrap = $('#district-fee-table', container);
  const slotsWrap = $('#slots-container', container);

  // QR Code file upload preview
  const qrFile = $('#p-qr-file', container);
  const qrVal = $('#p-qr-val', container);
  const qrPreview = $('#p-qr-preview', container);
  const qrWrap = $('#p-qr-preview-wrap', container);
  if (qrFile && qrVal && qrPreview && qrWrap) {
    qrFile.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        qrVal.value = evt.target.result;
        qrPreview.src = evt.target.result;
        qrWrap.style.display = 'block';
      };
      reader.readAsDataURL(file);
    };
  }

  if (!stateSelect || !checkboxesWrap || !feeTableWrap || !slotsWrap) return;

  function renderSlots() {
    if (!slots.length) {
      slotsWrap.innerHTML = '<span class="muted" style="font-size:13px">No time slots added. Use presets or add custom slots below.</span>';
      return;
    }
    slotsWrap.innerHTML = slots.map((s, idx) => `
      <div class="slot-card-chip">
        <span class="material-icons clock-icon">schedule</span>
        <span>${esc(s)}</span>
        <button type="button" class="slot-remove-btn" data-slot-idx="${idx}" title="Remove slot">
          <span class="material-icons">close</span>
        </button>
      </div>
    `).join('');

    slotsWrap.querySelectorAll('.slot-remove-btn').forEach((btn) => {
      btn.onclick = () => {
        const i = +btn.dataset.slotIdx;
        slots.splice(i, 1);
        renderSlots();
      };
    });
  }

  function renderDistrictCheckboxes() {
    const list = LOCATIONS[curState] || [];
    checkboxesWrap.innerHTML = list.map((d) => `
      <label class="district-check">
        <input type="checkbox" value="${esc(d)}" ${curDistricts.has(d) ? 'checked' : ''}>
        <span>${esc(d)}</span>
      </label>
    `).join('') || '<span class="muted">No districts available for this state.</span>';

    checkboxesWrap.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
      chk.onchange = () => {
        const d = chk.value;
        if (chk.checked) {
          curDistricts.add(d);
          if (!curPrices[d]) curPrices[d] = +$('#av-fee', container).value || me.fee || 1500;
        } else {
          curDistricts.delete(d);
        }
        renderDistrictFeeInputs();
      };
    });
  }

  function renderDistrictFeeInputs() {
    const distArr = Array.from(curDistricts);
    if (!distArr.length) {
      feeTableWrap.innerHTML = '<div class="empty" style="padding:20px;grid-column:1/-1"><span class="muted">No districts selected. Select districts above to configure fees.</span></div>';
      return;
    }
    feeTableWrap.innerHTML = distArr.map((d) => {
      const price = curPrices[d] !== undefined ? curPrices[d] : (me.fee || 1500);
      return `
        <div class="district-fee-row">
          <span class="district-fee-row-name">
            <span class="material-icons">place</span>
            ${esc(d)}
          </span>
          <div class="district-fee-input-wrap">
            <span>₹</span>
            <input type="number" class="dist-fee-input" data-district="${esc(d)}" value="${price}" min="100" step="50">
          </div>
        </div>
      `;
    }).join('');

    feeTableWrap.querySelectorAll('.dist-fee-input').forEach((inp) => {
      inp.onchange = () => {
        const d = inp.dataset.district;
        curPrices[d] = Number(inp.value) || me.fee || 1500;
      };
    });
  }

  // State Change
  stateSelect.onchange = () => {
    curState = stateSelect.value;
    if (stateLabel) stateLabel.textContent = curState;
    const newStateDistricts = LOCATIONS[curState] || [];
    curDistricts = new Set(Array.from(curDistricts).filter((d) => newStateDistricts.includes(d)));
    if (!curDistricts.size && newStateDistricts.length) {
      curDistricts.add(newStateDistricts[0]);
    }
    renderDistrictCheckboxes();
    renderDistrictFeeInputs();
  };

  // Select All & Clear
  const btnSelectAll = $('#btn-select-all-dist', container);
  if (btnSelectAll) {
    btnSelectAll.onclick = () => {
      const allD = LOCATIONS[curState] || [];
      allD.forEach((d) => {
        curDistricts.add(d);
        if (!curPrices[d]) curPrices[d] = +$('#av-fee', container).value || me.fee || 1500;
      });
      renderDistrictCheckboxes();
      renderDistrictFeeInputs();
    };
  }

  const btnClear = $('#btn-clear-dist', container);
  if (btnClear) {
    btnClear.onclick = () => {
      curDistricts.clear();
      renderDistrictCheckboxes();
      renderDistrictFeeInputs();
    };
  }

  // Quick fill all fees
  const btnApplyAll = $('#btn-apply-all-fees', container);
  if (btnApplyAll) {
    btnApplyAll.onclick = () => {
      const val = +$('#quick-fill-fee', container).value;
      if (!val || val <= 0) return toast('Please enter a valid amount', true);
      curDistricts.forEach((d) => { curPrices[d] = val; });
      renderDistrictFeeInputs();
      toast(`Applied ₹${val.toLocaleString('en-IN')} to all ${curDistricts.size} selected districts!`);
    };
  }

  // Slot Presets
  const btnAllSlots = $('#preset-all-slots', container);
  if (btnAllSlots) {
    btnAllSlots.onclick = () => {
      slots = ['06:00 AM - 09:00 AM', '09:00 AM - 12:00 PM', '01:00 PM - 04:00 PM', '04:00 PM - 07:00 PM', '07:00 PM - 10:00 PM'];
      renderSlots();
    };
  }
  const btnMorning = $('#preset-morning', container);
  if (btnMorning) {
    btnMorning.onclick = () => {
      slots = ['06:00 AM - 09:00 AM', '09:00 AM - 12:00 PM'];
      renderSlots();
    };
  }
  const btnEvening = $('#preset-evening', container);
  if (btnEvening) {
    btnEvening.onclick = () => {
      slots = ['04:00 PM - 07:00 PM', '07:00 PM - 10:00 PM'];
      renderSlots();
    };
  }

  // Add Custom Slot
  const btnAddSlot = $('#btn-add-slot', container);
  const newSlotInput = $('#new-slot-input', container);
  if (btnAddSlot && newSlotInput) {
    const addFn = () => {
      const val = newSlotInput.value.trim();
      if (!val) return toast('Please enter time slot text (e.g. 07:00 AM - 10:00 AM)', true);
      if (slots.includes(val)) return toast('This time slot is already added', true);
      slots.push(val);
      newSlotInput.value = '';
      renderSlots();
    };
    btnAddSlot.onclick = addFn;
    newSlotInput.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addFn(); } };
  }

  // Initial Renders
  renderSlots();
  renderDistrictCheckboxes();
  renderDistrictFeeInputs();

  // Expose current state for saveAvail
  S._availFormState = () => {
    feeTableWrap.querySelectorAll('.dist-fee-input').forEach((inp) => {
      curPrices[inp.dataset.district] = Number(inp.value) || me.fee || 1500;
    });
    const cleanPrices = {};
    curDistricts.forEach((d) => {
      cleanPrices[d] = curPrices[d] || +$('#av-fee', container).value || me.fee || 1500;
    });
    return {
      curState,
      workingDistricts: Array.from(curDistricts),
      districtPrices: cleanPrices,
      slots
    };
  };
}

function renderPanditProfileTab(me) {
  return `
    <div class="profile-card">
      <div class="profile-hero">
        <img src="${esc(me.photo || 'https://images.unsplash.com/photo-1544168190-79c15427015f?auto=format&fit=crop&q=80&w=200')}" class="profile-avatar-lg" alt="Avatar">
        <div style="flex:1">
          <h3 style="margin:0 0 6px;color:var(--gold);font-size:24px">${esc(me.name)} ${statusBadge(me.status)}</h3>
          <p style="margin:0 0 8px;color:#f1d9aa;font-size:13.5px">${esc(me.district || me.location)} · ${esc(me.exp || me.experience + ' Years Exp')}</p>
          <div>${(me.services || []).map(s => `<span class="badge green">${esc(s)}</span>`).join('')}</div>
        </div>
        <button class="btn btn-gold btn-sm" data-action="editPanditProfile"><span class="material-icons">edit</span> Edit Profile</button>
      </div>
      <div class="profile-grid-details">
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">badge</span> Full Name</div>
          <div class="profile-field-value">${esc(me.name)}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">email</span> Registered Email</div>
          <div class="profile-field-value">${esc(me.email)}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">phone</span> Phone Number</div>
          <div class="profile-field-value">${esc(me.phone)}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">payments</span> Base Dakshina</div>
          <div class="profile-field-value"><b>${inr(me.fee)}</b> per puja</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">map</span> Home District &amp; State</div>
          <div class="profile-field-value">${esc(me.district || me.city || '')}${me.state ? ', ' + esc(me.state) : ''}</div>
        </div>
        <div class="profile-field">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">explore</span> Working Districts</div>
          <div class="profile-field-value">${(me.workingDistricts || [me.district]).map(esc).join(', ')}</div>
        </div>
        <div class="profile-field" style="grid-column:1 / -1">
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">notes</span> Pandit Bio &amp; Vedic Lineage</div>
          <div class="profile-field-value" style="font-weight:400;color:#4a2b16">${esc(me.bio || 'Vedic Pandit conducting authentic traditional rituals.')}</div>
        </div>
        ${me.documentUrl || me.idDoc ? `
          <div class="profile-field" style="grid-column:1 / -1;border:1px dashed var(--ochre)">
            <div class="profile-field-label"><span class="material-icons" style="font-size:14px">verified_user</span> KYC Document Link on File</div>
            <div class="profile-field-value">
              <a href="${esc(me.documentUrl || me.idDoc)}" target="_blank" rel="noopener" style="color:var(--ochre);text-decoration:underline">
                View Submitted Identity Document ↗
              </a>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

async function adminDash(root) {
  let dbStatus = { connected: false, status: 'Checking...' };
  try {
    dbStatus = await api('/db-status');
  } catch {
    dbStatus = { connected: false, status: 'Disconnected' };
  }
  const [stats, pandits, longs, users, pujas] = await Promise.all([
    api('/admin/stats').catch(() => ({ users: 0, pandits: 0, verifiedPandits: 0, pendingPandits: 0, bookings: 0, completed: 0, revenue: 0, longRequests: 0, pendingLong: 0 })),
    api('/pandits').catch(() => []),
    api('/long-puja-requests').catch(() => []),
    api('/users').catch(() => []),
    api('/pujas').catch(() => [])
  ]);
  S.adminPandits = pandits; S.adminLongs = longs; S.pujas = pujas;
  const pend = pandits.filter((p) => p.status === 'Pending Review');
  const unassigned = longs.filter((l) => l.status === 'Pending Admin');
  const isConnected = dbStatus && (dbStatus.connected || dbStatus.status === 'Connected');

  root.innerHTML = `<div class="row" style="margin-bottom:16px;flex-wrap:wrap;gap:12px">
      <h2 class="section-title" style="margin:0">Super Admin Dashboard</h2>
      <div style="display:inline-flex;align-items:center;gap:8px;background:${isConnected ? 'rgba(46,125,50,0.1)' : 'rgba(211,47,47,0.1)'};border:1.5px solid ${isConnected ? '#2e7d32' : '#d32f2f'};padding:6px 14px;border-radius:20px;font-weight:600;font-size:13px;color:${isConnected ? '#1b5e20' : '#b71c1c'}">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${isConnected ? '#2e7d32' : '#d32f2f'}"></span>
        Database: ${isConnected ? 'MongoDB Connected 🟢 (' + (dbStatus.host || 'Atlas') + ')' : 'Disconnected 🔴'}
        <button class="btn btn-outline dark btn-sm" data-action="refreshDbStatus" style="padding:2px 8px;font-size:11px;margin-left:6px" title="Refresh DB status">Check</button>
      </div>
    </div>
    <div class="stats">${[['Devotees', stats.users], ['Pandits', stats.pandits], ['Verified', stats.verifiedPandits], ['Pending KYC', stats.pendingPandits], ['Bookings', stats.bookings], ['Completed', stats.completed], ['Booked Dakshina', inr(stats.revenue)], ['Multi-day (pending)', `${stats.pendingLong}/${stats.longRequests}`]].map(([k, v]) => `<div class="stat"><b>${v}</b><span>${k}</span></div>`).join('')}</div>
    <div class="panel"><h3>Pandit KYC Review</h3>${pend.length ? `<table><tr><th>Photo</th><th>Pandit</th><th>Location</th><th>Fee</th><th></th></tr>${pend.map((p) => `<tr>
      <td><img src="${esc(p.photo || 'https://images.unsplash.com/photo-1544168190-79c15427015f?auto=format&fit=crop&q=80&w=200')}" alt="Pandit" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--ochre)"></td>
      <td>${esc(p.name)}<br><small>${esc(p.email)} · ${esc(p.phone)}</small></td><td>${esc(p.location || p.district)}</td><td>${inr(p.fee)}</td>
      <td><button class="btn btn-green btn-sm" data-action="panditStatus" data-id="${esc(p._id)}" data-status="Verified">Approve</button><button class="btn btn-red btn-sm" data-action="panditStatus" data-id="${esc(p._id)}" data-status="Rejected">Reject</button></td></tr>`).join('')}</table>` : '<p class="muted">No Pandits awaiting review.</p>'}</div>
    <div class="panel"><h3>Multi-Day Requests</h3>${longs.length ? `<table><tr><th>ID</th><th>Devotee</th><th>Ritual</th><th>Dates</th><th>Pandits</th><th>Status</th><th></th></tr>${longs.map((l) => `<tr><td>${esc(l.id)}</td><td>${esc(l.userName)}<br><small>${esc(l.userEmail)}</small></td><td>${esc(l.pujaName)}<br><small>${esc(l.district)}</small></td><td>${esc(l.fromDate)} → ${esc(l.toDate)}</td>
      <td>${l.assignedPandits.length}/${l.requiredPandits}</td><td>${statusBadge(l.status)}</td><td>${['Pending Admin', 'Assigned'].includes(l.status) ? `<button class="btn btn-dark btn-sm" data-action="assign" data-id="${esc(l.id)}">${l.status === 'Assigned' ? 'Re-assign' : 'Assign'}</button>` : ''}</td></tr>`).join('')}</table>` : '<p class="muted">No requests.</p>'}
      ${unassigned.length ? `<p class="muted">${unassigned.length} request(s) need Pandit assignment.</p>` : ''}</div>
    <div class="panel"><div class="row"><h3>Service Catalog</h3><button class="btn btn-gold btn-sm" data-action="editPuja" data-id="">+ Add Puja</button></div><table><tr><th>Name</th><th>Type</th><th>Fee</th><th></th></tr>${pujas.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.type)}</td><td>${p.type === 'Long' ? inr(p.perHourFee) + '/hr' : inr(p.baseFee)}</td><td><button class="btn btn-outline dark btn-sm" data-action="editPuja" data-id="${esc(p._id)}">Edit</button><button class="btn btn-red btn-sm" data-action="delPuja" data-id="${esc(p._id)}">Delete</button></td></tr>`).join('')}</table></div>
    <div class="panel"><h3>All Pandits</h3><table><tr><th>Photo</th><th>Name</th><th>District</th><th>Experience</th><th>Status</th></tr>${pandits.map((p) => `<tr><td><img src="${esc(p.photo || 'https://images.unsplash.com/photo-1544168190-79c15427015f?auto=format&fit=crop&q=80&w=200')}" alt="Pandit" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid var(--ochre)"></td><td>${esc(p.name)}<br><small>${esc(p.email)}</small></td><td>${esc(p.district)}</td><td>${esc(p.exp)}</td><td>${statusBadge(p.status)}</td></tr>`).join('')}</table></div>
    <div class="panel"><h3>Devotees</h3>${users.length ? `<table><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr>${users.map((u) => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>${new Date(u.createdAt).toLocaleDateString()}</td></tr>`).join('')}</table>` : '<p class="muted">No devotees yet.</p>'}</div>`;
}

/* ---------- booking slip ---------- */
function printSlip(b) {
  const w = window.open('', '_blank');
  if (!w) return toast('Please allow pop-ups to download the slip', true);
  w.document.write(`<html><head><title>${esc(b.bookingId)}</title><style>body{font-family:Georgia,serif;padding:40px;color:#3b2115}h1{color:#351605;border-bottom:3px solid #d99a19;padding-bottom:8px}td{padding:8px 16px 8px 0;font-family:Arial}</style></head><body><h1>ॐ PujaConnect – Booking Slip</h1><table>
    ${[['Booking ID', b.bookingId], ['Devotee', b.userName], ['Ritual', b.service], ['Pandit', b.panditName], ['Date', b.date], ['Time', b.time], ['Venue', b.address || b.district], ['Dakshina', inr(b.fee)], ['Payment', b.paymentStatus], ['Status', b.status]].map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join('')}</table><p style="margin-top:30px">Please keep this slip for your records. 🙏</p><script>window.print()<\/script></body></html>`);
  w.document.close();
}

/* ---------- admin modals ---------- */
function openAssign(id) {
  const l = S.adminLongs.find((x) => x.id === id);
  const eligible = S.adminPandits.filter((p) => p.verified && ((p.workingDistricts || []).includes(l.district) || p.district === l.district));
  const list = eligible.length ? eligible : S.adminPandits.filter((p) => p.verified);
  openModal('Assign Pandits – ' + l.id, `<p class="muted" style="margin:0">${esc(l.pujaName)} · ${esc(l.district)} · needs <b>${l.requiredPandits}</b> Pandit(s)${eligible.length ? '' : ' (no Pandits serve this district; showing all verified)'}</p>
    <div class="checks" style="flex-direction:column;align-items:stretch">${list.map((p) => `<label class="check"><input type="checkbox" name="as" value="${esc(p.email)}" ${l.assignedPandits.includes(p.email) ? 'checked' : ''}>${esc(p.name)} · ${esc(p.district)} · ${esc(p.exp)}</label>`).join('') || '<span class="muted">No verified Pandits available.</span>'}</div>
    <button class="btn btn-gold" id="as-go">Assign Selected</button>`, (m) => {
    $('#as-go', m).onclick = async () => {
      const emails = [...m.querySelectorAll('input[name="as"]:checked')].map((i) => i.value);
      if (!emails.length) return toast('Select at least one Pandit', true);
      try { await api(`/long-puja-requests/${id}/assign`, { method: 'PUT', body: { panditEmails: emails } }); closeModal(); toast('Pandits assigned'); renderDashboard(); } catch (e) { toast(e.message, true); }
    };
  });
}

function openPujaEditor(id) {
  const p = S.pujas.find((x) => x._id === id) || { type: 'Short', baseFee: 1199, perHourFee: 500, benefits: [] };
  openModal(id ? 'Edit Puja' : 'Add Puja', `
    <div><label>Name</label><input id="e-name" value="${esc(p.name || '')}" ${id ? 'readonly' : ''}></div>
    <div><label>Type</label><select id="e-type">${opts(['Short', 'Long'], p.type)}</select></div>
    <div><label>Short description</label><input id="e-desc" value="${esc(p.desc || '')}"></div>
    <div><label>Detailed description</label><textarea id="e-long" rows="2">${esc(p.longDesc || '')}</textarea></div>
    <div><label>Benefits (comma separated)</label><input id="e-ben" value="${esc((p.benefits || []).join(', '))}"></div>
    <div><label>Image URL</label><input id="e-img" value="${esc(p.image || '')}"></div>
    <div class="form-grid" style="padding:0"><div><label>Base fee (₹)</label><input id="e-base" type="number" value="${p.baseFee}"></div><div><label>Per-hour fee (₹)</label><input id="e-hr" type="number" value="${p.perHourFee}"></div></div>
    <button class="btn btn-gold" id="e-save">Save</button>`, (m) => {
    $('#e-save', m).onclick = async () => {
      const type = $('#e-type', m).value, base = +$('#e-base', m).value, hr = +$('#e-hr', m).value;
      const body = { name: $('#e-name', m).value.trim(), type, desc: $('#e-desc', m).value, longDesc: $('#e-long', m).value, benefits: $('#e-ben', m).value.split(',').map((s) => s.trim()).filter(Boolean), baseFee: base, perHourFee: hr, price: type === 'Long' ? `From ${inr(hr)}/hr` : inr(base) };
      if ($('#e-img', m).value) body.image = $('#e-img', m).value;
      if (!body.name || !body.desc) return toast('Name and description are required', true);
      try { await api('/pujas', { method: 'POST', body }); closeModal(); toast('Catalog updated'); renderDashboard(); } catch (e) { toast(e.message, true); }
    };
  });
}

/* ---------- action dispatcher ---------- */
const ACTIONS = {
  nav: (d) => showView(d.view),
  toggleMenu: () => $('#nav-links').classList.toggle('open'),
  closeModal,
  login: () => openAuth('login'),
  adminPanel: openAdminDirect,
  refreshDbStatus: () => renderDashboard(),
  showLogin: () => openAuth('login'),
  showRegister: () => openAuth('register'),
  logout: () => { saveSession(null); showView('home'); toast('Logged out'); },
  bookCta: () => { S.filters.service = ''; showView('pandits'); },
  panditRegister: openPanditRegister,
  pujaTab: (d) => { S.pujaTab = d.type; renderPujas(); },
  findFor: (d) => { S.filters.service = d.name; showView('pandits'); },
  planLong: (d) => { S.longPreset = d.name; showView('long'); },
  bookPandit: (d) => openBooking(d.id),
  slip: (d) => printSlip(S.bookings.find((b) => b.bookingId === d.id)),
  cancelBooking: async (d) => {
    if (!confirm('Cancel this booking?')) return;
    try { await api(`/bookings/${d.id}/status`, { method: 'PUT', body: { status: 'Cancelled' } }); toast('Booking cancelled'); renderDashboard(); } catch (e) { toast(e.message, true); }
  },
  reschedule: async (d) => {
    const b = S.bookings.find((x) => x.bookingId === d.id);
    const date = prompt('New date (YYYY-MM-DD):', b.date);
    if (!date || date === b.date) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today()) return toast('Enter a valid future date (YYYY-MM-DD)', true);
    const time = prompt('Time slot:', b.time);
    if (!time) return;
    try { await api(`/bookings/${d.id}/reschedule`, { method: 'PUT', body: { date, time } }); toast('Booking rescheduled'); renderDashboard(); } catch (e) { toast(e.message, true); }
  },
  setStatus: async (d) => { try { await api(`/bookings/${d.id}/status`, { method: 'PUT', body: { status: d.status } }); toast('Updated'); renderDashboard(); } catch (e) { toast(e.message, true); } },
  longResp: async (d) => { try { await api(`/long-puja-requests/${d.id}/pandit-response`, { method: 'PUT', body: { panditEmail: S.user.email, response: d.resp } }); toast('Response recorded'); renderDashboard(); } catch (e) { toast(e.message, true); } },
  saveAvail: async () => {
    if (!S.me) return;
    const days = [...document.querySelectorAll('#av-days input:checked')].map((i) => i.value);
    const formState = typeof S._availFormState === 'function' ? S._availFormState() : null;
    const slots = formState && formState.slots && formState.slots.length
      ? formState.slots
      : ($('#av-slots') ? $('#av-slots').value.split('\n').map((s) => s.trim()).filter(Boolean) : DEFAULT_SLOTS);

    if (!days.length) return toast('Please select at least one available day', true);
    if (!slots.length) return toast('Please configure at least one time slot', true);

    const fee = +$('#av-fee').value || S.me.fee || 1500;
    const workingState = formState ? formState.curState : (S.me.workingState || S.me.state || 'Odisha');
    const workingDistricts = formState && formState.workingDistricts && formState.workingDistricts.length
      ? formState.workingDistricts
      : (S.me.workingDistricts || [S.me.district]);
    const districtPrices = formState ? formState.districtPrices : (S.me.districtPrices || {});

    try {
      const updated = await api('/pandits/' + S.me._id, {
        method: 'PUT',
        body: {
          availableDays: days,
          timeSlots: slots,
          fee,
          workingState,
          workingDistricts,
          districtPrices
        }
      });
      S.me = updated;
      toast('Availability, working districts & per-district fees saved successfully! 🙏');
      renderDashboard();
    } catch (e) {
      toast(e.message, true);
    }
  },
  dashTab: (d) => {
    S.dashTab = d.tab;
    renderDashboard();
  },
  openProfile: () => {
    if (!S.user) {
      openAuth('login');
      toast('Please log in to view your profile 🙏');
      return;
    }
    S.dashTab = 'profile';
    showView('dashboard');
  },
  registerDevotee: () => openAuth('register'),
  editDevoteeProfile: () => {
    const u = S.user;
    openModal('Edit Devotee Profile', `
      <div><label>Full Name</label><input id="ep-dev-name" value="${esc(u.name || '')}"></div>
      <div><label>Phone Number</label><input id="ep-dev-phone" value="${esc(u.phone || '')}"></div>
      <div class="form-grid" style="padding:0">
        <div><label>State</label><input id="ep-dev-state" value="${esc(u.state || '')}"></div>
        <div><label>District</label><input id="ep-dev-dist" value="${esc(u.district || '')}"></div>
      </div>
      <div><label>City / Town</label><input id="ep-dev-city" value="${esc(u.city || '')}"></div>
      <button class="btn btn-gold" id="btn-save-dev-prof" style="margin-top:10px;width:100%"><span class="material-icons">save</span> Save Profile</button>
    `, (m) => {
      $('#btn-save-dev-prof', m).onclick = async () => {
        const name = $('#ep-dev-name', m).value.trim();
        const phone = $('#ep-dev-phone', m).value.trim();
        const state = $('#ep-dev-state', m).value.trim();
        const district = $('#ep-dev-dist', m).value.trim();
        const city = $('#ep-dev-city', m).value.trim();
        if (!name || !phone) return toast('Name and phone are required', true);
        try {
          const updated = await api('/users/profile', { method: 'PUT', body: { name, phone, state, district, city } });
          saveSession(updated, S.token);
          closeModal();
          toast('Profile updated successfully! 🙏');
          renderDashboard();
        } catch (e) { toast(e.message, true); }
      };
    });
  },
  editPanditProfile: () => {
    const me = S.me;
    if (!me) return;
    openModal('Edit Pandit Profile', `
      <div><label>Phone Number</label><input id="ep-p-phone" value="${esc(me.phone || '')}"></div>
      <div><label>Base Dakshina (₹)</label><input id="ep-p-fee" type="number" value="${me.fee || 1500}"></div>
      <div><label>Working Districts (comma-separated)</label><input id="ep-p-districts" value="${esc((me.workingDistricts || [me.district]).join(', '))}"></div>
      <div><label>Profile Photo URL</label><input id="ep-p-photo" value="${esc(me.photo || '')}"></div>
      <div><label>Pandit Bio / Vedic Lineage</label><textarea id="ep-p-bio" rows="3">${esc(me.bio || '')}</textarea></div>
      <button class="btn btn-gold" id="btn-save-p-prof" style="margin-top:10px;width:100%"><span class="material-icons">save</span> Save Pandit Profile</button>
    `, (m) => {
      $('#btn-save-p-prof', m).onclick = async () => {
        const phone = $('#ep-p-phone', m).value.trim();
        const fee = +$('#ep-p-fee', m).value || me.fee;
        const workingDistricts = $('#ep-p-districts', m).value.split(',').map((s) => s.trim()).filter(Boolean);
        const photo = $('#ep-p-photo', m).value.trim() || me.photo;
        const bio = $('#ep-p-bio', m).value.trim();
        try {
          const updated = await api('/pandits/' + me._id, { method: 'PUT', body: { phone, fee, workingDistricts, photo, bio } });
          S.me = updated;
          closeModal();
          toast('Pandit profile updated! 🙏');
          renderDashboard();
        } catch (e) { toast(e.message, true); }
      };
    });
  },
  panditStatus: async (d) => { try { await api(`/pandits/${d.id}/status`, { method: 'PUT', body: { status: d.status } }); toast('Pandit ' + d.status.toLowerCase() + '. Email sent.'); renderDashboard(); } catch (e) { toast(e.message, true); } },
  assign: (d) => openAssign(d.id),
  editPuja: (d) => openPujaEditor(d.id),
  delPuja: async (d) => { if (!confirm('Delete this puja from the catalog?')) return; try { await api('/pujas/' + d.id, { method: 'DELETE' }); toast('Deleted'); renderDashboard(); } catch (e) { toast(e.message, true); } },
  modalBackdrop: (d, el, ev) => { if (ev.target === el) closeModal(); }
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  if (el.tagName === 'A') ev.preventDefault();
  fn(el.dataset, el, ev);
});

/* ---------- boot ---------- */
(async function init() {
  $('#yr').textContent = new Date().getFullYear();
  renderNav();
  await loadPujas();
  renderHomePujas();
  setupHeroFilter();
  const hash = location.hash.replace('#', '');
  if (['pandits', 'pujas', 'long', 'about', 'dashboard'].includes(hash)) showView(hash);
})();
