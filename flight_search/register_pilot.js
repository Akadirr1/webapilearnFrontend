// Tailwind CSS Configuration
tailwind.config = {
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				"primary": "#0A3D62",
				"secondary": "#00A8FF",
				"success": "#10B981",
				"error": "#EF4444",
				"background-light": "#F5F7FA",
				"background-dark": "#101922",
				"text-light": "#333333",
				"text-dark": "#f5f7fa",
				"text-muted-light": "#4c739a",
				"text-muted-dark": "#94a3b8",
				"border-light": "#cfdbe7",
				"border-dark": "#334155",
			},
			fontFamily: {
				"display": ["Work Sans", "Noto Sans", "sans-serif"]
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

// Show Success Message
function showSuccess(message) {
	const successDiv = document.getElementById('successMessage');
	const successText = successDiv.querySelector('p');
	successText.textContent = message;
	successDiv.classList.remove('hidden');

	// Auto hide after 5 seconds
	setTimeout(() => {
		successDiv.classList.add('hidden');
	}, 5000);
}

function hideSuccess() {
	const successDiv = document.getElementById('successMessage');
	successDiv.classList.add('hidden');
}

// Show Error Message
function showError(message) {
	const errorDiv = document.getElementById('errorMessage');
	const errorText = errorDiv.querySelector('p');
	errorText.textContent = message;
	errorDiv.classList.remove('hidden');

	// Auto hide after 5 seconds
	setTimeout(() => {
		errorDiv.classList.add('hidden');
	}, 5000);
}

function hideError() {
	const errorDiv = document.getElementById('errorMessage');
	errorDiv.classList.add('hidden');
}

// Handle Pilot Registration
async function handlePilotRegister(event) {
	event.preventDefault();

	const ad = document.getElementById('ad').value.trim();
	const soyad = document.getElementById('soyad').value.trim();
	const email = document.getElementById('email').value.trim();
	const sifre = document.getElementById('sifre').value;
	const registerButton = document.getElementById('registerButton');
	const buttonText = document.getElementById('buttonText');

	// Validation
	if (!ad || !soyad || !email || !sifre) {
		showError('Lütfen tüm alanları doldurun');
		return;
	}

	// Email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		showError('Geçerli bir email adresi girin');
		return;
	}

	// Password validation
	if (sifre.length < 6) {
		showError('Şifre en az 6 karakter olmalıdır');
		return;
	}

	// Disable button and show loading state
	registerButton.disabled = true;
	buttonText.textContent = 'Kaydediliyor...';

	hideError();
	hideSuccess();

	try {
		const response = await fetch(`${API_BASE_URL}/Auth/Register-Pilot`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				ad: ad,
				soyad: soyad,
				email: email,
				sifre: sifre
			})
		});

		if (response.ok) {
			// Registration successful
			showSuccess('Pilot başarıyla kaydedildi!');
			
			// Clear form
			document.getElementById('pilotRegisterForm').reset();

			// Redirect to admin panel after 2 seconds
			setTimeout(() => {
				window.location.href = 'admin.html';
			}, 2000);

		} else {
			// Registration failed
			const errorText = await response.text();
			showError(errorText || 'Pilot kaydı başarısız oldu');
		}

	} catch (error) {
		console.error('Register error:', error);

		if (error instanceof TypeError && error.message.includes('fetch')) {
			showError('Bağlantı hatası. Sunucunun çalıştığından emin olun.');
		} else {
			showError('Bir hata oluştu. Lütfen tekrar deneyin.');
		}

	} finally {
		// Re-enable button
		registerButton.disabled = false;
		buttonText.textContent = 'Pilot Kaydı Oluştur';
	}
}

// Toggle Password Visibility
function togglePasswordVisibility() {
	const passwordInput = document.getElementById('sifre');
	const toggleButton = document.getElementById('togglePassword');
	const icon = toggleButton.querySelector('.material-symbols-outlined');

	if (passwordInput.type === 'password') {
		passwordInput.type = 'text';
		icon.textContent = 'visibility_off';
	} else {
		passwordInput.type = 'password';
		icon.textContent = 'visibility';
	}
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	const form = document.getElementById('pilotRegisterForm');
	const togglePassword = document.getElementById('togglePassword');

	if (form) {
		form.addEventListener('submit', handlePilotRegister);
	}

	if (togglePassword) {
		togglePassword.addEventListener('click', togglePasswordVisibility);
	}
});
