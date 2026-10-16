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
  const roleLabel = !u ? '' : u.role === 'admin' ? 'Super Admin' : u.role === 'pandit' ? 'Pandit' : 'Devotee';
  $('#nav-actions').innerHTML =
    `<button class="btn btn-gold" data-action="bookCta"><span class="material-icons">self_improvement</span> Book a Puja</button>` +
    (u && u.role === 'pandit' ? '' : `<button class="btn btn-outline" data-action="panditRegister">Pandit Registration</button>`) +
    (u
      ? `<span class="role-badge">${roleLabel}</span><button class="btn btn-outline" data-action="nav" data-view="dashboard">My Account</button><button class="btn btn-outline" data-action="logout" title="Logout"><span class="material-icons">logout</span></button>`
      : `<button class="btn btn-outline" data-action="login">Login / My Account</button>`);
}

function showView(name) {
  if (name === 'dashboard' && !S.user) { openAuth(); return; }
  S.view = name;
  document.querySelectorAll('.view-section').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  document.querySelectorAll('.nav-links a').forEach((a) => a.classList.toggle('active', a.dataset.view === name));
  $('#nav-links').classList.remove('open');
  history.replaceState(null, '', '#' + name);
  window.scrollTo({ top: 0 });
  if (name === 'pandits') renderPandits();
  if (name === 'pujas') renderPujas();
  if (name === 'long') renderLongForm();
  if (name === 'dashboard') renderDashboard();
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
  const list = S.pujas.filter((p) => p.type === 'Short').slice(0, 3);
  $('#home-pujas').innerHTML = list.length ? list.map((p) => pujaCard(p)).join('') : '<div class="empty">Loading pujas…</div>';
}
function renderPujas() {
  document.querySelectorAll('#view-pujas .tab').forEach((t) => t.classList.toggle('active', t.dataset.type === S.pujaTab));
  const list = S.pujas.filter((p) => p.type === S.pujaTab);
  $('#puja-list').innerHTML = list.length ? list.map((p) => pujaCard(p, true)).join('') : '<div class="empty">No pujas in this category yet.</div>';
}

