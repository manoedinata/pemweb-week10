# API Daftar Produk (Express.js + Prisma + PostgreSQL)

REST API daftar produk dengan pemisahan route, controller, dan middleware. Minggu ke-10: data tidak lagi disimpan di array memori Express, tetapi di **PostgreSQL** melalui **Prisma ORM 7**. Produk tetap ada walaupun server Express dimulai ulang.

## Struktur Proyek

```
api-docs/                        # Koleksi Bruno untuk menguji semua endpoint
images/bruno/                    # Screenshot hasil pengujian di Bruno
prisma/
├── migrations/                  # Riwayat perubahan struktur tabel (file SQL)
├── schema.prisma                # Model Product
└── seed.js                      # Data awal (Buku, Pulpen)
src/
├── controllers/
│   └── products.controller.js   # Query ke database lewat Prisma Client
├── lib/
│   └── prisma.js                # Membuat PrismaClient dengan adapter PostgreSQL
├── middleware/
│   ├── error-handler.js         # JSON rusak (400) dan error tak terduga (500)
│   ├── request-logger.js        # Mencatat method dan URL setiap request
│   └── validate-product.js      # Validasi body (name, price) dan parameter :id
├── routes/
│   └── products.routes.js       # Memasangkan method dan URL ke controller
├── app.js                       # Memasang middleware dan router
└── index.js                     # Menjalankan server dengan app.listen()
prisma.config.js                 # Konfigurasi Prisma 7 (schema, migrations, DATABASE_URL)
docker-compose.yml               # PostgreSQL lokal untuk pengembangan
.env.example                     # Contoh DATABASE_URL (file .env tidak masuk Git)
```

## Model

```prisma
model Product {
  id        Int      @id @default(autoincrement())
  name      String
  price     Int
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("products")
}
```

ID dibuat otomatis oleh database (`SERIAL`), bukan counter array di Express.

## Cara Menjalankan

```bash
# 1. Jalankan PostgreSQL (atau pakai PostgreSQL sendiri)
docker compose up -d

# 2. Siapkan environment
cp .env.example .env
# lalu isi DATABASE_URL, contoh untuk docker-compose di atas:
# DATABASE_URL="postgresql://pemweb:pemweb@localhost:5433/products_db"

# 3. Install dependency (otomatis menjalankan prisma generate)
npm install

# 4. Terapkan migration dan isi data awal
npm run db:deploy
npm run db:seed

# 5. Jalankan server
npm run start
```

Server berjalan di `http://localhost:3000`. Prisma Studio: `npm run db:studio`.

## Daftar Endpoint

| Method | URL             | Keterangan                                      | Status          |
| ------ | --------------- | ----------------------------------------------- | --------------- |
| GET    | `/products`     | Mengambil semua produk                          | 200             |
| GET    | `/products/:id` | Mengambil satu produk berdasarkan ID            | 200 / 400 / 404 |
| POST   | `/products`     | Membuat produk baru (body: `name`, `price`)     | 201 / 400       |
| PUT    | `/products/:id` | Mengubah produk (body sama dengan POST + id)    | 200 / 400 / 404 |
| DELETE | `/products/:id` | Menghapus produk berdasarkan ID                 | 200 / 400 / 404 |

Aturan validasi:

- `name` wajib, berupa string tidak kosong.
- `price` wajib, berupa bilangan bulat `>= 0` (string `"7000"` ditolak).
- `id` pada URL harus bilangan bulat positif.
- Body yang bukan JSON valid dijawab `400 Invalid JSON body`.

## Bukti Pengujian (Bruno)

Koleksi Bruno ada di folder [`api-docs/`](api-docs/). Buka di Bruno lewat **Open Collection**, pilih environment **Local**, lalu jalankan request secara berurutan (atau **Run Collection**). Request **Create Product** menyimpan id produk baru ke variabel `productId`, yang dipakai oleh request PUT dan DELETE.

Lewat CLI:

```bash
cd api-docs
npx @usebruno/cli run -r --env Local
```

### GET

| Skenario | Request | Hasil |
| --- | --- | --- |
| Semua produk | `GET /products` | 200 OK |
| Produk berdasarkan ID | `GET /products/1` | 200 OK |
| ID tidak ada | `GET /products/999` | 404 Not Found |
| ID bukan angka | `GET /products/abc` | 400 Bad Request |

