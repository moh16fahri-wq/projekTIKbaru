// ========== APLIKASI SEKOLAH DIGITAL - TANPA DATABASE (LOCALSTORAGE) ==========

let data;
let currentUser = null;
let currentRole = null;
let absensiHariIniSelesai = false;

// DATA DEFAULT
function getDefaultData() {
    return {
        users: {
            admins: [{ id: 1, username: 'admin', password: 'admin123' }],
            gurus: [
                { id: 1, nama: 'Pak Budi', email: 'budi@sekolah.com', password: 'guru123', jadwal: [] },
                { id: 2, nama: 'Bu Ani', email: 'ani@sekolah.com', password: 'guru123', jadwal: [] }
            ],
            siswas: [
                { id: 1, nama: 'Ahmad', nis: '12345', id_kelas: 1, email: '', password: 'siswa123' },
                { id: 2, nama: 'Siti', nis: '12346', id_kelas: 1, email: '', password: 'siswa123' },
                { id: 3, nama: 'Budi', nis: '12347', id_kelas: 2, email: '', password: 'siswa123' }
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
}

// FUNGSI LOAD & SAVE DATA
function loadDataAndInit() {
    try {
        const savedData = localStorage.getItem('sekolahDigitalData');
        if (savedData) {
            data = JSON.parse(savedData);
            console.log("✅ Data dimuat dari localStorage");
        } else {
            data = getDefaultData();
            saveData();
            console.log("✅ Data default dibuat");
        }
        if (document.getElementById("kata-harian")) {
            setupHalamanAwal();
        } else if (document.getElementById("app")) {
            showView("view-role-selection");
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data. Menggunakan data default.');
        data = getDefaultData();
        saveData();
    }
}

function saveData() {
    try {
        localStorage.setItem('sekolahDigitalData', JSON.stringify(data));
    } catch (error) {
        console.error('Gagal menyimpan:', error);
        alert('Storage penuh! Hapus beberapa data lama.');
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        input.nextElementSibling.textContent = "🙈";
    } else {
        input.type = "password";
        input.nextElementSibling.textContent = "👁️";
    }
}

function setupHalamanAwal() {
    const quotes = ["Minggu: Istirahat.", "Senin: Mulailah!", "Selasa: Terus bertumbuh.", "Rabu: Jangan takut gagal.", "Kamis: Optimis!", "Jumat: Selesaikan.", "Sabtu: Refleksi."];
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
        alert("Login Gagal!");
    }
}

function logout() {
    currentUser = null;
    currentRole = null;
    absensiHariIniSelesai = false;
    showView("view-role-selection");
}

function toggleProfilPopup() {
    document.getElementById("profil-popup").classList.toggle("hidden");
}

function renderProfilPopup() {
    let dataProfil = '';
    if (currentRole === 'admin') {
        dataProfil = `<div class="profil-info"><p><strong>Username:</strong> ${currentUser.username}</p></div>`;
    } else if (currentRole === 'guru') {
        dataProfil = `<div class="profil-info"><p><strong>Nama:</strong> ${currentUser.nama}</p><p><strong>Email:</strong> ${currentUser.email || '-'}</p></div>`;
    } else if (currentRole === 'siswa') {
        const namaKelas = data.kelas.find(k => k.id === currentUser.id_kelas)?.nama || '-';
        dataProfil = `<div class="profil-info"><p><strong>Nama:</strong> ${currentUser.nama}</p><p><strong>Kelas:</strong> ${namaKelas}</p></div>`;
    }
    return `<div class="profil-header"><div class="profil-avatar">👤</div><h4>${currentUser.nama || currentUser.username}</h4></div>${dataProfil}<div class="profil-actions"><button class="profil-btn logout-btn" onclick="logout()">🚪 Logout</button></div>`;
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
    return `<div class="tabs"><button class="tab-link active" onclick="openAdminTab(event, 'Analitik')">📈 Analitik</button><button class="tab-link" onclick="openAdminTab(event, 'Absensi')">📊 Rekap Absensi</button><button class="tab-link" onclick="openAdminTab(event, 'Manajemen')">⚙️ Manajemen</button><button class="tab-link" onclick="openAdminTab(event, 'JadwalPelajaran')">📚 Jadwal</button><button class="tab-link" onclick="openAdminTab(event, 'Pengumuman')">📢 Pengumuman</button></div><div id="Analitik" class="tab-content" style="display:block;"></div><div id="Absensi" class="tab-content"></div><div id="Manajemen" class="tab-content"></div><div id="JadwalPelajaran" class="tab-content"></div><div id="Pengumuman" class="tab-content"></div>`;
}

function openAdminTab(evt, tabName) {
    document.querySelectorAll(".tab-content").forEach(tc => tc.style.display = "none");
    document.querySelectorAll(".tab-link").forEach(tl => tl.className = tl.className.replace(" active", ""));
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    if (tabName === 'Analitik') renderAdminAnalitik();
    else if (tabName === 'Absensi') renderAdminAbsensi();
    else if (tabName === 'Manajemen') renderAdminManajemen();
    else if (tabName === 'JadwalPelajaran') renderAdminManajemenJadwal();
    else if (tabName === 'Pengumuman') renderAdminPengumuman();
}

function renderGuruDashboard() {
    return `<div class="dashboard-section"><h4>📤 Buat Tugas</h4><select id="tugas-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="tugas-mapel" placeholder="Mata Pelajaran"><input type="text" id="tugas-judul" placeholder="Judul"><textarea id="tugas-deskripsi" placeholder="Deskripsi"></textarea><input type="date" id="tugas-deadline"><button onclick="buatTugas()">Kirim</button><div id="submission-container" style="margin-top:1rem;"></div></div><div class="dashboard-section"><h4>📚 Unggah Materi</h4><select id="materi-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select><input type="text" id="materi-judul" placeholder="Judul"><textarea id="materi-deskripsi" placeholder="Deskripsi"></textarea><button onclick="unggahMateri()">Unggah</button></div><div class="dashboard-section"><h4>📢 Buat Pengumuman</h4><input type="text" id="pengumuman-judul" placeholder="Judul"><textarea id="pengumuman-isi" placeholder="Isi"></textarea><button onclick="buatPengumuman()">Kirim</button></div>`;
}

function renderSiswaDashboard() {
    const locked = absensiHariIniSelesai ? "" : "locked-feature";
    const warning = absensiHariIniSelesai ? "" : '<p style="color: var(--danger-color); font-weight: 600;">🔒 Lakukan absensi untuk membuka fitur lain.</p>';
    return `<div class="dashboard-section"><h4>✅ Absensi Siswa</h4><button onclick="absen('masuk')">📝 Masuk</button><button onclick="absen('izin')">📝 Izin</button><button onclick="absen('sakit')">🤒 Sakit</button></div><div class="dashboard-section"><h4>🗓️ Jadwal & Catatan PR</h4><div id="jadwal-siswa-container"></div></div><div id="fitur-siswa-wrapper" class="${locked}">${warning}<div class="dashboard-section"><h4>📢 Pengumuman</h4><div id="pengumuman-container"></div></div><div class="dashboard-section"><h4>📚 Materi</h4><div id="materi-container"></div></div><div class="dashboard-section"><h4>📚 Tugas <span id="notif-tugas" class="notification-badge">0</span></h4><div id="daftar-tugas-container"></div></div></div>`;
}

function renderSiswaFeatures() {
    renderJadwalSiswa();
    renderPengumumanSiswa();
    renderMateriSiswa();
    renderDaftarTugas();
}

function renderJadwalSiswa() {
    const container = document.getElementById('jadwal-siswa-container');
    const jadwalKelas = data.jadwalPelajaran[currentUser.id_kelas] || [];
    if (jadwalKelas.length === 0) { container.innerHTML = '<p>Jadwal belum diatur.</p>'; return; }
    const hariSekolah = [1, 2, 3, 4, 5];
    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    let html = '<div class="jadwal-grid">';
    hariSekolah.forEach(hari => {
        html += `<div class="jadwal-hari"><h5>${namaHari[hari]}</h5>`;
        const sesi = jadwalKelas.filter(s => s.hari === hari);
        if (sesi.length > 0) {
            sesi.forEach(s => {
                html += `<div class="jadwal-sesi"><div class="sesi-info"><strong>${s.mataPelajaran}</strong><span>${s.jamMulai} - ${s.jamSelesai}</span></div></div>`;
            });
        } else { html += '<p class="sesi-kosong">Tidak ada jadwal</p>'; }
        html += `</div>`;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function cekAbsensiSiswaHariIni() {
    const today = new Date().toISOString().split('T')[0];
    absensiHariIniSelesai = data.absensi.some(a => a.id_siswa == currentUser.id && a.tanggal === today);
}

// ========== ABSENSI DENGAN FOTO ==========
function absen(status) {
    const today = new Date().toISOString().split('T')[0];
    if (data.absensi.some(a => a.id_siswa == currentUser.id && a.tanggal === today)) {
        return alert("Sudah absen hari ini!");
    }

    if (status === 'sakit') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    prosesAbsensi(status, event.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                alert("Foto wajib untuk status sakit!");
            }
        };
        input.click();
    } else {
        prosesAbsensi(status, null);
    }
}

function prosesAbsensi(status, fotoBase64) {
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
        foto: fotoBase64,
        keterangan: status === 'sakit' ? 'Bukti foto tersedia' : ''
    });
    
    saveData();
    absensiHariIniSelesai = true;
    alert(`Absensi ${status} berhasil!`);
    showDashboard();
}

function createNotification(id_user, role, message) {
    data.notifikasi.push({ id: Date.now(), id_user, role, message, read: false, timestamp: new Date() });
    saveData();
}

function renderNotificationBell() {
    const badge = document.getElementById("notif-badge");
    const unread = data.notifikasi.filter(n => (n.id_user === currentUser.id || n.id_user === "semua") && n.role === currentRole && !n.read);
    if (unread.length > 0) {
        badge.textContent = unread.length;
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
}

function toggleNotifDropdown() {
    document.getElementById("notification-dropdown").classList.toggle("hidden");
}

function renderPengumumanSiswa() {
    const container = document.getElementById("pengumuman-container");
    if (data.pengumuman.length === 0) { container.innerHTML = "<p>Belum ada pengumuman.</p>"; return; }
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
        judul, isi,
        nama_guru: currentUser.nama || 'Admin',
        tanggal: new Date().toISOString().split('T')[0]
    });
    createNotification("semua", "siswa", `Pengumuman: ${judul}`);
    saveData();
    alert("Pengumuman berhasil dibuat!");
    document.getElementById("pengumuman-judul").value = "";
    document.getElementById("pengumuman-isi").value = "";
}

function renderMateriSiswa() {
    const container = document.getElementById("materi-container");
    const materiKelas = data.materi.filter(m => m.id_kelas == currentUser.id_kelas);
    if (materiKelas.length === 0) { container.innerHTML = "<p>Belum ada materi.</p>"; return; }
    let html = "";
    [...materiKelas].reverse().forEach(m => {
        html += `<div class="task-card"><h5>${m.judul}</h5><p>${m.deskripsi}</p><small>oleh ${m.nama_guru} - ${m.tanggal}</small></div>`;
    });
    container.innerHTML = html;
}

function unggahMateri() {
    const id_kelas = parseInt(document.getElementById("materi-kelas").value);
    const judul = document.getElementById("materi-judul").value;
    const deskripsi = document.getElementById("materi-deskripsi").value;
    if (!judul || !deskripsi) return alert("Judul dan deskripsi harus diisi!");
    data.materi.push({
        id: Date.now(), judul, deskripsi, id_kelas,
        id_guru: currentUser.id,
        nama_guru: currentUser.nama,
        tanggal: new Date().toISOString().split('T')[0]
    });
    saveData();
    alert("Materi berhasil di-upload!");
    document.getElementById("materi-judul").value = "";
    document.getElementById("materi-deskripsi").value = "";
}

function renderDaftarTugas() {
    const container = document.getElementById("daftar-tugas-container");
    const tugasSiswa = data.tugas.filter(t => t.id_kelas == currentUser.id_kelas);
    document.getElementById("notif-tugas").textContent = tugasSiswa.length;
    if (tugasSiswa.length === 0) { container.innerHTML = "<p>🎉 Tidak ada tugas!</p>"; return; }
    let html = "";
    tugasSiswa.forEach(t => {
        const sub = t.submissions ? t.submissions.find(s => s.id_siswa === currentUser.id) : null;
        const subHTML = sub ? `<p style="color:green;">✓ Sudah dikumpulkan</p>${sub.nilai !== null ? `<p><strong>Nilai: ${sub.nilai}</strong></p>` : ''}` : `<input type="file" id="file-${t.id}"><button onclick="submitTugas(${t.id})">Kirim</button>`;
        html += `<div class="task-card"><h5>${t.judul}</h5><p>${t.deskripsi}</p><small>Deadline: ${t.deadline}</small>${subHTML}</div>`;
    });
    container.innerHTML = html;
}

function buatTugas() {
    const id_kelas = parseInt(document.getElementById("tugas-kelas").value);
    const mapel = document.getElementById("tugas-mapel").value;
    const judul = document.getElementById("tugas-judul").value;
    const deskripsi = document.getElementById("tugas-deskripsi").value;
    const deadline = document.getElementById("tugas-deadline").value;
    if (!mapel || !judul || !deskripsi || !deadline) return alert("Semua field harus diisi!");
    data.tugas.push({
        id: Date.now(), judul, deskripsi, mapel, id_kelas, deadline,
        id_guru: currentUser.id, nama_guru: currentUser.nama,
        submissions: []
    });
    saveData();
    alert("Tugas berhasil dibuat!");
    document.getElementById("tugas-mapel").value = "";
    document.getElementById("tugas-judul").value = "";
    document.getElementById("tugas-deskripsi").value = "";
    document.getElementById("tugas-deadline").value = "";
    renderTugasSubmissions();
}

function submitTugas(id_tugas) {
    const file = document.getElementById(`file-${id_tugas}`).files[0];
    if (!file) return alert("Pilih file!");
    const tugas = data.tugas.find(t => t.id === id_tugas);
    if (!tugas.submissions) tugas.submissions = [];
    tugas.submissions.push({ 
        id_siswa: currentUser.id, 
        nama_siswa: currentUser.nama, 
        file: file.name, 
        timestamp: new Date().toLocaleString("id-ID"), 
        nilai: null, 
        feedback: "" 
    });
    saveData();
    alert("Jawaban berhasil dikirim!");
    renderDaftarTugas();
}

function renderTugasSubmissions() {
    const container = document.getElementById("submission-container");
    const tugasGuru = data.tugas.filter(t => t.id_guru === currentUser.id);
    if (tugasGuru.length === 0) { container.innerHTML = ""; return; }
    let html = "";
    tugasGuru.forEach(t => {
        html += `<div class="task-card"><h5>${t.judul}</h5>`;
        if (t.submissions && t.submissions.length > 0) {
            t.submissions.forEach(sub => {
                html += `<p>${sub.nama_siswa} - ${sub.file}</p>${sub.nilai === null ? `<input type="number" id="nilai-${t.id}-${sub.id_siswa}" placeholder="Nilai"><button class="small-btn" onclick="simpanNilai(${t.id}, ${sub.id_siswa})">Nilai</button>` : `<p>Nilai: ${sub.nilai}</p>`}`;
            });
        } else { html += "<p>Belum ada yang mengumpulkan</p>"; }
        html += `</div>`;
    });
    container.innerHTML = html;
}

function simpanNilai(id_tugas, id_siswa) {
    const nilai = document.getElementById(`nilai-${id_tugas}-${id_siswa}`).value;
    if (!nilai || nilai < 0 || nilai > 100) return alert("Nilai harus 0-100");
    const tugas = data.tugas.find(t => t.id === id_tugas);
    const sub = tugas.submissions.find(s => s.id_siswa === id_siswa);
    sub.nilai = parseInt(nilai);
    saveData();
    alert("Nilai disimpan!");
    renderTugasSubmissions();
}

function renderAdminAnalitik() {
    const container = document.getElementById("Analitik");
    const today = new Date().toISOString().split('T')[0];
    const absen = data.absensi.filter(a => a.tanggal === today);
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>📊 Statistik</h4>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${data.users.siswas.length}</h3><p>Siswa</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${data.users.gurus.length}</h3><p>Guru</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${data.kelas.length}</h3><p>Kelas</p>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 8px; text-align: center;">
                    <h3>${absen.filter(a => a.status === 'masuk').length}</h3><p>Hadir Hari Ini</p>
                </div>
            </div>
        </div>
    `;
}

// ========== ADMIN: LIHAT ABSENSI DENGAN FOTO ==========
function renderAdminAbsensi() {
    const container = document.getElementById("Absensi");
    let html = `<div class="dashboard-section"><h4>📊 Rekap Absensi</h4>`;
    if (data.absensi.length === 0) {
        html += "<p>Belum ada data.</p>";
    } else {
        html += `<table><tr><th>Tanggal</th><th>Nama</th><th>Kelas</th><th>Status</th><th>Waktu</th><th>Foto</th></tr>`;
        [...data.absensi].reverse().forEach(a => {
            const siswa = data.users.siswas.find(s => s.id == a.id_siswa);
            const namaKelas = siswa ? data.kelas.find(k => k.id === siswa.id_kelas)?.nama || "-" : "-";
            const namaSiswa = siswa ? siswa.nama : "Unknown";
            const fotoBtn = a.foto ? `<button class="small-btn" onclick="lihatFoto('${a.id}')">👁️ Lihat</button>` : '-';
            html += `<tr><td>${a.tanggal}</td><td>${namaSiswa}</td><td>${namaKelas}</td><td>${a.status}</td><td>${a.waktu || '-'}</td><td>${fotoBtn}</td></tr>`;
        });
        html += "</table>";
    }
    html += "</div>";
    container.innerHTML = html;
}

function lihatFoto(absensiId) {
    const absensi = data.absensi.find(a => a.id == absensiId);
    if (!absensi || !absensi.foto) return alert("Foto tidak tersedia");
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:9999;';
    modal.innerHTML = `
        <div style="background:white;padding:2rem;border-radius:12px;max-width:90%;max-height:90%;overflow:auto;">
            <h4>Foto Bukti Absensi - ${absensi.nama_siswa}</h4>
            <p>Status: ${absensi.status} | Tanggal: ${absensi.tanggal}</p>
            <img src="${absensi.foto}" style="max-width:100%;height:auto;border-radius:8px;margin:1rem 0;">
            <button onclick="this.parentElement.parentElement.remove()" style="width:100%;">Tutup</button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
}

// ========== ADMIN: MANAJEMEN SISWA & GURU ==========
function renderAdminManajemen() {
    const container = document.getElementById("Manajemen");
    container.innerHTML = `
        <div class="dashboard-section">
            <h4>👥 Manajemen Siswa</h4>
            <div class="form-container">
                <h5>Tambah Siswa</h5>
                <input type="text" id="new-siswa-nama" placeholder="Nama">
                <input type="text" id="new-siswa-nis" placeholder="NIS">
                <select id="new-siswa-kelas">${data.kelas.map(k => `<option value="${k.id}">${k.nama}</option>`).join("")}</select>
                <input type="password" id="new-siswa-pass" placeholder="Password">
                <button onclick="tambahSiswa()">Tambah</button>
            </div>
            <table>
                <tr><th>Nama</th><th>NIS</th><th>Kelas</th><th>Aksi</th></tr>
                ${data.users.siswas.map(s => {
                    const namaKelas = data.kelas.find(k => k.id == s.id_kelas)?.nama || "-";
                    return `<tr><td>${s.nama}</td><td>${s.nis}</td><td>${namaKelas}</td><td><button class="small-btn delete" onclick="hapusSiswa(${s.id})">Hapus</button></td></tr>`;
                }).join("")}
            </table>
        </div>
        <div class="dashboard-section">
            <h4>👨‍🏫 Manajemen Guru</h4>
            <div class="form-container">
                <h5>Tambah Guru</h5>
                <input type="text" id="new-guru-nama" placeholder="Nama Guru">
                <input type="email" id="new-guru-email" placeholder="Email (opsional)">
                <input type="password" id="new-guru-pass" placeholder="Password">
                <button onclick="tambahGuru()">Tambah Guru</button>
            </div>
            <table>
                <tr><th>Nama</th><th>Email</th><th>Aksi</th></tr>
                ${data.users.gurus.map(g => `<tr><td>${g.nama}</td><td>${g.email || '-'}</td><td><button class="small-btn delete" onclick="hapusGuru(${g.id})">Hapus</button></td></tr>`).join("")}
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
    
    if (data.users.siswas.some(s => s.nis === nis)) return alert("NIS sudah terdaftar!");
    
    data.users.siswas.push({
        id: Date.now(),
        nama, nis, id_kelas, password,
        email: ''
    });
    saveData();
    alert("Siswa berhasil ditambahkan!");
    renderAdminManajemen();
}

function hapusSiswa(id) {
    if (!confirm("Yakin hapus siswa ini?")) return;
    data.users.siswas = data.users.siswas.filter(s => s.id !== id);
    data.absensi = data.absensi.filter(a => a.id_siswa !== id);
    saveData();
    alert("Siswa berhasil dihapus!");
    renderAdminManajemen();
}

function tambahGuru() {
    const nama = document.getElementById("new-guru-nama").value;
    const email = document.getElementById("new-guru-email").value;
    const password = document.getElementById("new-guru-pass").value;
    if (!nama || !password) return alert("Nama dan password harus diisi!");
    
    if (email && data.users.gurus.some(g => g.email === email)) {
        return alert("Email sudah terdaftar!");
    }
    
    data.users.gurus.push({
        id: Date.now(),
        nama,
        email: email || '',
        password,
        jadwal: []
    });
    saveData();
    alert("Guru berhasil ditambahkan!");
    document.getElementById("new-guru-nama").value = "";
    document.getElementById("new-guru-email").value = "";
    document.getElementById("new-guru-pass").value = "";
    renderAdminManajemen();
}

function hapusGuru(id) {
    if (!confirm("Yakin hapus guru ini?")) return;
    data.users.gurus = data.users.gurus.filter(g => g.id !== id);
    data.tugas = data.tugas.filter(t => t.id_guru !== id);
    data.materi = data.materi.filter(m => m.id_guru !== id);
    saveData();
    alert("Guru berhasil dihapus!");
    renderAdminManajemen();
}

function renderAdminManajemenJadwal() {
    const container = document.getElementById("JadwalPelajaran");
    let html = '<div class="dashboard-section"><h4>📚 Jadwal Pelajaran</h4>';
    data.kelas.forEach(kelas => {
        const jadwal = data.jadwalPelajaran[kelas.id] || [];
        html += `<div class="form-container"><h5>${kelas.nama}</h5>`;
        if (jadwal.length > 0) {
            const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            html += '<table><tr><th>Hari</th><th>Jam</th><th>Mapel</th><th>Aksi</th></tr>';
            jadwal.forEach(j => {
                html += `<tr><td>${namaHari[j.hari]}</td><td>${j.jamMulai}-${j.jamSelesai}</td><td>${j.mataPelajaran}</td><td><button class="small-btn delete" onclick="hapusJadwalPelajaran(${kelas.id}, ${j.id})">Hapus</button></td></tr>`;
            });
            html += '</table>';
        } else {
            html += '<p>Belum ada jadwal.</p>';
        }
        html += `<h6>Tambah Jadwal</h6>
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
        <button onclick="tambahJadwalPelajaran(${kelas.id})">Tambah</button>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function tambahJadwalPelajaran(id_kelas) {
    const hari = parseInt(document.getElementById(`jp-hari-${id_kelas}`).value);
    const mapel = document.getElementById(`jp-mapel-${id_kelas}`).value;
    const mulai = document.getElementById(`jp-mulai-${id_kelas}`).value;
    const selesai = document.getElementById(`jp-selesai-${id_kelas}`).value;
    if (!mapel || !mulai || !selesai) return alert("Semua field harus diisi!");
    
    if (!data.jadwalPelajaran[id_kelas]) data.jadwalPelajaran[id_kelas] = [];
    data.jadwalPelajaran[id_kelas].push({
        id: Date.now(),
        hari, jamMulai: mulai, jamSelesai: selesai, mataPelajaran: mapel
    });
    saveData();
    alert("Jadwal berhasil ditambahkan!");
    renderAdminManajemenJadwal();
}

function hapusJadwalPelajaran(id_kelas, id_jadwal) {
    if (!confirm("Yakin hapus jadwal ini?")) return;
    if (data.jadwalPelajaran[id_kelas]) {
        data.jadwalPelajaran[id_kelas] = data.jadwalPelajaran[id_kelas].filter(j => j.id !== id_jadwal);
    }
    saveData();
    alert("Jadwal berhasil dihapus!");
    renderAdminManajemenJadwal();
}

function renderAdminPengumuman() {
    const container = document.getElementById("Pengumuman");
    let html = `<div class="dashboard-section"><h4>📢 Kelola Pengumuman</h4>
    <div class="form-container">
        <input type="text" id="admin-pengumuman-judul" placeholder="Judul">
        <textarea id="admin-pengumuman-isi" placeholder="Isi pengumuman"></textarea>
        <button onclick="buatPengumumanAdmin()">Kirim</button>
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
        id: Date.now(), judul, isi,
        nama_guru: "Admin",
        tanggal: new Date().toISOString().split('T')[0]
    });
    saveData();
    alert("Pengumuman berhasil dibuat!");
    document.getElementById("admin-pengumuman-judul").value = "";
    document.getElementById("admin-pengumuman-isi").value = "";
    renderAdminPengumumanList();
}

function renderAdminPengumumanList() {
    const container = document.getElementById("admin-pengumuman-list");
    if (!container) return;
    container.innerHTML = "<h4>Daftar Pengumuman</h4>";
    if (data.pengumuman.length > 0) {
        [...data.pengumuman].reverse().forEach(p => {
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

function hapusPengumuman(id) {
    if (!confirm('Yakin hapus pengumuman ini?')) return;
    data.pengumuman = data.pengumuman.filter(p => p.id !== id);
    saveData();
    alert("Pengumuman berhasil dihapus!");
    renderAdminPengumumanList();
}

// INISIALISASI
document.addEventListener('DOMContentLoaded', loadDataAndInit)
