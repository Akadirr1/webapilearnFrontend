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

// Seat Selection Handler
document.addEventListener('DOMContentLoaded', function () {
	// Get flight data from URL parameters
	const urlParams = new URLSearchParams(window.location.search);
	const flightId = urlParams.get('flightId');
	const flightData = getFlightDataFromStorage();

	// Elements
	const seatsContainer = document.getElementById('seats-container');
	const selectedSeatsDisplay = document.getElementById('selected-seats-display');
	const selectedCount = document.getElementById('selected-count');
	const totalPriceDisplay = document.getElementById('total-price');
	const confirmBtn = document.getElementById('confirm-btn');
	const flightRoute = document.getElementById('flight-route');
	const flightPrice = document.getElementById('flight-price');
	const loadingState = document.getElementById('loading-state');
	const userDisplayName = document.getElementById('user-display-name');
	const couponInput = document.getElementById('coupon-input');
	const applyCouponBtn = document.getElementById('apply-coupon-btn');
	const removeCouponBtn = document.getElementById('remove-coupon-btn');
	const couponMessage = document.getElementById('coupon-message');
	const discountInfo = document.getElementById('discount-info');
	const discountRate = document.getElementById('discount-rate');
	const discountAmount = document.getElementById('discount-amount');
	const discountedTotal = document.getElementById('discounted-total');

	// State
	let selectedSeats = []; // Array of seat objects: {row, col, seatNumber, label}
	let occupiedSeats = []; // Array of occupied seat numbers
	const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
	const pricePerSeat = flightData ? parseFloat(flightData.fiyat) : 0;
	let appliedCoupon = null; // Stores {code, discountRate}
	let discountPercentage = 0;

	// Dynamic values that will be set from API
	let totalSeats = 0;
	let totalRows = 0;

	// Initialize
	init();

	function init() {
		console.log('seat_selection.js init - flightId from URL:', flightId);
		console.log('URL search params:', window.location.search);
		if (!flightId) {
			alert('Uçuş bilgisi bulunamadı!');
			window.location.href = 'code.html';
			return;
		}

		// Display flight information
		if (flightData) {
			flightRoute.textContent = `${flightData.kalkisYeri} → ${flightData.varisYeri}`;
			flightPrice.textContent = `₺ ${formatPrice(pricePerSeat)}`;
		} else {
			flightRoute.textContent = 'Uçuş Bilgisi Yok';
			flightPrice.textContent = '₺ 0';
		}

		// Load user info
		loadUserInfo();

		// Logout functionality
		const logoutBtn = document.getElementById('logout-btn');
		if (logoutBtn) {
			logoutBtn.addEventListener('click', handleLogout);
		}

		// Load flight details and generate seats
		loadFlightDetails();

		// Add confirm button listener
		confirmBtn.addEventListener('click', confirmReservation);

		// Add coupon button listeners
		applyCouponBtn.addEventListener('click', applyCoupon);
		removeCouponBtn.addEventListener('click', removeCoupon);

		// Enable apply button when user types
		couponInput.addEventListener('input', function () {
			applyCouponBtn.disabled = this.value.trim().length === 0;
		});
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

	// Load Flight Details
	async function loadFlightDetails() {
		try {
			// Show loading
			loadingState.classList.remove('hidden');
			seatsContainer.classList.add('hidden');

			console.log('Fetching flight with ID:', flightId);

			// Fetch specific flight by ID
			const response = await fetch(`${API_BASE_URL}/Ucus/${flightId}`, {
				method: 'GET',
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error('Uçuş bilgileri yüklenemedi');
			}

			const data = await response.json();
			console.log('API Response:', data);

			// Extract flight from result object
			const flight = data.result || data;
			console.log('Flight data:', flight);

			// Get total seats from toplamKoltukSayisi
			totalSeats = flight.toplamKoltukSayisi || flight.ucak?.kapasite || 0;
			console.log(`Total Seats: ${totalSeats}`);

			if (totalSeats === 0) {
				throw new Error('Uçak kapasite bilgisi bulunamadı');
			}

			// Calculate total rows based on actual total seats
			// Her satırda 6 koltuk var (A-F)
			totalRows = Math.ceil(totalSeats / 6);

			// Get occupied seats from doluKoltuklar array
			occupiedSeats = flight.doluKoltuklar || [];
			// Convert string array to number array
			occupiedSeats = occupiedSeats.map(seat => parseInt(seat));
			console.log(`Boş Koltuk: ${flight.bosKoltukSayisi}, Dolu Koltuklar:`, occupiedSeats, `Toplam: ${totalSeats}`);

			// Hide loading and show seats
			loadingState.classList.add('hidden');
			seatsContainer.classList.remove('hidden');

			// Generate seats
			generateSeats();

		} catch (error) {
			console.error('Uçuş detayları yükleme hatası:', error);
			alert('Uçuş bilgileri yüklenirken bir hata oluştu: ' + error.message);
			window.location.href = 'code.html';
		}
	}

	// Generate seat layout
	function generateSeats() {
		seatsContainer.innerHTML = '';

		for (let row = 1; row <= totalRows; row++) {
			const rowDiv = document.createElement('div');
			rowDiv.className = 'flex justify-center items-center gap-4';

			// Row number (left)
			const rowNumberLeft = document.createElement('div');
			rowNumberLeft.className = 'text-sm font-bold text-primary w-6 text-center';
			rowNumberLeft.textContent = row;
			rowDiv.appendChild(rowNumberLeft);

			// Seat container
			const seatContainer = document.createElement('div');
			seatContainer.className = 'grid grid-cols-7 gap-2 w-full max-w-md';

			columns.forEach((col, colIndex) => {
				// Add aisle space after column C (index 2)
				if (colIndex === 3) {
					const aisle = document.createElement('div');
					aisle.className = 'w-8';
					seatContainer.appendChild(aisle);
				}

				const seatNumber = getSeatNumber(row, col);
				const seatLabel = `${row}${col}`;

				const seat = document.createElement('button');
				seat.className = 'seat w-10 h-10 rounded border-2 border-primary bg-white dark:bg-gray-800 hover:bg-primary/20 transition flex items-center justify-center text-xs font-semibold';
				seat.dataset.row = row;
				seat.dataset.col = col;
				seat.dataset.seatNumber = seatNumber;
				seat.dataset.seatLabel = seatLabel;
				seat.textContent = col;

				// Check if seat is occupied (you can add logic here to fetch occupied seats from API)
				if (occupiedSeats.includes(seatNumber)) {
					seat.className = 'seat w-10 h-10 rounded border-2 border-gray-400 bg-gray-400 cursor-not-allowed flex items-center justify-center text-xs font-semibold text-white';
					seat.disabled = true;
				} else {
					seat.addEventListener('click', () => toggleSeat(row, col, seatNumber, seatLabel, seat));
				}

				seatContainer.appendChild(seat);
			});

			rowDiv.appendChild(seatContainer);

			// Row number (right)
			const rowNumberRight = document.createElement('div');
			rowNumberRight.className = 'text-sm font-bold text-primary w-6 text-center';
			rowNumberRight.textContent = row;
			rowDiv.appendChild(rowNumberRight);

			seatsContainer.appendChild(rowDiv);
		}
	}

	// Calculate seat number based on row and column
	// 1A = 1, 1B = 2, 1C = 3, 1D = 4, 1E = 5, 1F = 6
	// 2A = 7, 2B = 8, 2C = 9, 2D = 10, 2E = 11, 2F = 12
	// Formula: (row - 1) * 6 + columnIndex + 1
	function getSeatNumber(row, col) {
		const colIndex = columns.indexOf(col);
		return (row - 1) * 6 + colIndex + 1;
	}

	// Toggle seat selection
	function toggleSeat(row, col, seatNumber, seatLabel, seatElement) {
		const seatIndex = selectedSeats.findIndex(s => s.seatNumber === seatNumber);

		if (seatIndex > -1) {
			// Deselect
			selectedSeats.splice(seatIndex, 1);
			seatElement.classList.remove('bg-primary', 'text-white');
			seatElement.classList.add('bg-white', 'dark:bg-gray-800');
		} else {
			// Select
			selectedSeats.push({ row, col, seatNumber, seatLabel });
			seatElement.classList.remove('bg-white', 'dark:bg-gray-800');
			seatElement.classList.add('bg-primary', 'text-white');
		}

		updateSummary();
	}

	// Update selected seats summary
	function updateSummary() {
		if (selectedSeats.length === 0) {
			selectedSeatsDisplay.textContent = 'Henüz koltuk seçilmedi';
			selectedCount.textContent = '0 koltuk seçildi';
			totalPriceDisplay.textContent = '₺ 0';
			confirmBtn.disabled = true;
		} else {
			// Sort by seat number for better display
			const sortedSeats = [...selectedSeats].sort((a, b) => a.seatNumber - b.seatNumber);
			const seatLabels = sortedSeats.map(s => s.seatLabel).join(', ');
			selectedSeatsDisplay.textContent = seatLabels;
			selectedCount.textContent = `${selectedSeats.length} koltuk seçildi`;

			const totalPrice = selectedSeats.length * pricePerSeat;
			totalPriceDisplay.textContent = `₺ ${formatPrice(totalPrice)}`;
			confirmBtn.disabled = false;
		}

		// Update discount if coupon is applied
		if (appliedCoupon) {
			updateDiscountDisplay();
		}
	}

	// Apply coupon
	async function applyCoupon() {
		const couponCode = couponInput.value.trim();

		if (!couponCode) {
			showCouponMessage('Lütfen bir kupon kodu girin.', 'error');
			return;
		}

		// Show loading
		applyCouponBtn.disabled = true;
		applyCouponBtn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">sync</span> Kontrol ediliyor...';

		try {
			const response = await fetch(`${API_BASE_URL}/Kupon?kpnstr=${encodeURIComponent(couponCode)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			});

			if (response.ok) {
				const result = await response.json();
				console.log('Kupon Sonucu:', result);

				// Extract discount rate from response
				// Assuming the API returns {result: {indirimOrani: 10}} or similar
				const discountRate = result.result?.indirimOrani || result.indirimOrani || 0;

				if (discountRate > 0) {
					appliedCoupon = {
						code: couponCode,
						discountRate: discountRate
					};
					discountPercentage = discountRate;

					showCouponMessage(`Kupon başarıyla uygulandı! %${discountRate} indirim kazandınız.`, 'success');
					discountInfo.classList.remove('hidden');
					couponInput.disabled = true;
					applyCouponBtn.classList.add('hidden');

					updateDiscountDisplay();
				} else {
					showCouponMessage('Bu kupon geçersiz veya süresi dolmuş.', 'error');
				}
			} else {
				const errorText = await response.text();
				console.error('Kupon API Hatası:', errorText);
				showCouponMessage('Kupon doğrulanırken bir hata oluştu.', 'error');
			}
		} catch (error) {
			console.error('Kupon Uygulama Hatası:', error);
			showCouponMessage('Kupon kontrolü sırasında bir hata oluştu.', 'error');
		} finally {
			applyCouponBtn.disabled = false;
			applyCouponBtn.innerHTML = '<span class="material-symbols-outlined text-base">local_offer</span> Uygula';
		}
	}

	// Remove coupon
	function removeCoupon() {
		appliedCoupon = null;
		discountPercentage = 0;
		couponInput.value = '';
		couponInput.disabled = false;
		discountInfo.classList.add('hidden');
		applyCouponBtn.classList.remove('hidden');
		couponMessage.classList.add('hidden');

		updateSummary();
	}

	// Update discount display
	function updateDiscountDisplay() {
		if (!appliedCoupon || selectedSeats.length === 0) {
			return;
		}

		const totalPrice = selectedSeats.length * pricePerSeat;
		const discountAmountValue = (totalPrice * discountPercentage) / 100;
		const finalPrice = totalPrice - discountAmountValue;

		discountRate.textContent = `%${discountPercentage}`;
		discountAmount.textContent = `₺ ${formatPrice(discountAmountValue)}`;
		discountedTotal.textContent = `₺ ${formatPrice(finalPrice)}`;
	}

	// Show coupon message
	function showCouponMessage(message, type) {
		couponMessage.textContent = message;
		couponMessage.classList.remove('hidden', 'text-success', 'text-error');

		if (type === 'success') {
			couponMessage.classList.add('text-success');
		} else if (type === 'error') {
			couponMessage.classList.add('text-error');
		}

		// Auto-hide after 5 seconds
		setTimeout(() => {
			if (type === 'error') {
				couponMessage.classList.add('hidden');
			}
		}, 5000);
	}

	// Confirm reservation
	async function confirmReservation() {
		if (selectedSeats.length === 0) {
			alert('Lütfen en az bir koltuk seçin!');
			return;
		}

		// Prepare request body
		const seatNumbers = selectedSeats.map(s => s.seatNumber.toString());
		const requestBody = {
			ucusId: parseInt(flightId),
			koltukNumaraları: seatNumbers,
			kuponKodu: appliedCoupon ? appliedCoupon.code : ""
		};

		console.log('Rezervasyon İsteği:', requestBody);

		// Show loading
		loadingState.classList.remove('hidden');
		confirmBtn.disabled = true;

		try {
			const response = await fetch(`${API_BASE_URL}/Rezervasyon`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include', // Cookie'leri göndermek için gerekli
				body: JSON.stringify(requestBody)
			});

			console.log('Response Status:', response.status);

			if (response.ok) {
				const result = await response.json();
				console.log('Rezervasyon Başarılı:', result);

				// Hide loading
				loadingState.classList.add('hidden');

				// Calculate final price
				const totalPrice = selectedSeats.length * pricePerSeat;
				let finalPrice = totalPrice;
				let discountText = '';

				if (appliedCoupon) {
					const discountAmountValue = (totalPrice * discountPercentage) / 100;
					finalPrice = totalPrice - discountAmountValue;
					discountText = `\nİndirim (%${discountPercentage}): -₺ ${formatPrice(discountAmountValue)}`;
				}

				// Show success message
				alert(`Rezervasyonunuz başarıyla oluşturuldu!\n\nUçuş: ${flightData.kalkisYeri} → ${flightData.varisYeri}\nKoltuklar: ${selectedSeats.map(s => s.seatLabel).join(', ')}\nAra Toplam: ₺ ${formatPrice(totalPrice)}${discountText}\nÖdenecek Tutar: ₺ ${formatPrice(finalPrice)}`);

				// Clear storage and redirect
				clearFlightDataFromStorage();
				window.location.href = 'code.html';
			} else {
				const errorText = await response.text();
				console.error('API Error:', errorText);
				throw new Error('Rezervasyon işlemi başarısız oldu.');
			}
		} catch (error) {
			console.error('Rezervasyon Hatası:', error);
			loadingState.classList.add('hidden');
			confirmBtn.disabled = false;
			alert('Rezervasyon sırasında bir hata oluştu. Lütfen tekrar deneyin.\n\nHata: ' + error.message);
		}
	}

	// Format price
	function formatPrice(price) {
		return new Intl.NumberFormat('tr-TR', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(price);
	}

	// Get flight data from sessionStorage
	function getFlightDataFromStorage() {
		const data = sessionStorage.getItem('selectedFlight');
		return data ? JSON.parse(data) : null;
	}

	// Clear flight data from sessionStorage
	function clearFlightDataFromStorage() {
		sessionStorage.removeItem('selectedFlight');
	}
});
