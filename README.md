# ByteStore - Backend

API en Express y PostgreSQL. El frontend está en el repo `byte-store-front`.

## Cómo levantarlo

Hace falta Node.js y Docker Desktop abierto.

1. Crear la base. La primera vez que arranca carga las tablas y los datos de prueba:

   ```bash
   docker build -t bytestore-db .
   docker run -d --name bytestore-db -p 5432:5432 bytestore-db
   ```

2. Copiar `.env.example` a `.env` y completar:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=bytestore_user
   DB_PASSWORD=bytestore_pass
   DB_NAME=bytestore_db
   PORT=3000
   JWT_SECRET=cualquier-texto-largo
   ```

3. Levantar la API:

   ```bash
   npm install
   npm run dev
   ```

4. Levantar el front siguiendo el README de `byte-store-front` y abrir http://localhost:4200.

## Datos de prueba

La base arranca con 8 categorías, 14 productos con foto y 2 compras del usuario cliente.

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@bytestore.test` | `Admin1234` |
| Cliente | `cliente@bytestore.test` | `Cliente1234` |

Son usuarios de demostración, solo para correr el proyecto en local.

## Empezar de cero

Los datos de prueba solo se cargan cuando la base se crea. Para recargarlos hay que recrearla, lo que borra todos los datos locales:

```bash
docker rm -f -v bytestore-db
docker build -t bytestore-db .
docker run -d --name bytestore-db -p 5432:5432 bytestore-db
```
