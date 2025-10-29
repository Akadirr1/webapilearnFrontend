// ============================================
// API Configuration
// ============================================
// Bu dosyayı düzenleyerek tüm uygulamanın API ayarlarını değiştirebilirsiniz.
// 
// Kullanım:
// 1. PROTOCOL: 'http' veya 'https'
// 2. HOST: API sunucusunun adresi (örn: 'localhost', 'api.example.com')
// 3. PORT: API sunucusunun portu (örn: 5001, 7100, 80)
// 
// NOT: Bu dosyayı değiştirdikten sonra tarayıcıyı yenilemeniz yeterlidir.
// ============================================

const API_CONFIG = {
    PROTOCOL: 'https',
    HOST: 'localhost',
    PORT: 5000,
    
    // Otomatik oluşturulan base URL (bu satırı değiştirmeyin)
    get BASE_URL() {
        return `${this.PROTOCOL}://${this.HOST}:${this.PORT}/api`;
    }
};

// Global olarak erişilebilir hale getir
window.API_CONFIG = API_CONFIG;
window.API_BASE_URL = API_CONFIG.BASE_URL;

// Console'da bilgilendirme
console.log('===========================================');
console.log('API Configuration Loaded');
console.log('===========================================');
console.log('Protocol:', API_CONFIG.PROTOCOL);
console.log('Host:', API_CONFIG.HOST);
console.log('Port:', API_CONFIG.PORT);
console.log('Base URL:', API_CONFIG.BASE_URL);
console.log('===========================================');