![GET semua produk](images/bruno/01-get-all-products.png)
![GET produk berdasarkan ID](images/bruno/02-get-product-by-id.png)
![GET produk tidak ditemukan](images/bruno/03-get-product-not-found.png)
![GET produk dengan ID tidak valid](images/bruno/04-get-product-invalid-id.png)

### POST

| Skenario | Body | Hasil |
| --- | --- | --- |
| Produk baru | `{"name":"Penghapus","price":3000}` | 201 Created |
| Name kosong, price negatif | `{"name":"","price":-5}` | 400 Bad Request |
| Price berupa string | `{"name":"Spidol","price":"7000"}` | 400 Bad Request |
| JSON rusak | `{"name":"Spidol",` | 400 Bad Request |

![POST produk baru](images/bruno/05-create-product.png)
![POST name kosong dan price negatif](images/bruno/06-create-product-empty-fields.png)
![POST price berupa string](images/bruno/07-create-product-price-string.png)
![POST JSON rusak](images/bruno/08-create-product-invalid-json.png)

### PUT

| Skenario | Request | Hasil |
| --- | --- | --- |
| Ubah produk | `PUT /products/3` `{"name":"Penghapus Besar","price":4500}` | 200 OK |
| ID tidak ada | `PUT /products/999` | 404 Not Found |
| Tanpa price | `PUT /products/3` `{"name":"Penghapus Besar"}` | 400 Bad Request |

![PUT ubah produk](images/bruno/09-update-product.png)
![PUT produk tidak ditemukan](images/bruno/10-update-product-not-found.png)
![PUT tanpa price](images/bruno/11-update-product-missing-price.png)

### DELETE

| Skenario | Request | Hasil |
| --- | --- | --- |
| Hapus produk | `DELETE /products/3` | 200 OK |
| Hapus lagi produk yang sama | `DELETE /products/3` | 404 Not Found |
| ID bukan angka | `DELETE /products/abc` | 400 Bad Request |

![DELETE produk](images/bruno/12-delete-product.png)
![DELETE produk yang sudah dihapus](images/bruno/13-delete-product-already-deleted.png)
![DELETE produk dengan ID tidak valid](images/bruno/14-delete-product-invalid-id.png)

## Bukti Pengujian (curl dan isi database)

Pengujian dengan `curl` setelah `npm run start`. Isi tabel diperiksa dengan:

```bash
docker exec pemweb-week10-pg psql -U pemweb -d products_db \
  -c 'SELECT id, name, price FROM products ORDER BY id;'
```

### Database sebelum pengujian (hasil seed)

```
 id |  name  | price
----+--------+-------
  1 | Buku   | 15000
  2 | Pulpen |  5000
(2 rows)
```

### GET semua produk (200)

```bash
curl -i http://localhost:3000/products
```

```
HTTP/1.1 200 OK

[{"id":1,"name":"Buku","price":15000,"createdAt":"2026-11-08T08:31:47.683Z","updatedAt":"2026-11-08T08:31:47.683Z"},{"id":2,"name":"Pulpen","price":5000,"createdAt":"2026-11-08T08:31:47.683Z","updatedAt":"2026-11-08T08:31:47.683Z"}]
```

### GET produk berdasarkan ID (200, 404, 400)

```bash
curl -i http://localhost:3000/products/1
curl -i http://localhost:3000/products/999
curl -i http://localhost:3000/products/abc
```

```
HTTP/1.1 200 OK
{"id":1,"name":"Buku","price":15000,"createdAt":"2026-11-08T08:31:47.683Z","updatedAt":"2026-11-08T08:31:47.683Z"}

HTTP/1.1 404 Not Found
{"message":"Product not found"}

HTTP/1.1 400 Bad Request
{"message":"Validation error","errors":["id harus bilangan bulat positif"]}
```

### POST produk baru (201)

```bash
curl -i -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Penghapus","price":3000}'
```

```
HTTP/1.1 201 Created
{"id":3,"name":"Penghapus","price":3000,"createdAt":"2026-11-08T08:32:13.320Z","updatedAt":"2026-11-08T08:32:13.320Z"}
```

