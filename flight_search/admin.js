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

// Admin Panel Handler
document.addEventListener('DOMContentLoaded', function () {
	// Elements
	const reservationsContainer = document.getElementById('reservations-container');
	const loadingState = document.getElementById('loading-state');
	const noReservations = document.getElementById('no-reservations');
	const errorState = document.getElementById('error-state');
	const errorMessage = document.getElementById('error-message');
	const showingCount = document.getElementById('showing-count');
	const retryBtn = document.getElementById('retry-btn');
	const logoutBtn = document.getElementById('logout-btn');
	const adminDisplayName = document.getElementById('admin-display-name');

	// Stats elements
	const totalCount = document.getElementById('total-count');
	const activeCount = document.getElementById('active-count');
	const cancelledCount = document.getElementById('cancelled-count');
	const totalRevenue = document.getElementById('total-revenue');

	// Filter elements
	const filterPnr = document.getElementById('filter-pnr');
	const filterDeparture = document.getElementById('filter-departure');
	const filterArrival = document.getElementById('filter-arrival');
	const filterStatus = document.getElementById('filter-status');
	const applyFiltersBtn = document.getElementById('apply-filters-btn');
	const clearFiltersBtn = document.getElementById('clear-filters-btn');

	// Modal elements
	const createFlightBtn = document.getElementById('create-flight-btn');
	const createFlightModal = document.getElementById('create-flight-modal');
	const closeModalBtn = document.getElementById('close-modal-btn');
	const cancelModalBtn = document.getElementById('cancel-modal-btn');
	const createFlightForm = document.getElementById('create-flight-form');
	const modalLoading = document.getElementById('modal-loading');

	// Plane modal elements
	const createPlaneBtn = document.getElementById('create-plane-btn');
	const createPlaneModal = document.getElementById('create-plane-modal');
	const closePlaneModalBtn = document.getElementById('close-plane-modal-btn');
	const cancelPlaneModalBtn = document.getElementById('cancel-plane-modal-btn');
	const createPlaneForm = document.getElementById('create-plane-form');
	const planeModalLoading = document.getElementById('plane-modal-loading');
	const planeError = document.getElementById('plane-error');
	const planeSuccess = document.getElementById('plane-success');
	const planeModelInput = document.getElementById('plane-model');
	const planeCapacityInput = document.getElementById('plane-capacity');
	const planeIdHidden = document.getElementById('plane-id-hidden');
	const planeModalTitle = document.getElementById('plane-modal-title-text');
	const submitPlaneBtnText = document.getElementById('submit-plane-btn-text');

	// Tab elements
	const tabReservations = document.getElementById('tab-reservations');
	const tabFlights = document.getElementById('tab-flights');
	const tabPlanes = document.getElementById('tab-planes');
	const contentReservations = document.getElementById('content-reservations');
	const contentFlights = document.getElementById('content-flights');
	const contentPlanes = document.getElementById('content-planes');

	// Flights elements
	const flightsLoading = document.getElementById('flights-loading');
	const flightsList = document.getElementById('flights-list');
	const noFlights = document.getElementById('no-flights');
	const flightsErrorState = document.getElementById('flights-error-state');
	const flightsErrorMessage = document.getElementById('flights-error-message');
	const flightsRetryBtn = document.getElementById('flights-retry-btn');
	const flightsTotalCount = document.getElementById('flights-total-count');
	const flightsAvailableSeats = document.getElementById('flights-available-seats');
	const flightsBookedSeats = document.getElementById('flights-booked-seats');

	// Planes elements
	const planesLoading = document.getElementById('planes-loading');
	const planesList = document.getElementById('planes-list');
	const planesContainer = document.getElementById('planes-container');
	const noPlanes = document.getElementById('no-planes');
	const planesErrorState = document.getElementById('planes-error-state');
	const planesErrorMessage = document.getElementById('planes-error-message');
	const planesRetryBtn = document.getElementById('planes-retry-btn');
	const planesTotalCount = document.getElementById('planes-total-count');
	const planesTotalCapacity = document.getElementById('planes-total-capacity');
	const planesAvgCapacity = document.getElementById('planes-avg-capacity');
	const planesShowingCount = document.getElementById('planes-showing-count');
	const addFirstPlaneBtn = document.getElementById('add-first-plane-btn');

	// Data
	let allReservations = [];
	let filteredReservations = [];
	let allFlights = [];
	let allPlanes = [];
	let currentTab = 'reservations';

	// Initialize
	init();

	function init() {
		// Check admin access
		checkAdminAccess();

		// Logout functionality
		if (logoutBtn) {
			logoutBtn.addEventListener('click', handleLogout);
		}

		// Retry button
		if (retryBtn) {
			retryBtn.addEventListener('click', loadReservations);
		}

		// Filter buttons
		if (applyFiltersBtn) {
			applyFiltersBtn.addEventListener('click', applyFilters);
		}

		if (clearFiltersBtn) {
			clearFiltersBtn.addEventListener('click', clearFilters);
		}

		// Modal buttons
		if (createFlightBtn) {
			createFlightBtn.addEventListener('click', openModal);
		}

		if (closeModalBtn) {
			closeModalBtn.addEventListener('click', closeModal);
		}

		if (cancelModalBtn) {
			cancelModalBtn.addEventListener('click', closeModal);
		}

		if (createFlightForm) {
			createFlightForm.addEventListener('submit', handleCreateFlight);
		}

		// Close modal on outside click
		if (createFlightModal) {
			createFlightModal.addEventListener('click', (e) => {
				if (e.target === createFlightModal) {
					closeModal();
				}
			});
		}

		// Plane modal buttons
		if (createPlaneBtn) {
			createPlaneBtn.addEventListener('click', openPlaneModal);
		}

		if (closePlaneModalBtn) {
			closePlaneModalBtn.addEventListener('click', closePlaneModal);
		}

		if (cancelPlaneModalBtn) {
			cancelPlaneModalBtn.addEventListener('click', closePlaneModal);
		}

		if (createPlaneForm) {
			createPlaneForm.addEventListener('submit', handleCreatePlane);
		}

		// Close plane modal on outside click
		if (createPlaneModal) {
			createPlaneModal.addEventListener('click', (e) => {
				if (e.target === createPlaneModal) {
					closePlaneModal();
				}
			});
		}

		// Set minimum datetime to now
		const departureDatetime = document.getElementById('departure-datetime');
		if (departureDatetime) {
			const now = new Date();
			now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
			departureDatetime.min = now.toISOString().slice(0, 16);
		}

		// Tab switching
		if (tabReservations) {
			tabReservations.addEventListener('click', () => switchTab('reservations'));
		}

		if (tabFlights) {
			tabFlights.addEventListener('click', () => switchTab('flights'));
		}

		if (tabPlanes) {
			tabPlanes.addEventListener('click', () => switchTab('planes'));
		}

		// Flights retry button
		if (flightsRetryBtn) {
			flightsRetryBtn.addEventListener('click', loadFlights);
		}

		// Planes retry button
		if (planesRetryBtn) {
			planesRetryBtn.addEventListener('click', loadPlanes);
		}

		// Add first plane button
		if (addFirstPlaneBtn) {
			addFirstPlaneBtn.addEventListener('click', openPlaneModal);
		}

		// Enter key on filters
		[filterPnr, filterDeparture, filterArrival].forEach(input => {
			if (input) {
				input.addEventListener('keypress', (e) => {
					if (e.key === 'Enter') {
						applyFilters();
					}
				});
			}
		});
	}

	// Check Admin Access
	async function checkAdminAccess() {
		try {
			const response = await fetch(`${API_BASE_URL}/Auth/CheckStatus`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			});

			if (response.ok) {
				const userData = await response.json();
				console.log('User Data:', userData);

				if (userData.isLoggedIn) {
					// Check if user is admin
					if (userData.role && userData.role.toLowerCase() === 'admin') {
						// Display admin name
						if (userData.ad && userData.soyad) {
							adminDisplayName.textContent = `${userData.ad} ${userData.soyad}`;
						} else if (userData.ad) {
							adminDisplayName.textContent = userData.ad;
						}

						// Load reservations
						loadReservations();
					} else {
						// Not admin - redirect to customer page
						alert('Bu sayfaya erişim yetkiniz yok. Müşteri sayfasına yönlendiriliyorsunuz.');
						window.location.href = 'code.html';
					}
				} else {
					// Not logged in
					window.location.href = '../login_screen/code.html';
				}
			} else {
				// Error
				window.location.href = '../login_screen/code.html';
			}
		} catch (error) {
			console.error('Admin check error:', error);
			window.location.href = '../login_screen/code.html';
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
			const response = await fetch(`${API_BASE_URL}/Rezervasyon/GetRezAdmin`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			});

			console.log('Response Status:', response.status);

			if (response.ok) {
				const reservations = await response.json();
				console.log('All Reservations:', reservations);

				allReservations = reservations;
				filteredReservations = reservations;

				// Hide loading
				loadingState.classList.add('hidden');

				if (reservations && reservations.length > 0) {
					// Update stats
					updateStats(reservations);

					// Display reservations
					displayReservations(reservations);
					showingCount.textContent = `${reservations.length} rezervasyon gösteriliyor`;
				} else {
					// No reservations found
					noReservations.classList.remove('hidden');
					showingCount.textContent = '0 rezervasyon';
					updateStats([]);
				}
			} else if (response.status === 401 || response.status === 403) {
				// Unauthorized
				alert('Bu sayfaya erişim yetkiniz yok.');
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

	// Update Stats
	function updateStats(reservations) {
		const total = reservations.length;
		const active = reservations.filter(r => !r.durum || r.durum.toLowerCase() !== 'iptal').length;
		const cancelled = reservations.filter(r => r.durum && r.durum.toLowerCase() === 'iptal').length;
		const revenue = reservations
			.filter(r => !r.durum || r.durum.toLowerCase() !== 'iptal')
			.reduce((sum, r) => sum + (r.toplamTutar || r.toplamFiyat || 0), 0);

		totalCount.textContent = total;
		activeCount.textContent = active;
		cancelledCount.textContent = cancelled;
		totalRevenue.textContent = '₺ ' + formatPrice(revenue);
	}

	// Apply Filters
	function applyFilters() {
		const pnr = filterPnr.value.trim().toLowerCase();
		const departure = filterDeparture.value.trim().toUpperCase();
		const arrival = filterArrival.value.trim().toUpperCase();
		const status = filterStatus.value.toLowerCase();

		filteredReservations = allReservations.filter(reservation => {
			let matches = true;

			if (pnr && !(reservation.pnrKodu || '').toLowerCase().includes(pnr)) {
				matches = false;
			}

			if (departure && reservation.kalkisYeri !== departure) {
				matches = false;
			}

			if (arrival && reservation.varisYeri !== arrival) {
				matches = false;
			}

			if (status) {
				const resStatus = (reservation.durum || 'aktif').toLowerCase();
				if (resStatus !== status) {
					matches = false;
				}
			}

			return matches;
		});

		if (filteredReservations.length > 0) {
			displayReservations(filteredReservations);
			noReservations.classList.add('hidden');
			showingCount.textContent = `${filteredReservations.length} rezervasyon gösteriliyor (${allReservations.length} toplam)`;
		} else {
			reservationsContainer.innerHTML = '';
			noReservations.classList.remove('hidden');
			showingCount.textContent = '0 rezervasyon gösteriliyor';
		}
	}

	// Clear Filters
	function clearFilters() {
		filterPnr.value = '';
		filterDeparture.value = '';
		filterArrival.value = '';
		filterStatus.value = '';

		filteredReservations = allReservations;
		displayReservations(allReservations);
		showingCount.textContent = `${allReservations.length} rezervasyon gösteriliyor`;
		noReservations.classList.add('hidden');
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
		card.className = 'rounded-xl border border-border-light dark:border-border-dark bg-white/70 dark:bg-background-dark/70 p-6 shadow-lg backdrop-blur-sm';

		// Get data
		const pnr = reservation.pnrKodu || reservation.id || 'N/A';
		const kalkisYeri = reservation.kalkisYeri || 'N/A';
		const varisYeri = reservation.varisYeri || 'N/A';
		const seatNumbers = reservation.koltukNumaralari || [];
		const seatLabels = seatNumbers.map(num => convertSeatNumberToLabel(num)).join(', ');
		const totalPrice = reservation.toplamTutar || reservation.toplamFiyat || 0;
		const status = reservation.durum || 'Aktif';

		let dateStr = '';
		if (reservation.kalkisTarihi) {
			const date = new Date(reservation.kalkisTarihi);
			dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
		}

		card.innerHTML = `
			<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
				<!-- PNR and Status -->
				<div class="md:col-span-2">
					<p class="text-xs text-gray-500 dark:text-gray-400">PNR Kodu</p>
					<p class="text-lg font-bold text-text-light dark:text-text-dark">${pnr}</p>
					<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${getStatusColor(status)}">
						${status}
					</span>
				</div>

				<!-- Route -->
				<div class="md:col-span-3 flex items-center justify-center gap-2">
					<div class="text-center">
						<p class="text-xl font-black text-primary">${kalkisYeri}</p>
					</div>
					<span class="material-symbols-outlined text-primary">arrow_forward</span>
					<div class="text-center">
						<p class="text-xl font-black text-primary">${varisYeri}</p>
					</div>
				</div>

				<!-- Date -->
				<div class="md:col-span-2 text-center">
					<p class="text-xs text-gray-500 dark:text-gray-400">Uçuş Tarihi</p>
					<p class="text-sm font-semibold text-text-light dark:text-text-dark">${dateStr || 'Belirtilmemiş'}</p>
				</div>

				<!-- Seats -->
				<div class="md:col-span-2 text-center">
					<p class="text-xs text-gray-500 dark:text-gray-400">Koltuklar</p>
					<p class="text-sm font-semibold text-text-light dark:text-text-dark">${seatLabels || 'N/A'}</p>
					<p class="text-xs text-gray-500">${seatNumbers.length} yolcu</p>
				</div>

				<!-- Price -->
				<div class="md:col-span-2 text-center">
					<p class="text-xs text-gray-500 dark:text-gray-400">Tutar</p>
					<p class="text-xl font-black text-primary">₺ ${formatPrice(totalPrice)}</p>
				</div>

				<!-- Reservation Date -->
				<div class="md:col-span-1 text-center text-xs text-gray-500 dark:text-gray-400">
					${reservation.rezervasyonTarihi ? new Date(reservation.rezervasyonTarihi).toLocaleDateString('tr-TR') : '-'}
				</div>
			</div>
		`;

		return card;
	}

	// Convert seat number to label
	function convertSeatNumberToLabel(seatNumber) {
		const num = parseInt(seatNumber);
		const row = Math.ceil(num / 6);
		const col = ((num - 1) % 6);
		const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
		return `${row}${columns[col]}`;
	}

	// Get status color
	function getStatusColor(status) {
		switch (status?.toLowerCase()) {
			case 'aktif':
			case 'onaylandı':
			case 'confirmed':
				return 'bg-success/10 text-success';
			case 'iptal':
			case 'cancelled':
				return 'bg-error/10 text-error';
			default:
				return 'bg-gray-500/10 text-gray-600';
		}
	}

	// Format price
	function formatPrice(price) {
		return new Intl.NumberFormat('tr-TR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(price);
	}

	// Open Modal
	function openModal() {
		createFlightModal.classList.remove('hidden');
		createFlightModal.classList.add('flex');

		// Reset form
		createFlightForm.reset();
		
		// Clear hidden field (create mode)
		document.getElementById('flight-id-hidden').value = '';
		
		// Set modal title and button text for create mode
		document.getElementById('flight-modal-title').textContent = 'Yeni Uçuş Oluştur';
		document.getElementById('flight-submit-btn-text').textContent = 'Uçuş Oluştur';

		// Set minimum datetime
		const departureDatetime = document.getElementById('departure-datetime');
		if (departureDatetime) {
			const now = new Date();
			now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
			departureDatetime.min = now.toISOString().slice(0, 16);
		}

		// Load planes for dropdown
		loadPlanesForDropdown();
	}
	
	// Open Modal for Update
	function openFlightModalForUpdate(flightId, departure, arrival, datetime, price, planeId) {
		createFlightModal.classList.remove('hidden');
		createFlightModal.classList.add('flex');
		
		// Normalize datetime to match input format (remove seconds and milliseconds)
		let normalizedDatetime = datetime;
		if (datetime) {
			// Convert to format: yyyy-MM-ddTHH:mm (without seconds)
			const date = new Date(datetime);
			if (!isNaN(date.getTime())) {
				normalizedDatetime = date.toISOString().slice(0, 16);
			}
		}
		
		// Set hidden field (update mode)
		document.getElementById('flight-id-hidden').value = flightId;
		
		// Store original values for comparison (use normalized datetime)
		document.getElementById('flight-original-departure').value = departure;
		document.getElementById('flight-original-arrival').value = arrival;
		document.getElementById('flight-original-datetime').value = normalizedDatetime;
		document.getElementById('flight-original-price').value = price;
		document.getElementById('flight-original-plane-id').value = planeId;
		
		// Set modal title and button text for update mode
		document.getElementById('flight-modal-title').textContent = 'Uçuş Güncelle';
		document.getElementById('flight-submit-btn-text').textContent = 'Güncelle';
		
		// Load planes first, then populate fields
		loadPlanesForDropdown().then(() => {
			// Populate form fields (use normalized datetime)
			document.getElementById('departure-city').value = departure;
			document.getElementById('arrival-city').value = arrival;
			document.getElementById('departure-datetime').value = normalizedDatetime;
			document.getElementById('flight-price').value = price;
			document.getElementById('plane-id').value = planeId;
		});
	}

	// Close Modal
	function closeModal() {
		createFlightModal.classList.add('hidden');
		createFlightModal.classList.remove('flex');
		modalLoading.classList.add('hidden');
		modalLoading.classList.remove('flex');
	}

	// Handle Create Flight
	async function handleCreateFlight(e) {
		e.preventDefault();
		
		// Check if we're in update mode
		const flightId = document.getElementById('flight-id-hidden').value;
		const isUpdateMode = flightId !== '';

		// Get form values
		const kalkisYeri = document.getElementById('departure-city').value;
		const varisYeri = document.getElementById('arrival-city').value;
		const kalkisTarihi = document.getElementById('departure-datetime').value;
		const fiyat = parseFloat(document.getElementById('flight-price').value);
		const ucakId = parseInt(document.getElementById('plane-id').value);

		// If in update mode, check if anything changed
		if (isUpdateMode) {
			const originalDeparture = document.getElementById('flight-original-departure').value;
			const originalArrival = document.getElementById('flight-original-arrival').value;
			const originalDatetime = document.getElementById('flight-original-datetime').value;
			const originalPrice = parseFloat(document.getElementById('flight-original-price').value);
			const originalPlaneId = parseInt(document.getElementById('flight-original-plane-id').value);
			
			// Check price equality with small epsilon for float comparison
			const priceChanged = Math.abs(fiyat - originalPrice) > 0.001;
			
			// Debug: Log comparison values
			console.log('Comparison Check:', {
				current: { kalkisYeri, varisYeri, kalkisTarihi, fiyat, ucakId },
				original: { originalDeparture, originalArrival, originalDatetime, originalPrice, originalPlaneId },
				checks: {
					departure: kalkisYeri === originalDeparture,
					arrival: varisYeri === originalArrival,
					datetime: kalkisTarihi === originalDatetime,
					price: !priceChanged,
					planeId: ucakId === originalPlaneId
				}
			});
			
			// Check if nothing changed
			if (kalkisYeri === originalDeparture && 
				varisYeri === originalArrival && 
				kalkisTarihi === originalDatetime && 
				!priceChanged && 
				ucakId === originalPlaneId) {
				alert('Hiçbir değişiklik yapılmadı. Lütfen değiştirmek istediğiniz alanları güncelleyin.');
				return;
			}
		}

		// Validate
		if (kalkisYeri === varisYeri) {
			alert('Kalkış ve varış yerleri aynı olamaz!');
			return;
		}

		if (fiyat <= 0) {
			alert('Fiyat 0\'dan büyük olmalıdır!');
			return;
		}

		if (!ucakId || isNaN(ucakId)) {
			alert('Lütfen bir uçak seçin!');
			return;
		}

		// Prepare request body (backend will set bosKoltukSayisi from ucak.kapasite)
		const requestBody = {
			kalkisYeri: kalkisYeri,
			varisYeri: varisYeri,
			kalkisTarihi: kalkisTarihi,
			fiyat: fiyat,
			ucakId: ucakId
		};

		console.log(isUpdateMode ? 'Updating flight:' : 'Creating flight:', requestBody);

		// Show loading
		modalLoading.classList.remove('hidden');
		modalLoading.classList.add('flex');

		try {
			// Determine URL and method based on mode
			const url = isUpdateMode 
				? `${API_BASE_URL}/Ucus/${flightId}`
				: `${API_BASE_URL}/Ucus`;
			const method = isUpdateMode ? 'PATCH' : 'POST';

			const response = await fetch(url, {
				method: method,
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(requestBody)
			});

			console.log('Response Status:', response.status);

			if (response.ok) {
				const result = await response.json();
				console.log(isUpdateMode ? 'Flight updated:' : 'Flight created:', result);

				// Success message
				const successMessage = isUpdateMode
					? `Uçuş başarıyla güncellendi!\n\n${kalkisYeri} → ${varisYeri}\nTarih: ${new Date(kalkisTarihi).toLocaleString('tr-TR')}\nFiyat: ₺${fiyat}`
					: `Uçuş başarıyla oluşturuldu!\n\n${kalkisYeri} → ${varisYeri}\nTarih: ${new Date(kalkisTarihi).toLocaleString('tr-TR')}\nFiyat: ₺${fiyat}`;
				
				alert(successMessage);

				// Close modal
				closeModal();

				// Reset form
				createFlightForm.reset();

				// Reload flights if on flights tab
				if (currentTab === 'flights') {
					loadFlights();
				}
			} else {
				const errorText = await response.text();
				console.error('API Error:', errorText);
				throw new Error(errorText || (isUpdateMode ? 'Uçuş güncellenemedi' : 'Uçuş oluşturulamadı'));
			}
		} catch (error) {
			console.error(isUpdateMode ? 'Uçuş güncelleme hatası:' : 'Uçuş oluşturma hatası:', error);
			alert((isUpdateMode ? 'Uçuş güncellenirken' : 'Uçuş oluşturulurken') + ' bir hata oluştu.\n\nHata: ' + error.message);
		} finally {
			// Hide loading
			modalLoading.classList.add('hidden');
			modalLoading.classList.remove('flex');
		}
	}

	// Handle Logout
	async function handleLogout() {
		try {
			const response = await fetch(`${API_BASE_URL}/Auth/Logout`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			});

			window.location.href = '../login_screen/code.html';
		} catch (error) {
			console.error('Logout hatası:', error);
			window.location.href = '../login_screen/code.html';
		}
	}

	// Switch Tab
	function switchTab(tab) {
		currentTab = tab;

		// Remove active from all tabs
		tabReservations.classList.remove('active', 'border-primary', 'text-primary');
		tabReservations.classList.add('border-transparent', 'text-gray-500');
		tabFlights.classList.remove('active', 'border-primary', 'text-primary');
		tabFlights.classList.add('border-transparent', 'text-gray-500');
		tabPlanes.classList.remove('active', 'border-primary', 'text-primary');
		tabPlanes.classList.add('border-transparent', 'text-gray-500');

		// Hide all content
		contentReservations.classList.add('hidden');
		contentFlights.classList.add('hidden');
		contentPlanes.classList.add('hidden');

		// Update tab buttons and show content
		if (tab === 'reservations') {
			tabReservations.classList.add('active', 'border-primary', 'text-primary');
			tabReservations.classList.remove('border-transparent', 'text-gray-500');
			contentReservations.classList.remove('hidden');
		} else if (tab === 'flights') {
			tabFlights.classList.add('active', 'border-primary', 'text-primary');
			tabFlights.classList.remove('border-transparent', 'text-gray-500');
			contentFlights.classList.remove('hidden');

			// Load flights if not loaded yet
			if (allFlights.length === 0) {
				loadFlights();
			}
		} else if (tab === 'planes') {
			tabPlanes.classList.add('active', 'border-primary', 'text-primary');
			tabPlanes.classList.remove('border-transparent', 'text-gray-500');
			contentPlanes.classList.remove('hidden');

			// Load planes if not loaded yet
			if (allPlanes.length === 0) {
				loadPlanes();
			}
		}
	}

	// Load Flights
	async function loadFlights() {
		// Show loading
		flightsLoading.classList.remove('hidden');
		flightsList.classList.add('hidden');
		noFlights.classList.add('hidden');
		flightsErrorState.classList.add('hidden');

		try {
			const response = await fetch(`${API_BASE_URL}/Ucus`, {
				method: 'GET',
				credentials: 'include'
			});

			console.log('Flights Response Status:', response.status);

			if (!response.ok) {
				throw new Error('Uçuşlar yüklenemedi');
			}

			const flights = await response.json();
			console.log('Flights loaded:', flights);

			allFlights = flights;

			// Hide loading
			flightsLoading.classList.add('hidden');

			// Show flights or no flights message
			if (flights.length === 0) {
				noFlights.classList.remove('hidden');
			} else {
				flightsList.classList.remove('hidden');
				displayFlights(flights);
			}

			// Update stats
			updateFlightStats(flights);

		} catch (error) {
			console.error('Uçuşlar yüklenirken hata:', error);
			flightsLoading.classList.add('hidden');
			flightsErrorState.classList.remove('hidden');
			flightsErrorMessage.textContent = error.message || 'Bir hata oluştu';
		}
	}

	// Display Flights
	async function displayFlights(flights) {
		flightsList.innerHTML = '';

		// Display each flight
		flights.forEach(flight => {
			// Get total seats from ucak.kapasite
			const totalSeats = flight.ucak?.kapasite || 54; // Default fallback
			const card = createFlightCard(flight, totalSeats);
			flightsList.appendChild(card);
		});
	}

	// Create Flight Card
	function createFlightCard(flight, totalSeats) {
		const card = document.createElement('div');
		card.className = 'rounded-xl border border-border-light dark:border-border-dark bg-white/70 dark:bg-background-dark/70 p-6 backdrop-blur-sm hover:shadow-lg transition-shadow';

		const kalkisTarihi = new Date(flight.kalkisTarihi);
		const formattedDate = kalkisTarihi.toLocaleDateString('tr-TR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		const formattedTime = kalkisTarihi.toLocaleTimeString('tr-TR', {
			hour: '2-digit',
			minute: '2-digit'
		});

		const doluKoltuk = totalSeats - flight.bosKoltukSayisi;
		const dolulukOrani = totalSeats > 0 ? ((doluKoltuk / totalSeats) * 100).toFixed(0) : 0;

		card.innerHTML = `
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<div class="flex items-center gap-4 mb-4">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-primary text-2xl">flight_takeoff</span>
							<span class="text-2xl font-bold text-text-light dark:text-text-dark">${flight.kalkisYeri}</span>
						</div>
						<span class="material-symbols-outlined text-gray-400">arrow_forward</span>
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-primary text-2xl">flight_land</span>
							<span class="text-2xl font-bold text-text-light dark:text-text-dark">${flight.varisYeri}</span>
						</div>
					</div>

					<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-gray-500 text-lg">event</span>
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Tarih</p>
								<p class="text-sm font-semibold text-text-light dark:text-text-dark">${formattedDate}</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-gray-500 text-lg">schedule</span>
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Saat</p>
								<p class="text-sm font-semibold text-text-light dark:text-text-dark">${formattedTime}</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-gray-500 text-lg">airline_seat_recline_normal</span>
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Boş Koltuk</p>
								<p class="text-sm font-semibold text-success">${flight.bosKoltukSayisi} / ${totalSeats}</p>
							</div>
						</div>
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-gray-500 text-lg">payments</span>
							<div>
								<p class="text-xs text-gray-500 dark:text-gray-400">Fiyat</p>
								<p class="text-sm font-semibold text-primary">₺ ${formatPrice(flight.fiyat)}</p>
							</div>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
							<span>Doluluk Oranı: ${dolulukOrani}%</span>
							<span>${doluKoltuk} / ${totalSeats} dolu</span>
						</div>
						<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
							<div class="h-2 rounded-full transition-all ${dolulukOrani >= 80 ? 'bg-error' : dolulukOrani >= 50 ? 'bg-warning' : 'bg-success'}" 
								style="width: ${dolulukOrani}%"></div>
						</div>
					</div>
				</div>

				<div class="ml-6 flex flex-col items-end gap-2">
					<span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${flight.bosKoltukSayisi > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}">
						<span class="material-symbols-outlined text-sm">${flight.bosKoltukSayisi > 0 ? 'check_circle' : 'cancel'}</span>
						${flight.bosKoltukSayisi > 0 ? 'Müsait' : 'Dolu'}
					</span>
					<div class="text-xs text-gray-500 dark:text-gray-400">
						<span class="material-symbols-outlined text-sm align-middle">tag</span>
						ID: ${flight.id}
					</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">
						<span class="material-symbols-outlined text-sm align-middle">connecting_airports</span>
						Uçak: ${flight.ucakId}
					</div>
					<button class="update-flight-btn mt-2 flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition"
						data-flight-id="${flight.id}"
						data-flight-departure="${flight.kalkisYeri}"
						data-flight-arrival="${flight.varisYeri}"
						data-flight-datetime="${flight.kalkisTarihi}"
						data-flight-price="${flight.fiyat}"
						data-flight-plane-id="${flight.ucakId}">
						<span class="material-symbols-outlined text-sm">edit</span>
						Güncelle
					</button>
				</div>
			</div>
		`;

		// Add click event to update button
		const updateBtn = card.querySelector('.update-flight-btn');
		if (updateBtn) {
			updateBtn.addEventListener('click', function() {
				const flightId = parseInt(this.getAttribute('data-flight-id'));
				const departure = this.getAttribute('data-flight-departure');
				const arrival = this.getAttribute('data-flight-arrival');
				const datetime = this.getAttribute('data-flight-datetime');
				const price = parseFloat(this.getAttribute('data-flight-price'));
				const planeId = parseInt(this.getAttribute('data-flight-plane-id'));
				openFlightModalForUpdate(flightId, departure, arrival, datetime, price, planeId);
			});
		}

		return card;
	}

	// Update Flight Stats
	function updateFlightStats(flights) {
		const totalFlights = flights.length;
		let totalAvailable = 0;
		let totalBooked = 0;

		flights.forEach(flight => {
			const kapasite = flight.ucak?.kapasite || 0;
			totalAvailable += flight.bosKoltukSayisi;
			totalBooked += (kapasite - flight.bosKoltukSayisi);
		});

		flightsTotalCount.textContent = totalFlights;
		flightsAvailableSeats.textContent = totalAvailable;
		flightsBookedSeats.textContent = totalBooked;
	}

	// ============================================
	// Plane Modal Functions
	// ============================================

	// Open Plane Modal
	function openPlaneModal() {
		createPlaneModal.classList.remove('hidden');
		createPlaneModal.classList.add('flex');
		createPlaneForm.reset();
		planeError.classList.add('hidden');
		planeSuccess.classList.add('hidden');

		// Set to create mode
		planeIdHidden.value = '';
		planeModalTitle.textContent = 'Yeni Uçak Ekle';
		submitPlaneBtnText.textContent = 'Uçak Ekle';
	}

	// Open Plane Modal for Update
	function openPlaneModalForUpdate(planeId, planeModel, planeCapacity) {
		createPlaneModal.classList.remove('hidden');
		createPlaneModal.classList.add('flex');
		planeError.classList.add('hidden');
		planeSuccess.classList.add('hidden');

		// Set to update mode
		planeIdHidden.value = planeId;
		planeModelInput.value = planeModel;
		planeCapacityInput.value = planeCapacity;
		
		// Store original values for comparison
		document.getElementById('plane-original-model').value = planeModel;
		document.getElementById('plane-original-capacity').value = planeCapacity;
		
		planeModalTitle.textContent = 'Uçak Güncelle';
		submitPlaneBtnText.textContent = 'Güncelle';
	}

	// Close Plane Modal
	function closePlaneModal() {
		createPlaneModal.classList.add('hidden');
		createPlaneModal.classList.remove('flex');
		createPlaneForm.reset();
		planeError.classList.add('hidden');
		planeSuccess.classList.add('hidden');
	}

	// Show Plane Error
	function showPlaneError(message) {
		planeError.textContent = message;
		planeError.classList.remove('hidden');
		planeSuccess.classList.add('hidden');
	}

	// Show Plane Success
	function showPlaneSuccess(message) {
		planeSuccess.textContent = message;
		planeSuccess.classList.remove('hidden');
		planeError.classList.add('hidden');
	}

	// Handle Create Plane
	async function handleCreatePlane(e) {
		e.preventDefault();

		// Hide previous messages
		planeError.classList.add('hidden');
		planeSuccess.classList.add('hidden');

		const planeId = planeIdHidden.value;
		const model = planeModelInput.value.trim();
		const kapasite = parseInt(planeCapacityInput.value);
		const isUpdateMode = planeId !== '';

		// If in update mode, check if anything changed
		if (isUpdateMode) {
			const originalModel = document.getElementById('plane-original-model').value;
			const originalCapacity = parseInt(document.getElementById('plane-original-capacity').value);
			
			// Debug: Log comparison values
			console.log('Plane Comparison Check:', {
				current: { model, kapasite },
				original: { originalModel, originalCapacity },
				checks: {
					model: model === originalModel,
					capacity: kapasite === originalCapacity
				}
			});
			
			if (model === originalModel && kapasite === originalCapacity) {
				showPlaneError('Hiçbir değişiklik yapılmadı. Lütfen değiştirmek istediğiniz alanları güncelleyin.');
				return;
			}
		}

		// Validation
		if (!model) {
			showPlaneError('Lütfen uçak modelini girin.');
			return;
		}

		if (!kapasite || kapasite < 1 || kapasite > 1000) {
			showPlaneError('Kapasite 1 ile 1000 arasında olmalıdır.');
			return;
		}

		// Show loading
		planeModalLoading.classList.remove('hidden');
		planeModalLoading.classList.add('flex');

		try {
			let response;

			if (isUpdateMode) {
				// Update existing plane
				response = await fetch(`${API_BASE_URL}/Ucak/UcakGuncelle`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						id: parseInt(planeId),
						model: model,
						kapasite: kapasite
					})
				});
			} else {
				// Create new plane
				response = await fetch(`${API_BASE_URL}/Ucak`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						model: model,
						kapasite: kapasite
					})
				});
			}

			if (response.ok) {
				const successMessage = isUpdateMode
					? `Uçak başarıyla güncellendi! Model: ${model}, Kapasite: ${kapasite}`
					: `Uçak başarıyla eklendi! Model: ${model}, Kapasite: ${kapasite}`;

				showPlaneSuccess(successMessage);
				createPlaneForm.reset();

				// Close modal after 2 seconds
				setTimeout(() => {
					closePlaneModal();
					// Reload planes list if on planes tab
					if (currentTab === 'planes') {
						loadPlanes();
					}
				}, 2000);
			} else {
				const contentType = response.headers.get('content-type');
				let errorMessage = isUpdateMode
					? 'Uçak güncellenirken bir hata oluştu.'
					: 'Uçak eklenirken bir hata oluştu.';

				try {
					if (contentType && contentType.includes('application/json')) {
						const errorData = await response.json();
						errorMessage = errorData.message || errorData.error || errorMessage;
					} else {
						const errorText = await response.text();
						errorMessage = errorText || errorMessage;
					}
				} catch (parseError) {
					console.error('Error parsing response:', parseError);
				}

				showPlaneError(errorMessage);
			}
		} catch (error) {
			console.error('Plane operation error:', error);
			showPlaneError('Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
		} finally {
			planeModalLoading.classList.add('hidden');
			planeModalLoading.classList.remove('flex');
		}
	}

	// ============================================
	// Planes List Functions
	// ============================================

	// Load Planes for Dropdown
	async function loadPlanesForDropdown() {
		const planeSelect = document.getElementById('plane-id');

		// Show loading state
		planeSelect.innerHTML = '<option value="">Uçaklar yükleniyor...</option>';
		planeSelect.disabled = true;

		try {
			const response = await fetch(`${API_BASE_URL}/Ucak`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			});

			if (response.ok) {
				const planes = await response.json();
				console.log('Planes for dropdown:', planes);

				// Clear and populate dropdown
				planeSelect.innerHTML = '<option value="">Uçak seçin</option>';

				if (planes && planes.length > 0) {
					planes.forEach(plane => {
						const option = document.createElement('option');
						option.value = plane.id;
						option.textContent = `ID: ${plane.id} - ${plane.model} (${plane.kapasite} koltuk)`;
						planeSelect.appendChild(option);
					});
					planeSelect.disabled = false;
				} else {
					planeSelect.innerHTML = '<option value="">Sistemde uçak bulunamadı</option>';
					alert('Sistemde kayıtlı uçak bulunamadı. Lütfen önce uçak ekleyin.');
				}
			} else if (response.status === 401) {
				console.error('Yetkisiz erişim');
				planeSelect.innerHTML = '<option value="">Yetki hatası</option>';
			} else {
				throw new Error('Uçaklar yüklenemedi');
			}
		} catch (error) {
			console.error('Load planes for dropdown error:', error);
			planeSelect.innerHTML = '<option value="">Uçaklar yüklenemedi</option>';
			alert('Uçaklar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
		}
	}

	// Load Planes
	async function loadPlanes() {
		// Show loading
		planesLoading.classList.remove('hidden');
		planesList.classList.add('hidden');
		noPlanes.classList.add('hidden');
		planesErrorState.classList.add('hidden');

		try {
			const response = await fetch(`${API_BASE_URL}/Ucak`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			});

			console.log('Planes Response Status:', response.status);

			if (response.ok) {
				const planes = await response.json();
				console.log('Planes:', planes);

				allPlanes = planes;

				// Hide loading
				planesLoading.classList.add('hidden');

				if (planes && planes.length > 0) {
					// Display planes
					displayPlanes(planes);
					planesList.classList.remove('hidden');
					planesShowingCount.textContent = `${planes.length} uçak listeleniyor`;
				} else {
					// No planes found
					noPlanes.classList.remove('hidden');
				}

				// Update stats
				updatePlaneStats(planes);
			} else if (response.status === 401) {
				// Unauthorized - redirect to login
				console.error('Yetkisiz erişim - Login sayfasına yönlendiriliyorsunuz...');
				window.location.href = '../login_screen/code.html';
			} else {
				const errorText = await response.text();
				console.error('API Error:', errorText);
				throw new Error(errorText || 'Uçaklar yüklenemedi');
			}
		} catch (error) {
			console.error('Load planes error:', error);
			planesLoading.classList.add('hidden');
			planesErrorState.classList.remove('hidden');
			planesErrorMessage.textContent = error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
		}
	}

	// Display Planes
	function displayPlanes(planes) {
		planesContainer.innerHTML = '';

		planes.forEach(plane => {
			const planeCard = createPlaneCard(plane);
			planesContainer.appendChild(planeCard);
		});
	}

	// Create Plane Card
	function createPlaneCard(plane) {
		const card = document.createElement('div');
		card.className = 'rounded-xl border border-border-light dark:border-border-dark bg-white/70 dark:bg-background-dark/70 p-6 shadow-lg backdrop-blur-sm hover:shadow-xl transition';

		card.innerHTML = `
			<div class="flex flex-col gap-4">
				<!-- Header -->
				<div class="flex items-center justify-between pb-4 border-b border-border-light dark:border-border-dark">
					<div class="flex items-center gap-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
							<span class="material-symbols-outlined text-2xl text-secondary">airplanemode_active</span>
						</div>
						<div>
							<p class="text-xs text-gray-500 dark:text-gray-400">Uçak ID</p>
							<p class="text-lg font-bold text-text-light dark:text-text-dark">#${plane.id}</p>
						</div>
					</div>
				</div>

				<!-- Plane Info -->
				<div class="space-y-3">
					<div>
						<p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Model</p>
						<p class="text-xl font-bold text-text-light dark:text-text-dark">${plane.model || 'Belirtilmemiş'}</p>
					</div>
					
					<div class="flex items-center justify-between pt-3 border-t border-border-light dark:border-border-dark">
						<div>
							<p class="text-xs text-gray-500 dark:text-gray-400">Koltuk Kapasitesi</p>
							<div class="flex items-center gap-2 mt-1">
								<span class="material-symbols-outlined text-secondary">event_seat</span>
								<p class="text-2xl font-bold text-secondary">${plane.kapasite || 0}</p>
								<span class="text-sm text-gray-500">koltuk</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Status Badge -->
				<div class="pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between">
					<span class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-success/10 text-success">
						<span class="material-symbols-outlined text-sm">check_circle</span>
						Aktif
					</span>
					<div class="flex items-center gap-2">
						<button class="update-plane-btn flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 transition"
							data-plane-id="${plane.id}"
							data-plane-model="${plane.model || ''}"
							data-plane-capacity="${plane.kapasite || 0}">
							<span class="material-symbols-outlined text-sm">edit</span>
							Güncelle
						</button>
						<button class="delete-plane-btn flex items-center gap-1 rounded-lg bg-error px-3 py-1.5 text-xs font-semibold text-white hover:bg-error/90 transition"
							data-plane-id="${plane.id}"
							data-plane-model="${plane.model || ''}">
							<span class="material-symbols-outlined text-sm">delete</span>
							Sil
						</button>
					</div>
				</div>
			</div>
		`;

		// Add click event to update button
		const updateBtn = card.querySelector('.update-plane-btn');
		if (updateBtn) {
			updateBtn.addEventListener('click', function () {
				const planeId = parseInt(this.getAttribute('data-plane-id'));
				const planeModel = this.getAttribute('data-plane-model');
				const planeCapacity = parseInt(this.getAttribute('data-plane-capacity'));
				openPlaneModalForUpdate(planeId, planeModel, planeCapacity);
			});
		}

		// Add click event to delete button
		const deleteBtn = card.querySelector('.delete-plane-btn');
		if (deleteBtn) {
			deleteBtn.addEventListener('click', function () {
				const planeId = parseInt(this.getAttribute('data-plane-id'));
				const planeModel = this.getAttribute('data-plane-model');
				deletePlane(planeId, planeModel);
			});
		}

		return card;
	}

	// Delete Plane
	async function deletePlane(planeId, planeModel) {
		// Confirm deletion
		const confirmDelete = confirm(
			`"${planeModel}" modelindeki uçağı silmek istediğinizden emin misiniz?\n\n` +
			`Uçak ID: ${planeId}\n\n` +
			`⚠️ DİKKAT: Bu işlem geri alınamaz ve bu uçağa bağlı tüm uçuşlar etkilenebilir!`
		);

		if (!confirmDelete) {
			return;
		}

		try {
			const response = await fetch(`${API_BASE_URL}/Ucak/UcakSil?ucakId=${planeId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			});

			if (response.ok) {
				alert(`✅ Uçak başarıyla silindi!\n\nModel: ${planeModel}\nID: ${planeId}`);

				// Reload planes list
				loadPlanes();
			} else {
				const contentType = response.headers.get('content-type');
				let errorMessage = 'Uçak silinirken bir hata oluştu.';

				try {
					if (contentType && contentType.includes('application/json')) {
						const errorData = await response.json();
						errorMessage = errorData.message || errorData.error || errorMessage;
					} else {
						const errorText = await response.text();
						errorMessage = errorText || errorMessage;
					}
				} catch (parseError) {
					console.error('Error parsing response:', parseError);
				}

				alert(`❌ Hata: ${errorMessage}`);
			}
		} catch (error) {
			console.error('Delete plane error:', error);
			alert('❌ Sunucuya bağlanırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
		}
	}

	// Update Plane Stats
	function updatePlaneStats(planes) {
		const totalPlanes = planes.length;
		let totalCapacity = 0;

		planes.forEach(plane => {
			totalCapacity += plane.kapasite || 0;
		});

		const avgCapacity = totalPlanes > 0 ? Math.round(totalCapacity / totalPlanes) : 0;

		planesTotalCount.textContent = totalPlanes;
		planesTotalCapacity.textContent = totalCapacity.toLocaleString('tr-TR');
		planesAvgCapacity.textContent = avgCapacity.toLocaleString('tr-TR');
	}
});


