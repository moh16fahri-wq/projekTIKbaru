// ========== APLIKASI SEKOLAH DIGITAL - TANPA DATABASE (LOCALSTORAGE) ==========

let data;
let currentUser = null;
let currentRole = null;
let absensiHariIniSelesai = false;

// DATA DEFAULT (SAMPLE DATA)
const defaultData = {
    users: {
        admins: [
            { id: 1, username: 'admin', password: 'admin123' }
        ],
        gurus: [
            { id: 1, nama: 'Budi Santoso', email: 'budi@gmail.com', password: 'guru123', jadwal: [] },
            { id: 2, nama: 'Siti Rahayu', email: 'siti@gmail.com', password: 'guru123', jadwal: [] }
        ],
        siswas: [
            { id: 1, nama: 'Ahmad Rizki', nis: '2023001', id_kelas: 1, email: '', password: 'siswa123' },
            { id: 2, nama: 'Siti Nurhaliza', nis: '2023002', id_kelas: 1, email: '', password: 'siswa123' },
            { id: 3, nama: 'Budi Setiawan', nis: '2023003', id_kelas: 2, email: '', password: 'siswa123' }
        ]
    },
    kelas: [
        { id: 1, nama: 'X IPA 1', lokasi: { latitude: -7.257472, longitude: 112.752090 } },
        { id: 2, nama: 'X IPA 2', lokasi: { latitude: -7.257472, longitude: 112.752090 } },
        { id: 3, nama: 'XI IPA 1', lokasi: { latitude: -7.257472, longitude: 112.752090 } }
    ],
    pengumuman: [],
    tugas: [],
    absensi: [],
    materi: [],
    notifikasi: [],
    jurnal: [],
    jadwalPelajaran: {},
    catatanPR: [],
    diskusi: []
};

// FUNGSI LOAD DATA DARI LOCALSTORAGE
function loadDataAndInit() {
    try {
        const savedData = localStorage.getItem('sekolahDigitalData');
        
        if (savedData) {
            data = JSON.parse(savedData);
            console.log("Data berhasil dimuat dari LocalStorage:", data);
        } else {
            data = JSON.parse(JSON.stringify(defaultData));
            saveData();
            console.log("Data default berhasil dibuat");
        }

        if (document.getElementById("kata-harian")) {
            setupHalamanAwal();
        } else if (document.getElementById("app")) {
            showView("view-role-selection");
        }

    } catch (error) {
        console.error('Terjadi kesalahan saat memuat data:', error);
        alert('Gagal memuat data. Data akan direset.');
        data = JSON.parse(JSON.stringify(defaultData));
        saveData();
    }
}

// FUNGSI SIMPAN DATA KE LOCALSTORAGE
function saveData() {
    try {
        localStorage.setItem('sekolahDigitalData', JSON.stringify(data));
        console.log("Data berhasil disimpan ke LocalStorage");
    } catch (error) {
        console.error('Gagal menyimpan data:', error);
        alert('Gagal menyimpan data. Storage mungkin penuh.');
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === "password") {
        input.type = "text";
        button.textContent = "🙈";
    } else {
        input.type = "password";
        button.textContent = "👁️";
    }
}

function setupHalamanAwal() {
    const quotes = [
        "Minggu: Istirahat.", 
        "Senin: Mulailah!", 
        "Selasa: Terus bertumbuh.", 
        "Rabu: Jangan takut gagal.", 
        "Kamis: Optimis!", 
        "Jumat: Selesaikan.", 
        "Sabtu: Refleksi."
    ];
    document.getElementById("kata-harian").textContent = quotes[new Date().getDay()];
    document.getElementById("tombol-buka").addEventListener("click", () => window.location.href = "main.html");
}

function showView(viewId) {
    document.querySelectorAll("#app > div").forEach(div => div.classList.add("hidden"));
    document.getElementById(viewId).classList.remove("hidden");
}

