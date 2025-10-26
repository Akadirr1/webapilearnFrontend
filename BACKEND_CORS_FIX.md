# Backend CORS Ayarları Nasıl Düzeltilir

## Problem
Frontend'den backend'e istek atarken CORS hatası alıyorsunuz çünkü:
- Frontend: `file://` veya farklı bir origin'den çalışıyor
- Backend: `https://localhost:7100`
- Cookie kullanımı için `credentials: 'include'` gerekiyor

## Çözüm (.NET Core/ASP.NET için)

### 1. Program.cs veya Startup.cs dosyasına ekleyin:

```csharp
// CORS policy tanımla
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5500",  // Live Server veya localhost portları
                "http://127.0.0.1:5500",
                "http://localhost:3000",
                "file://"                 // HTML dosyasını direkt açıyorsanız
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();  // Cookie için ZORUNLU
    });
});

// Middleware'lerde kullan (app.UseRouting()'den ÖNCE olmalı)
app.UseCors("AllowFrontend");
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
```

### 2. Eğer tüm origin'lere izin vermek isterseniz (Development için):

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)  // Tüm origin'lere izin ver
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

app.UseCors("AllowAll");
```

### 3. Cookie Ayarları

Login controller'ınızda cookie set ederken:

```csharp
Response.Cookies.Append("authToken", token, new CookieOptions
{
    HttpOnly = true,
    Secure = true,        // HTTPS kullanıyorsanız
    SameSite = SameSiteMode.None,  // Cross-origin istekler için ZORUNLU
    Expires = DateTimeOffset.UtcNow.AddDays(7)
});
```

### 4. HTTPS Sertifika Sorunu Varsa

Geliştirme ortamında HTTPS sertifika hatası alıyorsanız:

```bash
dotnet dev-certs https --trust
```

## Sıralama Önemli!

```csharp
var app = builder.Build();

app.UseCors("AllowFrontend");  // 1. CORS
app.UseRouting();               // 2. Routing
app.UseAuthentication();        // 3. Authentication
app.UseAuthorization();         // 4. Authorization
app.MapControllers();           // 5. Controllers

app.Run();
```

## Test

1. Backend'i yeniden başlatın
2. Browser console'u temizleyin
3. Login formunu tekrar deneyin
4. Network tab'de cookie'nin set edildiğini kontrol edin

## Hala Çalışmazsa

- Browser'ın developer tools > Network tab'inde OPTIONS request'i kontrol edin
- Response headers'da `Access-Control-Allow-Credentials: true` olmalı
- Backend console'da CORS error logu var mı bakın
