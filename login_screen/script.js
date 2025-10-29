// Tailwind CSS Configuration
tailwind.config = {
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				"primary": "#0A3D62",
				"secondary": "#00A8FF",
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

// Show/Hide Error Message
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

// Handle Login
async function handleLogin(event) {
	event.preventDefault();

	const email = document.getElementById('emailInput').value.trim();
	const password = document.getElementById('passwordInput').value;
	const loginButton = document.getElementById('loginButton');

	// Validation
	if (!email || !password) {
		showError('Please fill in all fields');
		return;
	}

	// Disable button and show loading state
	loginButton.disabled = true;
	const buttonText = loginButton.querySelector('span');
	const originalText = buttonText.textContent;
	buttonText.textContent = 'Logging in...';

	hideError();

	try {
		const response = await fetch(`${API_BASE_URL}/Auth/Login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include', // Cookie'leri almak için gerekli
			body: JSON.stringify({
				email: email,
				sifre: password
			})
		});

		if (response.ok) {
			// Login successful - Backend cookie set etti
			console.log('Login successful! Cookie received.');

			// Check user role and redirect accordingly
			try {
				const checkResponse = await fetch(`${API_BASE_URL}/Auth/CheckStatus`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				});

				if (checkResponse.ok) {
					const userData = await checkResponse.json();
					console.log('User Role:', userData.role);

					// Redirect based on role
					if (userData.role && userData.role.toLowerCase() === 'admin') {
						// Admin user - redirect to admin panel
						window.location.href = '../flight_search/admin.html';
					} else {
						// Customer user - redirect to flight search
						window.location.href = '../flight_search/code.html';
					}
				} else {
					// If check fails, default to flight search
					window.location.href = '../flight_search/code.html';
				}
			} catch (error) {
				console.error('Role check error:', error);
				// If error, default to flight search
				window.location.href = '../flight_search/code.html';
			}

		} else {
			// Login failed
			const errorText = await response.text();
			showError(errorText || 'Invalid email or password');
		}

	} catch (error) {
		console.error('Login error:', error);

		// CORS hatası kontrolü
		if (error instanceof TypeError && error.message.includes('fetch')) {
			showError('CORS Error: Backend CORS ayarlarını kontrol edin. Credential support ekleyin.');
		} else {
			showError('Connection error. Please check if the server is running.');
		}

	} finally {
		// Re-enable button
		loginButton.disabled = false;
		buttonText.textContent = originalText;
	}
}

// Toggle Password Visibility
function togglePasswordVisibility() {
	const passwordInput = document.getElementById('passwordInput');
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
	const loginForm = document.getElementById('loginForm');
	const togglePassword = document.getElementById('togglePassword');

	if (loginForm) {
		loginForm.addEventListener('submit', handleLogin);
	}

	if (togglePassword) {
		togglePassword.addEventListener('click', togglePasswordVisibility);
	}
});