function getNomorMinggu(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function showLogin(role) {
    currentRole = role;
    showView("view-login-form");
    document.querySelectorAll("#view-login-form > div").forEach(div => div.classList.add("hidden"));
    const title = document.getElementById("login-title");
    
    if (role === "admin") {
        title.textContent = "Login Admin";
        document.getElementById("form-admin").classList.remove("hidden");
    } else if (role === "guru") {
        title.textContent = "Login Guru";
        document.getElementById("form-guru").classList.remove("hidden");
        populateGuruDropdown();
    } else if (role === "siswa") {
        title.textContent = "Login Siswa";
        document.getElementById("form-siswa").classList.remove("hidden");
        populateKelasDropdown();
    }
}

function populateGuruDropdown() {
    const select = document.getElementById("guru-select-nama");
    select.innerHTML = '<option value="">-- Pilih Nama Guru --</option>';
    data.users.gurus.forEach(guru => select.innerHTML += `<option value="${guru.id}">${guru.nama}</option>`);
}

function populateKelasDropdown() {
    const select = document.getElementById("siswa-select-kelas");
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    data.kelas.forEach(k => select.innerHTML += `<option value="${k.id}">${k.nama}</option>`);
    populateSiswaDropdown();
}

function populateSiswaDropdown() {
    const kelasId = document.getElementById("siswa-select-kelas").value;
    const select = document.getElementById("siswa-select-nama");
    select.innerHTML = '<option value="">-- Pilih Nama Siswa --</option>';
    if (kelasId) {
        data.users.siswas.filter(s => s.id_kelas == kelasId).forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.nama}</option>`;
        });
    }
}

function login() {
    let user = null;
    if (currentRole === "admin") {
        user = data.users.admins.find(u => u.username === document.getElementById("admin-user").value && u.password === document.getElementById("admin-pass").value);
    } else if (currentRole === "guru") {
        user = data.users.gurus.find(u => u.id == document.getElementById("guru-select-nama").value && u.password === document.getElementById("guru-pass").value);
    } else if (currentRole === "siswa") {
        user = data.users.siswas.find(u => u.id == document.getElementById("siswa-select-nama").value && u.password === document.getElementById("siswa-pass").value);
    }
    
    if (user) {
        currentUser = user;
        alert("Login Berhasil!");
        showDashboard();
    } else {
        alert("Login Gagal! Periksa kembali data Anda.");
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    absensiHariIniSelesai = false;
    showView("view-role-selection");
    document.querySelectorAll("input").forEach(i => i.value = "");
}

function toggleProfilPopup() {
    const popup = document.getElementById("profil-popup");
    popup.classList.toggle("hidden");
}

function renderProfilPopup() {
    let dataProfil = '';
    if (currentRole === 'admin') {
        dataProfil = `<div class="profil-info"><p><strong>Username:</strong> ${currentUser.username}</p><p><strong>Role:</strong> Administrator</p></div>`;
    } else if (currentRole === 'guru') {
        const jumlahJadwal = currentUser.jadwal ? currentUser.jadwal.length : 0;
        dataProfil = `<div class="profil-info"><p><strong>Nama:</strong> ${currentUser.nama}</p><p><strong>Email:</strong> ${currentUser.email || '-'}</p><p><strong>ID Guru:</strong> ${currentUser.id}</p><p><strong>Jadwal Mengajar:</strong> ${jumlahJadwal} sesi</p></div>`;
    } else if (currentRole === 'siswa') {
        const namaKelas = data.kelas.find(k => k.id === currentUser.id_kelas)?.nama || '-';
        dataProfil = `<div class="profil-info"><p><strong>Nama:</strong> ${currentUser.nama}</p><p><strong>NIS:</strong> ${currentUser.nis || '-'}</p><p><strong>Kelas:</strong> ${namaKelas}</p></div>`;
    }
    return `<div class="profil-header"><div class="profil-avatar">👤</div><h4>${currentUser.nama || currentUser.username}</h4></div>${dataProfil}<div class="profil-actions"><button class="profil-btn ganti-pass-btn" onclick="showGantiPassword()">🔒 Ganti Password</button><button class="profil-btn logout-btn" onclick="logout()">🚪 Logout</button></div><div id="ganti-password-section" class="hidden"><hr><h5>Ganti Password</h5><div class="password-wrapper"><input type="password" id="old-pass-popup" placeholder="Password Lama"><button type="button" class="toggle-password" onclick="togglePassword('old-pass-popup')">👁️</button></div><div class="password-wrapper"><input type="password" id="new-pass-popup" placeholder="Password Baru"><button type="button" class="toggle-password" onclick="togglePassword('new-pass-popup')">👁️</button></div><div class="password-wrapper"><input type="password" id="confirm-new-pass-popup" placeholder="Konfirmasi Password"><button type="button" class="toggle-password" onclick="togglePassword('confirm-new-pass-popup')">👁️</button></div><button onclick="changePasswordFromPopup()">Simpan Password</button></div>`;
}

function showGantiPassword() {
    document.getElementById("ganti-password-section").classList.toggle("hidden");
}

function changePasswordFromPopup() {
    const oldP = document.getElementById("old-pass-popup").value;
    const newP = document.getElementById("new-pass-popup").value;
    const confirmP = document.getElementById("confirm-new-pass-popup").value;
    if (!oldP || !newP || !confirmP) return alert("Semua kolom harus diisi!");
    if (newP !== confirmP) return alert("Password baru tidak cocok!");
    if (oldP !== currentUser.password) return alert("Password lama salah!");
    currentUser.password = newP;
    saveData();
    alert("Password berhasil diubah!");
    document.getElementById("old-pass-popup").value = "";
    document.getElementById("new-pass-popup").value = "";
    document.getElementById("confirm-new-pass-popup").value = "";
    document.getElementById("ganti-password-section").classList.add("hidden");
}

function showDashboard() {
    showView("view-dashboard");
    const header = document.querySelector("#view-dashboard .header");
    const content = document.getElementById("dashboard-content");
    content.innerHTML = "";
    
    if (!document.getElementById('notification-bell')) {
        header.innerHTML = `<h2 id="dashboard-title">Dashboard</h2><div class="header-actions"><div id="notification-bell" onclick="toggleNotifDropdown()"><span id="notif-badge" class="notification-badge hidden">0</span>🔔</div><div id="notification-dropdown" class="hidden"></div><div class="profil-menu" onclick="toggleProfilPopup()"><div class="profil-icon">👤</div><span class="profil-name">${currentUser.nama || currentUser.username}</span></div><div id="profil-popup" class="hidden"></div></div>`;
    }

    if (currentRole === 'admin') {
        document.getElementById('dashboard-title').textContent = "Dashboard Admin";
        content.innerHTML = renderAdminDashboard();
        renderAdminAnalitik();
    } else if (currentRole === 'guru') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        content.innerHTML = renderGuruDashboard();
        cekJadwalMengajar();
        renderTugasSubmissions();
    } else if (currentRole === 'siswa') {
        document.getElementById('dashboard-title').textContent = `Selamat Datang, ${currentUser.nama}`;
        cekAbsensiSiswaHariIni();
        content.innerHTML = renderSiswaDashboard();
        renderSiswaFeatures();
    }
    
    document.getElementById('profil-popup').innerHTML = renderProfilPopup();
    renderNotificationBell();
}

function renderAdminDashboard() {
    return `<div class="tabs"><button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button><button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button><button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen Data</button><button class="tab-link" onclick="openAdminTab(event, 'JadwalGuru')">🗓️ Jadwal Guru</button><button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal Pelajaran</button><button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button></div><div id="Analitik" class="tab-content" style="display:block;"></div><div id="Absensi" class="tab-content"></div><div id="Manajemen" class="tab-content"></div><div id="JadwalGuru" class="tab-content"></div><div id="JadwalPelajaran" class="tab-content"></div><div id="Pengumuman" class="tab-content"></div>`;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.className = tl.className.replace(" active", ""));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if (tabName === 'Analitik') renderAdminAnalitik();
    else if (tabName === 'Absensi') renderAdminAbsensi();
    else if (tabName === 'Manajemen') renderAdminManajemen();
    else if (tabName === 'JadwalGuru') renderAdminJadwal();
    else if (tabName === 'JadwalPelajaran') renderAdminManajemenJadwal();
    else if (tabName === 'Pengumuman') renderAdminPengumuman();
}

function renderGuruDashboard() {
    return `<div class="dashboard-section" id="guru-absen"><h4>🗓️ Absensi & Jadwal</h4><p id="info-absen-guru">Mengecek jadwal...</p><button id="btn-mulai-ajar" onclick="mulaiAjar()" disabled>Mulai Ajar</button><div id="container-absen-kelas" style="margin-top: 1rem;"></div></div><div class="dashboard-section" id="guru-tugas"><h4>📤 Manajemen Tugas</h4><div class="form-container"><h5>Buat Tugas Baru</h5><select id="tugas-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="tugas-mapel" placeholder="Mata Pelajaran"><input type="text" id="tugas-judul" placeholder="Judul Tugas"><textarea id="tugas-deskripsi" placeholder="Deskripsi tugas..."></textarea><input type="date" id="tugas-deadline"><button onclick="buatTugas()">Kirim Tugas</button></div><div id="submission-container"></div></div><div class="dashboard-section"><h4>📚 Unggah Materi</h4><select id="materi-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="materi-judul" placeholder="Judul Materi"><textarea id="materi-deskripsi" placeholder="Deskripsi..."></textarea><button onclick="unggahMateri()">Unggah</button></div><div class="dashboard-section"><h4>📢 Buat Pengumuman</h4><input type="text" id="pengumuman-judul" placeholder="Judul"><textarea id="pengumuman-isi" placeholder="Isi..."></textarea><button onclick="buatPengumuman()">Kirim</button></div>`;
}

function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : '<p style="color: var(--danger-color); font-weight: 600;">🔒 Lakukan absensi untuk membuka fitur lain.</p>';
    return `<div class="dashboard-section" id="siswa-absen"><h4>✅ Absensi Siswa</h4><button id="btn-absen-masuk-siswa" onclick="absen('masuk')">📍 Masuk</button><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit</button></div><div class="dashboard-section"><h4>🗓️ Jadwal & Catatan PR</h4><div id="jadwal-siswa-container">Memuat jadwal...</div></div><div id="fitur-siswa-wrapper" class="${locked}">${warning}<div class="dashboard-section"><h4>📢 Pengumuman</h4><div id="pengumuman-container"></div></div><div class="dashboard-section"><h4>📚 Materi Pembelajaran</h4><div id="materi-container"></div></div><div class="dashboard-section"><h4>📚 Tugas Sekolah <span id="notif-tugas" class="notification-badge">0</span></h4><div id="daftar-tugas-container"></div></div></div>`;
}

function renderSiswaFeatures() {
    cekDanHapusCatatanLama();
    renderJadwalSiswa();
    renderPengumumanSiswa();
    renderMateriSiswa();
    renderDaftarTugas();
}

function cekDanHapusCatatanLama() {
    const mingguSekarang = getNomorMinggu(new Date());
    data.catatanPR = data.catatanPR.filter(catatan => !(catatan.id_siswa === currentUser.id && catatan.mingguDibuat < mingguSekarang));
    saveData();
}

function renderJadwalSiswa() {
    const container = document.getElementById('jadwal-siswa-container');
    const jadwalKelas = data.jadwalPelajaran[currentUser.id_kelas] || [];
    if (jadwalKelas.length === 0) { 
        container.innerHTML = '<p>Jadwal pelajaran belum diatur oleh admin.</p>'; 
        return; 
    }
    const hariSekolah = [1, 2, 3, 4, 5];
    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    let html = '<div class="jadwal-grid">';
    hariSekolah.forEach(hari => {
        html += `<div class="jadwal-hari"><h5>${namaHari[hari]}</h5>`;
        const sesiUntukHariIni = jadwalKelas.filter(s => s.hari === hari);
        if (sesiUntukHariIni.length > 0) {
            sesiUntukHariIni.forEach(sesi => {
                const catatanTersimpan = data.catatanPR.find(c => c.id_siswa === currentUser.id && c.id_jadwal === sesi.id);
                html += `<div class="jadwal-sesi"><div class="sesi-info"><strong>${sesi.mataPelajaran}</strong><span>${sesi.jamMulai} - ${sesi.jamSelesai}</span></div><textarea class="catatan-pr" id="catatan-${sesi.id}" placeholder="Ketik catatan PR..." onblur="simpanCatatan(${sesi.id})">${catatanTersimpan ? catatanTersimpan.catatan : ''}</textarea></div>`;
            });
        } else { 
            html += '<p class="sesi-kosong">Tidak ada jadwal</p>'; 
        }
        html += `</div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function simpanCatatan(id_jadwal) {
    const textarea = document.getElementById(`catatan-${id_jadwal}`);
    const catatanTeks = textarea.value.trim();
    data.catatanPR = data.catatanPR.filter(c => !(c.id_siswa === currentUser.id && c.id_jadwal === id_jadwal));
    if (catatanTeks) { 
        data.catatanPR.push({ 
            id: Date.now(),
            id_siswa: currentUser.id, 
            id_jadwal, 
            catatan: catatanTeks, 
            mingguDibuat: getNomorMinggu(new Date()) 
        }); 
    }
    saveData();
    textarea.style.borderColor = 'var(--success-color)';
    setTimeout(() => { textarea.style.borderColor = 'var(--border-color)'; }, 1500);
}

function cekAbsensiSiswaHariIni() {
    const today = new Date().toISOString().split('T')[0];
    const sudahAbsen = data.absensi.some(a => a.id_siswa == currentUser.id && a.tanggal === today);
    absensiHariIniSelesai = sudahAbsen;
}

function absen(status) {
    const today = new Date().toISOString().split('T')[0];
    const sudahAbsen = data.absensi.some(a => a.id_siswa == currentUser.id && a.tanggal === today);
    
    if (sudahAbsen) {
        return alert("Anda sudah melakukan absensi hari ini!");
    }

    if (status === 'sakit') {
        const fotoNama = prompt('Masukkan nama file foto (simulasi):');
        if (fotoNama) {
            prosesAbsensi(status, fotoNama);
        } else {
            alert("Foto bukti wajib untuk status sakit!");
        }
    } else if (status === 'masuk') {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lokasi = data.kelas.find(k => k.id === currentUser.id_kelas).lokasi;
                    const jarak = hitungJarak(position.coords.latitude, position.coords.longitude, lokasi.latitude, lokasi.longitude);
                    
                    if (jarak <= 50) {
                        prosesAbsensi(status);
                    } else {
                        alert(`Anda terlalu jauh dari lokasi kelas (${jarak.toFixed(0)}m). Maksimal 50m.`);
                    }
                },
                () => {
                    alert("Tidak dapat mengakses lokasi. Absensi masuk memerlukan GPS.");
                }
            );
        } else {
            alert("Browser tidak mendukung geolokasi.");
        }
    } else {
        prosesAbsensi(status);
    }
}

