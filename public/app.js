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
  const drawer = $('#nav-drawer');
  if (drawer) drawer.classList.remove('open');
  $('#modal-root').innerHTML = `<div class="modal-backdrop" data-action="modalBackdrop"><div class="modal ${wide ? 'modal-wide' : ''}"><div class="modal-head"><h3>${esc(title)}</h3><button data-action="closeModal" aria-label="Close"><span class="material-icons">close</span></button></div><div class="modal-body">${html}</div></div></div>`;
  if (onMount) onMount($('#modal-root .modal'));
}
const closeModal = () => ($('#modal-root').innerHTML = '');

function appConfirm({
  title = 'Confirmation Required',
  message = 'Are you sure you want to proceed?',
  detail = '',
  confirmText = 'Confirm',
  confirmClass = 'btn-gold',
  cancelText = 'Cancel',
  icon = 'help_outline'
} = {}) {
  return new Promise((resolve) => {
    openModal(title, `
      <div style="text-align:center;padding:12px 8px">
        <span class="material-icons" style="font-size:46px;color:var(--ochre);display:block;margin-bottom:10px">${icon}</span>
        <h4 style="margin:0 0 8px;font-size:16.5px;color:var(--mahogany)">${esc(message)}</h4>
        ${detail ? `<p style="font-size:13px;color:var(--muted);margin:0 0 18px;line-height:1.5">${esc(detail)}</p>` : '<div style="margin-bottom:18px"></div>'}
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button type="button" class="btn btn-outline" id="app-confirm-cancel" style="min-width:110px">${esc(cancelText)}</button>
          <button type="button" class="btn ${confirmClass}" id="app-confirm-ok" style="min-width:130px">${esc(confirmText)}</button>
        </div>
      </div>
    `, (m) => {
      const cancelBtn = $('#app-confirm-cancel', m);
      const okBtn = $('#app-confirm-ok', m);
      if (cancelBtn) cancelBtn.onclick = () => { closeModal(); resolve(false); };
      if (okBtn) okBtn.onclick = () => { closeModal(); resolve(true); };
    });
  });
}