/* ---------- hero filter ---------- */
function setupHeroFilter() {
  const st = $('#f-state'), di = $('#f-district'), pu = $('#f-puja');
  st.innerHTML = opts(Object.keys(LOCATIONS), S.filters.state);
  const fillDistricts = () => (di.innerHTML = opts(LOCATIONS[st.value] || [], '', 'Any District'));
  fillDistricts();
  pu.innerHTML = '<option value="">Any Puja</option>' + S.pujas.filter((p) => p.type === 'Short').map((p) => `<option>${esc(p.name)}</option>`).join('');
  st.onchange = fillDistricts;
  $('#hero-filter').onsubmit = (e) => {
    e.preventDefault();
    S.filters = { state: st.value, district: di.value, service: pu.value };
    showView('pandits');
  };
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
  return `<div class="card"><div class="head"><img src="${esc(p.photo)}" alt="" onerror="this.style.visibility='hidden'">
    <div><h3>${esc(p.name)} <span class="material-icons" style="font-size:16px;vertical-align:middle" title="Verified">verified</span></h3><small>${esc(p.location)}</small></div></div>
    <div class="body"><div><span class="badge">${esc(exp)}</span><span class="badge green"><span class="material-icons">verified</span>Verified</span><span class="badge">🗣 Sanskrit, Odia, Hindi</span></div>
    <p style="margin:6px 0;font-size:14px"><strong>${esc(p.specialty)}</strong><br><span class="muted">${esc(p.bio)}</span></p>
    <p class="muted" style="font-size:13px;margin:4px 0">Serves: ${esc((p.workingDistricts || []).join(', '))}</p>
    <div class="row"><span class="price">${inr(p.fee)}<small class="muted" style="font-weight:400"> /puja</small></span>
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
    const paintFee = () => ($('#b-fee', m).textContent = inr(feeFor()));
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
          $('#pandit-otp-msg', m).textContent = 'Code sent to ' + email + (res.devOtp ? ` (Dev OTP: ${res.devOtp})` : '');
          toast('OTP sent to your email! 🙏 Check inbox/spam.');
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
  const [bookings, longs] = await Promise.all([api('/bookings?userEmail=' + e), api('/long-puja-requests?userEmail=' + e)]);
  S.bookings = bookings;
  const upcoming = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'In Progress').length;
  root.innerHTML = `<h2 class="section-title">Namaste, ${esc(S.user.name)} 🙏</h2>
    <div class="stats"><div class="stat"><b>${bookings.length}</b><span>Total bookings</span></div><div class="stat"><b>${upcoming}</b><span>Upcoming rituals</span></div><div class="stat"><b>${longs.length}</b><span>Multi-day requests</span></div></div>
    <div class="panel"><h3>My Bookings</h3>${bookings.length ? `<table><tr><th>ID</th><th>Ritual</th><th>Pandit</th><th>When</th><th>Dakshina</th><th>Status</th><th></th></tr>${bookings.map((b) => `<tr>
      <td>${esc(b.bookingId)}</td><td>${esc(b.service)}<br><small class="muted">${esc(b.district)}</small></td><td>${esc(b.panditName)}</td><td>${esc(b.date)}<br><small>${esc(b.time)}</small></td>
      <td>${inr(b.fee)}<br><small class="muted">${esc(b.paymentStatus)}</small></td><td>${statusBadge(b.status)}</td>
      <td><button class="btn btn-dark btn-sm" data-action="slip" data-id="${esc(b.bookingId)}">Slip</button>${['Confirmed', 'In Progress'].includes(b.status) ? `<button class="btn btn-outline dark btn-sm" data-action="reschedule" data-id="${esc(b.bookingId)}">Reschedule</button><button class="btn btn-red btn-sm" data-action="cancelBooking" data-id="${esc(b.bookingId)}">Cancel</button>` : ''}</td></tr>`).join('')}</table>`
      : '<p class="muted">No bookings yet. <a href="#pandits" data-action="nav" data-view="pandits" style="color:var(--ochre);font-weight:600">Find a Pandit</a></p>'}</div>
    <div class="panel"><h3>Multi-Day Pujas</h3>${longs.length ? `<table><tr><th>ID</th><th>Ritual</th><th>Dates</th><th>Pandits</th><th>Estimate</th><th>Status</th></tr>${longs.map((l) => `<tr>
      <td>${esc(l.id)}</td><td>${esc(l.pujaName)}<br><small class="muted">${esc(l.district)}</small></td><td>${esc(l.fromDate)} → ${esc(l.toDate)}<br><small>${l.totalDays}d × ${l.dailyHours}h</small></td>
      <td>${l.assignedPandits.length}/${l.requiredPandits}<br><small class="muted">${l.assignedPandits.map(esc).join('<br>') || 'Awaiting assignment'}</small></td>
      <td>${inr(l.estimatedCost)}${l.advancePaid ? `<br><small class="muted">Advance ${inr(l.advanceAmount)}</small>` : ''}</td><td>${statusBadge(l.status)}</td></tr>`).join('')}</table>` : '<p class="muted">No multi-day requests yet.</p>'}</div>`;
}

async function panditDash(root) {
  const email = S.user.email;
  const [plist, bookings, longs] = await Promise.all([api('/pandits?email=' + encodeURIComponent(email)), api('/bookings?panditEmail=' + encodeURIComponent(email)), api('/long-puja-requests?panditEmail=' + encodeURIComponent(email))]);
  const me = plist[0];
  if (!me) { root.innerHTML = '<div class="empty">Pandit profile not found.</div>'; return; }
  S.me = me;
  const earned = bookings.filter((b) => b.status === 'Completed').reduce((s, b) => s + (b.fee || 0), 0);
  const pending = bookings.filter((b) => b.status === 'Confirmed').reduce((s, b) => s + (b.fee || 0), 0);
  root.innerHTML = `<h2 class="section-title">Pandit Portal – ${esc(me.name)} ${statusBadge(me.status)}</h2>
    ${me.verified ? '' : '<div class="panel"><strong>Your profile is awaiting admin verification.</strong> You will receive bookings after approval.</div>'}
    <div class="stats"><div class="stat"><b>${inr(earned)}</b><span>Dakshina earned</span></div><div class="stat"><b>${inr(pending)}</b><span>Upcoming Dakshina</span></div><div class="stat"><b>${bookings.length}</b><span>Ceremonies</span></div></div>
    <div class="panel"><h3>Availability</h3>
      <label>Available days</label><div class="checks" id="av-days">${DAYS.map((d) => `<label class="check"><input type="checkbox" value="${d}" ${(me.availableDays || []).includes(d) ? 'checked' : ''}>${d.slice(0, 3)}</label>`).join('')}</div>
      <label style="margin-top:12px">Time slots (one per line)</label><textarea id="av-slots" rows="3">${esc((me.timeSlots || DEFAULT_SLOTS).join('\n'))}</textarea>
      <label style="margin-top:12px">Base Dakshina (₹)</label><input id="av-fee" type="number" value="${me.fee}" style="max-width:200px">
      <p><button class="btn btn-dark" data-action="saveAvail">Save Availability</button></p></div>
    <div class="panel"><h3>Ceremony Requests</h3>${bookings.length ? `<table><tr><th>ID</th><th>Devotee</th><th>Ritual</th><th>When</th><th>Venue</th><th>Dakshina</th><th>Status</th><th></th></tr>${bookings.map((b) => `<tr>
      <td>${esc(b.bookingId)}</td><td>${esc(b.userName)}<br><small>${esc(b.phone)}</small></td><td>${esc(b.service)}</td><td>${esc(b.date)}<br><small>${esc(b.time)}</small></td>
      <td>${esc(b.address || b.district)}</td><td>${inr(b.fee)}</td><td>${statusBadge(b.status)}</td>
      <td>${b.status === 'Confirmed' ? `<button class="btn btn-green btn-sm" data-action="setStatus" data-id="${esc(b.bookingId)}" data-status="In Progress">Accept</button><button class="btn btn-red btn-sm" data-action="setStatus" data-id="${esc(b.bookingId)}" data-status="Cancelled">Decline</button>` : ''}${b.status === 'In Progress' ? `<button class="btn btn-dark btn-sm" data-action="setStatus" data-id="${esc(b.bookingId)}" data-status="Completed">Mark Completed</button>` : ''}</td></tr>`).join('')}</table>` : '<p class="muted">No ceremonies yet.</p>'}</div>
    <div class="panel"><h3>Multi-Day Assignments</h3>${longs.length ? `<table><tr><th>ID</th><th>Ritual</th><th>Dates</th><th>District</th><th>My response</th><th></th></tr>${longs.map((l) => { const st = (l.panditStatuses || {})[email] || 'Assigned'; return `<tr><td>${esc(l.id)}</td><td>${esc(l.pujaName)}</td><td>${esc(l.fromDate)} → ${esc(l.toDate)}<br><small>${l.dailyHours}h/day</small></td><td>${esc(l.district)}</td><td>${statusBadge(st)}</td>
      <td>${st === 'Assigned' ? `<button class="btn btn-green btn-sm" data-action="longResp" data-id="${esc(l.id)}" data-resp="Accepted">Accept</button><button class="btn btn-red btn-sm" data-action="longResp" data-id="${esc(l.id)}" data-resp="Declined">Decline</button>` : ''}</td></tr>`; }).join('')}</table>` : '<p class="muted">No multi-day assignments yet.</p>'}</div>`;
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
    const days = [...document.querySelectorAll('#av-days input:checked')].map((i) => i.value);
    const slots = $('#av-slots').value.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!days.length || !slots.length) return toast('Select at least one day and one slot', true);
    try { await api('/pandits/' + S.me._id, { method: 'PUT', body: { availableDays: days, timeSlots: slots, fee: +$('#av-fee').value || S.me.fee } }); toast('Availability saved'); } catch (e) { toast(e.message, true); }
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