function prosesAbsensi(status, fotoNama = null) {
    const today = new Date().toISOString().split('T')[0];
    const waktu = new Date().toTimeString().split(' ')[0];
    
    data.absensi.push({
        id: Date.now(),
        id_siswa: currentUser.id,
        nama_siswa: currentUser.nama,
        id_kelas: currentUser.id_kelas,
        status: status,
        tanggal: today,
        waktu: waktu,
        keterangan: fotoNama || ''
    });
    
    saveData();
    absensiHariIniSelesai = true;
    alert(`Absensi ${status} berhasil dicatat!`);
    showDashboard();
}

function hitungJarak(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function createNotification(id_user, role, message) {
    if (currentUser && currentUser.id === id_user && currentRole === role) return;
    data.notifikasi.push({ 
        id: Date.now(), 
        id_user, 
        role, 
        message, 
        read: false, 
        timestamp: new Date().toISOString() 
    });
    saveData();
}

function renderNotificationBell() {
    const notifBadge = document.getElementById("notif-badge");
    if (!notifBadge) return;
    const unreadNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === "semua") && n.role === currentRole && !n.read);
    if (unreadNotifs.length > 0) {
        notifBadge.textContent = unreadNotifs.length;
        notifBadge.classList.remove("hidden");
    } else {
        notifBadge.classList.add("hidden");
    }
}

