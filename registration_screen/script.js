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

// Registration Form Handler
document.addEventListener('DOMContentLoaded', function () {
	const form = document.querySelector('form');
	const emailInput = document.getElementById('email');
	const passwordInput = document.getElementById('password');
	const confirmPasswordInput = document.getElementById('confirm-password');
	const firstNameInput = document.getElementById('first-name');
	const lastNameInput = document.getElementById('last-name');
	const phoneInput = document.getElementById('phone');
	const idNumberInput = document.getElementById('id-number');
	const termsCheckbox = document.getElementById('terms');
	const emailError = document.querySelector('.text-error');

	// Password visibility toggle
	const togglePasswordBtns = document.querySelectorAll('button[aria-label="Toggle password visibility"]');
	togglePasswordBtns.forEach(btn => {
		btn.addEventListener('click', function () {
			const input = this.previousElementSibling;
			const icon = this.querySelector('.material-symbols-outlined');

			if (input.type === 'password') {
				input.type = 'text';
				icon.textContent = 'visibility_off';
			} else {
				input.type = 'password';
				icon.textContent = 'visibility';
			}
		});
	});

	// Password strength indicator
	passwordInput.addEventListener('input', function () {
		const password = this.value;
		const strengthBar = document.querySelector('.h-full');
		const strengthText = document.querySelector('.text-xs.font-medium');

		let strength = 0;
		if (password.length >= 8) strength++;
		if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
		if (/[0-9]/.test(password)) strength++;
		if (/[^a-zA-Z0-9]/.test(password)) strength++;

		if (strength === 0 || strength === 1) {
			strengthBar.className = 'h-full w-1/3 rounded-full bg-error';
			strengthText.className = 'text-xs font-medium text-error';
			strengthText.textContent = 'Weak';
		} else if (strength === 2 || strength === 3) {
			strengthBar.className = 'h-full w-2/3 rounded-full bg-yellow-500';
			strengthText.className = 'text-xs font-medium text-yellow-500';
			strengthText.textContent = 'Medium';
		} else {
			strengthBar.className = 'h-full w-full rounded-full bg-success';
			strengthText.className = 'text-xs font-medium text-success';
			strengthText.textContent = 'Strong';
		}
	});

	// Email validation
	emailInput.addEventListener('blur', function () {
		const email = this.value;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (email && !emailRegex.test(email)) {
			emailError.style.display = 'block';
		} else {
			emailError.style.display = 'none';
		}
	});

	// Hide error on input
	emailInput.addEventListener('input', function () {
		emailError.style.display = 'none';
	});

	// Form submission
	form.addEventListener('submit', async function (e) {
		e.preventDefault();

		// Validate all fields
		const firstName = firstNameInput.value.trim();
		const lastName = lastNameInput.value.trim();
		const email = emailInput.value.trim();
		const phone = phoneInput.value.trim();
		const idNumber = idNumberInput.value.trim();
		const password = passwordInput.value;
		const confirmPassword = confirmPasswordInput.value;

		// Basic validation
		if (!firstName || !lastName || !email || !phone || !idNumber || !password || !confirmPassword) {
			alert('Lütfen tüm alanları doldurun.');
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			alert('Lütfen geçerli bir e-posta adresi girin.');
			return;
		}

		// Password match validation
		if (password !== confirmPassword) {
			alert('Şifreler eşleşmiyor.');
			return;
		}

		// Terms acceptance validation
		if (!termsCheckbox.checked) {
			alert('Hizmet şartlarını kabul etmelisiniz.');
			return;
		}

		// Prepare data for API
		const requestData = {
			email: email,
			sifre: password,
			ad: firstName,
			soyad: lastName,
			tcNo: idNumber,
			telefonNo: phone
		};

		try {
			// Show loading state
			const submitBtn = form.querySelector('button[type="submit"]');
			const originalText = submitBtn.textContent;
			submitBtn.disabled = true;
			submitBtn.textContent = 'Kayıt oluşturuluyor...';

			// Make API request
			const response = await fetch('https://localhost:7100/api/Auth/Register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestData)
			});

			if (response.ok) {
				const data = await response.json();
				alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
				// Redirect to login page
				window.location.href = '../login_screen/code.html';
			} else {
				const errorData = await response.json();
				alert('Kayıt başarısız: ' + (errorData.message || 'Bir hata oluştu.'));
			}
		} catch (error) {
			console.error('Kayıt hatası:', error);
			alert('Sunucuya bağlanırken bir hata oluştu. Lütfen tekrar deneyin.');
		} finally {
			// Reset button state
			const submitBtn = form.querySelector('button[type="submit"]');
			submitBtn.disabled = false;
			submitBtn.textContent = 'Create Account';
		}
	});
});