### POST gagal validasi (400)

```bash
curl -i -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{"name":"","price":-5}'
curl -i -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{"name":"Spidol","price":"7000"}'
curl -i -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{"name":"Spidol",'
```

```
HTTP/1.1 400 Bad Request
{"message":"Validation error","errors":["name wajib diisi dan berupa string","price wajib diisi dan berupa bilangan bulat >= 0"]}

HTTP/1.1 400 Bad Request
{"message":"Validation error","errors":["price wajib diisi dan berupa bilangan bulat >= 0"]}

HTTP/1.1 400 Bad Request
{"message":"Invalid JSON body"}
```

Database setelah POST (hanya request yang valid tersimpan):

```
 id |   name    | price
----+-----------+-------
  1 | Buku      | 15000
  2 | Pulpen    |  5000
  3 | Penghapus |  3000
(3 rows)
```

### PUT mengubah produk (200, 404, 400)

```bash
curl -i -X PUT http://localhost:3000/products/2 -H "Content-Type: application/json" -d '{"name":"Pulpen Gel","price":7500}'
curl -i -X PUT http://localhost:3000/products/999 -H "Content-Type: application/json" -d '{"name":"X","price":1}'
curl -i -X PUT http://localhost:3000/products/2 -H "Content-Type: application/json" -d '{"name":"Pulpen Gel"}'
```

```
HTTP/1.1 200 OK
{"id":2,"name":"Pulpen Gel","price":7500,"createdAt":"2026-11-08T08:31:47.683Z","updatedAt":"2026-11-08T08:32:13.390Z"}

HTTP/1.1 404 Not Found
{"message":"Product not found"}

HTTP/1.1 400 Bad Request
{"message":"Validation error","errors":["price wajib diisi dan berupa bilangan bulat >= 0"]}
```

Database setelah PUT (`updatedAt` ikut berubah):

```
 id |    name    | price
----+------------+-------
  1 | Buku       | 15000
  2 | Pulpen Gel |  7500
  3 | Penghapus  |  3000
(3 rows)
```

### DELETE menghapus produk (200, 404)

```bash
curl -i -X DELETE http://localhost:3000/products/3
curl -i -X DELETE http://localhost:3000/products/3
```

```
HTTP/1.1 200 OK
{"message":"Product deleted","product":{"id":3,"name":"Penghapus","price":3000,"createdAt":"2026-11-08T08:32:13.320Z","updatedAt":"2026-11-08T08:32:13.320Z"}}

HTTP/1.1 404 Not Found
{"message":"Product not found"}
```

Database setelah DELETE:

```
 id |    name    | price
----+------------+-------
  1 | Buku       | 15000
  2 | Pulpen Gel |  7500
(2 rows)
```

### Data tetap ada setelah restart Express

Server dihentikan lalu dijalankan ulang, kemudian:

```bash
curl http://localhost:3000/products
```

```
[{"id":1,"name":"Buku","price":15000,...},{"id":2,"name":"Pulpen Gel","price":7500,...}]
```

Berbeda dengan minggu ke-9 (array), perubahan dari PUT dan DELETE tetap tersimpan.

### Log server

```
Server is running on port 3000
2026-11-08T08:32:13.214Z GET /products
2026-11-08T08:32:13.285Z GET /products/1
2026-11-08T08:32:13.297Z GET /products/999
2026-11-08T08:32:13.305Z GET /products/abc
2026-11-08T08:32:13.317Z POST /products
2026-11-08T08:32:13.326Z POST /products
2026-11-08T08:32:13.331Z POST /products
2026-11-08T08:32:13.388Z PUT /products/2
2026-11-08T08:32:13.399Z PUT /products/999
2026-11-08T08:32:13.410Z PUT /products/2
2026-11-08T08:32:13.460Z DELETE /products/3
2026-11-08T08:32:13.471Z DELETE /products/3
```

## Migration

Migration awal ada di `prisma/migrations/20261108083143_init/migration.sql`:

```sql
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
```

Perubahan struktur berikutnya dibuat dengan `npx prisma migrate dev --name <nama>` sehingga tercatat sebagai file SQL baru.