function appPrompt({
  title = 'Action Required',
  message = '',
  label = 'Details',
  placeholder = '',
  defaultValue = '',
  confirmText = 'Submit',
  confirmClass = 'btn-gold',
  cancelText = 'Cancel',
  icon = 'edit_note'
} = {}) {
  return new Promise((resolve) => {
    openModal(title, `
      <div style="padding:6px 4px">
        ${message ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;color:var(--mahogany);font-weight:600;font-size:14px"><span class="material-icons" style="color:var(--ochre);font-size:22px">${icon}</span><span>${esc(message)}</span></div>` : ''}
        <div style="margin-bottom:16px">
          <label style="font-weight:600;display:block;margin-bottom:6px;font-size:13px">${esc(label)}</label>
          <textarea id="app-prompt-input" rows="3" placeholder="${esc(placeholder)}" style="width:100%;box-sizing:border-box;border:1.5px solid var(--ochre);border-radius:8px;padding:10px;font-family:inherit;font-size:13.5px;line-height:1.4">${esc(defaultValue)}</textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="btn btn-outline" id="app-prompt-cancel">${esc(cancelText)}</button>
          <button type="button" class="btn ${confirmClass}" id="app-prompt-ok">${esc(confirmText)}</button>
        </div>
      </div>
    `, (m) => {
      const inp = $('#app-prompt-input', m);
      if (inp) { inp.focus(); inp.select(); }
      const cancelBtn = $('#app-prompt-cancel', m);
      const okBtn = $('#app-prompt-ok', m);
      if (cancelBtn) cancelBtn.onclick = () => { closeModal(); resolve(null); };
      if (okBtn) okBtn.onclick = () => {
        const val = ($('#app-prompt-input', m).value || '').trim();
        closeModal();
        resolve(val);
      };
    });
  });
}

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
  if (drawer) {
    drawer.classList.remove('open');
    const btn = $('#hamburger-btn') || $('.hamburger-btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

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
    <div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap"><span class="price">${isLong ? esc(p.price) : 'From ' + inr(p.baseFee)}</span>
    ${isLong ? `
      <button class="btn btn-dark btn-sm" data-action="planLong" data-name="${esc(p.name)}">Customize</button>
    ` : `
      <div style="display:flex;gap:6px">
        <button class="btn btn-gold btn-sm" data-action="bookDirectPuja" data-name="${esc(p.name)}">Book Puja</button>
        <button class="btn btn-outline dark btn-sm" data-action="findFor" data-name="${esc(p.name)}">Pandits</button>
      </div>
    `}
    </div></div></div>`;
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

  const homeDist = p.district || 'Khordha';
  const homeState = p.state || (p.location && p.location.includes(',') ? p.location.split(',').pop().trim() : 'Odisha');

  return `<div class="card pandit-card"><div class="head"><img src="${esc(p.photo)}" alt="" onerror="this.style.visibility='hidden'">
    <div>
      <h3>${esc(p.name)} <span class="material-icons" style="font-size:16px;vertical-align:middle;color:var(--ochre)" title="Verified">verified</span></h3>
      <div style="font-size:13px;color:var(--mahogany);font-weight:600;display:flex;align-items:center;gap:4px;margin-top:2px">
        <span class="material-icons" style="font-size:15px;color:var(--ochre)">home</span>
        <span>Home: <b>${esc(homeDist)}</b>, <b>${esc(homeState)}</b></span>
      </div>
    </div></div>
    <div class="body">
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <span class="badge">${esc(exp)}</span>
        <span class="badge green"><span class="material-icons">verified</span>Verified</span>
        <span class="badge" style="background:#fffcf5;border:1px solid #ebd9be;color:var(--mahogany);font-weight:600">
          <span class="material-icons" style="font-size:13px;vertical-align:middle;margin-right:2px;color:var(--ochre)">place</span>
          Home: ${esc(homeDist)}, ${esc(homeState)}
        </span>
        <span class="badge">🗣 Sanskrit, Odia, Hindi</span>
      </div>
      <div style="margin:8px 0 6px">
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:6px">
          <span class="badge" style="background:#fff3e0;border:1.5px solid #ffd8a8;color:#b23b00;font-weight:700;font-size:12px">
            ⭐ Specialty: ${esc(p.specialty || 'Vedic Rituals')}
          </span>
          <span class="badge" style="background:#e8f5e9;border:1px solid #c8e6c9;color:#2e7d32;font-size:11px">
            ✓ Performs All Pujas
          </span>
        </div>
        <p class="muted" style="margin:0;font-size:13px">${esc(p.bio)}</p>
      </div>
      <div style="background:#faf5ee;border:1px solid #ebd9be;border-radius:8px;padding:7px 12px;font-size:12.5px;color:#4a2c16;margin-bottom:8px;display:flex;align-items:center;gap:6px">
        <span class="material-icons" style="font-size:16px;color:var(--ochre)">location_on</span>
        <span><strong>Home District:</strong> ${esc(homeDist)} &nbsp;|&nbsp; <strong>State:</strong> ${esc(homeState)}</span>
      </div>
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

async function openBooking(arg) {
  let targetPanditId = null;
  let targetPujaName = '';
  let targetDistrict = '';
  let targetDate = '';
  let targetTime = '';
  let targetAddress = '';
  let targetPhone = '';
  let targetBookingId = null;
  let isRebook = false;

  if (typeof arg === 'string') {
    targetPanditId = arg;
  } else if (arg && typeof arg === 'object') {
    targetPanditId = arg.panditId || arg.panditEmail || arg.preferredPanditEmail || null;
    targetPujaName = arg.pujaName || arg.service || arg.name || '';
    targetDistrict = arg.district || '';
    targetDate = arg.date || '';
    targetTime = arg.time || '';
    targetAddress = arg.address || '';
    targetPhone = arg.phone || '';
    targetBookingId = arg.bookingId || null;
    isRebook = Boolean(arg.isRebook || targetBookingId);
  }

  if (!requireLogin(() => openBooking(arg))) return;
  const u = S.user;

  // Ensure both Pandits and Pujas catalogs are loaded
  const loadPromises = [];
  if (!S.pandits || !S.pandits.length) {
    loadPromises.push(api('/pandits?verified=true').then(res => { S.pandits = res; }).catch(() => {}));
  }
  if (!S.pujas || !S.pujas.length) {
    loadPromises.push(api('/pujas').then(res => { S.pujas = res; }).catch(() => {}));
  }
  if (loadPromises.length) await Promise.all(loadPromises);

  const allShortPujas = (S.pujas || []).filter(p => p.type === 'Short').map(p => p.name);
  const selectedPandit = targetPanditId ? (S.pandits || []).find((x) => x._id === targetPanditId || (x.email && x.email.toLowerCase() === String(targetPanditId).toLowerCase())) : null;
  const lockedDistrict = (u && u.district) ? u.district.trim() : '';
  const lockedState = (u && u.state) ? u.state.trim() : 'Odisha';
  const curState = lockedState || S.filters.state || (selectedPandit && (selectedPandit.workingState || selectedPandit.state)) || 'Odisha';
  const availableDistricts = LOCATIONS[curState] || ['Khordha', 'Cuttack', 'Puri', 'Bhadrak', 'Balasore', 'Sambalpur'];

  const sel = { date: targetDate || '', time: targetTime || '' };
  const initialPuja = targetPujaName || S.filters.service || (selectedPandit && selectedPandit.services && selectedPandit.services[0]) || allShortPujas[0] || 'Satyanarayan Puja';
  const initialDistrict = lockedDistrict || targetDistrict || (selectedPandit && ((selectedPandit.workingDistricts && selectedPandit.workingDistricts[0]) || selectedPandit.district)) || S.filters.district || availableDistricts[0];

  const modalTitle = isRebook ? `Rebook Sacred Ritual – ${esc(targetBookingId || 'Edit Details')}` : 'Book a Sacred Ritual';

  openModal(modalTitle, `
    ${isRebook ? `
      <div style="background:#fff3e0;border-left:4px solid #e65100;padding:10px 14px;border-radius:8px;margin-bottom:14px;font-size:13px;color:#bf360c">
        ℹ️ <strong>Rebooking with Updated Details:</strong> Please choose a new ceremony date and time slot for your ritual.
      </div>
    ` : ''}
    <div>
      <label>Puja / Sacred Ritual *</label>
      <select id="b-service">${opts(allShortPujas.length ? allShortPujas : ['Satyanarayan Puja', 'Griha Pravesh', 'Ganesh Puja', 'Rudrabhishek', 'Vastu Shanti'], initialPuja)}</select>
    </div>
    <div class="form-grid" style="padding:0">
      <div>
        <label>District * ${lockedDistrict ? '<span style="color:var(--ochre);font-weight:600;font-size:12px">(Locked to Account)</span>' : ''}</label>
        ${lockedDistrict ? `
          <div style="background:#fcf8f0;border:1.5px solid #ebd9c2;border-radius:8px;padding:9px 12px;display:flex;align-items:center;justify-content:space-between">
            <span style="font-weight:700;color:var(--mahogany);font-size:14px"><span class="material-icons" style="font-size:16px;vertical-align:middle;color:var(--ochre);margin-right:4px">lock</span> ${esc(lockedDistrict)}${lockedState ? ', ' + esc(lockedState) : ''}</span>
            <span class="badge" style="background:#fff3e0;color:#e65100;font-size:10px;padding:2px 6px">Locked</span>
          </div>
          <input type="hidden" id="b-district" value="${esc(lockedDistrict)}">
          <small class="muted" style="font-size:11px;margin-top:3px;display:block">Ritual will be conducted at your registered devotee location.</small>
        ` : `
          <select id="b-district">${opts(availableDistricts, initialDistrict)}</select>
        `}
      </div>
      <div>
        <label>Ceremony Date *</label>
        <input type="date" id="b-date" min="${today()}" value="${esc(targetDate || '')}">
      </div>
    </div>
    <div>
      <label>Preferred Vedic Pandit (Optional)</label>
      <select id="b-pandit">
        <option value="">✨ Any Available Verified Pandit (Auto-assigned by PujaConnect Admin)</option>
      </select>
      <div id="b-pandit-info" style="margin-top:8px"></div>
      <small class="muted" style="display:block;margin-top:4px;font-size:12px">
        All registered verified Pandits can perform all sacred Vedic pujas. Pandit's specialty is shown for your reference.
      </small>
    </div>
    <div>
      <label>Ceremony Time Slot *</label>
      <div id="b-slots" class="checks">
        <span class="muted">Select a date to view available time slots.</span>
      </div>
    </div>
    <div>
      <label>Ceremony Venue / Address *</label>
      <textarea id="b-address" rows="2" placeholder="House no., apartment, landmark, locality">${esc(targetAddress || '')}</textarea>
    </div>
    <div class="form-grid" style="padding:0">
      <div>
        <label>Contact Mobile Phone *</label>
        <input id="b-phone" value="${esc(targetPhone || u.phone || '')}" placeholder="10-digit mobile number">
      </div>
      <div>
        <label>Devotee Email (for ceremony acknowledgement) *</label>
        <input id="b-email" value="${esc(u.email || '')}" readonly style="background:#fcf8f0;cursor:not-allowed">
      </div>
    </div>
    <div class="cost-box" style="margin-top:14px;background:#fff8ed;border:1.5px dashed var(--ochre);border-radius:12px;padding:14px">
      <div class="row" style="align-items:center;justify-content:space-between">
        <div>
          <span style="font-size:14px;font-weight:700;color:var(--mahogany)">Estimated Dakshina</span>
          <div id="b-fee-note" style="font-size:12px;color:var(--muted);margin-top:2px">
            Standard fixed Vedic Dakshina for ritual
          </div>
        </div>
        <b id="b-fee" style="font-size:24px;color:var(--ochre);font-weight:700">₹1,199</b>
      </div>
      <small class="muted" style="display:block;margin-top:6px;font-size:12px;border-top:1px dashed #ebd9c2;padding-top:6px">
        Dakshina rates are fixed district-wise by PujaConnect Admin. Payment is completed only after admin assignment and confirmation.
      </small>
    </div>
    <button class="btn btn-gold btn-lg" id="b-submit" style="width:100%;margin-top:12px">
      <span class="material-icons">${isRebook ? 'event_repeat' : 'send'}</span> ${isRebook ? 'Submit Rebook Request' : 'Submit Booking Request'}
    </button>
  `, (m) => {
    const serviceSel = $('#b-service', m);
    const districtSel = $('#b-district', m);
    const panditSel = $('#b-pandit', m);
    const dateInp = $('#b-date', m);
    const feeEl = $('#b-fee', m);

    const updatePanditInfo = () => {
      const pEmail = (panditSel && panditSel.value) ? panditSel.value.trim() : '';
      const p = pEmail ? (S.pandits || []).find((x) => x.email.toLowerCase() === pEmail.toLowerCase()) : null;
      const box = $('#b-pandit-info', m);
      if (!box) return;
      if (p) {
        box.style.display = 'block';
        box.innerHTML = `
          <div style="background:#fffcf5;border:1.5px solid #ebd9c2;border-radius:10px;padding:10px 12px">
            <div style="display:flex;align-items:center;gap:10px">
              <img src="${esc(p.photo || 'https://images.unsplash.com/photo-1544168190-79c15427015f?auto=format&fit=crop&q=80&w=200')}" alt="Pandit" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:1.5px solid var(--ochre)">
              <div style="flex:1">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px">
                  <span style="font-weight:700;color:var(--mahogany);font-size:13.5px">Pt. ${esc(p.name)}</span>
                  <span class="badge" style="background:#fff3e0;border:1px solid #ffe0b2;color:#b23b00;font-size:11px;font-weight:700">⭐ Specialty: ${esc(p.specialty || 'Vedic Rituals')}</span>
                </div>
                <div style="font-size:12px;color:var(--muted);margin-top:2px">
                  ${esc(p.exp || p.experience + ' Years Exp')} · Home: ${esc(p.district || 'Khordha')}, ${esc(p.state || 'Odisha')}
                </div>
              </div>
            </div>
            <div style="margin-top:8px;padding-top:6px;border-top:1px dashed #ebd9c2;font-size:11.5px;color:#2e7d32;display:flex;align-items:center;gap:5px">
              <span class="material-icons" style="font-size:14px">check_circle</span>
              <span><strong>All Registered Pandits Perform All Pujas:</strong> Pt. ${esc(p.name)} is qualified to perform all sacred home rituals.</span>
            </div>
          </div>
        `;
      } else {
        box.style.display = 'block';
        box.innerHTML = `
          <div style="background:#f4fbf5;border:1px solid #c8e6c9;border-radius:8px;padding:8px 12px;font-size:12px;color:#1b5e20;display:flex;align-items:center;gap:6px">
            <span class="material-icons" style="font-size:16px;color:#2e7d32">verified</span>
            <span><strong>All Registered Pandits Perform All Sacred Pujas:</strong> PujaConnect Admin will auto-assign a qualified Pandit for your ritual.</span>
          </div>
        `;
      }
    };

    const updatePanditsDropdown = () => {
      const dist = districtSel ? districtSel.value : initialDistrict;
      const ritual = serviceSel ? serviceSel.value : initialPuja;

      // All registered pandits can perform all pujas
      const verified = (S.pandits || []).filter((p) => p.verified || p.status === 'Verified');
      const inDist = verified.filter((p) => (p.workingDistricts && p.workingDistricts.includes(dist)) || p.district === dist);
      const other = verified.filter((p) => !inDist.includes(p));
      const allPandits = [...inDist, ...other];

      const pujaDoc = (S.pujas || []).find((x) => (x.name || '').trim().toLowerCase() === (ritual || '').trim().toLowerCase());
      const baseDakshina = (pujaDoc && (pujaDoc.baseFee || Number(String(pujaDoc.price || '').replace(/[^0-9]/g, '')))) || 1199;

      let optionsHtml = `<option value="">✨ Any Available Verified Pandit (Auto-assigned by Admin) — Base Dakshina: ${inr(baseDakshina)}</option>`;
      allPandits.forEach((p) => {
        const isSelected = (selectedPandit && selectedPandit.email.toLowerCase() === p.email.toLowerCase()) || (targetPanditId && (p._id === targetPanditId || p.email.toLowerCase() === String(targetPanditId).toLowerCase()));
        const pFee = (p.districtPrices && Number(p.districtPrices[dist])) || p.fee || baseDakshina;
        const servesTag = (p.workingDistricts && p.workingDistricts.includes(dist)) || p.district === dist ? `Serves ${dist}` : p.district;
        const spec = p.specialty || 'Vedic Rituals';
        optionsHtml += `<option value="${esc(p.email)}" ${isSelected ? 'selected' : ''}>Pt. ${esc(p.name)} [Specialty: ${esc(spec)}] · ${esc(servesTag)} — Dakshina: ${inr(pFee)}</option>`;
      });
      panditSel.innerHTML = optionsHtml;
      updatePanditInfo();
      paintFee();
    };

    const paintFee = () => {
      const dist = (districtSel ? districtSel.value : '') || initialDistrict;
      const ritual = (serviceSel ? serviceSel.value : '') || initialPuja;
      const pEmail = (panditSel && panditSel.value) ? panditSel.value.trim() : '';
      const p = pEmail ? (S.pandits || []).find((x) => x.email.toLowerCase() === pEmail.toLowerCase()) : null;

      let f = 0;
      let noteText = '';
      if (p) {
        f = (p.districtPrices && Number(p.districtPrices[dist])) || p.fee || 1500;
        noteText = `Dakshina rate for Pandit ${p.name} in ${dist}`;
      } else {
        // Any Available Verified Pandit
        const pujaDoc = (S.pujas || []).find((x) => (x.name || '').trim().toLowerCase() === (ritual || '').trim().toLowerCase());
        if (pujaDoc && (pujaDoc.baseFee || Number(String(pujaDoc.price || '').replace(/[^0-9]/g, '')))) {
          f = pujaDoc.baseFee || Number(String(pujaDoc.price || '').replace(/[^0-9]/g, ''));
        } else {
          const eligibleInDist = (S.pandits || []).filter(
            (x) => x.verified && ((x.workingDistricts && x.workingDistricts.includes(dist)) || x.district === dist)
          );
          const distPriceCandidate = eligibleInDist.find((x) => x.districtPrices && Number(x.districtPrices[dist]) > 0);
          if (distPriceCandidate) {
            f = Number(distPriceCandidate.districtPrices[dist]);
          } else if (eligibleInDist.length && eligibleInDist[0].fee) {
            f = Number(eligibleInDist[0].fee);
          }
        }
        noteText = `Standard fixed Vedic Dakshina for ${ritual} in ${dist}`;
      }
      if (!f || isNaN(f) || f <= 0) f = 1199;
      if (feeEl) feeEl.innerHTML = inr(f);
      const noteEl = $('#b-fee-note', m);
      if (noteEl) noteEl.textContent = noteText;
    };

    const standardSlots = ['06:30 AM - 09:30 AM', '08:00 AM - 11:00 AM', '10:30 AM - 01:30 PM', '04:00 PM - 07:00 PM', '06:30 PM - 09:30 PM'];
    const drawSlots = () => {
      const d = dateInp.value;
      const box = $('#b-slots', m);
      if (!d) {
        box.innerHTML = '<span class="muted">Select a date to view live slots.</span>';
        sel.time = '';
        return;
      }
      box.innerHTML = standardSlots.map((s) => `
        <button type="button" class="slot ${sel.time === s ? 'selected' : ''}" data-slot="${esc(s)}">${esc(s)}</button>
      `).join('');
    };

    updatePanditsDropdown();
    paintFee();
    if (dateInp.value) drawSlots();

    serviceSel.onchange = () => { updatePanditsDropdown(); paintFee(); };
    districtSel.onchange = () => { updatePanditsDropdown(); paintFee(); };
    panditSel.onchange = () => { updatePanditInfo(); paintFee(); };
    dateInp.onchange = drawSlots;

    $('#b-slots', m).onclick = (e) => {
      const b = e.target.closest('.slot');
      if (!b) return;
      m.querySelectorAll('.slot').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      sel.time = b.dataset.slot;
    };

    $('#b-submit', m).onclick = async (e) => {
      const date = dateInp.value;
      if (!date) return toast('Please choose a ceremony date', true);
      if (!sel.time) return toast('Please choose a time slot', true);
      const address = $('#b-address', m).value.trim();
      if (!address) return toast('Please enter your ceremony venue / address', true);
      const phone = $('#b-phone', m).value.trim();
      if (!phone) return toast('Please enter your contact mobile number', true);

      const feeText = feeEl.textContent.replace(/[^0-9]/g, '');
      const fee = Number(feeText) || 1199;

      const submitBtn = e.target.closest('button') || e.target;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="material-icons spin">sync</span> Submitting...';

      try {
        const endpoint = (isRebook && targetBookingId) ? `/bookings/${encodeURIComponent(targetBookingId)}/rebook` : '/bookings';
        const method = (isRebook && targetBookingId) ? 'PUT' : 'POST';

        const res = await api(endpoint, {
          method,
          body: {
            userEmail: u.email,
            userName: u.name,
            phone,
            service: serviceSel.value,
            district: lockedDistrict || districtSel.value,
            date,
            time: sel.time,
            address,
            panditEmail: panditSel.value,
            fee
          }
        });

        closeModal();
        const bk = res.booking || res;
        const devoteeEmail = bk.userEmail || u.email;

        if (isRebook) {
          toast('Puja rebooked with new details! Admin will assign an available Pandit shortly. 🙏');
          renderDashboard();
          return;
        }

        // Display Success Screen as requested
        openModal('Booking Request Submitted', `
          <div style="text-align:center;padding:16px 8px">
            <span class="material-icons" style="font-size:56px;color:var(--green)">check_circle</span>
            <h3 style="margin:12px 0 6px;color:var(--mahogany)">Sacred Ritual Requested 🙏</h3>
            <p style="color:var(--muted);font-size:14px;line-height:1.5;max-width:440px;margin:0 auto 18px">
              Your ceremony booking request for <b>${esc(bk.service)}</b> has been submitted. Our team will verify pandit availability and assign a verified Pandit for your district.
            </p>
            <div style="background:#fff8ed;border:1px solid #ebd9c2;border-radius:10px;padding:14px;text-align:left;max-width:440px;margin:0 auto 18px;font-size:13px;line-height:1.6">
              <div><b>Booking ID:</b> ${esc(bk.bookingId)}</div>
              <div><b>Ritual:</b> ${esc(bk.service)}</div>
              <div><b>Preferred Pandit:</b> ${esc(bk.preferredPanditName || 'Any Available Verified Pandit')}</div>
              <div><b>Ceremony Schedule:</b> ${esc(bk.date)} · ${esc(bk.time)}</div>
              <div><b>District:</b> ${esc(bk.district)}</div>
              <div><b>Estimated Dakshina:</b> ${inr(bk.fee)}</div>
            </div>
            <div style="display:flex;gap:10px;justify-content:center">
              <button class="btn btn-gold" onclick="closeModal();showView('dashboard')">
                <span class="material-icons">dashboard</span> Go to Devotee Dashboard
              </button>
            </div>
          </div>
        `);
        renderDashboard();
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span class="material-icons">${isRebook ? 'event_repeat' : 'send'}</span> ${isRebook ? 'Submit Rebook Request' : 'Submit Booking Request'}`;
        toast(err.message, true);
      }
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
        <div><label style="font-weight:600">State *</label><select id="r-state">${opts(Object.keys(LOCATIONS), 'Odisha')}</select></div>
        <div><label style="font-weight:600">District *</label><select id="r-district"></select></div>
      </div>
      <div style="background:#fff8ed;border:1px dashed var(--ochre);border-radius:8px;padding:9px 12px;margin:8px 0 4px;font-size:12px;color:var(--mahogany);display:flex;align-items:flex-start;gap:8px">
        <span class="material-icons" style="font-size:16px;color:var(--ochre);flex-shrink:0;margin-top:1px">lock</span>
        <span><b>Permanent Account Location:</b> Your State &amp; District are locked upon registration for both short &amp; long puja ceremonies. No district change is permitted after account creation.</span>
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
  openModal('Pandit Registration', `
    <div class="form-grid" style="padding:0">
      <div><label>Full Name</label><input id="p-name" placeholder="Pt. Name"></div>
      <div><label>Email</label><input id="p-email" type="email" placeholder="pandit@example.com"></div>
      <div><label>Phone (used to log in)</label><input id="p-phone" type="tel" placeholder="10-digit mobile"></div>
      <div><label>Experience (years)</label><input id="p-exp" type="number" min="0" value="5"></div>
      <div><label>State</label><select id="p-state">${opts(Object.keys(LOCATIONS), 'Odisha')}</select></div>
      <div><label>Home District</label><select id="p-district"></select></div>
      <div class="full"><label>City / Town</label><input id="p-city" placeholder="e.g. Bhubaneswar"></div>
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
      <div class="full" style="background:#fff8e1;border:1.5px solid #ffe082;border-left:5px solid #e65100;border-radius:10px;padding:14px 16px;margin-top:6px">
        <div style="display:flex;align-items:flex-start;gap:10px">
          <span class="material-icons" style="color:#e65100;font-size:24px;margin-top:2px">gavel</span>
          <div style="flex:1">
            <div style="font-weight:700;color:#b26a00;font-size:14px;margin-bottom:4px">
              ⚠️ Important Notice: Admin Decision is the Final Decision
            </div>
            <p style="margin:0 0 10px;font-size:13px;color:#5d2800;line-height:1.5">
              All Pandit onboarding, verification, ritual allocations, district assignments, and platform guidelines are governed by PujaConnect Administration. <strong>The Admin decision is the final decision.</strong>
            </p>
            <label style="cursor:pointer;display:inline-flex;align-items:center;gap:10px;background:#ffffff;border:1.5px solid #e65100;border-radius:8px;padding:9px 14px;font-weight:700;font-size:13px;color:#3e2723;user-select:none">
              <input type="checkbox" id="p-admin-consent" style="width:19px;height:19px;cursor:pointer;accent-color:#e65100">
              <span>I acknowledge and accept that the Admin decision is the final decision.</span>
            </label>
          </div>
        </div>
      </div>
    </div>
    <button class="btn btn-gold" id="p-submit" style="margin-top:16px;width:100%;transition:all 0.2s ease"><span class="material-icons">send</span> Submit Registration</button>`, (m) => {
    let photoDataUrl = '';
    const consentBox = $('#p-admin-consent', m);
    const submitBtn = $('#p-submit', m);

    const updateSubmitState = () => {
      if (consentBox && submitBtn) {
        if (!consentBox.checked) {
          submitBtn.style.opacity = '0.65';
          submitBtn.title = 'Please check the Admin decision agreement box to enable submission';
        } else {
          submitBtn.style.opacity = '1';
          submitBtn.title = 'Submit Registration';
        }
      }
    };
    updateSubmitState();
    if (consentBox) consentBox.onchange = updateSubmitState;

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
      if (!consentBox || !consentBox.checked) {
        return toast('Please check the confirmation box: "Admin decision is the final decision" before submitting.', true);
      }
      const home = $('#p-district', m).value;
      if (!home) return toast('Please select your home district', true);
      const body = {
        name: $('#p-name', m).value.trim(),
        email: $('#p-email', m).value.trim(),
        phone: $('#p-phone', m).value.trim(),
        state: $('#p-state', m).value,
        workingState: $('#p-state', m).value,
        district: home,
        city: $('#p-city', m).value.trim(),
        workingDistricts: [home],
        experience: $('#p-exp', m).value,
        fee: 1500,
        services: ['Vedic Rituals', 'Home Puja'],
        specialty: $('#p-spec', m).value.trim() || undefined,
        bio: $('#p-bio', m).value.trim() || undefined,
        photo: photoDataUrl || undefined,
        adminDecisionAccepted: true
      };
      if (!body.name || !body.email || !body.phone) return toast('Name, email and phone are required', true);
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
  if (!f) return;
  const pre = S.longPreset || (longs[0] && longs[0].name);
  const u = S.user;
  const lockedDistrict = (u && u.district) ? u.district.trim() : '';
  const lockedState = (u && u.state) ? u.state.trim() : 'Odisha';

  f.innerHTML = `
    <div class="full"><label>Puja / Mahayajna</label><select id="l-puja">${opts(longs.map((p) => p.name), pre)}</select></div>
    <div><label>Start Date</label><input type="date" id="l-from" min="${today()}" required></div>
    <div><label>End Date</label><input type="date" id="l-to" min="${today()}" required></div>
    <div><label>Daily Duration (hours)</label><input type="number" id="l-hours" min="1" max="12" value="4"></div>
    <div><label>Pandits Required</label><input type="number" id="l-count" min="1" max="21" value="1"></div>
    ${lockedDistrict ? `
      <div>
        <label>State (Locked)</label>
        <input type="text" id="l-state" value="${esc(lockedState)}" readonly style="background:#fcf8f0;cursor:not-allowed;font-weight:600">
      </div>
      <div>
        <label>District (Locked)</label>
        <input type="text" id="l-district" value="${esc(lockedDistrict)}" readonly style="background:#fcf8f0;cursor:not-allowed;font-weight:600">
        <small class="muted" style="font-size:11px;color:var(--ochre);display:block;margin-top:2px"><span class="material-icons" style="font-size:12px;vertical-align:middle">lock</span> Locked to your registered account location</small>
      </div>
    ` : `
      <div><label>State</label><select id="l-state">${opts(Object.keys(LOCATIONS), 'Odisha')}</select></div>
      <div><label>District</label><select id="l-district"></select></div>
    `}
    <div class="full"><button class="btn btn-gold" type="submit">Submit Request</button></div>`;

  const stateSel = $('#l-state');
  const distSel = $('#l-district');
  if (stateSel && stateSel.tagName === 'SELECT') {
    const fillD = () => {
      if (distSel && distSel.tagName === 'SELECT') {
        distSel.innerHTML = opts(LOCATIONS[stateSel.value] || []);
      }
    };
    fillD();
    stateSel.onchange = fillD;
  }

  f.onsubmit = async (e) => {
    e.preventDefault();
    if (!requireLogin(() => { renderLongForm(); f.requestSubmit(); })) return;
    const from = $('#l-from').value, to = $('#l-to').value;
    if (!from || !to || to < from) return toast('Please choose valid start and end dates', true);
    const finalDistrict = (S.user && S.user.district) ? S.user.district : $('#l-district').value;
    try {
      const r = await api('/long-puja-requests', { method: 'POST', body: {
        userEmail: S.user.email, userName: S.user.name, phone: S.user.phone, pujaName: $('#l-puja').value,
        district: finalDistrict, fromDate: from, toDate: to,
        dailyHours: +$('#l-hours').value, requiredPandits: +$('#l-count').value,
        advanceAmount: 0
      } });
      toast(`Request ${r.id} submitted. Confirmation email sent.`);
      showView('dashboard');
    } catch (err) { toast(err.message, true); }
  };
}

const statusBadge = (s) => {
  let cls = 'amber';
  if (['Completed', 'Confirmed', 'Verified', 'Assigned', 'Accepted'].includes(s)) cls = 'green';
  else if (['Cancelled', 'Rejected', 'Declined'].includes(s)) cls = 'red';
  else if (['Pending Pandit Confirmation', 'Offered'].includes(s)) cls = 'blue';
  return `<span class="badge ${cls}">${esc(s)}</span>`;
};

async function renderDashboard() {
  const root = $('#dashboard-root');
  if (!S.user) return;
  const isAlreadyLoaded = root && root.querySelector('.dash-banner');
  if (!isAlreadyLoaded) {
    root.innerHTML = '<div class="empty">Loading your dashboard…</div>';
  }
  try {
    if (S.user.role === 'admin') await adminDash(root);
    else if (S.user.role === 'pandit') await panditDash(root);
    else await userDash(root);
  } catch (e) {
    if (/Authentication|Admin access/.test(e.message)) { saveSession(null); showView('home'); toast('Session expired. Please log in again.', true); }
    else root.innerHTML = `<div class="empty">${esc(e.message)}</div>`;
  }
}

function isBookingRejected(b) {
  if (!b) return false;
  return Boolean(
    b.slotUnavailable ||
    b.status === 'Rejected' ||
    b.adminApproval === 'Rejected' ||
    b.panditApproval === 'Rejected' ||
    (b.status === 'Cancelled' && (b.slotUnavailable || (b.rejectionReason && b.rejectionReason.length > 0)))
  );
}

function renderPanditCoverageSection(verifiedList, devoteeDistrict, devoteeState) {
  const coverageMap = {};
  (verifiedList || []).forEach((p) => {
    if (!p.verified && p.status !== 'Verified') return;
    const st = (p.workingState || p.state || 'Odisha').trim() || 'Odisha';
    if (!coverageMap[st]) coverageMap[st] = { pandits: new Set(), districts: {} };
    const pId = (p.email || p._id || p.name).toLowerCase();
    coverageMap[st].pandits.add(pId);

    const served = new Set();
    if (p.district) served.add(p.district.trim());
    if (Array.isArray(p.workingDistricts)) {
      p.workingDistricts.forEach((d) => { if (d && String(d).trim()) served.add(String(d).trim()); });
    }
    if (p.districtPrices && typeof p.districtPrices === 'object') {
      Object.keys(p.districtPrices).forEach((d) => {
        if (d && Number(p.districtPrices[d]) > 0) served.add(d.trim());
      });
    }

    served.forEach((dist) => {
      if (!coverageMap[st].districts[dist]) coverageMap[st].districts[dist] = new Set();
      coverageMap[st].districts[dist].add(pId);
    });
  });

  const stateNames = Object.keys(coverageMap).sort();
  const dLower = (devoteeDistrict || '').trim().toLowerCase();

  let myDistPanditCount = 0;
  Object.keys(coverageMap).forEach((st) => {
    Object.keys(coverageMap[st].districts).forEach((dist) => {
      if (dist.toLowerCase() === dLower) {
        myDistPanditCount = Math.max(myDistPanditCount, coverageMap[st].districts[dist].size);
      }
    });
  });

  return `
    <div class="dash-coverage-card">
      <div class="dash-coverage-header">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="dash-coverage-icon">
            <span class="material-icons">travel_explore</span>
          </div>
          <div>
            <h3 style="margin:0;color:var(--mahogany);font-size:18px">Active Pandit Availability by State &amp; District</h3>
            <p class="muted" style="margin:2px 0 0;font-size:13px">Verified Vedic Pandits currently serving devotees across India</p>
          </div>
        </div>
        <div class="devotee-locked-badge">
          <span class="material-icons" style="font-size:15px;color:var(--ochre)">lock</span>
          <span>Your Location (Locked): <b>${esc(devoteeDistrict || 'Not Set')}${devoteeState ? ', ' + esc(devoteeState) : ''}</b></span>
          ${myDistPanditCount > 0 ? `<span class="badge green" style="margin:0;font-size:11px">Available (${myDistPanditCount})</span>` : `<span class="badge amber" style="margin:0;font-size:11px">Awaiting Pandits</span>`}
        </div>
      </div>

      ${myDistPanditCount > 0 ? `
        <div class="coverage-loc-alert success">
          <span class="material-icons" style="color:var(--green);font-size:22px">verified</span>
          <div>
            <b>Vedic Pandits Active in Your District:</b> ${myDistPanditCount} verified Pandit(s) are actively serving <b>${esc(devoteeDistrict)}</b>. All short and long puja ceremonies are locked to your registered district.
          </div>
        </div>
      ` : `
        <div class="coverage-loc-alert warning">
          <span class="material-icons" style="color:var(--amber);font-size:22px">notifications_active</span>
          <div>
            <b>Your District Status:</b> Currently 0 Pandits registered in <b>${esc(devoteeDistrict || 'your district')}${devoteeState ? ', ' + esc(devoteeState) : ''}</b>. You will receive an automated email as soon as verified Pandits become available. See active locations below:
          </div>
        </div>
      `}

      <div class="coverage-states-list">
        ${stateNames.length ? stateNames.map((st) => {
          const sData = coverageMap[st];
          const distNames = Object.keys(sData.districts).sort();
          return `
            <div class="coverage-state-row">
              <div class="coverage-state-head">
                <span class="material-icons" style="color:var(--ochre);font-size:16px">account_balance</span>
                <span class="coverage-state-name">${esc(st)}</span>
                <span class="badge gold" style="font-size:11px;padding:2px 8px">${sData.pandits.size} Verified Pandit${sData.pandits.size > 1 ? 's' : ''}</span>
              </div>
              <div class="coverage-districts-wrap">
                ${distNames.map((dName) => {
                  const cnt = sData.districts[dName].size;
                  const isMine = dName.toLowerCase() === dLower;
                  return `
                    <span class="coverage-district-pill ${isMine ? 'active-user-dist' : ''}">
                      <span class="material-icons" style="font-size:12px;color:var(--ochre)">place</span>
                      <b>${esc(dName)}</b>
                      <span class="dist-count">${cnt} Pandit${cnt > 1 ? 's' : ''}</span>
                      ${isMine ? '<span class="mine-tag">🔒 Your District</span>' : ''}
                    </span>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('') : '<div class="empty">No verified Pandits listed in the directory yet.</div>'}
      </div>
    </div>
  `;
}

async function userDash(root) {
  const e = encodeURIComponent(S.user.email);
  const [bookings, longs, panditsRes] = await Promise.all([
    api('/bookings?userEmail=' + e).catch(() => []),
    api('/long-puja-requests?userEmail=' + e).catch(() => []),
    api('/pandits?verified=true').catch(() => [])
  ]);
  S.bookings = bookings;
  if (panditsRes && panditsRes.length) S.pandits = panditsRes;
  const verifiedList = S.pandits || [];

  const devoteeDistrict = (S.user.district || '').trim();
  const devoteeState = (S.user.state || '').trim();

  const panditsInDistrict = verifiedList.filter((p) => {
    if (!p.verified && p.status !== 'Verified') return false;
    const dLower = devoteeDistrict.toLowerCase();
    const isHome = p.district && p.district.toLowerCase() === dLower;
    const isWorking = Array.isArray(p.workingDistricts) && p.workingDistricts.some((d) => String(d).toLowerCase() === dLower);
    if (!isHome && !isWorking) return false;

    // Service is available ONLY after admin sets/updates the district price rate (> 0)
    const prices = p.districtPrices;
    if (!prices || typeof prices !== 'object') return false;
    const priceKey = Object.keys(prices).find((k) => k.trim().toLowerCase() === dLower);
    return Boolean(priceKey && Number(prices[priceKey]) > 0);
  });

  const panditsInState = verifiedList.filter((p) => {
    if (!p.verified && p.status !== 'Verified') return false;
    const sLower = devoteeState.toLowerCase();
    const isHomeState = p.state && p.state.toLowerCase() === sLower;
    const isWorkingState = p.workingState && p.workingState.toLowerCase() === sLower;
    if (!isHomeState && !isWorkingState) return false;

    const prices = p.districtPrices;
    if (!prices || typeof prices !== 'object') return false;
    return Object.values(prices).some((v) => Number(v) > 0);
  });

  const isRegionUnavailable = Boolean(
    (devoteeDistrict && panditsInDistrict.length === 0) ||
    (!devoteeDistrict && devoteeState && panditsInState.length === 0)
  );
  S._isRegionUnavailable = isRegionUnavailable;

  // Auto-subscribe ONLY 404 error page users so that they receive the notification email when admin sets district-wise amounts
  const targetLoc = devoteeDistrict || devoteeState;
  if (isRegionUnavailable && targetLoc && S.user && S.user.email) {
    api('/region-notifications/subscribe-404', {
      method: 'POST',
      body: {
        email: S.user.email,
        district: targetLoc,
        state: devoteeState
      }
    }).catch(() => {});
  }

  const tab = S.dashTab || 'bookings';
  const upcoming = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'In Progress').length;
  const pendingPayments = bookings.filter((b) => b.paymentStatus !== 'Paid' && (['Confirmed', 'In Progress'].includes(b.status) || b.panditApproval === 'Approved')).length;
  const rebookNeeded = bookings.filter(isBookingRejected).length;
  const initial = (S.user.name || 'D').charAt(0).toUpperCase();

  root.innerHTML = `
    <div class="dash-banner">
      <div class="dash-user-info">
        <div class="dash-avatar">${initial}</div>
        <div class="dash-title-wrap">
          <h2>Namaste, ${esc(S.user.name)} 🙏</h2>
          <p>${esc(S.user.email)} · ${esc(S.user.phone || 'No phone')} · <span class="badge green" style="margin:0">Devotee Account</span> · <span class="badge gold" style="margin:0"><span class="material-icons" style="font-size:12px;vertical-align:middle">lock</span> ${esc(devoteeDistrict || 'District Not Set')}${devoteeState ? ', ' + esc(devoteeState) : ''} (Locked)</span></p>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-gold btn-sm" data-action="dashTab" data-tab="explore"><span class="material-icons">spa</span> Explore All Pujas</button>
        <button class="btn btn-outline btn-sm" data-action="nav" data-view="home"><span class="material-icons">home</span> Home</button>
        <button class="btn btn-outline btn-sm" data-action="logout" title="Logout"><span class="material-icons">logout</span> Logout</button>
      </div>
    </div>

    <!-- Active Pandit Availability by State & District -->
    ${renderPanditCoverageSection(verifiedList, devoteeDistrict, devoteeState)}

    ${isRegionUnavailable ? `
      <div class="dash-404-banner" style="background:linear-gradient(135deg, #fff5f5 0%, #fffbf0 100%);border:2px solid #ffab91;border-left:8px solid #d32f2f;border-radius:14px;padding:22px;margin-bottom:20px;box-shadow:0 4px 18px rgba(211,47,47,0.08)">
        <div style="display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap">
          <div style="background:#ffebee;border:2px solid #ef5350;border-radius:12px;width:72px;height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#c62828;flex-shrink:0;box-shadow:0 3px 10px rgba(211,47,47,0.12)">
            <span style="font-size:24px;font-weight:900;line-height:1;letter-spacing:-0.5px">404</span>
            <span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-top:2px">Region</span>
          </div>
          <div style="flex:1;min-width:280px">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span class="badge" style="background:#d32f2f;color:#fff;font-weight:700;font-size:11px;padding:3px 8px;letter-spacing:0.5px">SERVICE PENDING</span>
              <span class="badge" style="background:#fff3e0;color:#e65100;border:1px solid #ffb74d;font-weight:600">Locked Location: ${esc(devoteeDistrict || 'Not Set')}${devoteeState ? ', ' + esc(devoteeState) : ''}</span>
            </div>
            <h3 style="margin:8px 0 6px;color:#b71c1c;font-size:20px;font-weight:800">
              No Pandits Currently Available in Your District
            </h3>
            <p style="margin:0 0 12px;color:#5d2800;font-size:14.5px;line-height:1.6">
              No verified Vedic Pandits are currently available in your registered district (<strong>${esc(devoteeDistrict || 'your district')}${devoteeState ? ', ' + esc(devoteeState) : ''}</strong>). Your location is permanently locked to your account. <strong>Our team will notify you automatically when Pandits become available here.</strong> You can explore rituals and view your profile below.
            </p>
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px dashed #ffccbc">
              <div style="display:inline-flex;align-items:center;gap:8px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:7px 14px;font-size:13px;color:#1b5e20;font-weight:600">
                <span class="material-icons" style="font-size:18px;color:#2e7d32">notifications_active</span>
                <span>✓ Auto-Notification Subscribed: We will notify <b>${esc(S.user.email)}</b> as soon as Pandits become available in ${esc(devoteeDistrict || devoteeState || 'Location')}.</span>
              </div>
              <span class="badge" style="background:#fff3e0;border:1px solid #ffcc80;color:#bf360c;font-weight:600;padding:6px 12px"><span class="material-icons" style="font-size:14px;vertical-align:middle">lock</span> Location Locked to Account</span>
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    ${rebookNeeded > 0 ? `
      <div style="background:#fff3e0;border:1.5px solid #ffcc80;border-left:5px solid #e65100;border-radius:12px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="material-icons" style="font-size:32px;color:#e65100">event_busy</span>
          <div>
            <div style="font-weight:700;color:#bf360c;font-size:14.5px">
              ⚠️ Attention: ${rebookNeeded} Ceremony Booking(s) Need Rebooking
            </div>
            <div style="font-size:13px;color:#6d2800;margin-top:2px">
              No verified Pandit was available for your chosen time slot. Click below to view and update details for rebooking.
            </div>
          </div>
        </div>
        <button class="btn btn-gold btn-sm" data-action="dashTab" data-tab="bookings"><span class="material-icons" style="font-size:14px;vertical-align:middle">event_repeat</span> View &amp; Rebook Now</button>
      </div>
    ` : ''}

    <!-- Quick Stat Cards (Tappable on both Mobile & Desktop) -->
    <div class="stats">
      <div class="stat" data-action="dashTab" data-tab="bookings" style="cursor:pointer" title="Click to view all bookings">
        <b>${bookings.length}</b>
        <span>Total Bookings</span>
      </div>
      <div class="stat" data-action="dashTab" data-tab="bookings" style="cursor:pointer" title="Click to view upcoming rituals">
        <b style="color:var(--ochre)">${upcoming}</b>
        <span>Upcoming Rituals</span>
      </div>
      <div class="stat" data-action="dashTab" data-tab="long" style="cursor:pointer" title="Click to view multi-day requests">
        <b>${longs.length}</b>
        <span>Multi-Day Requests</span>
      </div>
    </div>

    <!-- Devotee Navigation: Button Cards Grid on Mobile & Clean Bar on Desktop -->
    <div class="dash-subtabs">
      <button class="subtab ${tab === 'bookings' ? 'active' : ''}" data-action="dashTab" data-tab="bookings">
        <span class="subtab-icon-wrap"><span class="material-icons">event</span></span>
        <div class="subtab-info">
          <span class="subtab-title">My Bookings</span>
          <span class="subtab-sub">${rebookNeeded > 0 ? `${rebookNeeded} To Rebook` : `${bookings.length} Registered`}</span>
        </div>
        ${rebookNeeded > 0 ? `<span class="subtab-badge alert" style="background:#e65100;color:#fff">${rebookNeeded}</span>` : `<span class="subtab-badge">${bookings.length}</span>`}
      </button>

      <button class="subtab ${tab === 'payments' ? 'active' : ''}" data-action="dashTab" data-tab="payments">
        <span class="subtab-icon-wrap"><span class="material-icons">payments</span></span>
        <div class="subtab-info">
          <span class="subtab-title">Payment Tracking</span>
          <span class="subtab-sub">${pendingPayments > 0 ? `${pendingPayments} To Pay` : 'All Clear'}</span>
        </div>
        ${pendingPayments > 0 ? `<span class="subtab-badge alert">${pendingPayments}</span>` : ''}
      </button>

      <button class="subtab ${tab === 'explore' ? 'active' : ''}" data-action="dashTab" data-tab="explore">
        <span class="subtab-icon-wrap"><span class="material-icons">spa</span></span>
        <div class="subtab-info">
          <span class="subtab-title">Explore All Pujas</span>
          <span class="subtab-sub">Browse Rituals</span>
        </div>
      </button>

      <button class="subtab ${tab === 'long' ? 'active' : ''}" data-action="dashTab" data-tab="long">
        <span class="subtab-icon-wrap"><span class="material-icons">local_fire_department</span></span>
        <div class="subtab-info">
          <span class="subtab-title">Multi-Day Yajnas</span>
          <span class="subtab-sub">${longs.length} Requests</span>
        </div>
        <span class="subtab-badge">${longs.length}</span>
      </button>

      <button class="subtab ${tab === 'profile' ? 'active' : ''}" data-action="dashTab" data-tab="profile">
        <span class="subtab-icon-wrap"><span class="material-icons">account_circle</span></span>
        <div class="subtab-info">
          <span class="subtab-title">My Profile</span>
          <span class="subtab-sub">Account Details</span>
        </div>
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
        const isPaid = b.paymentStatus === 'Paid' || b.paymentStatus === 'Paid & Verified';
        const isVerifying = b.paymentStatus === 'Under Processing' || b.paymentStatus === 'Verification Pending';
        const isRejected = b.paymentStatus === 'Rejected' || b.paymentStatus === 'Payment Rejected';
        const remaining = Math.max(0, isPaid ? 0 : fee - (b.advancePaid ? advance : 0));
        const isPanditApproved = b.status === 'Confirmed' || b.status === 'In Progress' || b.panditApproval === 'Approved';

        let statusSnippet = '';
        if (isPaid) {
          statusSnippet = `<span class="badge green"><span class="material-icons" style="font-size:14px">check_circle</span> Paid &amp; Verified</span>`;
        } else if (isVerifying) {
          statusSnippet = `<span class="badge amber"><span class="material-icons" style="font-size:14px">hourglass_top</span> Under Processing</span>`;
        } else if (isRejected) {
          statusSnippet = `<span class="badge red" style="background:#ffebee;color:#c62828;border:1px solid #ef9a9a"><span class="material-icons" style="font-size:14px">cancel</span> Payment Rejected</span>${b.paymentRejectionReason ? `<br><small class="muted" style="color:#c62828;font-size:12px;margin-top:2px;display:inline-block">Reason: ${esc(b.paymentRejectionReason)}</small>` : ''}`;
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
              <span class="material-icons">hourglass_top</span> Under Processing (Ref: ${esc(b.paymentProof || 'Submitted')})
            </div>
          `;
        } else if (isRejected) {
          actionButton = `
            <button class="btn btn-gold btn-sm" data-action="payBooking" data-id="${esc(b.bookingId)}">
              <span class="material-icons">refresh</span> Repay Dakshina (${inr(fee)})
            </button>
          `;
        } else if (b.status !== 'Cancelled') {
          if (isPanditApproved) {
            actionButton = `
              <button class="btn btn-gold btn-sm" data-action="payBooking" data-id="${esc(b.bookingId)}">
                <span class="material-icons">account_balance_wallet</span> Pay Dakshina (${inr(fee)})
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
          <div class="payment-card" data-action="viewTimeline" data-id="${esc(b.bookingId)}" style="cursor:pointer" title="Click to view live ceremony progress timeline">
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
              <div style="display:flex;gap:6px;align-items:center">
                <button class="btn btn-outline dark btn-sm" data-action="viewTimeline" data-id="${esc(b.bookingId)}" title="View live timeline and progress">
                  <span class="material-icons" style="font-size:14px">timeline</span> Timeline
                </button>
                ${actionButton}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function openBookingTimeline(arg) {
  let b = (typeof arg === 'object' && arg && arg.bookingId) ? arg : (S.bookings || []).find((x) => x.bookingId === arg);
  if (!b && (typeof arg === 'string' || (arg && arg.id))) {
    const id = typeof arg === 'string' ? arg : arg.id;
    try {
      b = await api('/bookings/' + encodeURIComponent(id));
    } catch (e) {}
  }
  if (!b) return toast('Ceremony booking record not found', true);

  const isSlotRejected = isBookingRejected(b);
  const fee = b.fee || 1199;

  // Stage 2: Admin Review & Pandit Assignment
  let step2State = 'pending';
  let step2Tag = 'Pending Review';
  let step2Desc = 'PujaConnect team is verifying ceremony requirements and available Vedic Pandits.';
  if (isSlotRejected) {
    step2State = 'rejected';
    step2Tag = 'Slot Unavailable (Rejected)';
    step2Desc = b.rejectionReason || 'No verified Vedic Pandit available for this date and time slot in your district. Rebooking required.';
  } else if (b.status === 'Pending Assignment') {
    step2State = 'active';
    step2Tag = 'In Progress';
    step2Desc = `PujaConnect coordination team is currently reviewing verified Vedic Purohits in ${esc(b.district)} to assign the best scholar for ${esc(b.service)}.`;
  } else {
    step2State = 'completed';
    step2Tag = 'Approved & Assigned';
    step2Desc = `Admin verified ritual requirements and assigned Pandit ${esc(b.panditName || 'Verified Pandit')} (${esc(b.district)}).`;
  }

  // Stage 3: Waiting for Selected / Assigned Pandit ji Confirmation
  let step3State = 'pending';
  let step3Tag = 'Pending';
  let step3Desc = 'Will be dispatched to assigned Pandit ji once admin review is approved.';
  if (isSlotRejected) {
    step3State = 'disabled';
    step3Tag = 'Cancelled';
    step3Desc = 'Not reached due to slot unavailability. Please rebook to pick an alternative date or time slot.';
  } else if (b.status === 'Pending Assignment') {
    step3State = 'pending';
    step3Tag = 'Awaiting Admin';
    step3Desc = 'Pandit offer will be sent immediately upon admin assignment.';
  } else if (b.status === 'Pending Pandit Confirmation') {
    step3State = 'active';
    step3Tag = 'Waiting for Pandit ji Confirmation';
    step3Desc = `Ceremony offer has been sent to Pandit ${esc(b.panditName)}. Waiting for Pandit ji to accept and confirm availability.`;
  } else if (b.panditApproval === 'Rejected') {
    step3State = 'warning';
    step3Tag = 'Pandit Unavailable (Reassigning)';
    step3Desc = `Pandit had a prior commitment. Admin is reassigning another verified Vedic Pandit for ${esc(b.district)}.`;
  } else if (b.panditApproval === 'Approved' || ['Confirmed', 'In Progress', 'Completed'].includes(b.status)) {
    step3State = 'completed';
    step3Tag = 'Confirmed & Accepted';
    step3Desc = `Pandit ${esc(b.panditName)} has accepted the ceremony assignment and confirmed availability for ${esc(b.date)} (${esc(b.time)}).`;
  }

  // Stage 4: Dakshina Payment & Bank Verification
  let step4State = 'pending';
  let step4Tag = 'Pending';
  let step4Desc = `Dakshina amount: ${inr(fee)}. Payment unlocks once Pandit confirms availability.`;
  if (isSlotRejected) {
    step4State = 'disabled';
    step4Tag = 'Cancelled';
    step4Desc = 'No payment needed for rejected slot. Rebook to choose a new slot.';
  } else if (b.paymentStatus === 'Paid' || b.paymentStatus === 'Paid & Verified') {
    step4State = 'completed';
    step4Tag = 'Paid & Verified';
    step4Desc = `Dakshina of ${inr(fee)} verified by PujaConnect accounts. Official ceremony receipt generated.`;
  } else if (b.paymentStatus === 'Under Processing' || b.paymentStatus === 'Verification Pending') {
    step4State = 'active';
    step4Tag = 'Verification in Progress';
    step4Desc = `Payment transaction proof submitted (${esc(b.paymentProof || 'UTR/UPI')}). Administration is verifying bank records.`;
  } else if (b.paymentStatus === 'Rejected' || b.paymentStatus === 'Payment Rejected') {
    step4State = 'rejected';
    step4Tag = 'Verification Unsuccessful';
    step4Desc = `${esc(b.paymentRejectionReason || 'Reference not found in bank records')}. Please click "Repay" to re-submit valid payment details.`;
  } else if (['Confirmed', 'In Progress', 'Completed'].includes(b.status) || b.panditApproval === 'Approved') {
    step4State = 'active';
    step4Tag = 'Payment Due';
    step4Desc = `Fixed Dakshina: ${inr(fee)}. Please scan UPI QR code or transfer to secure ceremony schedule.`;
  }

  // Stage 5: Sacred Ceremony Day & Blessings
  let step5State = 'pending';
  let step5Tag = 'Upcoming';
  let step5Desc = `Scheduled for ${esc(b.date)} at ${esc(b.time || '10:00 AM')} in ${esc(b.district)}.`;
  if (b.status === 'Completed') {
    step5State = 'completed';
    step5Tag = 'Ceremony Completed 🙏';
    step5Desc = `Sacred Vedic ritual completed successfully on ${esc(b.date)}. May Lord shower peace, health, and prosperity to you and your family! ✨`;
  } else if (b.status === 'In Progress') {
    step5State = 'active';
    step5Tag = 'In Progress Today 🪔';
    step5Desc = `Ceremony is in progress today (${esc(b.time)}). Pandit ji is performing sacred Vedic rituals at your venue.`;
  } else if (b.status === 'Confirmed') {
    step5State = 'scheduled';
    step5Tag = 'Confirmed & Scheduled 📅';
    step5Desc = `All confirmations complete! Pandit ${esc(b.panditName)} will arrive at your venue on ${esc(b.date)} for the ${esc(b.time)} slot.`;
  } else if (b.status === 'Cancelled') {
    step5State = 'rejected';
    step5Tag = 'Cancelled';
    step5Desc = 'Ceremony booking was cancelled.';
  }

  openModal(`Ceremony Progress Timeline – ${b.bookingId}`, `
    <div style="padding:4px 0">
      <!-- Ritual Summary Card -->
      <div style="background:#fff8ed;border:1.5px solid #ebd9c2;border-radius:12px;padding:16px;margin-bottom:18px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
          <div>
            <span class="booking-id-tag" style="color:#b26a00;font-size:12px">BOOKING ID: ${esc(b.bookingId)}</span>
            <h3 style="margin:4px 0 6px;color:var(--mahogany);font-size:20px">${esc(b.service)}</h3>
            <div style="font-size:13px;color:#5c3818;display:flex;flex-wrap:wrap;gap:14px;margin-top:6px">
              <span><span class="material-icons" style="font-size:15px;vertical-align:middle;color:var(--ochre)">schedule</span> <b>${esc(b.date)}</b> at <b>${esc(b.time || '10:00 AM')}</b></span>
              <span><span class="material-icons" style="font-size:15px;vertical-align:middle;color:var(--ochre)">place</span> <b>${esc(b.district)}</b></span>
              <span><span class="material-icons" style="font-size:15px;vertical-align:middle;color:var(--ochre)">payments</span> Dakshina: <b>${inr(fee)}</b></span>
            </div>
          </div>
          <div>
            ${isSlotRejected ? `<span class="badge red"><span class="material-icons" style="font-size:12px">event_busy</span> Rejected – Slot Unavailable</span>` : statusBadge(b.status)}
          </div>
        </div>
        ${b.address ? `<div style="font-size:12.5px;color:#7a5030;margin-top:8px;border-top:1px dashed #ebd9c2;padding-top:8px"><b>Ceremony Venue:</b> ${esc(b.address)}</div>` : ''}
      </div>

      <!-- Live Stepper Timeline -->
      <div class="ceremony-timeline">
        <!-- Step 1: Request Submitted -->
        <div class="ceremony-timeline-step completed">
          <div class="timeline-step-icon"><span class="material-icons">check_circle</span></div>
          <div class="timeline-step-content">
            <div class="timeline-step-header">
              <span class="timeline-step-title">1. Request Submitted</span>
              <span class="timeline-step-tag" style="background:#e8f5e9;color:#2e7d32">Submitted ✅</span>
            </div>
            <p class="timeline-step-desc">
              Ritual booking request submitted for <b>${esc(b.service)}</b> in <b>${esc(b.district)}</b>.
              <br><small class="muted">${b.preferredPanditName ? `Devotee preferred: Pandit ${esc(b.preferredPanditName)}` : 'Devotee selected: Any Available Verified Pandit'}</small>
            </p>
          </div>
        </div>

        <!-- Step 2: Approved / Reviewed by Admin -->
        <div class="ceremony-timeline-step ${step2State}">
          <div class="timeline-step-icon">
            <span class="material-icons">${step2State === 'completed' ? 'check_circle' : (step2State === 'rejected' ? 'cancel' : (step2State === 'active' ? 'hourglass_top' : 'radio_button_unchecked'))}</span>
          </div>
          <div class="timeline-step-content">
            <div class="timeline-step-header">
              <span class="timeline-step-title">2. Approved by Admin &amp; Pandit Assignment</span>
              <span class="timeline-step-tag" style="background:${step2State === 'completed' ? '#e8f5e9;color:#2e7d32' : (step2State === 'rejected' ? '#ffebee;color:#c62828' : '#fff8e1;color:#b26a00')}">${esc(step2Tag)}</span>
            </div>
            <p class="timeline-step-desc">${step2Desc}</p>
          </div>
        </div>

        <!-- Step 3: Waiting for Selected / Assigned Pandit ji Confirmation -->
        <div class="ceremony-timeline-step ${step3State}">
          <div class="timeline-step-icon">
            <span class="material-icons">${step3State === 'completed' ? 'check_circle' : (step3State === 'active' ? 'sync' : (step3State === 'warning' ? 'error_outline' : (step3State === 'disabled' ? 'block' : 'radio_button_unchecked')))}</span>
          </div>
          <div class="timeline-step-content">
            <div class="timeline-step-header">
              <span class="timeline-step-title">3. Waiting for Selected / Assigned Pandit ji Confirmation</span>
              <span class="timeline-step-tag" style="background:${step3State === 'completed' ? '#e8f5e9;color:#2e7d32' : (step3State === 'active' ? '#fff8e1;color:#b26a00' : '#f5f5f5;color:#777')}">${esc(step3Tag)}</span>
            </div>
            <p class="timeline-step-desc">${step3Desc}</p>
          </div>
        </div>

        <!-- Step 4: Dakshina Payment & Bank Verification -->
        <div class="ceremony-timeline-step ${step4State}">
          <div class="timeline-step-icon">
            <span class="material-icons">${step4State === 'completed' ? 'check_circle' : (step4State === 'rejected' ? 'error' : (step4State === 'active' ? 'payments' : (step4State === 'disabled' ? 'block' : 'radio_button_unchecked')))}</span>
          </div>
          <div class="timeline-step-content">
            <div class="timeline-step-header">
              <span class="timeline-step-title">4. Dakshina Payment &amp; Verification</span>
              <span class="timeline-step-tag" style="background:${step4State === 'completed' ? '#e8f5e9;color:#2e7d32' : (step4State === 'rejected' ? '#ffebee;color:#c62828' : (step4State === 'active' ? '#fff8e1;color:#b26a00' : '#f5f5f5;color:#777'))}">${esc(step4Tag)}</span>
            </div>
            <p class="timeline-step-desc">${step4Desc}</p>
          </div>
        </div>

        <!-- Step 5: Sacred Ceremony Day & Blessings -->
        <div class="ceremony-timeline-step ${step5State}">
          <div class="timeline-step-icon">
            <span class="material-icons">${step5State === 'completed' ? 'auto_awesome' : (step5State === 'active' ? 'local_fire_department' : (step5State === 'scheduled' ? 'event' : (step5State === 'rejected' ? 'cancel' : 'radio_button_unchecked')))}</span>
          </div>
          <div class="timeline-step-content">
            <div class="timeline-step-header">
              <span class="timeline-step-title">5. Sacred Ceremony &amp; Divine Blessings</span>
              <span class="timeline-step-tag" style="background:${step5State === 'completed' ? '#e8f5e9;color:#2e7d32' : (step5State === 'scheduled' ? '#e3f2fd;color:#1565c0' : (step5State === 'active' ? '#fff3e0;color:#e65100' : '#f5f5f5;color:#777'))}">${esc(step5Tag)}</span>
            </div>
            <p class="timeline-step-desc">${step5Desc}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons Footer inside Modal -->
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:20px;padding-top:14px;border-top:1px solid #ebd9c2;flex-wrap:wrap">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${isSlotRejected ? `
            <button class="btn btn-gold btn-sm" onclick="closeModal();ACTIONS.rebookBooking({id:'${esc(b.bookingId)}'})" style="background:linear-gradient(135deg, #e65100 0%, #b71c1c 100%);color:#fff;font-weight:700">
              <span class="material-icons" style="font-size:15px;vertical-align:middle">event_repeat</span> Rebook This Puja
            </button>
          ` : ''}
          ${b.paymentStatus === 'Paid' || b.paymentStatus === 'Paid & Verified' ? `
            <button class="btn btn-gold btn-sm" onclick="closeModal();ACTIONS.viewBill({id:'${esc(b.bookingId)}'})">
              <span class="material-icons" style="font-size:15px;vertical-align:middle">receipt_long</span> View Bill / Receipt
            </button>
          ` : (!isSlotRejected && (['Confirmed', 'In Progress'].includes(b.status) || b.panditApproval === 'Approved')) ? `
            <button class="btn btn-gold btn-sm" onclick="closeModal();ACTIONS.payBooking({id:'${esc(b.bookingId)}'})">
              <span class="material-icons" style="font-size:15px;vertical-align:middle">payments</span> Pay Dakshina (${inr(fee)})
            </button>
          ` : ''}
          <button class="btn btn-dark btn-sm" onclick="ACTIONS.slip({id:'${esc(b.bookingId)}'})">
            <span class="material-icons" style="font-size:15px;vertical-align:middle">print</span> Print Slip
          </button>
        </div>
        <button class="btn btn-outline btn-sm" onclick="closeModal()">Close</button>
      </div>
    </div>
  `, null, true);
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

  const rejectedBookings = bookings.filter(isBookingRejected);

  return `
    ${rejectedBookings.length ? `
      <div style="background:#fff3e0;border:1.5px solid #ffcc80;border-left:5px solid #e65100;border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="material-icons" style="font-size:32px;color:#e65100">event_busy</span>
          <div>
            <div style="font-weight:700;color:#bf360c;font-size:14.5px">
              ${rejectedBookings.length} Ceremony Request(s) Require Rebooking
            </div>
            <div style="font-size:13px;color:#6d2800;margin-top:2px">
              No verified Vedic Pandit was available for the requested time slot. Click "Rebook This Puja" on your booking card below to choose another convenient date or time slot.
            </div>
          </div>
        </div>
      </div>
    ` : ''}

    <div class="booking-cards-grid">
      ${bookings.map((b) => {
        const isSlotRejected = isBookingRejected(b);
        const fee = b.fee || 1199;

        let badgeHtml = '';
        if (isSlotRejected) {
          badgeHtml = `<span class="badge red" style="background:#ffebee;color:#c62828;border:1px solid #ef9a9a"><span class="material-icons" style="font-size:12px;vertical-align:middle">event_busy</span> Rejected – No Pandit Available</span>`;
        } else if (b.status === 'Pending Assignment') {
          badgeHtml = `<span class="badge amber"><span class="material-icons" style="font-size:12px;vertical-align:middle">hourglass_top</span> Pending Pandit Assignment</span>`;
        } else {
          badgeHtml = statusBadge(b.status);
        }

        return `
        <div class="booking-card" data-action="viewTimeline" data-id="${esc(b.bookingId)}" style="cursor:pointer;${isSlotRejected ? 'border:2px solid #ff9800;background:#fffdf9;box-shadow:0 4px 18px rgba(230,81,0,0.12)' : ''}" title="Click to view live ceremony progress timeline">
          <div>
            <div class="booking-card-top">
              <span class="booking-id-tag">${esc(b.bookingId)}</span>
              ${badgeHtml}
            </div>
            <h4>${esc(b.service)}</h4>
            <div style="display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--ochre);font-weight:600;margin:3px 0 6px">
              <span class="material-icons" style="font-size:14px">timeline</span> Tap to track live ceremony timeline &rarr;
            </div>

            ${isSlotRejected ? `
              <div style="background:#fff3e0;border:1.5px solid #ffb74d;border-left:5px solid #e65100;border-radius:10px;padding:12px 14px;margin:12px 0;font-size:13.5px;color:#bf360c;line-height:1.5">
                <div style="font-weight:700;display:flex;align-items:center;gap:6px;font-size:14px">
                  <span class="material-icons" style="font-size:18px;color:#e65100">event_busy</span> Ceremony Request Rejected (Slot Unavailable)
                </div>
                <div style="margin-top:4px;color:#5c1d00">${esc(b.rejectionReason || 'No verified Pandit is currently available for this date and time slot in your district.')}</div>
                <div style="margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                  <button class="btn btn-gold btn-sm rebook-action-btn" data-action="rebookBooking" data-id="${esc(b.bookingId)}" style="background:linear-gradient(135deg, #e65100 0%, #b71c1c 100%);color:#fff;font-weight:700;padding:8px 16px;border-radius:8px;box-shadow:0 3px 10px rgba(230,81,0,0.3)">
                    <span class="material-icons" style="font-size:16px;vertical-align:middle">event_repeat</span> Rebook This Puja
                  </button>
                  <span style="font-size:12.5px;color:#8d2800;font-weight:500">Pick a new date &amp; time slot to reschedule</span>
                </div>
              </div>
            ` : ''}

            <div class="booking-meta-row" style="margin-top:8px">
              <span class="material-icons">person</span>
              <span>Preferred Pandit: <strong>${esc(b.preferredPanditName || 'Any Available Verified Pandit')}</strong></span>
            </div>
            ${b.panditEmail ? `
              <div class="booking-meta-row">
                <span class="material-icons">badge</span>
                <span>Assigned Pandit: <strong>${esc(b.panditName)}</strong></span>
              </div>
            ` : (!isSlotRejected ? `
              <div class="booking-meta-row">
                <span class="material-icons">badge</span>
                <span class="muted">Assigned Pandit: <em>To Be Assigned by Admin</em></span>
              </div>
            ` : '')}
            <div class="booking-meta-row">
              <span class="material-icons">schedule</span>
              <span>Ceremony Schedule: ${esc(b.date)} at <b>${esc(b.time || '10:00 AM')}</b></span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">place</span>
              <span>District: <b>${esc(b.district || 'N/A')}</b>${b.address ? ` · Venue/City: ${esc(b.address)}` : ''}</span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">payments</span>
              <span>Estimated Dakshina: <b>${inr(fee)}</b> <small class="muted">(${b.paymentStatus === 'Paid' || b.paymentStatus === 'Paid & Verified' ? 'Paid & Verified' : (b.paymentStatus === 'Under Processing' || b.paymentStatus === 'Verification Pending' ? 'Under Processing' : (b.paymentStatus === 'Rejected' || b.paymentStatus === 'Payment Rejected' ? 'Payment Rejected' : (b.paymentStatus || 'Pending')))})</small></span>
            </div>
          </div>
          <div class="booking-card-footer">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <button class="btn btn-gold btn-sm" data-action="viewTimeline" data-id="${esc(b.bookingId)}" title="View live timeline and progress">
                <span class="material-icons" style="font-size:15px;vertical-align:middle">timeline</span> Timeline
              </button>
              ${isSlotRejected ? `
                <button class="btn btn-gold btn-sm" data-action="rebookBooking" data-id="${esc(b.bookingId)}" style="background:linear-gradient(135deg, #e65100 0%, #b71c1c 100%);color:#fff;font-weight:700">
                  <span class="material-icons" style="font-size:15px;vertical-align:middle">event_repeat</span> Rebook This Puja
                </button>
              ` : ''}
              <button class="btn btn-dark btn-sm" data-action="slip" data-id="${esc(b.bookingId)}"><span class="material-icons">print</span> Slip</button>
              ${b.paymentStatus === 'Paid' || b.paymentStatus === 'Paid & Verified' ? `
                <button class="btn btn-gold btn-sm" data-action="viewBill" data-id="${esc(b.bookingId)}">
                  <span class="material-icons">receipt_long</span> Bill
                </button>
              ` : (b.paymentStatus === 'Under Processing' || b.paymentStatus === 'Verification Pending') ? `
                <span class="badge amber" style="font-size:11px"><span class="material-icons" style="font-size:13px">hourglass_top</span> Under Processing</span>
              ` : (b.paymentStatus === 'Rejected' || b.paymentStatus === 'Payment Rejected') ? `
                <button class="btn btn-gold btn-sm" data-action="payBooking" data-id="${esc(b.bookingId)}">
                  <span class="material-icons">refresh</span> Repay (${inr(fee)})
                </button>
              ` : (!isSlotRejected && (['Confirmed', 'In Progress'].includes(b.status) || b.panditApproval === 'Approved')) ? `
                <button class="btn btn-gold btn-sm" data-action="payBooking" data-id="${esc(b.bookingId)}">
                  <span class="material-icons">payments</span> Pay (${inr(fee)})
                </button>
              ` : ''}
            </div>
            <div style="display:flex;gap:6px">
              ${['Confirmed', 'In Progress'].includes(b.status) ? `
                <button class="btn btn-outline dark btn-sm" data-action="reschedule" data-id="${esc(b.bookingId)}">Reschedule</button>
                <button class="btn btn-red btn-sm" data-action="cancelBooking" data-id="${esc(b.bookingId)}">Cancel</button>
              ` : ''}
            </div>
          </div>
        </div>
        `;
      }).join('')}
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
            <div class="row" style="margin-top:14px;gap:6px;flex-wrap:wrap">
              <span class="price">${inr(p.baseFee)}</span>
              <div style="display:flex;gap:6px">
                <button class="btn btn-gold btn-sm" data-action="bookDirectPuja" data-name="${esc(p.name)}">Book Puja</button>
                <button class="btn btn-outline dark btn-sm" data-action="findFor" data-name="${esc(p.name)}">Pandits</button>
              </div>
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
          <div class="profile-field-label"><span class="material-icons" style="font-size:14px">map</span> State &amp; District (Locked)</div>
          <div class="profile-field-value">${esc(u.district || '')}${u.state ? ', ' + esc(u.state) : (u.district ? '' : 'Not set')} <span class="badge" style="background:#fff3e0;border:1px solid #ffcc80;color:#bf360c;font-size:10.5px;padding:2px 6px;margin-left:6px"><span class="material-icons" style="font-size:11px;vertical-align:middle">lock</span> Locked</span></div>
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
  let me = plist[0];
  if (!me && S.me && S.me.email && S.me.email.toLowerCase() === email.toLowerCase()) {
    me = S.me;
  }
  if (!me) {
    me = {
      name: S.user.name,
      email: S.user.email,
      phone: S.user.phone || '',
      district: S.user.district || 'Khordha',
      city: S.user.city || 'Bhubaneswar',
      fee: 1500,
      bankAccount: S.user.bankAccount || '',
      ifscCode: S.user.ifscCode || '',
      bankName: S.user.bankName || '',
      accountHolder: S.user.accountHolder || S.user.name,
      upiId: S.user.upiId || '',
      status: S.user.status || 'Pending Review',
      verified: S.user.status === 'Verified'
    };
  }
  if (S.me && S.me.bankAccount && !me.bankAccount) {
    me.bankAccount = S.me.bankAccount;
    me.ifscCode = S.me.ifscCode;
    me.bankName = S.me.bankName;
    me.accountHolder = S.me.accountHolder;
    me.upiId = S.me.upiId;
  }
  S.me = me;
  S._panditBookings = bookings;
  S._panditLongs = longs;
  const tab = S.dashTab || 'ceremonies';
  const paidOut = bookings.filter((b) => b.panditPayoutStatus === 'Paid').reduce((s, b) => s + (b.panditPayoutAmount || b.fee || 0), 0);
  const pendingPayout = bookings.filter((b) => (b.paymentStatus === 'Paid' || b.status === 'Completed') && b.panditPayoutStatus !== 'Paid').reduce((s, b) => s + (b.fee || 0), 0);
  const completedCount = bookings.filter((b) => b.status === 'Completed' || b.paymentStatus === 'Paid').length;

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
      <div class="stat"><b>${inr(paidOut)}</b><span>Dakshina Paid by Admin</span></div>
      <div class="stat"><b>${inr(pendingPayout)}</b><span>Payout Due from Admin</span></div>
      <div class="stat"><b>${completedCount} / ${bookings.length}</b><span>Completed / Total Pujas</span></div>
    </div>

    <!-- Pandit Subtabs -->
    <div class="dash-subtabs">
      <button class="subtab ${tab === 'ceremonies' ? 'active' : ''}" data-action="dashTab" data-tab="ceremonies">
        <span class="material-icons">notifications</span> Ceremony Requests <span class="subtab-badge">${bookings.length}</span>
      </button>
      <button class="subtab ${tab === 'havan' ? 'active' : ''}" data-action="dashTab" data-tab="havan">
        <span class="material-icons" style="color:#e65100">local_fire_department</span> Conduct Havan
      </button>
      <button class="subtab ${tab === 'long' ? 'active' : ''}" data-action="dashTab" data-tab="long">
        <span class="material-icons">event_note</span> Multi-Day Assignments <span class="subtab-badge">${longs.length}</span>
      </button>
      <button class="subtab ${tab === 'avail' ? 'active' : ''}" data-action="dashTab" data-tab="avail">
        <span class="material-icons">schedule</span> Availability &amp; Dakshina
      </button>
      <button class="subtab ${tab === 'bank' ? 'active' : ''}" data-action="dashTab" data-tab="bank">
        <span class="material-icons">account_balance</span> Bank &amp; Payout Account ${me.bankAccount ? '<span class="subtab-badge green">✓ Linked</span>' : (me.verified ? '<span class="subtab-badge alert">Setup</span>' : '')}
      </button>
      <button class="subtab ${tab === 'profile' ? 'active' : ''}" data-action="dashTab" data-tab="profile">
        <span class="material-icons">account_circle</span> My Profile
      </button>
    </div>

    <div id="dash-tab-content">
      ${tab === 'ceremonies' ? renderPanditCeremoniesTab(bookings) : ''}
      ${tab === 'havan' ? renderPanditHavanTab(bookings, me) : ''}
      ${tab === 'long' ? renderPanditLongTab(longs, email) : ''}
      ${tab === 'avail' ? renderPanditAvailTab(me) : ''}
      ${tab === 'bank' ? renderPanditBankTab(me) : ''}
      ${tab === 'profile' ? renderPanditProfileTab(me) : ''}
    </div>
  `;
  if (tab === 'avail') {
    setupAvailTabListeners(me);
  } else if (tab === 'havan') {
    setupPanditHavanListeners();
  }
}

function switchPanditSubtab(tab, bookingId) {
  S.dashTab = tab;
  const subtabs = document.querySelectorAll('.dash-subtabs .subtab');
  subtabs.forEach((st) => {
    st.classList.toggle('active', st.dataset.tab === tab);
  });
  const container = document.getElementById('dash-tab-content');
  if (container) {
    const bookings = S._panditBookings || [];
    const longs = S._panditLongs || [];
    const me = S.me || {};
    const email = (S.user && S.user.email) || '';
    if (tab === 'ceremonies') container.innerHTML = renderPanditCeremoniesTab(bookings);
    else if (tab === 'havan') {
      container.innerHTML = renderPanditHavanTab(bookings, me, bookingId);
      setupPanditHavanListeners();
    }
    else if (tab === 'long') container.innerHTML = renderPanditLongTab(longs, email);
    else if (tab === 'avail') {
      container.innerHTML = renderPanditAvailTab(me);
      setupAvailTabListeners(me);
    } else if (tab === 'bank') {
      container.innerHTML = renderPanditBankTab(me);
    } else if (tab === 'profile') {
      container.innerHTML = renderPanditProfileTab(me);
    }
  }
}

function renderPanditCeremoniesTab(bookings) {
  if (!bookings.length) {
    return `<div class="panel empty" style="padding:48px 20px"><span class="material-icons" style="font-size:48px;color:var(--ochre)">event</span><p>No ceremony bookings assigned yet.</p></div>`;
  }
  return `
    <div class="booking-cards-grid">
      ${bookings.map((b) => {
        const isUserPaid = b.paymentStatus === 'Paid' || b.paymentStatus === 'Paid & Verified';
        const isUnderProcessing = b.paymentStatus === 'Under Processing' || b.paymentStatus === 'Verification Pending';
        const isAdminPaid = b.panditPayoutStatus === 'Paid';
        const isCeremonyEnded = b.status === 'Completed';

        const mainFee = Number(b.fee) || 1500;
        const feePercent = Number(b.adminFeePercent !== undefined ? b.adminFeePercent : 10);
        const adminFee = Number(b.adminFeeAmount !== undefined ? b.adminFeeAmount : Math.round((mainFee * feePercent) / 100));
        const netFee = b.panditPayoutAmount || b.panditNetPayout || Math.max(0, mainFee - adminFee);

        return `
        <div class="booking-card">
          <div>
            <div class="booking-card-top">
              <span class="booking-id-tag">${esc(b.bookingId)}</span>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                ${isCeremonyEnded ? `<span class="badge green"><span class="material-icons" style="font-size:13px;vertical-align:middle">task_alt</span> Ceremony Completed</span>` : statusBadge(b.status)}
                ${isAdminPaid ? `<span class="badge green" style="background:#e8f5e9;color:#1b5e20;border:1px solid #a5d6a7;font-weight:700"><span class="material-icons" style="font-size:13px;vertical-align:middle">payments</span> Paid (${inr(netFee)})</span>` : (isUserPaid ? `<span class="badge amber" style="background:#fff8ed;color:#8a5d3b;border:1px solid #ebd9c2"><span class="material-icons" style="font-size:13px;vertical-align:middle">hourglass_top</span> Payout Pending</span>` : (isUnderProcessing ? `<span class="badge amber" style="font-size:11px"><span class="material-icons" style="font-size:13px;vertical-align:middle">hourglass_top</span> Payment Under Processing</span>` : ''))}
              </div>
            </div>
            <h4>${esc(b.service)}</h4>
            <div class="booking-meta-row" style="margin-top:8px">
              <span class="material-icons">person</span>
              <span>Devotee: <b>${esc(b.userName)}</b> · 📞 ${esc(b.phone || 'N/A')}</span>
            </div>
            ${b.userEmail ? `
              <div class="booking-meta-row">
                <span class="material-icons">email</span>
                <span>Devotee Email: <b>${esc(b.userEmail)}</b></span>
              </div>
            ` : ''}
            <div class="booking-meta-row">
              <span class="material-icons">schedule</span>
              <span>${esc(b.date)} at <b>${esc(b.time || '10:00 AM')}</b></span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">place</span>
              <span>District: <b>${esc(b.district || 'N/A')}</b>${b.address ? ` · Venue/City: ${esc(b.address)}` : ''}</span>
            </div>
            <div class="booking-meta-row">
              <span class="material-icons">payments</span>
              <span>Total Devotee Dakshina: <b>${inr(mainFee)}</b></span>
            </div>
            <div class="booking-meta-row" style="color:var(--muted);font-size:12.5px">
              <span class="material-icons" style="font-size:15px;color:var(--ochre)">percent</span>
              <span>Admin Coordination Fee (${feePercent}%): <b style="color:#c62828">-${inr(adminFee)} (${feePercent}%)</b></span>
            </div>
            <div class="booking-meta-row" style="font-size:13.5px">
              <span class="material-icons" style="font-size:16px;color:#2e7d32">account_balance_wallet</span>
              <span>Remaining Net Pandit Dakshina: <b style="color:#1b5e20">${inr(netFee)}</b></span>
            </div>

            <!-- Devotee Payment & Admin Payout (Uncompacted Details) -->
            ${isUserPaid ? `
              <div style="background:#f0fff4;border:1px solid #c8e6c9;border-radius:8px;padding:9px 12px;margin-top:10px;font-size:12.5px;color:#1b5e20">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="font-weight:700;display:flex;align-items:center;gap:4px">
                    <span class="material-icons" style="font-size:16px;color:#2e7d32">verified</span>
                    Devotee Payment: Received (${inr(mainFee)})
                  </span>
                  <b>Net Payout: ${inr(netFee)}</b>
                </div>
                <div style="font-size:11.5px;margin-top:3px;color:#2e7d32">
                  Ceremony ended · Devotee Mode: ${esc(b.paymentMethod || 'UPI/Transfer')} ${b.paymentProof ? `· Ref: <code>${esc(b.paymentProof)}</code>` : ''}
                </div>
              </div>
            ` : `
              <div style="background:#fafafa;border:1px solid #eee;border-radius:8px;padding:9px 12px;margin-top:10px;font-size:12px;color:var(--muted)">
                <span class="material-icons" style="font-size:14px;vertical-align:middle">schedule</span>
                Devotee Payment: <b>${esc(b.paymentStatus || 'Pending')}</b> (Awaiting payment from devotee to conclude ritual)
              </div>
            `}

            ${isAdminPaid ? `
              <div style="background:#e8f5e9;border:1.5px solid #2e7d32;border-radius:8px;padding:10px 12px;margin-top:8px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#1b5e20;font-weight:800;font-size:13.5px;display:flex;align-items:center;gap:5px">
                    <span class="material-icons" style="font-size:18px;color:#2e7d32">check_circle</span>
                    Dakshina Payout: Paid
                  </span>
                  <b style="color:#1b5e20;font-size:15px">${inr(netFee)}</b>
                </div>
                <div style="font-size:12px;color:#1b5e20;margin-top:4px;line-height:1.4">
                  ✓ Admin has transferred your Net Dakshina of <b>${inr(netFee)}</b> (${inr(mainFee)} - ${feePercent}% Admin Fee) via ${esc(b.panditPayoutMethod || 'Direct Bank Transfer')}.<br>
                  Transaction Ref: <code style="background:#fff;padding:1px 5px;border-radius:4px;border:1px solid #c8e6c9">${esc(b.panditPayoutTxnId || 'SETTLED')}</code>
                  ${b.panditPayoutDate ? ` · Date: <b>${new Date(b.panditPayoutDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</b>` : ''}
                </div>
              </div>
            ` : (isUserPaid ? `
              <div style="background:#fff8ed;border:1.5px solid #d99a19;border-radius:8px;padding:10px 12px;margin-top:8px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:var(--ochre);font-weight:700;font-size:13px;display:flex;align-items:center;gap:5px">
                    <span class="material-icons" style="font-size:16px">hourglass_top</span>
                    Dakshina Payout: Awaiting Admin Transfer
                  </span>
                  <b style="color:var(--mahogany);font-size:14.5px">${inr(netFee)}</b>
                </div>
                <div class="muted" style="font-size:11.5px;margin-top:3px">
                  Devotee payment verified. PujaConnect Admin dispatches Net Dakshina of <b>${inr(netFee)}</b> (after ${feePercent}% Admin platform fee of ${inr(adminFee)}) to your registered bank/UPI account within 24 hours. Once transferred, status updates to <b>Paid</b>.
                </div>
              </div>
            ` : '')}
          </div>
          <div class="booking-card-footer">
            ${(b.status === 'Pending Pandit Confirmation' || b.panditApproval === 'Pending') ? `
              <div style="background:#fff8ed;border:1.5px solid #d99a19;border-radius:8px;padding:12px;margin-bottom:10px;width:100%">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <b style="color:var(--mahogany);font-size:13px">⭐ Ceremony Assignment Offer from Admin</b>
                  <span class="badge amber" style="font-size:11px">Awaiting Your Acceptance</span>
                </div>
                <div style="background:#fff;border:1px solid #ebd9c2;border-radius:6px;padding:8px 10px;font-size:12px;line-height:1.5;margin-bottom:8px">
                  <div><span class="muted">Total Devotee Dakshina:</span> <b>${inr(mainFee)}</b></div>
                  <div style="color:#c62828"><span class="muted">Admin Platform Charge (${feePercent}%):</span> <b>-${inr(adminFee)} (${feePercent}%)</b></div>
                  <div style="color:#1b5e20;font-weight:700;border-top:1px dashed #ebd9c2;margin-top:3px;padding-top:3px">
                    <span>Remaining Dakshina to be Paid to You:</span> <b>${inr(netFee)}</b>
                  </div>
                </div>
                <div class="muted" style="font-size:11.5px;margin-bottom:10px">Please review terms and accept this assignment to confirm the ritual or decline for admin reassignment.</div>
                <div style="display:flex;gap:8px;width:100%">
                  <button class="btn btn-green btn-sm" style="flex:1" data-action="panditAcceptBooking" data-id="${esc(b.bookingId)}">✓ Accept Ceremony (${inr(netFee)})</button>
                  <button class="btn btn-red btn-sm" style="flex:1" data-action="panditRejectBooking" data-id="${esc(b.bookingId)}">✕ Reject Offer</button>
                </div>
              </div>
            ` : ''}
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;width:100%">
              ${isUserPaid ? `
                <button class="btn btn-gold btn-sm" data-action="viewBill" data-id="${esc(b.bookingId)}">
                  <span class="material-icons">receipt_long</span> View Ritual Bill
                </button>
              ` : ''}
              <button class="btn btn-gold btn-sm" data-action="openPanditHavan" data-id="${esc(b.bookingId)}">
                <span class="material-icons" style="font-size:15px;vertical-align:middle">local_fire_department</span> Conduct Havan
              </button>
              <button class="btn btn-outline dark btn-sm" data-action="slip" data-id="${esc(b.bookingId)}">
                <span class="material-icons">print</span> Ritual Slip
              </button>
              ${isCeremonyEnded ? `
                <span class="badge green" style="margin-left:auto;font-size:11.5px"><span class="material-icons" style="font-size:13px;vertical-align:middle">done_all</span> Ceremony Ended</span>
              ` : (b.status === 'Confirmed' ? `
                <small class="muted" style="margin-left:auto">Awaiting Devotee Payment</small>
              ` : ['Cancelled'].includes(b.status) ? `
                <small class="muted" style="margin-left:auto">Ceremony Cancelled</small>
              ` : '')}
            </div>
          </div>
        </div>
      `;}).join('')}
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

    <!-- Working Districts Section -->
    <div class="panel-section-box">
      <div class="section-box-header">
        <div class="box-icon"><span class="material-icons">place</span></div>
        <div style="flex:1">
          <h4>Working Districts</h4>
          <p class="muted">Select your state and choose the districts you are available to serve for ceremonies.</p>
        </div>
        ${isApproved ? '<span class="badge green"><span class="material-icons">check_circle</span> Approved for Service</span>' : '<span class="badge amber">Pending Admin Approval</span>'}
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

      <div style="background:#fff8ed;border:1px solid #ebd9c2;border-radius:10px;padding:12px 14px;margin-top:18px;display:flex;align-items:center;gap:12px">
        <span class="material-icons" style="color:var(--ochre);font-size:24px">gavel</span>
        <div style="font-size:13px;color:#3b2115;line-height:1.5">
          <b>Admin Fixed Dakshina:</b> Official ceremony Dakshina amounts are set and managed exclusively by the PujaConnect Administration for each district you select.
        </div>
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
            <input type="checkbox" value="${d}" ${(me.availableDays && me.availableDays.length ? me.availableDays : DAYS).includes(d) ? 'checked' : ''}>
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
    </div>

    <!-- Prominent Save Action -->
    <div style="margin:20px 0 36px;display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <button class="btn btn-gold btn-lg" id="btn-save-all-avail" data-action="saveAvail">
        <span class="material-icons">save</span> Save Working Districts &amp; Availability
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
  let slots = [...(me.timeSlots && me.timeSlots.length ? me.timeSlots : DEFAULT_SLOTS)];

  const stateSelect = $('#av-state', container);
  const stateLabel = $('#cur-state-name', container);
  const checkboxesWrap = $('#district-checkboxes', container);
  const slotsWrap = $('#slots-container', container);

  if (!stateSelect || !checkboxesWrap || !slotsWrap) return;

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
    const curPrices = me.districtPrices || {};
    checkboxesWrap.innerHTML = list.map((d) => {
      const isChecked = curDistricts.has(d);
      const price = curPrices[d];
      const hasPrice = price !== undefined && price !== null && Number(price) > 0;
      let badgeHtml = '';
      if (isChecked) {
        if (hasPrice) {
          badgeHtml = `<span class="badge green" style="font-size:11px;margin-left:6px;padding:2px 6px">Rate: ${inr(price)}</span>`;
        } else {
          badgeHtml = `<span class="badge" style="background:#d32f2f;color:#fff;font-weight:800;font-size:9.5px;padding:2px 6px;margin-left:6px;border-radius:4px;letter-spacing:0.5px">NEW (Rate: ₹0 · Pending Admin)</span>`;
        }
      }
      return `
        <label class="district-check" style="display:flex;align-items:center;flex-wrap:wrap">
          <input type="checkbox" value="${esc(d)}" ${isChecked ? 'checked' : ''}>
          <span>${esc(d)}</span>
          ${badgeHtml}
        </label>
      `;
    }).join('') || '<span class="muted">No districts available for this state.</span>';

    checkboxesWrap.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
      chk.onchange = () => {
        const d = chk.value;
        if (chk.checked) curDistricts.add(d);
        else curDistricts.delete(d);
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
  };

  // Select All & Clear
  const btnSelectAll = $('#btn-select-all-dist', container);
  if (btnSelectAll) {
    btnSelectAll.onclick = () => {
      const allD = LOCATIONS[curState] || [];
      allD.forEach((d) => curDistricts.add(d));
      renderDistrictCheckboxes();
    };
  }

  const btnClear = $('#btn-clear-dist', container);
  if (btnClear) {
    btnClear.onclick = () => {
      curDistricts.clear();
      renderDistrictCheckboxes();
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

  // Expose current state for saveAvail
  S._availFormState = () => ({
    curState,
    workingDistricts: Array.from(curDistricts),
    slots
  });
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

        <!-- Dedicated Pandit Bank Details Section -->
        <div class="profile-field" style="grid-column:1 / -1;background:#fffcf5;border:1.5px solid #ebd9c2;border-radius:10px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
            <div class="profile-field-label" style="font-size:14px;font-weight:700;color:var(--dark);display:flex;align-items:center;gap:6px">
              <span class="material-icons" style="font-size:18px;color:var(--ochre)">account_balance</span>
              Bank Details for Dakshina Payouts
            </div>
            <button class="btn btn-gold btn-sm" data-action="dashTab" data-tab="bank">
              <span class="material-icons">edit</span> ${me.bankAccount ? 'Update Bank Details' : 'Add Bank Details'}
            </button>
          </div>
          ${me.bankAccount ? `
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;font-size:13px">
              <div><span class="muted" style="display:block;font-size:11.5px">Account Holder</span> <b>${esc(me.accountHolder || me.name)}</b></div>
              <div><span class="muted" style="display:block;font-size:11.5px">Bank Name</span> <b>${esc(me.bankName || 'Registered Bank')}</b></div>
              <div><span class="muted" style="display:block;font-size:11.5px">Account Number</span> <b style="font-family:monospace;letter-spacing:1px;color:#1b5e20">${esc(me.bankAccount)}</b></div>
              <div><span class="muted" style="display:block;font-size:11.5px">IFSC Code</span> <b style="font-family:monospace">${esc(me.ifscCode || 'N/A')}</b></div>
              ${me.upiId ? `<div><span class="muted" style="display:block;font-size:11.5px">UPI ID</span> <b>${esc(me.upiId)}</b></div>` : ''}
            </div>
          ` : `
            <p class="muted" style="margin:0;font-size:13px">
              No bank account added yet. Click above to provide your bank account details for direct Dakshina payouts.
            </p>
          `}
        </div>
      </div>
    </div>
  `;
}

function renderPanditBankTab(me) {
  const isVerified = Boolean(me.verified || me.status === 'Verified');

  return `
    <div class="panel-section-box">
      <div class="section-box-header">
        <div class="box-icon"><span class="material-icons">account_balance</span></div>
        <div style="flex:1">
          <h4>Pandit Bank &amp; Dakshina Payout Account</h4>
          <p class="muted">Provide your verified bank details to receive ceremony Dakshina payments directly into your account.</p>
        </div>
        ${isVerified
          ? '<span class="badge green"><span class="material-icons" style="font-size:13px">verified</span> Verified Pandit</span>'
          : `<span class="badge amber">KYC Status: ${esc(me.status || 'Pending Review')}</span>`
        }
      </div>

      <div style="background:#f0fff4;border:1px solid #c8e6c9;border-left:4px solid #2e7d32;padding:14px 16px;border-radius:8px;margin-top:16px;font-size:13.5px;color:#1b5e20;line-height:1.6">
        <b>💡 Direct Payout Policy:</b> When an Admin verifies a customer's payment, you receive an automated email that your money will be credited to your account within 24 hours. When the Admin processes the payout, it will be transferred directly to this account number and an email confirmation will be sent to you.
      </div>

      ${!isVerified ? `
        <div style="background:#fff8ed;border:1px dashed #d99a19;border-radius:10px;padding:14px 16px;margin-top:14px;line-height:1.5;font-size:13px;color:#3b2115">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span class="material-icons" style="color:var(--ochre);font-size:18px">info</span>
            <b>KYC Verification Note</b>
          </div>
          You can save and update your payout account details now. Once your Vedic credentials are verified by the Super Admin, direct ceremony Dakshina payouts will automatically transfer to this bank account.
        </div>
      ` : ''}

      ${me.bankAccount ? `
        <div style="margin-top:20px;background:#ffffff;border:1.5px solid #ebd9c2;border-radius:12px;padding:20px;box-shadow:0 4px 14px rgba(53,22,5,0.04)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #f2e4d4;padding-bottom:10px">
            <div style="display:flex;align-items:center;gap:8px">
              <span class="material-icons" style="color:#2e7d32">check_circle</span>
              <strong style="color:var(--mahogany);font-size:15px">Currently Linked Bank Account</strong>
            </div>
            <span class="badge green">Active Payout Account</span>
          </div>
          <div class="bank-info-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px">
            <div><label class="muted" style="font-size:12px;display:block">Account Holder</label><b style="font-size:14px">${esc(me.accountHolder || me.name)}</b></div>
            <div><label class="muted" style="font-size:12px;display:block">Bank Name</label><b style="font-size:14px">${esc(me.bankName || 'Registered Bank')}</b></div>
            <div><label class="muted" style="font-size:12px;display:block">Account Number</label><b style="font-size:15px;font-family:monospace;letter-spacing:1px;color:#1b5e20">${esc(me.bankAccount)}</b></div>
            <div><label class="muted" style="font-size:12px;display:block">IFSC Code</label><b style="font-size:14px;font-family:monospace">${esc(me.ifscCode || 'N/A')}</b></div>
            ${me.upiId ? `<div><label class="muted" style="font-size:12px;display:block">UPI ID</label><b style="font-size:14px">${esc(me.upiId)}</b></div>` : ''}
          </div>
          ${me.qrCode ? `
            <div style="margin-top:14px;padding-top:12px;border-top:1px dashed #ebd9c2;display:flex;align-items:center;gap:14px">
              <img src="${esc(me.qrCode)}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1.5px solid #d99a19;padding:2px;background:#fff;cursor:pointer" onclick="openQrViewModal('${esc(me.qrCode)}', 'Your Linked UPI QR Code')" alt="Linked UPI QR" title="Click to view full screen">
              <div>
                <span class="badge green" style="display:inline-flex;align-items:center;gap:4px;cursor:pointer" onclick="openQrViewModal('${esc(me.qrCode)}', 'Your Linked UPI QR Code')"><span class="material-icons" style="font-size:13px">qr_code</span> Uploaded UPI QR Code</span>
                <div class="muted" style="font-size:12px;margin-top:3px">Linked to your payout profile for Admin instant UPI scan &amp; settlement. Click image to enlarge.</div>
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div style="margin-top:24px">
        <h4 style="margin:0 0 14px;font-size:16px;color:var(--mahogany)">${me.bankAccount ? 'Update Bank Account Details' : 'Enter Bank Account Details'}</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:16px">
          <div>
            <label for="pandit-bank-holder" style="font-weight:600;font-size:13px">Account Holder Name *</label>
            <input id="pandit-bank-holder" type="text" value="${esc(me.accountHolder || me.name)}" placeholder="Full name as printed in passbook" style="margin-top:4px">
          </div>
          <div>
            <label for="pandit-bank-name" style="font-weight:600;font-size:13px">Bank Name *</label>
            <input id="pandit-bank-name" type="text" value="${esc(me.bankName || '')}" placeholder="e.g. State Bank of India, HDFC Bank, ICICI" style="margin-top:4px">
          </div>
          <div>
            <label for="pandit-bank-acc" style="font-weight:600;font-size:13px">Bank Account Number *</label>
            <input id="pandit-bank-acc" type="text" value="${esc(me.bankAccount || '')}" placeholder="Enter full account number" style="margin-top:4px;font-family:monospace">
          </div>
          <div>
            <label for="pandit-bank-acc-confirm" style="font-weight:600;font-size:13px">Confirm Bank Account Number *</label>
            <input id="pandit-bank-acc-confirm" type="text" value="${esc(me.bankAccount || '')}" placeholder="Re-enter bank account number" style="margin-top:4px;font-family:monospace">
          </div>
          <div>
            <label for="pandit-bank-ifsc" style="font-weight:600;font-size:13px">Bank IFSC Code *</label>
            <input id="pandit-bank-ifsc" type="text" value="${esc(me.ifscCode || '')}" placeholder="e.g. SBIN0001234" style="margin-top:4px;font-family:monospace;text-transform:uppercase">
          </div>
          <div>
            <label for="pandit-bank-upi" style="font-weight:600;font-size:13px">UPI ID (Optional)</label>
            <input id="pandit-bank-upi" type="text" value="${esc(me.upiId || '')}" placeholder="e.g. yourname@okhdfcbank" style="margin-top:4px">
          </div>
          <div style="grid-column: 1 / -1">
            <label style="font-weight:600;font-size:13px;display:flex;align-items:center;gap:6px">
              <span class="material-icons" style="font-size:16px;color:var(--ochre)">qr_code_scanner</span>
              Upload Personal UPI QR Code (Optional – PhonePe / GPay / Paytm / BHIM)
            </label>
            <p class="muted" style="font-size:12px;margin:2px 0 8px">
              Upload your UPI QR code image so Admin can scan and pay your Dakshina directly via UPI in the Admin Panel.
            </p>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
              <input id="pandit-bank-qr-file" type="file" accept="image/*" style="font-size:12.5px" onchange="handlePanditQrUpload(this)">
              <span class="muted" style="font-size:12px">OR Paste Image URL:</span>
              <input id="pandit-bank-qr-url" type="text" value="${esc(me.qrCode || '')}" placeholder="https://... or uploaded image data" style="flex:1;min-width:200px" oninput="updatePanditQrPreview(this.value)">
            </div>
            <div id="pandit-qr-preview-box" style="margin-top:12px;${me.qrCode ? '' : 'display:none;'}">
              <div style="font-size:12px;font-weight:600;color:var(--mahogany);margin-bottom:6px">QR Code Preview:</div>
              <div style="display:inline-flex;flex-direction:column;align-items:center;background:#fff;border:1.5px solid #ebd9c2;border-radius:10px;padding:10px">
                <img id="pandit-qr-preview-img" src="${esc(me.qrCode || '')}" style="max-width:160px;height:auto;border-radius:6px;border:1px solid #ddd" alt="UPI QR Code Preview">
                <button type="button" class="btn btn-outline red btn-sm" style="margin-top:6px;padding:2px 8px;font-size:11px" onclick="clearPanditQr()">Remove QR</button>
              </div>
            </div>
          </div>
        </div>

        <div style="margin-top:20px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <button type="button" class="btn btn-gold btn-lg" data-action="savePanditBank">
            <span class="material-icons">save</span> Save Bank &amp; Payout Details
          </button>
        </div>
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
  const mainFee = Number(b.fee) || 1500;
  const payStatusDisplay = (b.paymentStatus === 'Paid' || b.paymentStatus === 'Paid & Verified') 
    ? 'Paid & Verified ✅' 
    : ((b.paymentStatus === 'Under Processing' || b.paymentStatus === 'Verification Pending') 
      ? 'Under Processing' 
      : ((b.paymentStatus === 'Rejected' || b.paymentStatus === 'Payment Rejected') ? 'Payment Rejected' : (b.paymentStatus || 'Pending')));

  w.document.write(`<html><head><title>${esc(b.bookingId)}</title><style>body{font-family:Georgia,serif;padding:40px;color:#3b2115}h1{color:#351605;border-bottom:3px solid #d99a19;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:10px 16px 10px 0;font-family:Arial;border-bottom:1px solid #f0e0cc}td:first-child{width:38%;color:#6b4d3a}</style></head><body><h1>ॐ PujaConnect – Ceremony Slip</h1><table>
    ${[
      ['Booking ID', b.bookingId],
      ['Devotee Name', b.userName],
      ['Sacred Ritual', b.service],
      ['Assigned Pandit', b.panditName],
      ['Ceremony Date', b.date],
      ['Ceremony Time', b.time],
      ['Ceremony Venue', b.address || b.district],
      ['Dakshina Amount (Devotee Pay Amount)', inr(mainFee)],
      ['Payment Status', payStatusDisplay],
      ['Ceremony Status', b.status]
    ].map(([k, v]) => `<tr><td><b>${k}</b></td><td>${esc(v)}</td></tr>`).join('')}</table><p style="margin-top:30px">Please keep this official ceremony slip for your records. 🙏</p><script>window.print()<\/script></body></html>`);
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
  const p = id ? S.pujas.find((x) => x._id === id) : null;
  const initialType = p ? p.type : 'Short';
  openModal(id ? 'Edit Puja Service' : 'Add New Puja Service', `
    <div><label style="font-weight:600">Puja Name *</label><input id="e-name" value="${esc(p ? p.name : '')}" ${id ? 'readonly' : ''} placeholder="e.g. Satyanarayan Puja"></div>
    <div>
      <label style="font-weight:600">Type</label>
      <select id="e-type">
        <option value="Short" ${initialType === 'Short' ? 'selected' : ''}>Short (Single-session home puja)</option>
        <option value="Long" ${initialType === 'Long' ? 'selected' : ''}>Long (Multi-day Mahayajna)</option>
      </select>
    </div>
    <div id="e-base-wrap" style="${initialType === 'Long' ? 'display:none' : 'display:block'}">
      <label style="font-weight:600">Base Fee (₹) *</label>
      <input id="e-base" type="number" min="0" value="${p ? p.baseFee || 0 : 1199}">
      <small class="muted" style="font-size:11px;display:block;margin-top:2px">Fixed starting dakshina for single-session short puja.</small>
    </div>
    <div id="e-hr-wrap" style="${initialType === 'Long' ? 'display:block' : 'display:none'}">
      <label style="font-weight:600">Per Hour Fee for Multi-Day (₹) *</label>
      <input id="e-hr" type="number" min="0" value="${p ? p.perHourFee || 0 : 500}">
      <small class="muted" style="font-size:11px;display:block;margin-top:2px">Hourly rate per pandit for multi-day custom rituals.</small>
    </div>
    <div><label style="font-weight:600">Short description *</label><input id="e-desc" value="${esc(p ? p.desc : '')}" placeholder="Brief overview of ritual"></div>
    <div><label style="font-weight:600">Detailed description</label><textarea id="e-long" rows="2" placeholder="Significance, vidhi details...">${esc(p ? p.longDesc : '')}</textarea></div>
    <div><label style="font-weight:600">Benefits (comma separated)</label><input id="e-ben" value="${esc((p && p.benefits || []).join(', '))}" placeholder="Peace, Prosperity, Health"></div>
    <div>
      <label style="font-weight:600">Upload Puja Image</label>
      <input type="file" id="e-file" accept="image/*" style="margin-top:4px;padding:6px;background:#fcf8f0;border:1px dashed #ebd9be;width:100%">
      <div id="e-img-preview" style="margin-top:8px;display:${p && p.image ? 'block' : 'none'}">
        <img id="e-preview-tag" src="${esc(p ? p.image : '')}" alt="Puja Preview" style="max-height:140px;max-width:100%;border-radius:8px;border:1px solid #ebd9be;object-fit:cover;display:block">
        <button type="button" class="btn btn-outline red btn-sm" id="e-remove-img" style="margin-top:6px;padding:2px 8px;font-size:11px">Remove Image</button>
      </div>
      <small class="muted" style="font-size:12px;margin-top:4px;display:block">Upload an image file (PNG, JPG, WEBP). Image will be saved directly in the database.</small>
    </div>
    <button class="btn btn-gold" id="e-save" style="margin-top:14px;width:100%"><span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:4px">save</span> Save Puja Service</button>`, (m) => {
    const typeSel = $('#e-type', m);
    const baseWrap = $('#e-base-wrap', m);
    const hrWrap = $('#e-hr-wrap', m);
    const updateTypeFields = () => {
      const isLong = typeSel.value === 'Long';
      baseWrap.style.display = isLong ? 'none' : 'block';
      hrWrap.style.display = isLong ? 'block' : 'none';
    };
    typeSel.onchange = updateTypeFields;

    let uploadedImageData = p ? p.image : '';
    const fileInp = $('#e-file', m);
    const removeBtn = $('#e-remove-img', m);
    if (removeBtn) {
      removeBtn.onclick = () => {
        uploadedImageData = '';
        fileInp.value = '';
        const preview = $('#e-img-preview', m);
        if (preview) preview.style.display = 'none';
        const previewTag = $('#e-preview-tag', m);
        if (previewTag) previewTag.src = '';
      };
    }

    fileInp.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) return toast('Image size exceeds 8MB. Please choose a smaller image.', true);
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadedImageData = evt.target.result;
        const preview = $('#e-img-preview', m);
        const previewTag = $('#e-preview-tag', m);
        if (previewTag && preview) {
          previewTag.src = uploadedImageData;
          preview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    };

    $('#e-save', m).onclick = async () => {
      const type = typeSel.value;
      const base = type === 'Short' ? +$('#e-base', m).value || 1199 : 0;
      const hr = type === 'Long' ? +$('#e-hr', m).value || 500 : 0;
      const name = $('#e-name', m).value.trim();
      const desc = $('#e-desc', m).value.trim();
      if (!name || !desc) return toast('Name and description are required', true);

      const body = {
        name,
        type,
        desc,
        longDesc: $('#e-long', m).value.trim(),
        benefits: $('#e-ben', m).value.split(',').map((s) => s.trim()).filter(Boolean),
        baseFee: base,
        perHourFee: hr,
        price: type === 'Long' ? `From ${inr(hr)}/hr` : inr(base)
      };
      if (uploadedImageData) body.image = uploadedImageData;
      try {
        await api('/pujas', { method: 'POST', body });
        closeModal();
        toast('Puja service updated and saved to database! 🙏');
        renderDashboard();
      } catch (e) { toast(e.message, true); }
    };
  });
}

/* ---------- action dispatcher ---------- */
const ACTIONS = {
  nav: (d) => showView(d.view),
  toggleMenu: () => {
    const drawer = $('#nav-drawer');
    if (!drawer) return;
    const isOpen = drawer.classList.toggle('open');
    const btn = $('#hamburger-btn') || $('.hamburger-btn');
    if (btn) btn.setAttribute('aria-expanded', String(isOpen));
  },
  closeModal,
  login: () => {
    const drawer = $('#nav-drawer');
    if (drawer) drawer.classList.remove('open');
    openAuth('login');
  },
  adminPanel: openAdminDirect,
  refreshDbStatus: () => renderDashboard(),
  showLogin: () => openAuth('login'),
  showRegister: () => openAuth('register'),
  logout: () => {
    const drawer = $('#nav-drawer');
    if (drawer) drawer.classList.remove('open');
    saveSession(null);
    showView('home');
    toast('Logged out');
  },
  bookCta: () => {
    const drawer = $('#nav-drawer');
    if (drawer) drawer.classList.remove('open');
    S.filters.service = '';
    showView('pandits');
  },
  panditRegister: () => {
    const drawer = $('#nav-drawer');
    if (drawer) drawer.classList.remove('open');
    openPanditRegister();
  },
  pujaTab: (d) => { S.pujaTab = d.type; renderPujas(); },
  findFor: (d) => { S.filters.service = d.name; showView('pandits'); },
  bookDirectPuja: (d) => openBooking({ pujaName: d.name }),
  planLong: (d) => { S.longPreset = d.name; showView('long'); },
  bookPandit: (d) => openBooking(d.id),
  openPanditHavan: (d) => {
    if (!S.user || S.user.role !== 'pandit') {
      toast('Only verified Vedic Pandits can conduct Havan ceremonies.', true);
      return;
    }
    S.dashTab = 'havan';
    showView('dashboard');
    setTimeout(() => switchPanditSubtab('havan', d.id), 50);
  },
  viewTimeline: (d) => openBookingTimeline(d.id),
  rebookBooking: async (d) => {
    let b = (S.bookings || []).find((x) => x.bookingId === d.id);
    if (!b && d.id) {
      try {
        b = await api('/bookings/' + encodeURIComponent(d.id));
      } catch (e) {}
    }
    if (!b) return toast('Booking record not found', true);
    openBooking({
      bookingId: b.bookingId,
      service: b.service,
      district: b.district,
      date: b.date,
      time: b.time,
      address: b.address,
      phone: b.phone || (S.user ? S.user.phone : ''),
      panditEmail: b.preferredPanditEmail || '',
      preferredPanditEmail: b.preferredPanditEmail || '',
      fee: b.fee,
      isRebook: true
    });
  },
  slip: (d) => printSlip(S.bookings.find((b) => b.bookingId === d.id)),
  cancelBooking: async (d) => {
    const ok = await appConfirm({
      title: 'Cancel Ceremony Booking',
      message: 'Are you sure you want to cancel this booking?',
      detail: 'This will cancel your scheduled ritual slot.',
      confirmText: 'Yes, Cancel',
      confirmClass: 'btn-red',
      icon: 'cancel'
    });
    if (!ok) return;
    try { await api(`/bookings/${d.id}/status`, { method: 'PUT', body: { status: 'Cancelled' } }); toast('Booking cancelled'); renderDashboard(); } catch (e) { toast(e.message, true); }
  },
  reschedule: (d) => {
    const b = S.bookings.find((x) => x.bookingId === d.id);
    if (!b) return toast('Booking record not found', true);
    openModal('Reschedule Ceremony Slot', `
      <div>
        <label style="font-weight:600">Select New Ceremony Date *</label>
        <input type="date" id="resched-date" min="${today()}" value="${esc(b.date || '')}">
      </div>
      <div style="margin-top:12px">
        <label style="font-weight:600">Select New Time Slot *</label>
        <select id="resched-time">
          ${opts(['06:30 AM - 09:30 AM', '08:00 AM - 11:00 AM', '10:30 AM - 01:30 PM', '04:00 PM - 07:00 PM', '06:30 PM - 09:30 PM'], b.time || '08:00 AM - 11:00 AM')}
        </select>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-gold" id="btn-confirm-resched"><span class="material-icons">event</span> Confirm Reschedule</button>
      </div>
    `, (m) => {
      $('#btn-confirm-resched', m).onclick = async () => {
        const date = $('#resched-date', m).value;
        const time = $('#resched-time', m).value;
        if (!date) return toast('Please select a ceremony date', true);
        if (!time) return toast('Please select a time slot', true);
        try {
          await api(`/bookings/${d.id}/reschedule`, { method: 'PUT', body: { date, time } });
          closeModal();
          toast('Booking rescheduled successfully! 🙏');
          renderDashboard();
        } catch (e) {
          toast(e.message, true);
        }
      };
    });
  },
  setStatus: async (d) => { try { await api(`/bookings/${d.id}/status`, { method: 'PUT', body: { status: d.status } }); toast('Updated'); renderDashboard(); } catch (e) { toast(e.message, true); } },
  longResp: async (d) => { try { await api(`/long-puja-requests/${d.id}/pandit-response`, { method: 'PUT', body: { panditEmail: S.user.email, response: d.resp } }); toast('Response recorded'); renderDashboard(); } catch (e) { toast(e.message, true); } },
  saveAvail: async (d, el) => {
    if (!S.me) return;
    const saveBtn = el || document.getElementById('btn-save-all-avail');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="material-icons spin">sync</span> Saving...';
    }
    try {
      const days = [...document.querySelectorAll('#av-days input:checked')].map((i) => i.value);
      const finalDays = days.length ? days : (S.me.availableDays && S.me.availableDays.length ? S.me.availableDays : DAYS);

      const formState = typeof S._availFormState === 'function' ? S._availFormState() : null;
      const slots = formState && formState.slots && formState.slots.length
        ? formState.slots
        : ($('#av-slots') ? $('#av-slots').value.split('\n').map((s) => s.trim()).filter(Boolean) : DEFAULT_SLOTS);

      if (!slots.length) {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<span class="material-icons">save</span> Save Working Districts &amp; Availability'; }
        return toast('Please configure at least one time slot', true);
      }

      const domDistricts = [...document.querySelectorAll('#district-checkboxes input:checked')].map((i) => i.value);
      const workingDistricts = domDistricts.length
        ? domDistricts
        : (formState && formState.workingDistricts && formState.workingDistricts.length
            ? formState.workingDistricts
            : (S.me.workingDistricts && S.me.workingDistricts.length ? S.me.workingDistricts : [S.me.district || 'Khordha']));

      const workingState = $('#av-state') ? $('#av-state').value : (formState ? formState.curState : (S.me.workingState || S.me.state || 'Odisha'));
      const feeEl = $('#av-fee');
      const fee = (feeEl ? +feeEl.value : 0) || (S.me && S.me.fee) || 1500;
      const districtPrices = formState ? formState.districtPrices : (S.me.districtPrices || {});

      // Bank & UPI details
      const bankAccount = $('#p-bank-acc') ? $('#p-bank-acc').value.trim() : (S.me.bankAccount || '');
      const ifscCode = $('#p-bank-ifsc') ? $('#p-bank-ifsc').value.trim().toUpperCase() : (S.me.ifscCode || '');
      const upiId = $('#p-bank-upi') ? $('#p-bank-upi').value.trim() : (S.me.upiId || '');
      const bankName = $('#p-bank-name') ? $('#p-bank-name').value.trim() : (S.me.bankName || '');
      const accountHolder = $('#p-bank-holder') ? $('#p-bank-holder').value.trim() : (S.me.accountHolder || S.me.name);
      const qrCode = $('#p-qr-val') ? $('#p-qr-val').value.trim() : (S.me.qrCode || '');

      const payload = {
        availableDays: finalDays,
        timeSlots: slots,
        fee,
        workingState,
        workingDistricts,
        districtPrices,
        bankAccount,
        ifscCode,
        upiId,
        bankName,
        accountHolder,
        qrCode
      };

      // Optimistically update local Pandit state in memory immediately
      S.me = { ...S.me, ...payload };
      toast('Working districts & availability saved successfully! 🙏');

      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<span class="material-icons">check_circle</span> Saved Successfully';
        setTimeout(() => {
          if (saveBtn) saveBtn.innerHTML = '<span class="material-icons">save</span> Save Working Districts &amp; Availability';
        }, 2200);
      }

      // Persist to server in background without UI freeze
      api('/pandits/' + (S.me._id || S.me.email), {
        method: 'PUT',
        body: payload
      }).then(updated => {
        if (updated) S.me = { ...S.me, ...updated };
      }).catch(e => {
        toast(e.message || 'Error updating server', true);
      });
    } catch (e) {
      toast(e.message || 'Failed to save availability', true);
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<span class="material-icons">save</span> Save Working Districts &amp; Availability';
      }
    }
  },
  panditAcceptBooking: async (d, el) => {
    const bookingId = d.id;
    if (!bookingId) return toast('Booking ID missing', true);
    const btn = el || document.querySelector(`[data-action="panditAcceptBooking"][data-id="${bookingId}"]`);
    if (btn) { btn.disabled = true; btn.textContent = 'Accepting...'; }
    try {
      await api('/bookings/' + encodeURIComponent(bookingId) + '/pandit-response', {
        method: 'PUT',
        body: {
          response: 'Accept',
          panditEmail: S.user ? S.user.email : ''
        }
      });
      toast('Ceremony accepted successfully! Booking confirmed. Devotee has been notified. 🙏');
      renderDashboard();
    } catch (e) {
      toast(e.message || 'Failed to accept ceremony', true);
      if (btn) { btn.disabled = false; btn.textContent = '✓ Accept Ceremony'; }
    }
  },
  panditRejectBooking: async (d, el) => {
    const bookingId = d.id;
    if (!bookingId) return toast('Booking ID missing', true);
    const reason = await appPrompt({
      title: 'Decline Ceremony Assignment',
      message: `Decline ceremony offer for booking ${bookingId}?`,
      label: 'Reason for Declining (optional)',
      placeholder: 'e.g. Unavailable on this slot',
      defaultValue: 'Unavailable on this slot',
      confirmText: 'Decline Offer',
      confirmClass: 'btn-red',
      icon: 'event_busy'
    });
    if (reason === null) return;
    const btn = el || document.querySelector(`[data-action="panditRejectBooking"][data-id="${bookingId}"]`);
    if (btn) { btn.disabled = true; btn.textContent = 'Declining...'; }
    try {
      await api('/bookings/' + encodeURIComponent(bookingId) + '/pandit-response', {
        method: 'PUT',
        body: {
          response: 'Reject',
          rejectionReason: reason || 'Unavailable on this slot',
          panditEmail: S.user ? S.user.email : ''
        }
      });
      toast('Ceremony offer declined and returned to Admin for reassignment.');
      renderDashboard();
    } catch (e) {
      toast(e.message || 'Failed to reject ceremony offer', true);
      if (btn) { btn.disabled = false; btn.textContent = '✕ Reject Offer'; }
    }
  },
  dashTab: (d) => {
    S.dashTab = d.tab;
    if (S.user && S.user.role === 'pandit' && document.getElementById('dash-tab-content')) {
      switchPanditSubtab(d.tab);
      return;
    }
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
  changeDevoteeLocation: () => {
    const u = S.user;
    if (!u) return openAuth('login');
    openModal('Account Location Locked', `
      <div style="background:#fffcf5;border:1.5px solid #ebd9be;border-radius:12px;padding:22px 18px;text-align:center">
        <span class="material-icons" style="font-size:46px;color:var(--ochre)">lock</span>
        <h3 style="margin:12px 0 6px;color:var(--mahogany);font-size:20px">Location Locked to Account</h3>
        <p style="color:var(--muted);font-size:14px;line-height:1.6;max-width:440px;margin:0 auto 16px">
          Your devotee account location was set during registration and is permanently locked to <b>${esc(u.district || 'District')}${u.state ? ', ' + esc(u.state) : ''}</b>. Both short and long puja ceremonies are fixed to this location and no district will change.
        </p>
        <button class="btn btn-gold" onclick="closeModal()">Understood</button>
      </div>
    `);
  },
  editDevoteeProfile: () => {
    const u = S.user;
    openModal('Edit Devotee Profile', `
      <div><label style="font-weight:600">Full Name</label><input id="ep-dev-name" value="${esc(u.name || '')}"></div>
      <div><label style="font-weight:600">Phone Number</label><input id="ep-dev-phone" value="${esc(u.phone || '')}"></div>
      <div class="form-grid" style="padding:0">
        <div>
          <label style="font-weight:600">State (Locked)</label>
          <input value="${esc(u.state || 'Odisha')}" readonly disabled style="background:#fcf8f0;cursor:not-allowed;font-weight:600">
        </div>
        <div>
          <label style="font-weight:600">District (Locked)</label>
          <input value="${esc(u.district || 'Not Set')}" readonly disabled style="background:#fcf8f0;cursor:not-allowed;font-weight:600">
        </div>
      </div>
      <small class="muted" style="color:var(--ochre);display:block;margin:4px 0 10px;font-size:12px">
        <span class="material-icons" style="font-size:13px;vertical-align:middle">lock</span> State and District are permanently locked to your devotee account.
      </small>
      <div><label style="font-weight:600">City / Town / Locality</label><input id="ep-dev-city" value="${esc(u.city || '')}"></div>
      <button class="btn btn-gold" id="btn-save-dev-prof" style="margin-top:14px;width:100%"><span class="material-icons">save</span> Save Profile</button>
    `, (m) => {
      $('#btn-save-dev-prof', m).onclick = async () => {
        const name = $('#ep-dev-name', m).value.trim();
        const phone = $('#ep-dev-phone', m).value.trim();
        const city = $('#ep-dev-city', m).value.trim();
        if (!name || !phone) return toast('Name and phone are required', true);
        try {
          const updated = await api('/users/profile', { method: 'PUT', body: { name, phone, city } });
          saveSession(updated, S.token);
          closeModal();
          toast('Profile updated successfully! 🙏');
          renderDashboard();
        } catch (e) { toast(e.message, true); }
      };
    });
  },
  savePanditBank: async () => {
    let me = S.me;
    if (!me && S.user) {
      try {
        const plist = await api('/pandits?email=' + encodeURIComponent(S.user.email));
        if (plist && plist[0]) me = S.me = plist[0];
      } catch {}
    }
    if (!me && S.user) {
      me = S.me = { email: S.user.email, name: S.user.name, verified: true };
    }
    if (!me) return toast('Please log in to save bank details', true);

    const acc = $('#pandit-bank-acc') ? $('#pandit-bank-acc').value.trim() : '';
    const accConfirm = $('#pandit-bank-acc-confirm') ? $('#pandit-bank-acc-confirm').value.trim() : '';
    const ifsc = $('#pandit-bank-ifsc') ? $('#pandit-bank-ifsc').value.trim().toUpperCase() : '';
    const name = $('#pandit-bank-holder') ? $('#pandit-bank-holder').value.trim() : (me.accountHolder || me.name || '');
    const bankName = $('#pandit-bank-name') ? $('#pandit-bank-name').value.trim() : '';
    const upi = $('#pandit-bank-upi') ? $('#pandit-bank-upi').value.trim() : '';
    const qr = $('#pandit-bank-qr-url') ? $('#pandit-bank-qr-url').value.trim() : (me.qrCode || '');

    const cleanAcc = acc.replace(/[\s-]/g, '');
    const cleanConfirm = accConfirm.replace(/[\s-]/g, '');
    const cleanIfsc = ifsc.replace(/[\s-]/g, '').toUpperCase();

    if (!cleanAcc) return toast('Please enter your Bank Account Number', true);
    if (cleanConfirm && cleanAcc !== cleanConfirm) return toast('Bank Account numbers do not match. Please re-check.', true);
    if (!cleanIfsc) return toast('Please enter your Bank IFSC Code', true);

    const btn = document.querySelector('[data-action="savePanditBank"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-icons spin">sync</span> Saving Bank Details...'; }

    try {
      const pId = (me && (me._id || me.panditId)) ||
                  (S.user && (S.user.panditId || S.user._id)) ||
                  (me && me.email) ||
                  (S.user && S.user.email) ||
                  'current';
      const body = {
        panditId: (me && (me._id || me.panditId)) || (S.user && (S.user.panditId || S.user._id)) || '',
        email: (me && me.email) || (S.user && S.user.email) || '',
        phone: (me && me.phone) || (S.user && S.user.phone) || '',
        name: (me && me.name) || (S.user && S.user.name) || name,
        bankAccount: cleanAcc,
        ifscCode: cleanIfsc,
        bankName,
        accountHolder: name,
        upiId: upi,
        qrCode: qr
      };

      // Optimistically update in memory and localStorage immediately
      S.me = { ...(S.me || {}), ...body };
      if (S.user) {
        S.user = {
          ...S.user,
          ...body,
          panditId: (S.me && S.me._id) || S.user.panditId
        };
        localStorage.setItem('pc_user', JSON.stringify(S.user));
      }
      toast('Bank details & UPI QR saved successfully! Dakshina will be credited to this account. 🙏');

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-icons">check_circle</span> Saved Successfully';
        setTimeout(() => {
          if (btn) btn.innerHTML = '<span class="material-icons">save</span> Save Bank &amp; Payout Details';
        }, 2200);
      }

      // Persist to server in background without UI freeze
      api('/pandits/' + encodeURIComponent(pId) + '/bank-details', {
        method: 'PUT',
        body
      }).then(res => {
        const savedPandit = (res && res.pandit) ? res.pandit : { ...me, ...body };
        S.me = savedPandit;
      }).catch(e => {
        toast(e.message || 'Failed to sync bank details', true);
      });
    } catch (e) {
      toast(e.message || 'Failed to save bank details', true);
      if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-icons">save</span> Save Bank &amp; Payout Details'; }
    }
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
  delPuja: async (d) => {
    const ok = await appConfirm({
      title: 'Delete Ritual Service',
      message: 'Delete this puja from the catalog?',
      detail: 'This ritual service will be permanently deleted from the devotee catalog.',
      confirmText: 'Delete Puja',
      confirmClass: 'btn-red',
      icon: 'delete_forever'
    });
    if (!ok) return;
    try { await api('/pujas/' + d.id, { method: 'DELETE' }); toast('Deleted'); renderDashboard(); } catch (e) { toast(e.message, true); }
  },
  modalBackdrop: (d, el, ev) => { if (ev.target === el) closeModal(); },
  payBooking: async (d) => {
    try {
      const bId = d && d.id;
      if (!bId) return toast('Missing booking identifier', true);

      let b = (S.bookings || []).find((x) => x.bookingId === bId || x._id === bId);
      if (!b) {
        try {
          b = await api('/bookings/' + encodeURIComponent(bId));
        } catch {}
      }
      if (!b) {
        try {
          const list = await api('/bookings?bookingId=' + encodeURIComponent(bId));
          b = list && list[0];
        } catch {}
      }
      if (!b) return toast('Booking record not found for ' + bId, true);

      // Fetch centralized Platform Bank Details (managed exclusively by Admin)
      let platformBank = {
        accountHolder: 'PujaConnect Official Platform Account',
        bankName: 'State Bank of India',
        accountNumber: '40918237465',
        ifscCode: 'SBIN0001234',
        upiId: 'pujaconnect@upi',
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=pujaconnect@upi&pn=PujaConnect%20Vedic%20Services&cu=INR'
      };
      try {
        const pb = await api('/platform-bank-details');
        if (pb && (pb.accountNumber || pb.upiId)) platformBank = { ...platformBank, ...pb };
      } catch (err) {}

      const fee = Number(b.fee) || 1500;
      const advance = Number(b.advanceAmount) || 0;
      const remaining = Math.max(0, fee - (b.advancePaid ? advance : 0));

      const displayUpi = platformBank.upiId || 'pujaconnect@upi';
      const qrImgHtml = platformBank.qrCode
        ? `<div class="qr-preview-card" style="margin:16px 0;text-align:center">
             <div style="font-weight:600;font-size:13px;margin-bottom:8px;color:var(--mahogany)">
               <span class="material-icons" style="font-size:16px;vertical-align:middle;color:var(--ochre)">qr_code_scanner</span>
               Scan Official PujaConnect QR to Pay Dakshina (PhonePe / GPay / Paytm / BHIM)
             </div>
             <img src="${esc(platformBank.qrCode)}" class="qr-img" style="max-width:180px;height:auto;border-radius:10px;border:1px solid #ebd9c2;background:#fff;padding:8px" alt="PujaConnect UPI QR Code">
             <div class="muted" style="font-size:11px;margin-top:6px">Tap and hold or scan with any UPI/banking app</div>
           </div>`
        : '';

      openModal(`Pay Dakshina – ${esc(b.service || 'Puja')}`, `
        <div style="max-width:520px;margin:0 auto">
          <div style="background:#fff8ed;border:1px solid #ebd9c2;border-radius:12px;padding:16px;margin-bottom:18px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span class="booking-id-tag">${esc(b.bookingId || bId)}</span>
              <span class="badge green">Booking Confirmed ✅</span>
            </div>
            <div style="font-size:14px;color:var(--mahogany)"><b>${esc(b.service || 'Sacred Ritual')}</b></div>
            <div style="font-size:13px;color:var(--muted);margin-top:4px">
              📅 ${esc(b.date || 'Scheduled Date')} · ⏰ ${esc(b.time || '10:00 AM')} · Assigned Pandit: <b>${esc(b.panditName || 'Assigned Purohit')}</b>
            </div>
            <div style="margin-top:12px;padding-top:10px;border-top:1px dashed #ebd9c2;display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:13px;font-weight:600">Total Dakshina to Pay:</span>
              <span style="font-size:22px;font-weight:700;color:var(--ochre)">${inr(remaining)}</span>
            </div>
          </div>

          <!-- Official Platform Bank Details Box -->
          <div class="bank-details-box">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-weight:700;color:var(--mahogany);font-size:14.5px">
              <span class="material-icons" style="color:var(--ochre)">account_balance</span>
              PujaConnect Official Platform Bank &amp; UPI Details
            </div>
            <div class="bank-info-grid">
              <div class="bank-info-item">
                <label>Account Holder Name</label>
                <b>${esc(platformBank.accountHolder)}</b>
              </div>
              <div class="bank-info-item">
                <label>Bank Name</label>
                <b>${esc(platformBank.bankName)}</b>
              </div>
              <div class="bank-info-item">
                <label>Bank Account Number</label>
                <b style="font-family:monospace;letter-spacing:1px">${esc(platformBank.accountNumber)}</b>
              </div>
              <div class="bank-info-item">
                <label>IFSC Code</label>
                <b style="font-family:monospace;letter-spacing:1px">${esc(platformBank.ifscCode)}</b>
              </div>
              <div class="bank-info-item" style="grid-column: 1 / -1">
                <label>Official Platform UPI ID</label>
                <b style="font-family:monospace;color:var(--ochre);font-size:14.5px">${esc(displayUpi)}</b>
              </div>
            </div>
            ${qrImgHtml}
            <div style="background:#fff8ed;border-left:3px solid var(--ochre);padding:8px 10px;margin-top:12px;font-size:11.5px;color:#8a5d3b">
              ℹ️ Devotees pay directly to PujaConnect's verified platform account. Admin verifies payment and handles Pandit disbursements after ceremony completion.
            </div>
          </div>

          <!-- Submit Payment Verification Form -->
          <div style="margin-top:18px">
            <div style="font-weight:700;margin-bottom:8px;font-size:14px;color:var(--mahogany)">
              <span class="material-icons" style="font-size:16px;vertical-align:middle;color:var(--green)">verified</span>
              Submit Transfer Reference for Verification
            </div>
            <p class="muted" style="font-size:12.5px;margin-bottom:12px">
              After completing the transfer via UPI, GPay, PhonePe, or Bank Transfer, enter your Transaction UTR / Ref Number below. The Admin will verify and your official bill will be generated.
            </p>
            <div>
              <label style="font-weight:600;font-size:12.5px">Payment Mode Used</label>
              <select id="pay-mode" style="margin-bottom:10px">
                <option value="UPI (PhonePe / GPay / Paytm)">UPI (PhonePe / GPay / Paytm / BHIM)</option>
                <option value="Direct Bank Transfer (IMPS/NEFT)">Direct Bank Transfer (IMPS / NEFT)</option>
                <option value="Cash Paid to Pandit">Cash Paid Directly to Pandit</option>
              </select>
            </div>
            <div>
              <label style="font-weight:600;font-size:12.5px">Transaction UTR / Reference ID / UPI Ref Number *</label>
              <input type="text" id="pay-proof" placeholder="e.g. 423456789012 or UPI/345678" style="margin-bottom:14px">
            </div>
            <button class="btn btn-gold btn-lg" id="btn-submit-payment-proof" style="width:100%">
              <span class="material-icons">send</span> Submit Payment for Verification
            </button>
          </div>
        </div>
      `, (m) => {
        const submitBtn = $('#btn-submit-payment-proof', m);
        if (submitBtn) {
          submitBtn.onclick = async () => {
            const proof = $('#pay-proof', m).value.trim();
            const mode = $('#pay-mode', m).value;
            if (!proof) return toast('Please enter the Transaction UTR or Reference Number', true);
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="material-icons spin">sync</span> Submitting...';
            try {
              const targetBookingId = b.bookingId || bId;
              await api('/bookings/' + encodeURIComponent(targetBookingId) + '/submit-payment', {
                method: 'POST',
                body: { paymentProof: proof, paymentMethod: mode }
              });
              closeModal();
              toast('Dakshina payment submitted! Your payment is under processing and awaiting Admin verification. 🙏');
              renderDashboard();
            } catch (err) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<span class="material-icons">send</span> Submit Payment for Verification';
              toast(err.message, true);
            }
          };
        }
      });
    } catch (e) {
      console.error('Error in payBooking:', e);
      toast('Could not open payment window: ' + e.message, true);
    }
  },
  viewBill: async (d) => {
    try {
      const bId = d && d.id;
      if (!bId) return toast('Missing booking identifier', true);
      let b = (S.bookings || []).find((x) => x.bookingId === bId || x._id === bId);
      if (!b) {
        try {
          b = await api('/bookings/' + encodeURIComponent(bId));
        } catch {}
      }
      if (!b) {
        try {
          const list = await api('/bookings?bookingId=' + encodeURIComponent(bId));
          b = list && list[0];
        } catch {}
      }
      if (!b) return toast('Booking record not found', true);

    const invDate = b.invoiceGeneratedAt ? new Date(b.invoiceGeneratedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
    const invId = b.invoiceId || ('INV-' + b.bookingId.replace('PUJA-', '') + '-9901');

    const bMainFee = Number(b.fee) || 1500;
    const bFeePct = Number(b.adminFeePercent !== undefined ? b.adminFeePercent : 10);
    const bFeeCut = Number(b.adminFeeAmount !== undefined ? b.adminFeeAmount : Math.round((bMainFee * bFeePct) / 100));
    const bNetPayout = Number(b.panditNetPayout || b.panditPayoutAmount || Math.max(0, bMainFee - bFeeCut));

    openModal('Official Ritual Dakshina Receipt', `
      <div class="invoice-container">
        <div class="invoice-head">
          <div>
            <div class="invoice-brand"><span class="om">ॐ</span> PujaConnect</div>
            <div style="font-size:12px;color:var(--muted)">Authentic Vedic Ceremonies &amp; Ritual Logistics</div>
            <div style="font-size:11px;color:var(--muted);margin-top:2px">Govt. Registered Vedic Purohit Network · India</div>
          </div>
          <div style="text-align:right">
            <div class="invoice-num">${esc(invId)}</div>
            <div style="font-size:12px;color:var(--muted)">Issue Date: <b>${invDate}</b></div>
            <div style="font-size:12px;color:var(--muted)">Booking ID: <b>${esc(b.bookingId)}</b></div>
          </div>
        </div>

        <div class="invoice-parties">
          <div class="invoice-party">
            <label>Billed To (Devotee)</label>
            <b>${esc(b.userName)}</b>
            <div>${esc(b.userEmail)}</div>
            <div>📞 ${esc(b.userPhone || b.phone || 'Registered Mobile')}</div>
            ${b.address ? `<div>📍 ${esc(b.address)}</div>` : ''}
          </div>
          <div class="invoice-party" style="text-align:right">
            <label>Ceremony Performed By (Vedic Purohit)</label>
            <b>${esc(b.panditName)}</b>
            <div>${esc(b.panditEmail)}</div>
            <div>Verified Vedic Acharya</div>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>Item / Sacred Service</th>
              <th>Date &amp; Time</th>
              <th style="text-align:right">Dakshina Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>${esc(b.service)}</b>
                <div style="font-size:11.5px;color:var(--muted);margin-top:2px">Vedic chanting, havan sankalpa, samagri consultation &amp; rituals</div>
              </td>
              <td>${esc(b.date)}<br><small class="muted">${esc(b.time || '10:00 AM')}</small></td>
              <td style="text-align:right;font-weight:700">${inr(bMainFee)}</td>
            </tr>
          </tbody>
        </table>

        <div class="invoice-summary">
          ${(S.user && S.user.role === 'admin') ? `
            <div class="invoice-total-row">
              <span>Customer Dakshina Subtotal</span>
              <span>${inr(bMainFee)}</span>
            </div>
            <div class="invoice-total-row">
              <span>Admin Platform Coordination Charge (${bFeePct}%)</span>
              <span style="color:#c62828">-${inr(bFeeCut)} (${bFeePct}%)</span>
            </div>
            <div class="invoice-total-row grand">
              <span>Remaining Net Pandit Dakshina</span>
              <span>${inr(bNetPayout)}</span>
            </div>
          ` : `
            <div class="invoice-total-row grand">
              <span>Total Dakshina Pay Amount</span>
              <span style="color:#2e7d32">${inr(bMainFee)}</span>
            </div>
          `}
        </div>

        <div class="invoice-footer">
          <div class="invoice-stamp">PAID &amp; VERIFIED</div>
          <div style="font-size:12px;color:var(--muted);line-height:1.5">
            <b>Devotee Payment Mode:</b> ${esc(b.paymentMethod || 'UPI / Bank Transfer')}<br>
            <b>Transaction Ref / UTR:</b> <code style="font-size:11px">${esc(b.paymentProof || 'VERIFIED')}</code><br>
            <b>Ceremony Status:</b> <span style="color:#2e7d32;font-weight:700">Completed (Paid &amp; Verified)</span><br>
            ${(S.user && S.user.role === 'admin') ? (b.panditPayoutStatus === 'Paid' ? `
              <b>Admin Pandit Payout:</b> <span style="color:#1b5e20;font-weight:700">Paid (${inr(b.panditPayoutAmount || bNetPayout)}) via ${esc(b.panditPayoutMethod || 'Bank Transfer')} · Ref: <code>${esc(b.panditPayoutTxnId || 'SETTLED')}</code>${b.panditPayoutDate ? ` on ${new Date(b.panditPayoutDate).toLocaleDateString('en-IN')}` : ''}</span><br>
            ` : `
              <b>Admin Pandit Payout:</b> <span style="color:var(--ochre);font-weight:700">Pending Admin Transfer of ${inr(bNetPayout)} (Scheduled within 24 Hours)</span><br>
            `) : ''}
            <span style="font-style:italic;color:var(--ochre)">"May Lord Ganesha and the Divine Deities bestow health, peace &amp; prosperity on your family."</span>
          </div>
        </div>

        <div class="invoice-actions">
          <button class="btn btn-gold" onclick="window.print()">
            <span class="material-icons">print</span> Print Official Bill
          </button>
          <button class="btn btn-outline" onclick="closeModal()">Close</button>
        </div>
      </div>
    `);
    } catch (e) {
      console.error('Error in viewBill:', e);
      toast('Could not generate bill: ' + e.message, true);
    }
  }
};

window.handlePanditQrUpload = function(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  if (file.size > 3 * 1024 * 1024) {
    toast('Please upload an image smaller than 3MB.', true);
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const urlInput = document.getElementById('pandit-bank-qr-url');
    if (urlInput) urlInput.value = dataUrl;
    window.updatePanditQrPreview(dataUrl);
  };
  reader.readAsDataURL(file);
};

window.updatePanditQrPreview = function(url) {
  const box = document.getElementById('pandit-qr-preview-box');
  const img = document.getElementById('pandit-qr-preview-img');
  if (!url || !url.trim()) {
    if (box) box.style.display = 'none';
  } else {
    if (img) img.src = url.trim();
    if (box) box.style.display = 'block';
  }
};

window.clearPanditQr = function() {
  const fileInput = document.getElementById('pandit-bank-qr-file');
  const urlInput = document.getElementById('pandit-bank-qr-url');
  if (fileInput) fileInput.value = '';
  if (urlInput) urlInput.value = '';
  window.updatePanditQrPreview('');
};

window.openQrViewModal = function(url, title) {
  if (!url) return;
  openModal(title || 'UPI QR Code – Ready to Scan', `
    <div style="text-align:center;padding:10px 0">
      <div style="background:#fff;border:2px solid var(--ochre);border-radius:14px;padding:16px;display:inline-block;box-shadow:0 8px 24px rgba(0,0,0,0.08);margin-bottom:14px">
        <img src="${esc(url)}" style="max-width:280px;width:100%;height:auto;display:block;border-radius:6px" alt="UPI QR Code">
      </div>
      <div style="font-size:13.5px;color:var(--mahogany);font-weight:600">
        Scan using PhonePe, Google Pay, Paytm, or any UPI banking app
      </div>
      <div class="muted" style="font-size:12px;margin-top:4px">
        Linked directly to Pandit payout profile.
      </div>
      <div style="margin-top:18px">
        <button class="btn btn-gold" onclick="closeModal()">Close</button>
      </div>
    </div>
  `);
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  if (el.tagName === 'A') ev.preventDefault();
  fn(el.dataset, el, ev);
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    const drawer = $('#nav-drawer');
    if (drawer && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      const btn = $('#hamburger-btn') || $('.hamburger-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  }
});

/* ==========================================================================
   PANDIT CONDUCT HAVAN & YAJNA RITUAL ENGINE (Pandit Dashboard Exclusive)
   ========================================================================== */
function renderPanditHavanTab(bookings, me, activeBookingId) {
  const confirmedBookings = (bookings || []).filter(
    (b) => b.status === 'Confirmed' || b.status === 'Accepted' || b.status === 'Completed' || b.paymentStatus === 'Paid'
  );
  const activeBooking = activeBookingId ? (bookings || []).find((b) => b.bookingId === activeBookingId) : (confirmedBookings[0] || (bookings && bookings[0]) || null);

  const devoteeName = activeBooking ? (activeBooking.userName || 'Devotee') : 'Respected Devotee';
  const ceremonyName = activeBooking ? (activeBooking.service || 'Sacred Havan & Puja') : 'Vedic Havan & Yajna';
  const devoteeDistrict = activeBooking ? (activeBooking.district || 'Odisha') : ((me && me.district) || 'Odisha');
  const devoteeDate = activeBooking ? (activeBooking.date || 'Today') : 'Auspicious Muhurat';
  const devoteeTime = activeBooking ? (activeBooking.time || '10:00 AM') : 'Pratah Kaal';

  return `
    <div class="pandit-havan-container">
      <div class="pandit-havan-hero">
        <div>
          <h3><span class="material-icons">local_fire_department</span> Pandit Havan &amp; Yajna Ritual Tool</h3>
          <p>
            Perform and manage authentic Vedic Havan ceremonies for your assigned devotees. Follow traditional Shastric rites, verify sacred samagri, recite consecrated mantras, and bestow divine blessings.
          </p>
        </div>
        <div>
          <span class="badge green" style="font-size:12.5px;padding:6px 14px;background:#e8f5e9;color:#1b5e20;border:1px solid #a5d6a7">
            <span class="material-icons" style="font-size:15px;vertical-align:middle">verified</span> Verified Vedic Scholar
          </span>
        </div>
      </div>

      <div class="pandit-havan-card">
        <!-- Ceremony Selector -->
        <div class="pandit-havan-selector-row">
          <label for="pandit-havan-booking-select">
            <span class="material-icons" style="color:var(--ochre)">assignment</span> Select Devotee Ceremony:
          </label>
          <select id="pandit-havan-booking-select">
            ${bookings && bookings.length ? bookings.map((b) => `
              <option value="${esc(b.bookingId)}" ${(activeBooking && activeBooking.bookingId === b.bookingId) ? 'selected' : ''}>
                ${esc(b.service)} — ${esc(b.userName)} (${esc(b.district || 'N/A')}, ${esc(b.date || '')}) [${esc(b.status)}]
              </option>
            `).join('') : `
              <option value="">No assigned bookings yet — General Vedic Havan Ritual Mode</option>
            `}
          </select>
        </div>

        <!-- Step 1: Devotee Sankalpa -->
        <div class="pandit-havan-step-card">
          <div class="pandit-havan-step-header">
            <span class="step-number-badge">१</span>
            <span class="step-title">Devotee Sankalpa &amp; Avahan (संकल्प एवं आवाहन)</span>
          </div>
          <div class="pandit-havan-step-body">
            <div class="sankalpa-guidance-box">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                <span class="badge green">Devotee: <strong>${esc(devoteeName)}</strong></span>
                <span class="badge amber">Ritual: <strong>${esc(ceremonyName)}</strong></span>
                <span class="muted" style="font-size:12px">Location: <b>${esc(devoteeDistrict)}</b> · Slot: <b>${esc(devoteeDate)} (${esc(devoteeTime)})</b></span>
              </div>
              <div class="sankalpa-sanskrit">
                ॐ विष्णुर्विष्णुर्विष्णुः श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य... अद्य श्री <u>${esc(devoteeName)}</u> सपरिवारस्य आयुर्-आरोग्य-ऐश्वर्य-अभिवृद्ध्यर्थं श्री ${esc(ceremonyName)} निमित्तं हवनाख्यं कर्म करिष्ये ॥
              </div>
              <p class="muted" style="font-size:12px;margin:0">
                Chant the formal Sankalpa holding water, akshata, and flowers, invoking Agni Dev and Devatas for the devotee family.
              </p>
            </div>
          </div>
        </div>

        <!-- Step 2: Samagri Checklist -->
        <div class="pandit-havan-step-card">
          <div class="pandit-havan-step-header">
            <span class="step-number-badge">२</span>
            <span class="step-title">Sacred Samagri Verification (हवन सामग्री पुष्टि)</span>
          </div>
          <div class="pandit-havan-step-body">
            <p class="muted" style="margin:0 0 4px;font-size:13px">Verify all consecrated samagri is ready before igniting Agni:</p>
            <div class="samagri-checklist-grid">
              <label class="samagri-checkbox-item">
                <input type="checkbox" checked /> <span>🪔 Shuddha Desi Cow Ghee (शुद्ध गोघृत)</span>
              </label>
              <label class="samagri-checkbox-item">
                <input type="checkbox" checked /> <span>🪵 Mango Wood Samidha (आम्र समिधा)</span>
              </label>
              <label class="samagri-checkbox-item">
                <input type="checkbox" checked /> <span>🔥 Havan Kund &amp; Sruk-Sruva (हवन कुण्ड)</span>
              </label>
              <label class="samagri-checkbox-item">
                <input type="checkbox" checked /> <span>🌿 32-Herb Havan Samagri &amp; Guggul</span>
              </label>
              <label class="samagri-checkbox-item">
                <input type="checkbox" checked /> <span>🌾 Navadhanya, Black Til &amp; Jau (जौ)</span>
              </label>
              <label class="samagri-checkbox-item">
                <input type="checkbox" checked /> <span>🌺 Bilva Patra &amp; Auspicious Flowers</span>
              </label>
              <label class="samagri-checkbox-item">
                <input type="checkbox" checked /> <span>🕯️ Bhimseni Camphor (कपूर)</span>
              </label>
              <label class="samagri-checkbox-item">
                <input type="checkbox" checked /> <span>🥥 Purna Ahuti Coconut, Supari &amp; Cloth</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Step 3: Vedic Mantras & Ahuti Procedure -->
        <div class="pandit-havan-step-card">
          <div class="pandit-havan-step-header">
            <span class="step-number-badge">३</span>
            <span class="step-title">Vedic Ahuti Mantras Protocol (मंत्रोच्चार एवं आहुति क्रम)</span>
          </div>
          <div class="pandit-havan-step-body" style="gap:12px">
            <div class="mantra-recitation-guide">
              <span class="mantra-label">1. Agni Pratishtapana &amp; Pradhana Ahuti</span>
              <div class="mantra-verse">ॐ अग्नये स्वाहा । अग्नये इदं न मम ॥ ॐ सोमाय स्वाहा । सोमाय इदं न मम ॥</div>
            </div>

            <div class="mantra-recitation-guide">
              <span class="mantra-label">2. Gayatri Mahamantra Ahuti (11/21/108 Ahutis)</span>
              <div class="mantra-verse">ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् स्वाहा ॥</div>
            </div>

            <div class="mantra-recitation-guide">
              <span class="mantra-label">3. Maha Mrityunjaya Sanjeevani Ahuti</span>
              <div class="mantra-verse">ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्य pushyeya मामृतात् स्वाहा ॥</div>
            </div>

            <div class="mantra-recitation-guide">
              <span class="mantra-label">4. Navagraha &amp; Vastu Shanti Ahutis</span>
              <div class="mantra-verse">ॐ सूर्यादि नवग्रहेभ्यो नमः स्वाहा ॥ ॐ वास्तुपुरुषाय नमः स्वाहा ॥</div>
            </div>

            <div class="mantra-recitation-guide" style="border-left-color:#2e7d32">
              <span class="mantra-label" style="color:#2e7d32">5. Purna Ahuti (Supreme Concluding Offering)</span>
              <div class="mantra-verse">ॐ पूर्णमदः पूर्णमिदं पूर्णात् पूर्णमुदच्यते । पूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते ॥ ॐ शान्तिः शान्तिः शान्तिः स्वाहा ॥</div>
            </div>
          </div>
        </div>

        <!-- Step 4: Completion & Devotee Blessing Confirmation -->
        <div class="pandit-havan-complete-box">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="material-icons" style="color:#2e7d32">check_circle</span>
            <strong style="color:var(--mahogany);font-size:15px">Havan Ceremony Completion &amp; Devotee Blessing</strong>
          </div>
          <p class="muted" style="margin:0;font-size:13px">
            Upon completing the sacred Havan, enter any ritual notes or blessings for the devotee. Pressing confirm will record the ceremony completion.
          </p>
          <div style="display:flex;flex-direction:column;gap:6px">
            <label style="font-size:12.5px;font-weight:700">Pandit Ritual Notes / Ashirwad Message:</label>
            <input type="text" id="pandit-havan-notes" class="input" style="background:#fff;border:1.5px solid var(--border);border-radius:8px;padding:9px 12px;font-size:13px" placeholder="e.g. Completed with 108 Gayatri ahutis, Navagraha homa and Purnahuti. Devotee blessed." value="Sacred Havan performed according to Vedic Shastras with Purna Ahuti. Blessings of Ayur, Arogya & Soubhagya." />
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:6px">
            <button class="btn btn-green btn-lg" id="btn-complete-pandit-havan" data-id="${activeBooking ? esc(activeBooking.bookingId) : ''}">
              <span class="material-icons">local_fire_department</span> Complete Havan &amp; Bestow Blessings
            </button>
            ${activeBooking ? `
              <button class="btn btn-outline dark btn-sm" data-action="slip" data-id="${esc(activeBooking.bookingId)}">
                <span class="material-icons">receipt</span> View Ritual Slip
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupPanditHavanListeners() {
  const sel = document.getElementById('pandit-havan-booking-select');
  if (sel) {
    sel.addEventListener('change', (e) => {
      const bId = e.target.value;
      const container = document.getElementById('dash-tab-content');
      if (container) {
        container.innerHTML = renderPanditHavanTab(S._panditBookings, S.me, bId);
        setupPanditHavanListeners();
      }
    });
  }

  const completeBtn = document.getElementById('btn-complete-pandit-havan');
  if (completeBtn) {
    completeBtn.addEventListener('click', async () => {
      const bId = completeBtn.dataset.id;
      const notesEl = document.getElementById('pandit-havan-notes');
      const notes = notesEl ? notesEl.value.trim() : '';

      if (bId) {
        try {
          completeBtn.disabled = true;
          completeBtn.textContent = 'Recording Havan Completion…';
          await api('/bookings/' + encodeURIComponent(bId) + '/status', {
            method: 'PUT',
            body: {
              status: 'Completed',
              havanConducted: true,
              havanNotes: notes,
              completedAt: new Date().toISOString()
            }
          });
          if (S.user && S.user.email) {
            S._panditBookings = await api('/bookings?panditEmail=' + encodeURIComponent(S.user.email)).catch(() => S._panditBookings);
          }
          toast('🔥 Sacred Havan successfully completed and recorded! Blessings sent to devotee. 🙏');
          switchPanditSubtab('ceremonies');
        } catch (err) {
          toast(err.message || 'Error recording Havan completion', true);
          completeBtn.disabled = false;
          completeBtn.innerHTML = '<span class="material-icons">local_fire_department</span> Complete Havan &amp; Bestow Blessings';
        }
      } else {
        toast('🔥 Vedic Havan ritual mantras and protocol concluded. May Agni Dev bestow divine blessings! 🙏');
      }
    });
  }
}

/* ---------- boot ---------- */
(async function init() {
  const yrEl = $('#yr');
  if (yrEl) yrEl.textContent = new Date().getFullYear();
  renderNav();
  await loadPujas();
  renderHomePujas();
  renderHomePandits();
  setupHeroFilter();

  // Check for direct email "Click Here to Rebook" link
  const urlParams = new URLSearchParams(window.location.search);
  const actionParam = urlParams.get('action');
  const rebookId = urlParams.get('bookingId') || urlParams.get('rebook');
  const emailParam = urlParams.get('email');
  const tokenParam = urlParams.get('token');

  if (actionParam === 'rebook' || (rebookId && emailParam)) {
    // Clean search params from URL so refresh stays clean
    try {
      window.history.replaceState({}, document.title, window.location.pathname + '#dashboard');
    } catch (e) {}

    // Auto login devotee if not logged in or logged in as different account
    if (!S.user || (emailParam && S.user.email.toLowerCase() !== emailParam.toLowerCase())) {
      let loggedIn = false;
      try {
        const authRes = await api('/auth/magic-rebook', {
          method: 'POST',
          body: { bookingId: rebookId, email: emailParam, token: tokenParam }
        });
        if (authRes && authRes.user && authRes.token) {
          saveSession(authRes.user, authRes.token);
          renderNav();
          loggedIn = true;
        }
      } catch (err) {
        console.warn('Magic rebook auth error:', err);
      }

      if (!loggedIn && emailParam) {
        try {
          const devRes = await api('/auth/devotee-login', {
            method: 'POST',
            body: { email: emailParam }
          });
          if (devRes && devRes.user) {
            saveSession(devRes.user, devRes.token);
            renderNav();
            loggedIn = true;
          }
        } catch (e2) {}
      }
    }

    // Direct devotee to dashboard
    showView('dashboard');
    S.dashTab = 'bookings';
    await renderDashboard();

    // Directly open the rebooking form for this specific rejected booking
    if (rebookId) {
      setTimeout(async () => {
        let b = (S.bookings || []).find((x) => x.bookingId === rebookId);
        if (!b) {
          try {
            b = await api('/bookings/' + encodeURIComponent(rebookId));
          } catch (e) {}
        }
        if (b) {
          openBooking({
            bookingId: b.bookingId,
            service: b.service,
            district: b.district,
            date: b.date,
            time: b.time,
            address: b.address,
            phone: b.phone || (S.user ? S.user.phone : ''),
            panditEmail: b.preferredPanditEmail || '',
            preferredPanditEmail: b.preferredPanditEmail || '',
            fee: b.fee,
            isRebook: true
          });
          toast(`Ceremony ready to rebook. Please pick a new date & time slot! 🙏`);
        }
      }, 300);
    }
  } else {
    const hash = location.hash.replace('#', '');
    if (['pandits', 'pujas', 'long', 'about', 'dashboard'].includes(hash)) showView(hash);
  }
})();

