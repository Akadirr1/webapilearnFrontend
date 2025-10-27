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

// Flight Search Handler
document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('flight-search-form');
	const kalkisYeriInput = document.getElementById('kalkis-yeri');
	const varisYeriInput = document.getElementById('varis-yeri');
	const kalkisTarihiInput = document.getElementById('kalkis-tarihi');
	const loadingState = document.getElementById('loading-state');
	const resultsSection = document.getElementById('results-section');
	const resultsContainer = document.getElementById('results-container');
	const resultsCount = document.getElementById('results-count');
	const noResults = document.getElementById('no-results');
	const userDisplayName = document.getElementById('user-display-name');

	// Set minimum date to today
	const today = new Date().toISOString().split('T')[0];
	kalkisTarihiInput.setAttribute('min', today);
	kalkisTarihiInput.value = today;

	// Load user info
	loadUserInfo();

	// Logout functionality
	const logoutBtn = document.getElementById('logout-btn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', handleLogout);
	}

	// Load User Info
	async function loadUserInfo() {
		try {
			const response = await fetch('https://localhost:7100/api/Auth/CheckStatus', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include' // Cookie'yi göndermek için gerekli
			});

			if (response.ok) {
				const userData = await response.json();
				console.log('User Data:', userData);

				if (userData.isLoggedIn) {
					// Display user name
					if (userData.ad && userData.soyad) {
						userDisplayName.textContent = `${userData.ad} ${userData.soyad}`;
					} else if (userData.ad) {
						userDisplayName.textContent = userData.ad;
					}
				} else {
					// Not logged in - redirect to login
					window.location.href = '../login_screen/code.html';
				}
			} else if (response.status === 401) {
				// Unauthorized - redirect to login
				window.location.href = '../login_screen/code.html';
			}
		} catch (error) {
			console.error('Kullanıcı bilgisi yükleme hatası:', error);
		}
	}

	// Handle Logout
	async function handleLogout() {
		try {
			const response = await fetch('https://localhost:7100/api/Auth/Logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include' // Cookie'yi göndermek için gerekli
			});

			// Başarılı ya da başarısız, her türlü login'e yönlendir
			// Çünkü cookie silinmiş olacak
			window.location.href = '../login_screen/code.html';

		} catch (error) {
			console.error('Logout hatası:', error);
			// Hata olsa bile login'e yönlendir
			window.location.href = '../login_screen/code.html';
		}
	}

	// Form submission
	form.addEventListener('submit', async function (e) {
		e.preventDefault();

		// Get form values - These are already the city codes (e.g., "IST", "AYT")
		const kalkisYeri = kalkisYeriInput.value.trim();
		const varisYeri = varisYeriInput.value.trim();
		const kalkisTarihi = kalkisTarihiInput.value;

		// Debug: Log the values being sent
		console.log('Kalkış Yeri Kodu:', kalkisYeri);
		console.log('Varış Yeri Kodu:', varisYeri);
		console.log('Kalkış Tarihi:', kalkisTarihi);

		// Validate
		if (!kalkisYeri || !varisYeri || !kalkisTarihi) {
			alert('Lütfen tüm alanları doldurun.');
			return;
		}

		if (kalkisYeri === varisYeri) {
			alert('Kalkış ve varış yerleri aynı olamaz.');
			return;
		}

		// Hide previous results
		resultsSection.classList.add('hidden');
		noResults.classList.add('hidden');

		// Show loading
		loadingState.classList.remove('hidden');

		try {
			// Build API URL with query parameters
			// kalkisYeri and varisYeri are already city codes (IST, AYT, etc.)
			const apiUrl = `https://localhost:7100/api/Ucus/Ara?KalkisYeri=${encodeURIComponent(kalkisYeri)}&VarisYeri=${encodeURIComponent(varisYeri)}&KalkisTarihi=${encodeURIComponent(kalkisTarihi)}`;

			// Debug: Log the complete API URL
			console.log('API URL:', apiUrl);

			// Make API request
			const response = await fetch(apiUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include' // Cookie'leri göndermek için gerekli
			});

			// Debug: Log response status
			console.log('Response Status:', response.status);

			if (response.ok) {
				const flights = await response.json();

				// Debug: Log the received flights
				console.log('Received Flights:', flights);

				// Hide loading
				loadingState.classList.add('hidden');

				if (flights && flights.length > 0) {
					// Display results
					displayFlights(flights);
					resultsSection.classList.remove('hidden');
					resultsCount.textContent = `${flights.length} uçuş bulundu`;
				} else {
					// No results found
					noResults.classList.remove('hidden');
				}
			} else {
				const errorText = await response.text();
				console.error('API Error Response:', errorText);
				throw new Error('Uçuş araması başarısız oldu.');
			}
		} catch (error) {
			console.error('Arama hatası:', error);
			loadingState.classList.add('hidden');
			alert('Uçuş araması sırasında bir hata oluştu. Lütfen tekrar deneyin.\n\nHata detayı: ' + error.message);
		}
	});

	// Display flights function
	function displayFlights(flights) {
		resultsContainer.innerHTML = '';

		flights.forEach(flight => {
			const flightCard = createFlightCard(flight);
			resultsContainer.appendChild(flightCard);
		});
	}

	// Create flight card
	function createFlightCard(flight) {
		const card = document.createElement('div');
		card.className = 'flight-card rounded-xl border border-border-light dark:border-border-dark bg-white/70 dark:bg-background-dark/70 p-6 backdrop-blur-sm';

		// Format date and time
		const kalkisDate = new Date(flight.kalkisTarihi || flight.kalkisSaati);
		const varisDate = new Date(flight.varisTarihi || flight.varisSaati);

		const kalkisSaat = kalkisDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
		const varisSaat = varisDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

		// Calculate duration (if available)
		let duration = '';
		if (flight.ucusSuresi) {
			duration = flight.ucusSuresi;
		} else {
			const durationMs = varisDate - kalkisDate;
			const hours = Math.floor(durationMs / (1000 * 60 * 60));
			const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
			duration = `${hours}s ${minutes}d`;
		}

		card.innerHTML = `
			<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<!-- Flight Info -->
				<div class="flex-1">
					<div class="flex items-center gap-4 mb-3">
						<span class="material-symbols-outlined text-primary text-3xl">flight</span>
						<div>
							<p class="text-sm font-semibold text-gray-600 dark:text-gray-400">${flight.ucakAdi || 'Uçak Bilgisi'}</p>
							<p class="text-xs text-gray-500 dark:text-gray-500">Uçuş No: ${flight.ucusNo || flight.id || 'N/A'}</p>
						</div>
					</div>
					
					<div class="grid grid-cols-3 gap-4 items-center">
						<!-- Departure -->
						<div class="text-center">
							<p class="text-2xl font-bold text-text-light dark:text-text-dark">${kalkisSaat}</p>
							<p class="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">${flight.kalkisYeri}</p>
							<p class="text-xs text-gray-500 dark:text-gray-500">${kalkisDate.toLocaleDateString('tr-TR')}</p>
						</div>
						
						<!-- Duration -->
						<div class="flex flex-col items-center">
							<p class="text-xs text-gray-500 dark:text-gray-500 mb-1">${duration}</p>
							<div class="w-full h-px bg-gray-300 dark:bg-gray-600 relative">
								<span class="material-symbols-outlined absolute -top-2.5 left-1/2 -translate-x-1/2 text-primary text-sm">flight</span>
							</div>
							<p class="text-xs text-gray-500 dark:text-gray-500 mt-1">${flight.aktarma || 'Direkt'}</p>
						</div>
						
						<!-- Arrival -->
						<div class="text-center">
							<p class="text-2xl font-bold text-text-light dark:text-text-dark">${varisSaat}</p>
							<p class="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">${flight.varisYeri}</p>
							<p class="text-xs text-gray-500 dark:text-gray-500">${varisDate.toLocaleDateString('tr-TR')}</p>
						</div>
					</div>
				</div>
				
				<!-- Price & Book -->
				<div class="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 md:gap-2 md:min-w-[180px] border-t md:border-t-0 md:border-l border-border-light dark:border-border-dark pt-4 md:pt-0 md:pl-6">
					<div class="text-center">
						<p class="text-xs text-gray-500 dark:text-gray-500">Kalan Koltuk</p>
						<p class="text-lg font-bold text-text-light dark:text-text-dark">${flight.kalanKoltuk || flight.kapasite || 'N/A'}</p>
					</div>
					<div class="text-center">
						<p class="text-xs text-gray-500 dark:text-gray-500">Fiyat</p>
						<p class="text-2xl font-black text-primary">${flight.fiyat ? flight.fiyat + ' ₺' : 'N/A'}</p>
					</div>
					<button class="book-flight-btn whitespace-nowrap rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition"
						data-flight-id="${flight.id}">
						Rezervasyon Yap
					</button>
				</div>
			</div>
		`;

		// Add click event to booking button
		const bookBtn = card.querySelector('.book-flight-btn');
		bookBtn.addEventListener('click', function () {
			const flightId = this.getAttribute('data-flight-id');
			console.log('Book button clicked, data-flight-id:', flightId);
			console.log('Flight object:', flight);
			bookFlight(flight, flightId);
		});

		return card;
	}

	// Book flight function
	function bookFlight(flight, flightId) {
		console.log('bookFlight called with:', { flight, flightId });
		
		// Save flight data to sessionStorage
		sessionStorage.setItem('selectedFlight', JSON.stringify(flight));

		// Redirect to seat selection page
		console.log('Redirecting to:', `seat_selection.html?flightId=${flightId}`);
		window.location.href = `seat_selection.html?flightId=${flightId}`;
	}
});
