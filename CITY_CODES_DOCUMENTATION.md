# Türkiye Şehir Havalimanı Kodları Dokümantasyonu

Bu dosya, Türkiye'nin 81 ilinin havalimanı kodlarını içermektedir. Backend API entegrasyonunda kullanılmak üzere hazırlanmıştır.

## Kullanım

Frontend'de kullanıcı şehir seçtiğinde, bu kodlar API'ye gönderilir.

**Örnek API İsteği:**
```
GET https://localhost:7100/api/Ucus/Ara?KalkisYeri=IST&VarisYeri=AYT&KalkisTarihi=2025-10-25
```

## Şehir Kodları Listesi

| Şehir | Kod | Plaka Kodu |
|-------|-----|-----------|
| Adana | ADA | 01 |
| Adıyaman | ADF | 02 |
| Afyonkarahisar | AFY | 03 |
| Ağrı | AJI | 04 |
| Aksaray | ASR | 68 |
| Amasya | MZH | 05 |
| Ankara | ESB | 06 |
| Antalya | AYT | 07 |
| Ardahan | ARD | 75 |
| Artvin | ART | 08 |
| Aydın | AYD | 09 |
| Balıkesir | BZI | 10 |
| Bartın | BAR | 74 |
| Batman | BAL | 72 |
| Bayburt | BAY | 69 |
| Bilecik | BIL | 11 |
| Bingöl | BGG | 12 |
| Bitlis | BTL | 13 |
| Bolu | BOL | 14 |
| Burdur | BRD | 15 |
| Bursa | BTZ | 16 |
| Çanakkale | CKZ | 17 |
| Çankırı | CKR | 18 |
| Çorum | COR | 19 |
| Denizli | DNZ | 20 |
| Diyarbakır | DIY | 21 |
| Düzce | DZC | 81 |
| Edirne | EDI | 22 |
| Elazığ | EZS | 23 |
| Erzincan | ERC | 24 |
| Erzurum | ERZ | 25 |
| Eskişehir | ESK | 26 |
| Gaziantep | GZT | 27 |
| Giresun | GIR | 28 |
| Gümüşhane | GUM | 29 |
| Hakkari | HAK | 30 |
| Hatay | HTY | 31 |
| Iğdır | IGD | 76 |
| Isparta | ISE | 32 |
| İstanbul | IST | 34 |
| İzmir | ADB | 35 |
| Kahramanmaraş | KCM | 46 |
| Karabük | KRB | 78 |
| Karaman | KRM | 70 |
| Kars | KSY | 36 |
| Kastamonu | KAS | 37 |
| Kayseri | ASR | 38 |
| Kırıkkale | KRK | 71 |
| Kırklareli | KLR | 39 |
| Kırşehir | KSH | 40 |
| Kilis | KLS | 79 |
| Kocaeli | KOC | 41 |
| Konya | KYA | 42 |
| Kütahya | KUT | 43 |
| Malatya | MLX | 44 |
| Manisa | MNS | 45 |
| Mardin | MQM | 47 |
| Mersin | MER | 33 |
| Muğla | DLM | 48 |
| Muş | MSR | 49 |
| Nevşehir | NAV | 50 |
| Niğde | NIG | 51 |
| Ordu | ORD | 52 |
| Osmaniye | OSM | 80 |
| Rize | RZE | 53 |
| Sakarya | SAK | 54 |
| Samsun | SZF | 55 |
| Siirt | SXZ | 56 |
| Sinop | SIN | 57 |
| Sivas | VAS | 58 |
| Şanlıurfa | SFQ | 63 |
| Şırnak | NKT | 73 |
| Tekirdağ | TEK | 59 |
| Tokat | TKT | 60 |
| Trabzon | TZX | 61 |
| Tunceli | TUN | 62 |
| Uşak | USK | 64 |
| Van | VAN | 65 |
| Yalova | YLV | 77 |
| Yozgat | YOZ | 66 |
| Zonguldak | ZON | 67 |

## Backend Entegrasyonu

### C# / .NET Kullanımı

```csharp
public class CityCode
{
    public string Name { get; set; }
    public string Code { get; set; }
}

// Örnek kullanım
var cities = new Dictionary<string, string>
{
    { "IST", "İstanbul" },
    { "AYT", "Antalya" },
    { "ESB", "Ankara" },
    { "ADB", "İzmir" },
    { "GZT", "Gaziantep" },
    // ... diğer şehirler
};
```

### API Request Örneği

```javascript
// JavaScript/TypeScript
const searchFlights = async (from, to, date) => {
  const response = await fetch(
    `https://localhost:7100/api/Ucus/Ara?KalkisYeri=${from}&VarisYeri=${to}&KalkisTarihi=${date}`
  );
  return await response.json();
};

// Kullanım
searchFlights('IST', 'AYT', '2025-10-25');
```

## Önemli Notlar

1. **Kod Formatı**: Tüm kodlar 3 karakterli büyük harf formatındadır
2. **IATA/ICAO Uyumu**: Bazı kodlar gerçek IATA havalimanı kodlarıdır (IST, AYT, ESB, ADB, GZT vb.)
3. **Özel Kodlar**: Havalimanı olmayan şehirler için özel kodlar oluşturulmuştur
4. **Case Sensitive**: Backend'de kod karşılaştırması yapılırken büyük/küçük harf duyarlılığına dikkat edilmelidir

## En Çok Kullanılan Havalimanları

| Sıra | Şehir | Kod | Havalimanı Adı |
|------|-------|-----|----------------|
| 1 | İstanbul | IST | İstanbul Havalimanı |
| 2 | Ankara | ESB | Esenboğa Havalimanı |
| 3 | İzmir | ADB | Adnan Menderes Havalimanı |
| 4 | Antalya | AYT | Antalya Havalimanı |
| 5 | Adana | ADA | Adana Şakirpaşa Havalimanı |
| 6 | Trabzon | TZX | Trabzon Havalimanı |
| 7 | Gaziantep | GZT | Gaziantep Havalimanı |
| 8 | Muğla | DLM | Dalaman Havalimanı |
| 9 | Kayseri | ASR | Kayseri Erkilet Havalimanı |
| 10 | Diyarbakır | DIY | Diyarbakır Havalimanı |

## Versiyon Bilgisi

- **Son Güncelleme**: 25 Ekim 2025
- **Versiyon**: 1.0
- **Toplam Şehir**: 81