function toggleNotifDropdown() {
    const dropdown = document.getElementById("notification-dropdown");
    dropdown.classList.toggle("hidden");
    if (!dropdown.classList.contains("hidden")) renderNotifList();
}

function renderNotifList() {
    const dropdown = document.getElementById("notification-dropdown");
    const userNotifs = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === "semua") && n.role === currentRole);
    if (userNotifs.length === 0) { 
        dropdown.innerHTML = '<div class="notif-item">Tidak ada notifikasi.</div>'; 
        return; 
    }
    let html = "";
    [...userNotifs].reverse().forEach(n => {
        html += `<div class="notif-item ${n.read ? 'read' : ''}" onclick="markNotifAsRead(${n.id})"><p>${n.message}</p><span class="notif-time">${new Date(n.timestamp).toLocaleString("id-ID")}</span></div>`;
    });
    dropdown.innerHTML = html;
}

function markNotifAsRead(notifId) {
    const notif = data.notifikasi.find(n => n.id === notifId);
    if (notif) notif.read = true;
    saveData();
    renderNotificationBell();
    renderNotifList();
}

function renderPengumumanSiswa() {
    const container = document.getElementById("pengumuman-container");
    if (data.pengumuman.length === 0) {
        container.innerHTML = "<p>Belum ada pengumuman.</p>";
        return;
    }
    let html = "";
    [...data.pengumuman].reverse().forEach(p => {
        html += `<div class="announcement-card"><h5>${p.judul}</h5><p>${p.isi}</p><small>oleh ${p.nama_guru} - ${p.tanggal}</small></div>`;
    });
    container.innerHTML = html;
}

function buatPengumuman() {
    const judul = document.getElementById("pengumuman-judul").value;
    const isi = document.getElementById("pengumuman-isi").value;
    if (!judul || !isi) return alert("Judul dan isi harus diisi!");
    
    data.pengumuman.push({
        id: Date.now(),
        judul,
        isi,
        nama_guru: currentUser.nama,
        tanggal: new Date().toISOString().split('T')[0]
    });
    
    saveData();
    createNotification("semua", "siswa", `Pengumuman baru: ${judul}`);
    document.getElementById("pengumuman-judul").value = "";
    document.getElementById("pengumuman-isi").value = "";
    alert("Pengumuman berhasil dibuat!");
}

function renderMateriSiswa() {
    const container = document.getElementById("materi-container");
    const materiKelas = data.materi.filter(m => m.id_kelas == currentUser.id_kelas);
    if (materiKelas.length === 0) {
        container.innerHTML = "<p>Belum ada materi.</p>";
        return;
    }
    let html = "";
    [...materiKelas].reverse().forEach(m => {
        html += `<div class="task-card"><h5>${m.judul}</h5><p>${m.deskripsi}</p><p>File: <em>${m.file || 'Tidak ada file'}</em></p><small>oleh ${m.nama_guru} - ${m.tanggal}</small></div>`;
    });
    container.innerHTML = html;
}

