# API Daftar Produk (Express.js)

REST API sederhana untuk daftar produk, dengan pemisahan route, controller, dan middleware. Data disimpan di array (tanpa database).

## Struktur Proyek

```
src/
├── controllers/
│   └── products.controller.js   # Membaca request lalu mengirim response
├── middleware/
│   └── request-logger.js        # Mencatat method dan URL setiap request
├── routes/
│   └── products.routes.js       # Memasangkan method dan URL ke controller
├── app.js                       # Memasang middleware dan router
└── index.js                     # Menjalankan server dengan app.listen()
```

## Cara Menjalankan

```bash
npm install
npm run start
```

Server berjalan di `http://localhost:3000` (port bisa diganti lewat environment variable `PORT`).

## Daftar Endpoint

| Method | URL              | Keterangan                                           | Status        |
| ------ | ---------------- | ---------------------------------------------------- | ------------- |
| GET    | `/products`      | Mengambil semua produk                               | 200           |
| GET    | `/products/:id`  | Mengambil satu produk berdasarkan ID                 | 200 / 404     |
| POST   | `/products`      | Menambah produk baru (body JSON: `name`, `price`)    | 201           |

## Bukti Pengujian

Pengujian dilakukan dengan `curl` setelah menjalankan `npm run start`.

### GET semua produk

```bash
curl -i http://localhost:3000/products
```

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"name":"Buku","price":15000},{"id":2,"name":"Pulpen","price":5000}]
```

### GET produk berdasarkan ID

```bash
curl -i http://localhost:3000/products/1
```

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Buku","price":15000}
```

### GET produk yang tidak ada (404)

```bash
curl -i http://localhost:3000/products/999
```

```
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{"message":"Product not found"}
```

### POST produk baru

```bash
curl -i -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Penghapus","price":3000}'
```

```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"id":3,"name":"Penghapus","price":3000}
```

### GET setelah POST

```bash
curl -i http://localhost:3000/products
```

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"name":"Buku","price":15000},{"id":2,"name":"Pulpen","price":5000},{"id":3,"name":"Penghapus","price":3000}]
```

### Log server

```
> start
> node src/index.js

Server is running on port 3000
```
