// ============================================
// API Configuration - DEPLOYMENT
// ============================================
// Bu dosyayı düzenleyerek tüm uygulamanın API ayarlarını değiştirebilirsiniz.
// 
// Kullanım:
// 1. PROTOCOL: 'http' veya 'https'
// 2. URL: API sunucusunun tam adresi (örn: 'api.example.com', 'myapp.azurewebsites.net')
// 
// NOT: Bu dosya deployment (canlı ortam) için kullanılır.
//      Local çalıştırma için config_local.js dosyasını kullanın.
// 
// NOT: Bu dosyayı değiştirdikten sonra tarayıcıyı yenilemeniz yeterlidir.
// ============================================

const API_CONFIG = {
	PROTOCOL: 'https',
	URL: 'apir.akadir.tech',

	// Otomatik oluşturulan base URL (bu satırı değiştirmeyin)
	get BASE_URL() {
		return `${this.PROTOCOL}://${this.URL}/api`;
	}
};

// Global olarak erişilebilir hale getir
window.API_CONFIG = API_CONFIG;
window.API_BASE_URL = API_CONFIG.BASE_URL;

// Console'da bilgilendirme
console.log('===========================================');
console.log('API Configuration Loaded - DEPLOYMENT');
console.log('===========================================');
console.log('Protocol:', API_CONFIG.PROTOCOL);
console.log('URL:', API_CONFIG.URL);
console.log('Base URL:', API_CONFIG.BASE_URL);
console.log('===========================================');
