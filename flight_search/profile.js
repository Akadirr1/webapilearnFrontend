// Tailwind CSS Configuration
tailwind.config = {
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				"primary": "#005A9C",
				"secondary": "#00B2A9",
				"background-light": "#F8F9FA",
				"background-dark": "#101922",
				"text-light": "#343A40",
				"text-dark": "#F8F9FA",
				"border-light": "#DEE2E6",
				"border-dark": "#343A40",
				"error": "#DC3545",
				"success": "#28A745"
			},
			fontFamily: {
				"display": ["Work Sans", "sans-serif"]
			},
			borderRadius: {
				"DEFAULT": "0.25rem",
				"lg": "0.5rem",
				"xl": "0.75rem",
				"full": "9999px"
			},
		},
	},
}

// Profile Page Handler
document.addEventListener('DOMContentLoaded', function () {
	// Elements
	const reservationsContainer = document.getElementById('reservations-container');
	const loadingState = document.getElementById('loading-state');
	const noReservations = document.getElementById('no-reservations');
	const errorState = document.getElementById('error-state');
	const errorMessage = document.getElementById('error-message');
	const reservationCount = document.getElementById('reservation-count');
	const retryBtn = document.getElementById('retry-btn');
	const logoutBtn = document.getElementById('logout-btn');
	const userName = document.getElementById('user-name');
	const userEmail = document.getElementById('user-email');

	// Password change elements
	const changePasswordBtn = document.getElementById('change-password-btn');
	const passwordModal = document.getElementById('password-modal');
	const closeModalBtn = document.getElementById('close-modal-btn');
	const cancelBtn = document.getElementById('cancel-btn');
	const passwordForm = document.getElementById('password-change-form');
	const oldPasswordInput = document.getElementById('old-password');
	const newPasswordInput = document.getElementById('new-password');
	const confirmPasswordInput = document.getElementById('confirm-password');
	const passwordError = document.getElementById('password-error');
	const passwordSuccess = document.getElementById('password-success');

	// User data
	let currentUser = null;

	// Initialize
	init();

	function init() {
		// Logout functionality
		if (logoutBtn) {
			logoutBtn.addEventListener('click', handleLogout);
		}

		// Retry button
		if (retryBtn) {
			retryBtn.addEventListener('click', loadReservations);
		}

		// Password change modal
		if (changePasswordBtn) {
			changePasswordBtn.addEventListener('click', openPasswordModal);
		}

		if (closeModalBtn) {
			closeModalBtn.addEventListener('click', closePasswordModal);
		}

		if (cancelBtn) {
			cancelBtn.addEventListener('click', closePasswordModal);
		}

		if (passwordForm) {
			passwordForm.addEventListener('submit', handlePasswordChange);
		}

		// Close modal on outside click
		if (passwordModal) {
			passwordModal.addEventListener('click', function (e) {
				if (e.target === passwordModal) {
					closePasswordModal();
				}
			});
		}

		// Load user info first, then reservations
		loadUserInfo();
	}

	// Open Password Modal
	function openPasswordModal() {
		passwordModal.classList.remove('hidden');
		passwordModal.classList.add('flex');
		passwordForm.reset();
		passwordError.classList.add('hidden');
		passwordSuccess.classList.add('hidden');
	}

	// Close Password Modal
	function closePasswordModal() {
		passwordModal.classList.add('hidden');
		passwordModal.classList.remove('flex');
		passwordForm.reset();
		passwordError.classList.add('hidden');
		passwordSuccess.classList.add('hidden');
	}

	// Handle Password Change
	async function handlePasswordChange(e) {
		e.preventDefault();

		// Hide previous messages
		passwordError.classList.add('hidden');
		passwordSuccess.classList.add('hidden');

		const oldPassword = oldPasswordInput.value.trim();
		const newPassword = newPasswordInput.value.trim();
		const confirmPassword = confirmPasswordInput.value.trim();

		// Validation
		if (!oldPassword || !newPassword || !confirmPassword) {
			showPasswordError('Lütfen tüm alanları doldurun.');
			return;
		}

		if (newPassword !== confirmPassword) {
			showPasswordError('Yeni şifreler eşleşmiyor.');
			return;
		}

		if (newPassword.length < 6) {
			showPasswordError('Yeni şifre en az 6 karakter olmalıdır.');
			return;
		}

		if (oldPassword === newPassword) {
			showPasswordError('Yeni şifre, eski şifre ile aynı olamaz.');
			return;
		}

		// Disable submit button
		const submitBtn = document.getElementById('submit-password-btn');
		submitBtn.disabled = true;
		submitBtn.textContent = 'Değiştiriliyor...';

		try {
			const response = await fetch('https://localhost:5000/api/Auth/Re-Password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					oldPassword: oldPassword,
					newPassword: newPassword
				})
			});

			if (response.ok) {
				showPasswordSuccess('Şifreniz başarıyla değiştirildi!');
				passwordForm.reset();

				// Close modal after 2 seconds
				setTimeout(() => {
					closePasswordModal();
				}, 2000);
			} else {
				const errorText = await response.text();
				console.error('Password change error:', errorText);

				if (response.status === 400) {
					showPasswordError('Mevcut şifre yanlış.');
				} else if (response.status === 401) {
					showPasswordError('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
					setTimeout(() => {
						window.location.href = '../login_screen/code.html';
					}, 2000);
				} else {
					showPasswordError('Şifre değiştirilemedi. Lütfen tekrar deneyin.');
				}
			}
		} catch (error) {
			console.error('Password change error:', error);
			showPasswordError('Bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
		} finally {
			submitBtn.disabled = false;
			submitBtn.textContent = 'Değiştir';
		}
	}

	// Show Password Error
	function showPasswordError(message) {
		passwordError.textContent = message;
		passwordError.classList.remove('hidden');
		passwordSuccess.classList.add('hidden');
	}

	// Show Password Success
	function showPasswordSuccess(message) {
		passwordSuccess.textContent = message;
		passwordSuccess.classList.remove('hidden');
		passwordError.classList.add('hidden');
	}

	// Load User Info
	async function loadUserInfo() {
		try {
			const response = await fetch(`${API_BASE_URL}/Auth/CheckStatus`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include' // Cookie'yi göndermek için gerekli
			});

			console.log('CheckStatus Response Status:', response.status);

			if (response.ok) {
				const userData = await response.json();
				console.log('User Data:', userData);

				if (userData.isLoggedIn) {
					currentUser = userData;

					// Display user info
					if (userData.ad && userData.soyad) {
						userName.textContent = `${userData.ad} ${userData.soyad}`;
					} else if (userData.ad) {
						userName.textContent = userData.ad;
					} else {
						userName.textContent = 'Hoş Geldiniz';
					}

					if (userData.email) {
						userEmail.textContent = userData.email;
					} else {
						userEmail.textContent = 'Email bulunamadı';
					}

					// Load reservations
					loadReservations();
				} else {
					// Not logged in - redirect to login
					console.log('Kullanıcı giriş yapmamış - Login sayfasına yönlendiriliyorsunuz...');
					window.location.href = '../login_screen/code.html';
				}
			} else if (response.status === 401) {
				// Unauthorized - redirect to login
				console.error('Yetkisiz erişim - Login sayfasına yönlendiriliyorsunuz...');
				window.location.href = '../login_screen/code.html';
			} else {
				// Other error - still try to load reservations
				console.error('Kullanıcı bilgisi alınamadı');
				userName.textContent = 'Hoş Geldiniz';
				userEmail.textContent = 'Bilgi yüklenemedi';
				loadReservations();
			}
		} catch (error) {
			console.error('Kullanıcı bilgisi yükleme hatası:', error);
			userName.textContent = 'Hoş Geldiniz';
			userEmail.textContent = 'Bilgi yüklenemedi';
			// Continue to load reservations anyway
			loadReservations();
		}
	}

	// Load Reservations
	async function loadReservations() {
		// Hide all states
		loadingState.classList.remove('hidden');
		noReservations.classList.add('hidden');
		errorState.classList.add('hidden');
		reservationsContainer.innerHTML = '';

		try {
			const response = await fetch(`${API_BASE_URL}/Rezervasyon`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include' // Cookie'yi göndermek için gerekli
			});

			console.log('Response Status:', response.status);

			if (response.ok) {
				const reservations = await response.json();
				console.log('Rezervasyonlar:', reservations);

				// Hide loading
				loadingState.classList.add('hidden');

				if (reservations && reservations.length > 0) {
					// Display reservations
					displayReservations(reservations);
					reservationCount.textContent = `${reservations.length} aktif rezervasyon`;
				} else {
					// No reservations found
					noReservations.classList.remove('hidden');
					reservationCount.textContent = '0 rezervasyon';
				}
			} else if (response.status === 401) {
				// Unauthorized - redirect to login
				console.error('Yetkisiz erişim - Login sayfasına yönlendiriliyorsunuz...');
				window.location.href = '../login_screen/code.html';
			} else {
				const errorText = await response.text();
				console.error('API Error:', errorText);
				throw new Error(errorText || 'Rezervasyonlar yüklenemedi');
			}
		} catch (error) {
			console.error('Rezervasyon yükleme hatası:', error);
			loadingState.classList.add('hidden');
			errorState.classList.remove('hidden');
			errorMessage.textContent = error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
		}
	}

	// Display Reservations
	function displayReservations(reservations) {
		reservationsContainer.innerHTML = '';

		reservations.forEach(reservation => {
			const reservationCard = createReservationCard(reservation);
			reservationsContainer.appendChild(reservationCard);
		});
	}

	// Create Reservation Card
	function createReservationCard(reservation) {
		const card = document.createElement('div');
		card.className = 'rounded-xl border border-border-light dark:border-border-dark bg-white/70 dark:bg-background-dark/70 p-6 shadow-lg backdrop-blur-sm hover:shadow-xl transition';

		// Parse dates if available
		let kalkisDate, varisDate, kalkisSaat, varisSaat, kalkisTarihStr, varisTarihStr;
		let hasDateInfo = false;

		// Check if ucus object exists, otherwise use direct properties
		const hasUcusObject = reservation.ucus != null;

		if (hasUcusObject && reservation.ucus.kalkisTarihi) {
			// If ucus object exists with dates, use it
			kalkisDate = new Date(reservation.ucus.kalkisTarihi || reservation.ucus.kalkisSaati);
			varisDate = new Date(reservation.ucus.varisTarihi || reservation.ucus.varisSaati);
			kalkisSaat = kalkisDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
			varisSaat = varisDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
			kalkisTarihStr = kalkisDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
			varisTarihStr = varisDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
			hasDateInfo = true;
		} else if (reservation.kalkisTarihi) {
			// If direct kalkisTarihi property exists
			kalkisDate = new Date(reservation.kalkisTarihi);
			kalkisSaat = kalkisDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
			kalkisTarihStr = kalkisDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
			hasDateInfo = true;

			// If there's also varisTarihi
			if (reservation.varisTarihi) {
				varisDate = new Date(reservation.varisTarihi);
				varisSaat = varisDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
				varisTarihStr = varisDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
			}
		}

		// Get location info - either from ucus object or direct properties
		const kalkisYeri = hasUcusObject ? reservation.ucus.kalkisYeri : reservation.kalkisYeri;
		const varisYeri = hasUcusObject ? reservation.ucus.varisYeri : reservation.varisYeri;
		const ucakAdi = hasUcusObject ? (reservation.ucus.ucakAdi || 'Uçak Bilgisi') : 'Uçak Bilgisi';
		const ucusNo = hasUcusObject ? (reservation.ucus.ucusNo || reservation.ucus.id) : (reservation.ucusId || 'N/A');

		// Format seat numbers
		const seatNumbers = reservation.koltukNumaralari || reservation.koltukNumaralari || [];
		const seatLabels = seatNumbers.map(num => convertSeatNumberToLabel(num)).join(', ');

		// Use PNR code if available
		const reservationId = reservation.pnrKodu || reservation.id || 'N/A';

		// Use toplamTutar instead of toplamFiyat
		const totalPrice = reservation.toplamTutar || reservation.toplamFiyat;

		card.innerHTML = `
			<div class="flex flex-col gap-4">
				<!-- Header -->
				<div class="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border-light dark:border-border-dark">
					<div class="flex items-center gap-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<span class="material-symbols-outlined text-2xl text-primary">confirmation_number</span>
						</div>
						<div>
							<p class="text-xs text-gray-500 dark:text-gray-400">PNR Kodu</p>
							<p class="text-lg font-bold text-text-light dark:text-text-dark">${reservationId}</p>
						</div>
					</div>
					<div class="flex items-center gap-2">
						<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(reservation.durum)}">
							${getStatusText(reservation.durum)}
						</span>
					</div>
				</div>

				<!-- Flight Date (if available) -->
				${hasDateInfo ? `
				<div class="bg-primary/5 rounded-lg p-4 text-center border border-primary/20">
					<div class="flex items-center justify-center gap-2 mb-2">
						<span class="material-symbols-outlined text-primary text-xl">event</span>
						<p class="text-sm font-semibold text-primary">Uçuş Tarihi</p>
					</div>
					<p class="text-2xl font-black text-text-light dark:text-text-dark">${kalkisTarihStr}</p>
					<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Kalkış Saati: ${kalkisSaat}</p>
				</div>
				` : ''}

				<!-- Flight Route Info -->
				<div class="flex items-center justify-center gap-4 py-4">
					<div class="text-center">
						<p class="text-3xl font-black text-primary">${kalkisYeri || 'N/A'}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Kalkış</p>
					</div>
					<div class="flex flex-col items-center px-6">
						<span class="material-symbols-outlined text-primary text-4xl">flight</span>
						<div class="w-24 h-px bg-primary my-2"></div>
						<p class="text-xs text-gray-500 dark:text-gray-500">Uçuş ${ucusNo}</p>
					</div>
					<div class="text-center">
						<p class="text-3xl font-black text-primary">${varisYeri || 'N/A'}</p>
						<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Varış</p>
					</div>
				</div>

				<!-- Flight Details (if ucus object available) -->
				${hasUcusObject && varisDate ? `
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center py-2 border-y border-border-light dark:border-border-dark">
					<!-- Plane Info -->
					<div class="text-center">
						<p class="text-xs text-gray-500 dark:text-gray-400">Uçak</p>
						<p class="text-sm font-semibold text-text-light dark:text-text-dark mt-1">${ucakAdi}</p>
					</div>
					
					<!-- Arrival Time -->
					<div class="text-center">
						<p class="text-xs text-gray-500 dark:text-gray-400">Varış</p>
						<p class="text-xl font-bold text-text-light dark:text-text-dark mt-1">${varisSaat}</p>
						<p class="text-xs text-gray-500 dark:text-gray-500">${varisTarihStr}</p>
					</div>
				</div>
				` : ''}

				<!-- Seat and Price Info -->
				<div class="flex flex-wrap items-center justify-between gap-4 pt-2">
					<div class="flex items-center gap-6">
						<div>
							<p class="text-xs text-gray-500 dark:text-gray-400">Koltuk Numaraları</p>
							<p class="text-sm font-semibold text-text-light dark:text-text-dark mt-1">
								${seatLabels || 'Belirtilmemiş'}
							</p>
						</div>
						<div>
							<p class="text-xs text-gray-500 dark:text-gray-400">Yolcu Sayısı</p>
							<p class="text-sm font-semibold text-text-light dark:text-text-dark mt-1">
								${seatNumbers.length} Kişi
							</p>
						</div>
					</div>
					<div class="text-right">
						<p class="text-xs text-gray-500 dark:text-gray-400">Toplam Tutar</p>
						<p class="text-2xl font-black text-primary mt-1">
							${totalPrice ? '₺ ' + formatPrice(totalPrice) : 'N/A'}
						</p>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex justify-end gap-3 pt-4 border-t border-border-light dark:border-border-dark">
					<button class="cancel-reservation-btn flex items-center gap-2 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white hover:bg-error/90 transition"
						data-reservation-id="${reservation.id}"
						data-pnr="${reservationId}">
						<span class="material-symbols-outlined text-base">cancel</span>
						Rezervasyonu İptal Et
					</button>
				</div>

				<!-- Reservation Date -->
				<div class="text-center pt-2">
					<p class="text-xs text-gray-400 dark:text-gray-500">
						Rezervasyon Tarihi: ${reservation.rezervasyonTarihi ? new Date(reservation.rezervasyonTarihi).toLocaleString('tr-TR') : 'Belirtilmemiş'}
					</p>
				</div>
			</div>
		`;

		// Add click event to cancel button
		const cancelBtn = card.querySelector('.cancel-reservation-btn');
		if (cancelBtn) {
			cancelBtn.addEventListener('click', function () {
				const reservationId = this.getAttribute('data-reservation-id');
				const pnr = this.getAttribute('data-pnr');
				cancelReservation(reservationId, pnr);
			});
		}

		return card;
	}

	// Convert seat number to label (e.g., 1 -> 1A, 7 -> 2A)
	function convertSeatNumberToLabel(seatNumber) {
		const num = parseInt(seatNumber);
		const row = Math.ceil(num / 6);
		const col = ((num - 1) % 6);
		const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
		return `${row}${columns[col]}`;
	}

	// Cancel Reservation
	async function cancelReservation(reservationId, pnr) {
		// Confirm cancellation
		const confirmCancel = confirm(`${pnr} PNR kodlu rezervasyonunuzu iptal etmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz.`);

		if (!confirmCancel) {
			return;
		}

		try {
			// Show loading
			const cancelBtns = document.querySelectorAll('.cancel-reservation-btn');
			cancelBtns.forEach(btn => {
				if (btn.getAttribute('data-reservation-id') === reservationId) {
					btn.disabled = true;
					btn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">autorenew</span> İptal ediliyor...';
				}
			});

			const response = await fetch(`${API_BASE_URL}/Rezervasyon?rezervasyonId=${reservationId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include' // Cookie'yi göndermek için gerekli
			});

			console.log('Cancel Response Status:', response.status);

			if (response.ok) {
				// Success
				alert(`Rezervasyonunuz başarıyla iptal edildi.\nPNR: ${pnr}`);

				// Reload reservations
				loadReservations();
			} else {
				const errorText = await response.text();
				console.error('Cancel Error:', errorText);
				throw new Error(errorText || 'Rezervasyon iptal edilemedi');
			}
		} catch (error) {
			console.error('Rezervasyon iptal hatası:', error);
			alert('Rezervasyon iptal edilirken bir hata oluştu.\n\nHata: ' + error.message);

			// Re-enable buttons
			const cancelBtns = document.querySelectorAll('.cancel-reservation-btn');
			cancelBtns.forEach(btn => {
				if (btn.getAttribute('data-reservation-id') === reservationId) {
					btn.disabled = false;
					btn.innerHTML = '<span class="material-symbols-outlined text-base">cancel</span> Rezervasyonu İptal Et';
				}
			});
		}
	}

	// Get status color
	function getStatusColor(status) {
		switch (status?.toLowerCase()) {
			case 'aktif':
			case 'onaylandı':
			case 'confirmed':
				return 'bg-success/10 text-success';
			case 'beklemede':
			case 'pending':
				return 'bg-yellow-500/10 text-yellow-600';
			case 'iptal':
			case 'cancelled':
				return 'bg-error/10 text-error';
			default:
				return 'bg-gray-500/10 text-gray-600';
		}
	}

	// Get status text
	function getStatusText(status) {
		return status || 'Aktif';
	}

	// Format price
	function formatPrice(price) {
		return new Intl.NumberFormat('tr-TR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(price);
	}

	// Handle Logout
	async function handleLogout() {
		try {
			const response = await fetch(`${API_BASE_URL}/Auth/Logout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include' // Cookie'yi göndermek için gerekli
			});

			// Başarılı ya da başarısız, her türlü login'e yönlendir
			window.location.href = '../login_screen/code.html';

		} catch (error) {
			console.error('Logout hatası:', error);
			// Hata olsa bile login'e yönlendir
			window.location.href = '../login_screen/code.html';
		}
	}
});
