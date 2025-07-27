<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Appointment System (Backend)

Bu proje, işletme sahiplerinin işletmelerini, randevularını ve hizmetlerini kolayca yönetebileceği ve müşterilerin kolayca randevu oluşturabileceği **çok rollü** bir randevu yönetim sistemidir. Modern yazılım standartlarına uygun olarak geliştirilmiş olup **NestJS**, **PostgreSQL**, **TypeORM**, **JWT**, **Twilio**, **Ethereal**, **Swagger** gibi teknolojilerle donatılmıştır.

Sistem, çeşitli kullanıcı rolleri **(Admin, Business, Customer)** için farklı yetkilendirme seviyeleri sunarak güvenli ve esnek bir randevu deneyimi sağlar. API, **JWT tabanlı kimlik doğrulama** kullanarak admin ve işletme sahiplerinin güvenliğini garanti ederken, müşteriler için doğrudan randevu oluşturma imkanı sunar.

---

## 🧱 Projede Kullanılan Teknolojiler

- **[NestJS](https://nestjs.com/)** – Modüler, ölçeklenebilir ve test edilebilir Node.js framework'ü
- **[PostgreSQL](https://www.postgresql.org/)** – Güçlü ilişkisel veritabanı
- **[TypeORM](https://typeorm.io/)** – PostgreSQL ile kolay etkileşim için bir ORM (Object-Relational Mapper). Entity ve veri erişim yönetimi için
- **[JWT (JSON Web Tokens)](https://jwt.io/)** – Kimlik doğrulama ve yetkilendirme
- **[Bcrypt](https://github.com/kelektiv/node.bcrypt.js)** – Şifre güvenliği
- **[Swagger (OpenAPI)](https://swagger.io/)** – API dokümantasyonu
- **[Twilio](https://www.twilio.com/)** – SMS doğrulama hizmeti
- **[Nodemailer](https://nodemailer.com/about/) + [Ethereal](https://ethereal.email/)** – E-posta doğrulama (test ortamı)

---

## 🧭 API Endpoints

| Rol          | Açıklama                                                                    |
| ------------ | --------------------------------------------------------------------------- |
| **Admin**    | İşletmeleri ve işletme sahiplerini yönetir, sistem paketlerini kontrol eder |
| **Business** | İşletme oluşturur, düzenler, hizmetlerini ve zaman aralıklarını yönetir     |
| **Customer** | Randevu oluşturur (giriş sistemi yok, sadece işlem bazlı kullanım)          |
| **Auth**     | Giriş, kayıt, e-posta doğrulama, JWT üretimi                                |

### **Auth**

- `POST /auth/register` – Yeni bir kullanıcı kaydı oluşturur.
- `POST /auth/confirm-email` – E-posta adresine gönderilen doğrulama kodu ile hesabın aktive edilmesini sağlar.
- `POST /auth/login` – Kullanıcının giriş yapmasını sağlar.
- `POST /auth/refresh` – Refresh token ile yeni bir access token alınmasını sağlar.
- `GET  /auth/me` – Giriş yapmış kullanıcının bilgilerini döner. (JWT doğrulaması gereklidir.)
- `GET  /auth/verify` – Mevcut access token’ın geçerli olup olmadığını kontrol eder. (JWT doğrulaması gereklidir.)
- `POST /auth/logout` – Kullanıcının çıkış yapmasını sağlar.

### **Business**

-- İşletme Yönetimi

- `POST /business/create` – Yeni bir işletme oluşturur.
- `GET /business/check-add-permission` – Kullanıcının yeni bir işletme ekleyip ekleyemeyeceğini kontrol eder.
- `PUT /business/:id` – Belirli bir işletmenin bilgilerini günceller.
- `GET /business/my-businesses` – Kullanıcının sahip olduğu tüm işletmeleri listeler.

-- Paketler

- `GET /business/packages` – Mevcut abonelik paketlerini listeler.
- `GET /business/my-package` – Kullanıcının aktif paket bilgilerini getirir.
- `POST /business/subscribe` – Bir pakete abone olunmasını sağlar.
  Zaman Dilimi (Time Slot) Yönetimi

- `POST /business/time-slot/create` – Yeni bir zaman dilimi oluşturur.
- `PUT /business/:businessId/time-slots/:slotId` – Belirli bir zaman dilimini günceller.
- `DELETE /business/time-slots/delete/:slotId` – Belirli bir zaman dilimini siler.
- `GET /business/:id/time-slots` – Belirli bir işletmenin tüm zaman dilimlerini getirir.
- `GET /business/:id/time-slots/:dayId` – Belirli bir işletmenin belirli bir güne ait zaman dilimlerini getirir.
- `GET /business/business/:businessId/detailed-slots-range?start=YYYY-MM-DD&end=YYYY-MM-DD` – Belirli bir tarih aralığında haftalık detaylı zaman dilimlerini getirir.

-- Hizmet (Service) Yönetimi

- `POST /business/:businessId/services` – Yeni bir hizmet oluşturur.
- `GET /business/:businessId/services` – Belirli bir işletmeye ait tüm hizmetleri listeler.
- `PUT /business/:businessId/services/:serviceId` – Belirli bir hizmeti günceller.
- `DELETE /business/:businessId/services/:serviceId` – Belirli bir hizmeti siler.

-- Randevu (Appointment) Yönetimi

- `GET /business/appointments` – Filtrelenmiş randevu listesini getirir.
- `GET /business/appointment` – Belirli bir zaman dilimine ait randevuyu getirir.
- `GET /business/appointments/:id` – ID ile tekil randevuyu getirir.

### **Admin**

- `POST /admin/create` – Abonelik paketi oluşturur.
- `POST /admin/getPackages` – Abonelik paketlerini getirir.
  (Eklenecek.)

### **Customer**

- `GET /customers/business/:slug` – Belirli bir işletmenin URL slug'ını kullanarak detaylı bilgilerini getirir. Müşterilerin randevu almadan önce işletme hakkında bilgi edinmesini sağlar.
- `GET /customers/business/:businessId/detailed-slots/:date` – Belirli bir işletme ve tarih için müsait ve dolu olan zaman dilimlerinin detaylı listesini getirir. Müşterilerin randevu alırken uygun saatleri görmesini sağlar.
- `POST /customers/initiate-appointment-booking` – Randevu oluşturma sürecini başlatır. Müşterinin verdiği telefon numarasına bir doğrulama kodu (SMS ile) gönderir. Henüz randevu oluşturulmaz, sadece doğrulama başlatılır.
- `POST /customers/verify-phone` – Bir önceki adımda gönderilen doğrulama kodunu ve telefon numarasını kontrol ederek telefon numarasını doğrular.
- `POST /customers/finalize-appointment` – elefon numarası başarıyla doğrulandıktan sonra, randevuyu sisteme kaydeder ve kesinleştirir.

---

## 🔐 Kimlik Doğrulama & Güvenlik

- **JWT**, sadece `admin` ve `business` rollerinde kullanılır (`customer` login sistemi kullanmaz)
- Token süresi: `4 saat`
- Ortak erişim JWT modülü:
  ```ts
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    global: true,
    signOptions: { expiresIn: '4h' },
  });
  ```
- Şifreler bcrypt ile hashlenir.
- Kayıt esnasında E-posta doğrulama.(Test Ortamı için Nodemailer + Ethereal)
- Randevu oluştururken SMS doğrulama.

---

## 📚 API Dokümentasyon

- Swagger UI için ziyaret et. [http://localhost:3002/docs](http://localhost:3002/docs)

---

## Appointment System Backend Ubuntu Server'da Çalıştırma

Bu rehber, Appointment System Backend uygulamasını bir Ubuntu Server üzerinde başarıyla kurmak, yapılandırmak ve kalıcı olarak çalıştırmak için adım adım talimatlar sunar. Kendi ev sunucunuzda (eski bir bilgisayar olabilir) yerel bir PostgreSQL veritabanı ve PM2 ile uygulamanızı dağıtmak için tasarlanmıştır.

- Öncelikle kendi evimdeki eski bilgisayarıma Ubuntu Server(24.04.2) kurulumu yaptım.
- Ardından tekrar tekrar IP değişmemesi için IP'sini sabitledim.(Netplan konfigürasyon ile)
- Sonrasında kendi cihazımdan **ssh sami@SERVER_IP** komutu ile kurduğum sunucuya bağlandım.

### NodeJS ve npm Kurulumu

Node.js, backend uygulamamızın çalıştığı runtime ortamıdır. npm ise Node.js paket yöneticisidir.

```bash
# NodeSource'dan NodeJS 22.x sürümünü ekle
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -

# NodeJS ve npm'i yükle
sudo apt install -y nodejs

# Kurulumu doğrula
node -v  # Node.js versiyonunu gösterir (örn: v22.x.x)
npm -v   # npm versiyonunu gösterir (örn: 10.x.x)
```

---

### GİT Kurulumu

Proje dosyalarını GitHub reposundan klonlamak için Git'e ihtiyacımız var.

```bash
# Git'i yükle
sudo apt install git

# Kurulumu doğrula
git -v # Git versiyonunu gösterir
```

---

### PostgreSQL Kurulumu

Verileri depolamak için PostgreSQL kullanıyoruz.

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

PostgreSQL sunucusuna "postgres" kullanıcısı olarak bağlanır ve PostgreSQL komut satırı arayüzünü (CLI) açar.

```bash
sudo -u postgres psql
```

```bash
# 'appointment_system' adında bir veritabanı oluşturur
CREATE DATABASE appointment_system;

# 'myuser' adında ve 'mypassword' şifresine sahip bir kullanıcı oluşturur
CREATE USER myuser WITH PASSWORD 'mypassword';

# "myuser" kullanıcısına "appointment_system" veritabanı üzerinde tüm yetkileri verir.
# Bu, kullanıcının tablo oluşturma, silme, veri ekleme/güncelleme/silme gibi tüm işlemleri yapabilmesini sağlar.
GRANT ALL PRIVILEGES ON DATABASE appointment_system TO myuser;

# Opsiyonel: Veritabanının sahipliğini oluşturduğunuz kullanıcıya aktarın
ALTER DATABASE appointment_system OWNER TO myuser;
```

'appointment_system' adında bir database oluşturur.

```bash
CREATE DATABASE appointment_system;
```

'myuser' adında 'mypassword' şifresine sahip bir kullanıcı oluşturur.

```bash
CREATE USER myuser WITH PASSWORD 'mypassword';
```

"myuser" kullanıcısına "appointment_system" veritabanı üzerinde TÜM yetkileri verir.Bu, kullanıcının tablo oluşturma, silme, veri ekleme/güncelleme/silme gibi tüm işlemleri yapabilmesini sağlar.

```bash
GRANT ALL PRIVILEGES ON DATABASE appointment_system TO myuser;
```

Veritabanı sahipliği değiştirme

```bash
ALTER DATABASE appointment_system OWNER TO myuser;
```

Postgre arayüzünden çık.

```bash
\q
```

Oluşturulan veri tabanlarını listeler.

```bash
\l
```

Oluşturulan kullanıcıları listeler.

```bash
\du
```

`appointment_system`veritabanına bağlanır. Buradan SQL kodları ile istediğimiz işlemleri yapabiliriz.

```bash
\c appointment_system
```

Postgre arayüzünden çık.

```bash
\q
```

---

### Backend API Sunucuda Çalıştırma

Öncelikle kodlarımızı bir GitHub deposuna atıyoruz.

Projemizin GitHub deposunu sunucumuza klonluyoruz.

```bash
git clone https://github.com/Rocktiel/appointment_system_backend
```

Proje dizinine gidiyoruz.

```bash
cd nest_example_backend
```

Ardından gerekli bağımlılıkları yüklüyoruz.

```bash
npm install
```

Ortam değişikliklerini sakladığımız .env dosyamızı oluşturuyoruz.Bu dosya, hassas bilgileri (veritabanı şifreleri, API anahtarları vb.) projenin kendisinden ayrı tutmak için kullanılır.

```bash
nano .env
```

Uygulamayı Derleme (Build)

```bash
npm run build
```

### PM2 ile Uygulamayı Başlatma ve Yönetme

PM2, Node.js uygulamalarını üretimde sürekli olarak çalıştırmak, yeniden başlatmak ve izlemek için güçlü bir süreç yöneticisidir.

```bash
# PM2'yi global olarak yükle (eğer yüklü değilse)
sudo npm install -g pm2

# Backend uygulamasını PM2 ile başlat
# ÖNEMLİ: Bu komutu projenizin kök dizininde (`appointment_system_backend`) çalıştırdığınızdan emin olun.
pm2 start dist/main.js --name appointment-backend --cwd /home/sami/appointment_system_backend

# PM2'nin sistemi yeniden başlattığında uygulamalarınızı otomatik olarak başlatmasını sağlar
pm2 startup

# Mevcut çalışan uygulamaların listesini (appointment-backend gibi) kalıcı olarak kaydeder
pm2 save
```

pm2 yüklüyoruz.

```bash
sudo npm install -g pm2
```

Backend'i başlatıyoruz.

```bash
pm2 start dist/main.js --name appointment_backend
```

Sistemi yeniden başlattığımızda PM2'nin otomatik olarak devreye girmesini sağlar.

```bash
pm2 startup
```

Şu anda çalışan uygulamaların listesini (appointment_backend gibi) kalıcı olarak kaydeder.

```bash
pm2 save
```

Başlattığımız bir projenin hata fırlatıp fırlatmadığına bakabiliriz.

```bash
pm2 logs appointment_backend
```

Backend'i yeniden başlatır.

```bash
pm2 restart appointment_backend
```

Güvenlik Duvarı (UFW) Ayarları
Sunucunuzda UFW (Uncomplicated Firewall) etkinse, backend API'nizin dışarıdan erişilebilir olması için 3002 numaralı portu açmanız gerekir:

```bash
# Backend'in dinlediği 3002 TCP portunu aç
sudo ufw allow 3002/tcp

# UFW güvenlik duvarını etkinleştir (eğer daha önce etkin değilse)
sudo ufw enable

# Güvenlik duvarı durumunu kontrol et
sudo ufw status
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
