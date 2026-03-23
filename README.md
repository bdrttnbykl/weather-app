# Weather App

Modern, zengin ozellikli bir hava durumu uygulamasi. Kullanici sehir arayabilir, mevcut konumunu kullanabilir, saatlik ve 5 gunluk tahmine bakabilir, favori sehirlerini kaydedebilir ve hava kalitesi gibi ek verileri gorebilir.

## Ozellikler

- Sehre gore anlik hava durumu arama
- Konuma gore hava durumu alma
- Saatlik tahmin kartlari
- 5 gunluk tahmin kartlari
- Hava durumuna gore dinamik arka plan
- Dark Mode / Light Mode
- Celsius / Fahrenheit degistirici
- Son aranan sehri hatirlama
- Favori sehirleri localStorage ile kaydetme
- Hava kalitesi gostergesi
- Gundogumu / gunbatimi bilgisi
- Hava durumuna gore kisa yorumlar
- Loading spinner ve gelistirilmis hata mesajlari
- Responsive tasarim
- PWA destegi icin manifest ve service worker

## Kullanilan Teknolojiler

- HTML5
- CSS3
- Vanilla JavaScript
- OpenWeather API
- LocalStorage
- Geolocation API
- Service Worker
- Web App Manifest

## Proje Yapisi

```text
weather-app/
|- index.html
|- style.css
|- script.js
|- manifest.json
|- sw.js
|- README.md
```

## Kurulum

1. Repoyu klonla:

```bash
git clone https://github.com/kullaniciadi/weather-app.git
cd weather-app
```

2. Projeyi bir local server ile ac.

Ornek:

```bash
npx serve .
```

veya VS Code icinde `Live Server` kullan.

## API Bilgisi

Proje OpenWeather API kullaniyor. Mevcut surumde API anahtari [script.js](./script.js) icinde tanimli.

```js
const apiKey = "YOUR_API_KEY";
```

Daha guvenli kullanim icin bu anahtarin frontend icinde acik tutulmamasi gerekir. Gercek dagitimda backend proxy ya da environment tabanli bir yapi tercih edilmelidir.

## Uygulama Akisi

1. Kullanici bir sehir girer veya `Konumum` butonuna basar.
2. Uygulama mevcut hava durumu verisini alir.
3. Ardindan forecast ve air pollution endpointlerinden ek veriler cekilir.
4. Ekranda:
   - anlik hava durumu
   - saatlik tahmin
   - 5 gunluk tahmin
   - hava kalitesi
   - gundogumu / gunbatimi
   bilgileri gosterilir.
5. Son aranan sehir, secilen tema ve birim localStorage ile saklanir.

## LocalStorage Kullanimi

Uygulama su verileri localStorage icinde tutar:

- `lastCity`
- `favoriteCities`
- `themeMode`
- `temperatureUnit`

## PWA Desteji

Proje temel PWA dosyalarina sahiptir:

- [manifest.json](./manifest.json)
- [sw.js](./sw.js)

Bu sayede uygulama destekleyen tarayicilarda kurulabilir yapiya yaklasir ve bazi statik dosyalar cachelenir.

## Gelistirme Notlari

- Projede Turkce karakterler yerine ASCII tabanli metinler kullanildi. Bunun nedeni mevcut encoding sorununun kirik karakter uretmesiydi.
- `manifest.json` icindeki ikonlar simdilik harici kaynaktan geliyor. Uretim kalitesinde kullanim icin yerel ikon dosyalari eklemek daha dogru olur.
- Service worker temel seviyede cache yapiyor. Daha gelismis offline senaryolari icin genisletilebilir.

## Olası Sonraki Iyilestirmeler

- Gercek UTF-8 karakter temizligi
- Backend uzerinden API key gizleme
- Daha guclu offline destegi
- Favoriler icin surukle-birak siralama
- Saatlik tahmin icin yatay kaydirma deneyimi
- Grafik tabanli sicaklik gosterimi

## Ekran Goruntusu

Istersen bu bolume daha sonra uygulamanin ekran goruntulerini ekleyebilirsin:

```md
![Ana ekran](./assets/screenshot-home.png)
```

## Lisans

Bu proje kisisel gelisim ve portfoy amacli kullanilabilir. Istersen buraya `MIT` gibi bir lisans da ekleyebilirsin.