function unggahMateri() {
    const id_kelas = parseInt(document.getElementById("materi-kelas").value);
    const judul = document.getElementById("materi-judul").value;
    const deskripsi = document.getElementById("materi-deskripsi").value;
    
    if (!judul || !deskripsi) {
        return alert("Judul dan deskripsi harus diisi!");
    }
    
    data.materi.push({
        id: Date.now(),
        judul: judul,
        deskripsi: deskripsi,
        id_kelas: id_kelas,
        id_guru: currentUser.id,
        nama_guru: currentUser.nama,
        file: 'file_simulasi.pdf',
        tanggal: new Date().toISOString().split('T')[0]
    });
    
    saveData();
    document.getElementById("materi-judul").value = "";
    document.getElementById("materi-deskripsi").value = "";
    alert("Materi berhasil diunggah!");
}

function renderDaftarTugas() {
    const container = document.getElementById("daftar-tugas-container");
    const notif = document.getElementById("notif-tugas");
    const tugasSiswa = data.tugas.filter(t => t.id_kelas == currentUser.id_kelas);
    notif.textContent = tugasSiswa.length;
    if (tugasSiswa.length === 0) { 
        container.innerHTML = "<p>🎉 Hore, tidak ada tugas saat ini!</p>"; 
        return; 
    }
    let html = "";
    tugasSiswa.forEach(t => {
        const submission = t.submissions ? t.submissions.find(s => s.id_siswa === currentUser.id) : null;
        const submissionHTML = submission ? `<div class="submission-status"><p style="color:green;"><strong>✔ Anda sudah mengumpulkan.</strong></p>${submission.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${submission.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${submission.feedback}</em></p>` : `<p>Menunggu penilaian...</p>`}</div>` : `<button onclick="submitTugas(${t.id})">Kirim Tugas</button>`;
        html += `<div class="task-card"><div class="task-header"><span><strong>${t.judul}</strong> - ${t.nama_guru}</span><span class="task-deadline">Deadline: ${t.deadline}</span></div><p>${t.deskripsi}</p><p><em>Mata Pelajaran: ${t.mapel || 'Umum'}</em></p>${submissionHTML}${renderDiskusi(t.id)}</div>`;
    });
    container.innerHTML = html;
}

function buatTugas() {
    const id_kelas = parseInt(document.getElementById("tugas-kelas").value);
    const mapel = document.getElementById("tugas-mapel").value;
    const judul = document.getElementById("tugas-judul").value;
    const deskripsi = document.getElementById("tugas-deskripsi").value;
    const deadline = document.getElementById("tugas-deadline").value;
    
    if (!mapel || !judul || !deskripsi || !deadline) {
        return alert("Semua field harus diisi!");
    }
    
    data.tugas.push({
        id: Date.now(),
        judul: judul,
        deskripsi: deskripsi,
        mapel: mapel,
        id_kelas: id_kelas,
        deadline: deadline,
        id_guru: currentUser.id,
        nama_guru: currentUser.nama,
        created_at: new Date().toISOString().split('T')[0],
        submissions: []
    });
    
    saveData();
    document.getElementById("tugas-mapel").value = "";
    document.getElementById("tugas-judul").value = "";
    document.getElementById("tugas-deskripsi").value = "";
    document.getElementById("tugas-deadline").value = "";
    
    alert("Tugas berhasil dibuat!");
    renderTugasSubmissions();
}

function submitTugas(id_tugas) {
    const fileName = prompt('Masukkan nama file yang akan dikumpulkan:');
    if (!fileName) return alert("Nama file harus diisi!");
    
    const tugas = data.tugas.find(t => t.id === id_tugas);
    if (tugas) {
        if (!tugas.submissions) tugas.submissions = [];
        tugas.submissions.push({ 
            id_siswa: currentUser.id, 
            nama_siswa: currentUser.nama, 
            file: fileName, 
            timestamp: new Date().toLocaleString("id-ID"), 
            nilai: null, 
            feedback: "" 
        });
        saveData();
        createNotification(tugas.id_guru, "guru", `Siswa '${currentUser.nama}' mengumpulkan tugas '${tugas.judul}'.`);
        alert(`Jawaban berhasil dikirim!`);
        renderDaftarTugas();
        renderNotificationBell();
    }
}

function renderTugasSubmissions() {
    const container = document.getElementById("submission-container");
    const tugasGuru = data.tugas.filter(t => t.id_guru === currentUser.id);
    if (tugasGuru.length === 0) { 
        container.innerHTML = "<p>Anda belum mengirim tugas apapun.</p>"; 
        return; 
    }
    let html = "";
    tugasGuru.forEach(t => {
        html += `<div class="task-card"><h5>Tugas: ${t.judul} (Kelas: ${data.kelas.find(k => k.id === t.id_kelas).nama})</h5><p><em>Mata Pelajaran: ${t.mapel || 'Umum'}</em></p>`;
        if (t.submissions && t.submissions.length > 0) {
            html += "<ul class='submission-list'>";
            t.submissions.forEach(sub => {
                const submissionDetailHTML = `<strong>${sub.nama_siswa}</strong> mengumpulkan file: <em>${sub.file}</em><div class="grading-container">${sub.nilai !== null ? `<p class="grade-display"><strong>Nilai: ${sub.nilai}</strong></p><p class="feedback-display"><em>Feedback: ${sub.feedback}</em></p>` : `<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai (0-100)" min="0" max="100"><input type="text" id="feedback-${t.id}-${sub.id_siswa}" placeholder="Umpan Balik"><button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Simpan</button>`}</div>`;
                html += `<li style="margin-bottom: 1rem; padding: 1rem; background: var(--light-bg); border-radius: 8px;">${submissionDetailHTML}</li>`;
            });
            html += "</ul>";
        } else { 
            html += "<p>Belum ada siswa yang mengumpulkan.</p>"; 
        }
        html += renderDiskusi(t.id) + `</div>`;
    });
    container.innerHTML = html;
}

function simpanNilai(id_tugas, id_siswa) {
    const nilai = document.getElementById(`nilai-${id_tugas}-${id_siswa}`).value;
    const feedback = document.getElementById(`feedback-${id_tugas}-${id_siswa}`).value;
    if (nilai === "" || nilai < 0 || nilai > 100) return alert("Nilai harus 0-100.");
    const tugas = data.tugas.find(t => t.id === id_tugas);
    const submission = tugas.submissions.find(s => s.id_siswa === id_siswa);
    submission.nilai = parseInt(nilai);
    submission.feedback = feedback || "Tidak ada feedback.";
    saveData();
    createNotification(id_siswa, "siswa", `Tugas '${tugas.judul}' Anda telah dinilai.`);
    alert("Nilai berhasil disimpan!");
    renderTugasSubmissions();
}

function renderDiskusi(id_tugas) {
    const diskusiTugas = data.diskusi.filter(d => d.id_tugas === id_tugas);
    let html = '<div class="discussion-container"><h5>💬 Diskusi</h5>';
    if (diskusiTugas.length > 0) {
        html += '<div class="discussion-messages">';
        diskusiTugas.forEach(d => {
            html += `<div class="discussion-message"><strong>${d.nama}:</strong> ${d.pesan}<br><small>${d.timestamp}</small></div>`;
        });
        html += '</div>';
    }
    html += `<div class="discussion-form"><textarea id="diskusi-${id_tugas}" placeholder="Tulis komentar..."></textarea><button onclick="kirimDiskusi(${id_tugas})">Kirim</button></div></div>`;
    return html;
}

function kirimDiskusi(id_tugas) {
    const textarea = document.getElementById(`diskusi-${id_tugas}`);
    const pesan = textarea.value.trim();
    if (!pesan) return alert("Pesan tidak boleh kosong!");
    
    data.diskusi.push({
        id: Date.now(),
        id_tugas,
        nama: currentUser.nama || currentUser.username,
        role: currentRole,
        pesan,
        timestamp: new Date().toLocaleString("id-ID")
    });
    
    saveData();
    textarea.value = "";
    
    if (currentRole === 'siswa') {
        renderDaftarTugas();
    } else if (currentRole === 'guru') {
        renderTugasSubmissions();
    }
}

function cekJadwalMengajar() {
    const infoText = document.getElementById("info-absen-guru");
    const btnMulai = document.getElementById("btn-mulai-ajar");
    
    if (!infoText || !btnMulai) return;
    
    const now = new Date();
    const hariIni = now.getDay();
    const jamSekarang = now.getHours();
    
    const jadwalHariIni = currentUser.jadwal ? currentUser.jadwal.filter(j => j.hari === hariIni) : [];
    
    if (jadwalHariIni.length === 0) {
        infoText.textContent = "Tidak ada jadwal mengajar hari ini.";
        return;
    }
    
    const jadwalAktif = jadwalHariIni.find(j => j.jam === jamSekarang);
    
    if (jadwalAktif) {
        infoText.innerHTML = `<strong>Jadwal Aktif:</strong> ${jadwalAktif.nama_kelas} (Jam ${jadwalAktif.jam}:00)`;
        btnMulai.disabled = false;
        btnMulai.setAttribute('data-kelas-id', jadwalAktif.id_kelas);
    } else {
        infoText.innerHTML = `<strong>Jadwal Hari Ini:</strong><br>`;
        jadwalHariIni.forEach(j => {
            infoText.innerHTML += `${j.nama_kelas} - Jam ${j.jam}:00<br>`;
        });
    }
}

function mulaiAjar() {
    const kelasId = parseInt(document.getElementById("btn-mulai-ajar").getAttribute('data-kelas-id'));
    const kelas = data.kelas.find(k => k.id === kelasId);
    
    const container = document.getElementById("container-absen-kelas");
    const siswaDiKelas = data.users.siswas.filter(s => s.id_kelas === kelasId);
    const today = new Date().toISOString().split('T')[0];
    
    let html = `<h5>Absensi ${kelas.nama}</h5><table><tr><th>Nama</th><th>Status</th></tr>`;
    
    siswaDiKelas.forEach(siswa => {
        const absensi = data.absensi.find(a => a.id_siswa == siswa.id && a.tanggal === today);
        const status = absensi ? absensi.status : "Belum absen";
        const statusClass = status === "masuk" ? "style='color: green;'" : status === "Belum absen" ? "style='color: red;'" : "";
        html += `<tr><td>${siswa.nama}</td><td ${statusClass}>${status}</td></tr>`;
    });
    
    html += "</table>";
    container.innerHTML = html;
}

function renderAdminAnalitik() {
    const container = document.getElementById("Analitik");
    const totalSiswa = data.users.siswas.length;
    const totalGuru = data.users.gurus.length;
    const totalKelas = data.kelas.length;
    const totalTugas = data.tugas.length;
    
    const today = new Date().toISOString().split('T')[0];
    const absenHariIni = data.absensi.filter(a => a.tanggal === today);
    const hadir = absenHariIni.filter(a => a.status === "masuk").length;
    const izin = absenHariIni.filter(a => a.status === "izin").length;
    const sakit = absenHariIni.filter(a => a.status === "sakit").length;
    
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>📊 Statistik Umum</h4>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalSiswa}</h3>
                    <p>Siswa</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalGuru}</h3>
                    <p>Guru</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalKelas}</h3>
                    <p>Kelas</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${totalTugas}</h3>
                    <p>Tugas</p>
                </div>
            </div>
        </div>
        <div class="dashboard-section">
            <h4>📊 Absensi Hari Ini (${today})</h4>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: green;">${hadir}</h3>
                    <p>Hadir</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: orange;">${izin}</h3>
                    <p>Izin</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3 style="color: red;">${sakit}</h3>
                    <p>Sakit</p>
                </div>
            </div>
        </div>
    `;
}

function renderAdminAbsensi() {
    const container = document.getElementById("Absensi");
    
    let html = `<div class="dashboard-section"><h4>📊 Rekap Absensi</h4>`;
    
    if (data.absensi.length === 0) {
        html += "<p>Belum ada data absensi.</p>";
    } else {
        html += `<table><tr><th>Tanggal</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Waktu</th></tr>`;
        [...data.absensi].reverse().forEach(a => {
            const siswa = data.users.siswas.find(s => s.id == a.id_siswa);
            const namaKelas = siswa ? data.kelas.find(k => k.id === siswa.id_kelas)?.nama || "-" : "-";
            const namaSiswa = a.nama_siswa || (siswa ? siswa.nama : "Unknown");
            html += `<tr><td>${a.tanggal}</td><td>${namaSiswa}</td><td>${namaKelas}</td><td>${a.status}</td><td>${a.waktu || '-'}</td></tr>`;
        });
        html += "</table>";
    }
    
    html += "</div>";
    container.innerHTML = html;
}

function renderAdminManajemen() {
    const container = document.getElementById("Manajemen");
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>👥 Manajemen Siswa</h4>
            <div class="form-container">
                <h5>Tambah Siswa Baru</h5>
                <input type="text" id="new-siswa-nama" placeholder="Nama Siswa">
                <input type="text" id="new-siswa-nis" placeholder="NIS">
                <select id="new-siswa-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
                <input type="password" id="new-siswa-pass" placeholder="Password">
                <button onclick="tambahSiswa()">Tambah Siswa</button>
            </div>
            <table>
                <tr><th>ID</th><th>Nama</th><th>NIS</th><th>Kelas</th><th>Aksi</th></tr>
                ${data.users.siswas.map(s => {
                    const namaKelas = data.kelas.find(k => k.id == s.id_kelas)?.nama || "-";
                    return `<tr><td>${s.id}</td><td>${s.nama}</td><td>${s.nis}</td><td>${namaKelas}</td><td><button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button></td></tr>`;
                }).join("")}
            </table>
        </div>
        <div class="dashboard-section">
            <h4>👨‍🏫 Manajemen Guru</h4>
            <table>
                <tr><th>ID</th><th>Nama</th><th>Email</th></tr>
                ${data.users.gurus.map(g => `<tr><td>${g.id}</td><td>${g.nama}</td><td>${g.email}</td></tr>`).join("")}
            </table>
        </div>
    `;
}

function tambahSiswa() {
    const nama = document.getElementById("new-siswa-nama").value;
    const nis = document.getElementById("new-siswa-nis").value;
    const id_kelas = parseInt(document.getElementById("new-siswa-kelas").value);
    const password = document.getElementById("new-siswa-pass").value;
    
    if (!nama || !nis || !password) return alert("Semua field harus diisi!");
    
    if (data.users.siswas.some(s => s.nis === nis)) {
        return alert("NIS sudah terdaftar!");
    }
    
    data.users.siswas.push({
        id: Date.now(),
        nama: nama,
        nis: nis,
        id_kelas: id_kelas,
        password: password,
        email: ''
    });
    
    saveData();
    alert("Siswa berhasil ditambahkan!");
    renderAdminManajemen();
}

function hapusSiswa(id) {
    if (!confirm("Yakin ingin menghapus siswa ini?")) return;
    
    data.users.siswas = data.users.siswas.filter(s => s.id !== id);
    saveData();
    alert("Siswa berhasil dihapus!");
    renderAdminManajemen();
}

function renderAdminJadwal() {
    const container = document.getElementById("JadwalGuru");
    let html = '<div class="dashboard-section"><h4>🗓️ Jadwal Mengajar Guru</h4>';
    
    data.users.gurus.forEach(guru => {
        html += `<div class="jadwal-guru-container"><h5>${guru.nama}</h5>`;
        if (guru.jadwal && guru.jadwal.length > 0) {
            html += '<ul class="jadwal-list">';
            guru.jadwal.forEach((j, index) => {
                const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                html += `<li class="jadwal-item"><span>${namaHari[j.hari]} - Jam ${j.jam}:00 - ${j.nama_kelas}</span><button class="small-btn delete" onclick="hapusJadwalGuru(${guru.id}, ${index})">Hapus</button></li>`;
            });
            html += '</ul>';
        } else {
            html += '<p>Belum ada jadwal.</p>';
        }
        html += `<div class="jadwal-form">
            <select id="jadwal-kelas-${guru.id}">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
            <select id="jadwal-hari-${guru.id}">
                <option value="1">Senin</option>
                <option value="2">Selasa</option>
                <option value="3">Rabu</option>
                <option value="4">Kamis</option>
                <option value="5">Jumat</option>
            </select>
            <input type="number" id="jadwal-jam-${guru.id}" placeholder="Jam (0-23)" min="0" max="23">
            <button onclick="tambahJadwalGuru(${guru.id})">Tambah</button>
        </div></div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function tambahJadwalGuru(guruId) {
    const id_kelas = parseInt(document.getElementById(`jadwal-kelas-${guruId}`).value);
    const hari = parseInt(document.getElementById(`jadwal-hari-${guruId}`).value);
    const jam = parseInt(document.getElementById(`jadwal-jam-${guruId}`).value);
    
    const guru = data.users.gurus.find(g => g.id === guruId);
    if (!guru) return;

    if (!guru.jadwal) guru.jadwal = [];

    if (guru.jadwal.some(j => j.id_kelas === id_kelas && j.hari === hari && j.jam === jam)) {
        return alert("Jadwal ini sudah ada.");
    }

    const kelas = data.kelas.find(k => k.id === id_kelas);
    guru.jadwal.push({ id_kelas, hari, jam, nama_kelas: kelas.nama });
    
    saveData();
    alert("Jadwal berhasil ditambahkan!");
    renderAdminJadwal();
}

function hapusJadwalGuru(id_guru, index) {
    const guru = data.users.gurus.find(g => g.id === id_guru);
    guru.jadwal.splice(index, 1);
    saveData();
    alert("Jadwal berhasil dihapus!");
    renderAdminJadwal();
}

function renderAdminManajemenJadwal() {
    const container = document.getElementById("JadwalPelajaran");
    let html = '<div class="dashboard-section"><h4>📚 Jadwal Pelajaran Per Kelas</h4>';
    
    data.kelas.forEach(kelas => {
        const jadwal = data.jadwalPelajaran[kelas.id] || [];
        html += `<div class="form-container"><h5>${kelas.nama}</h5>`;
        
        if (jadwal.length > 0) {
            const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            html += '<table><tr><th>Hari</th><th>Jam</th><th>Mata Pelajaran</th><th>Aksi</th></tr>';
            jadwal.forEach((j, index) => {
                html += `<tr><td>${namaHari[j.hari]}</td><td>${j.jamMulai} - ${j.jamSelesai}</td><td>${j.mataPelajaran}</td><td><button class="small-btn delete" onclick="hapusJadwalPelajaran(${kelas.id}, ${index})">Hapus</button></td></tr>`;
            });
            html += '</table>';
        } else {
            html += '<p>Belum ada jadwal pelajaran.</p>';
        }
        
        html += `<h6>Tambah Jadwal Baru</h6>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <select id="jp-hari-${kelas.id}">
                <option value="1">Senin</option>
                <option value="2">Selasa</option>
                <option value="3">Rabu</option>
                <option value="4">Kamis</option>
                <option value="5">Jumat</option>
            </select>
            <input type="text" id="jp-mapel-${kelas.id}" placeholder="Mata Pelajaran">
            <input type="time" id="jp-mulai-${kelas.id}">
            <input type="time" id="jp-selesai-${kelas.id}">
        </div>
        <button onclick="tambahJadwalPelajaran(${kelas.id})" style="margin-top: 10px;">Tambah Jadwal</button>
        </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function tambahJadwalPelajaran(id_kelas) {
    const hari = parseInt(document.getElementById(`jp-hari-${id_kelas}`).value);
    const mataPelajaran = document.getElementById(`jp-mapel-${id_kelas}`).value;
    const jamMulai = document.getElementById(`jp-mulai-${id_kelas}`).value;
    const jamSelesai = document.getElementById(`jp-selesai-${id_kelas}`).value;
    
    if (!mataPelajaran || !jamMulai || !jamSelesai) return alert("Semua field harus diisi!");
    
    if (!data.jadwalPelajaran[id_kelas]) {
        data.jadwalPelajaran[id_kelas] = [];
    }
    
    data.jadwalPelajaran[id_kelas].push({
        id: Date.now(),
        hari: hari,
        jamMulai: jamMulai,
        jamSelesai: jamSelesai,
        mataPelajaran: mataPelajaran
    });
    
    saveData();
    alert("Jadwal pelajaran berhasil ditambahkan!");
    renderAdminManajemenJadwal();
}

function hapusJadwalPelajaran(id_kelas, index) {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
    
    if (data.jadwalPelajaran[id_kelas]) {
        data.jadwalPelajaran[id_kelas].splice(index, 1);
    }
    
    saveData();
    alert("Jadwal berhasil dihapus!");
    renderAdminManajemenJadwal();
}

function renderAdminPengumuman() {
    const container = document.getElementById("Pengumuman");
    let html = `<div class="dashboard-section"><h4>📢 Kelola Pengumuman</h4>
    <div class="form-container">
        <h5>Buat Pengumuman Baru</h5>
        <input type="text" id="admin-pengumuman-judul" placeholder="Judul Pengumuman">
        <textarea id="admin-pengumuman-isi" placeholder="Isi pengumuman..."></textarea>
        <button onclick="buatPengumumanAdmin()">Kirim Pengumuman</button>
    </div>
    <div id="admin-pengumuman-list"></div>
    </div>`;
    
    container.innerHTML = html;
    renderAdminPengumumanList();
}

function buatPengumumanAdmin() {
    const judul = document.getElementById("admin-pengumuman-judul").value;
    const isi = document.getElementById("admin-pengumuman-isi").value;
    
    if (!judul || !isi) return alert("Judul dan isi harus diisi!");
    
    data.pengumuman.push({
        id: Date.now(),
        judul: judul,
        isi: isi,
        nama_guru: "Admin",
        tanggal: new Date().toISOString().split('T')[0]
    });
    
    saveData();
    document.getElementById("admin-pengumuman-judul").value = "";
    document.getElementById("admin-pengumuman-isi").value = "";
    
    alert("Pengumuman berhasil dibuat!");
    renderAdminPengumumanList();
}

function renderAdminPengumumanList() {
    const container = document.getElementById("admin-pengumuman-list");
    if (!container) return;
    
    container.innerHTML = "<h4>Daftar Pengumuman</h4>";
    
    if (data.pengumuman.length > 0) {
        [...data.pengumuman].reverse().forEach((p) => {
            container.innerHTML += `
            <div class="announcement-card">
                <h5>${p.judul}</h5>
                <p>${p.isi}</p>
                <small>oleh ${p.nama_guru} - ${p.tanggal}</small>
                <button class="small-btn delete" onclick="hapusPengumuman(${p.id})">Hapus</button>
            </div>`;
        });
    } else {
        container.innerHTML += '<p>Belum ada pengumuman.</p>';
    }
}

async function hapusPengumuman(id) {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;
    
    try {
        const formData = new FormData();
        formData.append('table', 'pengumuman');
        formData.append('id', id);
        
        const response = await fetch('delete_data.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            
            data.pengumuman = data.pengumuman.filter(p => p.id !== id);
            
            renderAdminPengumumanList();
        } else {
            alert('Error: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghapus');
    }
}

// INISIALISASI APLIKASI

document.addEventListener('DOMContentLoaded', loadDataAndInit);
