INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin Demo', 'admin@bytestore.test', '$2b$10$.sul0I4CoGK3gVfmMWo7HuNY0zwRadC.XmV5PN5/qQJY0CY8Zey6q', 'admin'),
  ('Cliente Demo', 'cliente@bytestore.test', '$2b$10$ZhWsziUfR4PBgs2LJNIdROrLxHGKVK5Q0tMGsBvlVZMYIGmPS8Rym', 'user');

INSERT INTO categories (name, description) VALUES
  ('Notebooks', 'Computadoras portátiles'),
  ('Celulares', 'Smartphones'),
  ('Audio', 'Auriculares y parlantes'),
  ('Periféricos', 'Mouses y teclados'),
  ('Monitores', 'Monitores para computadora'),
  ('Tablets', 'Tablets'),
  ('Consolas', 'Consolas de videojuegos'),
  ('Almacenamiento', 'Discos y unidades SSD');

INSERT INTO products (category_id, brand, model, description, price, stock, image_url) VALUES
  ((SELECT id FROM categories WHERE name = 'Notebooks'), 'Apple', 'MacBook Air M1', 'Chip M1, 8 GB de RAM y 256 GB de SSD. Pantalla Retina de 13,3 pulgadas.', 1899999, 6, '/images/products/macbook-air-m1.png'),
  ((SELECT id FROM categories WHERE name = 'Notebooks'), 'Lenovo', 'ThinkPad X1 Carbon', 'Intel Core i7, 16 GB de RAM y 512 GB de SSD. Pantalla de 14 pulgadas.', 2349999, 4, '/images/products/thinkpad-x1-carbon.jpg'),
  ((SELECT id FROM categories WHERE name = 'Celulares'), 'Apple', 'iPhone 14', '128 GB, color rojo. Pantalla Super Retina XDR de 6,1 pulgadas.', 1499999, 8, '/images/products/iphone-14.jpg'),
  ((SELECT id FROM categories WHERE name = 'Celulares'), 'Samsung', 'Galaxy S23', '256 GB y 8 GB de RAM. Pantalla AMOLED de 6,1 pulgadas.', 1299999, 10, '/images/products/galaxy-s23.jpg'),
  ((SELECT id FROM categories WHERE name = 'Audio'), 'JBL', 'Live 650BTNC', 'Auriculares over-ear Bluetooth con cancelación de ruido.', 189999, 15, '/images/products/jbl-live-650.jpg'),
  ((SELECT id FROM categories WHERE name = 'Audio'), 'Apple', 'AirPods Pro 2', 'Auriculares in-ear con cancelación activa de ruido y estuche de carga.', 399999, 12, '/images/products/airpods-pro-2.jpg'),
  ((SELECT id FROM categories WHERE name = 'Audio'), 'JBL', 'Charge 4', 'Parlante Bluetooth resistente al agua, hasta 20 horas de batería.', 229999, 9, '/images/products/jbl-charge-4.jpg'),
  ((SELECT id FROM categories WHERE name = 'Periféricos'), 'Logitech', 'MX Master 3S', 'Mouse inalámbrico ergonómico con clics silenciosos.', 169999, 20, '/images/products/mx-master-3s.jpg'),
  ((SELECT id FROM categories WHERE name = 'Periféricos'), 'Keychron', 'K8', 'Teclado mecánico inalámbrico, compatible con Windows y Mac.', 149999, 2, '/images/products/keychron-k8.jpg'),
  ((SELECT id FROM categories WHERE name = 'Monitores'), 'ASUS', 'ProArt PA246Q', 'Monitor de 24 pulgadas con resolución de 1920x1200.', 499999, 5, '/images/products/asus-proart-pa246q.jpg'),
  ((SELECT id FROM categories WHERE name = 'Tablets'), 'Samsung', 'Galaxy Tab S8 Ultra', 'Tablet con pantalla AMOLED de 14,6 pulgadas.', 1699999, 3, '/images/products/galaxy-tab-s8-ultra.jpg'),
  ((SELECT id FROM categories WHERE name = 'Consolas'), 'Nintendo', 'Switch', 'Consola híbrida con dock y Joy-Con rojo y azul.', 749999, 7, '/images/products/nintendo-switch.jpg'),
  ((SELECT id FROM categories WHERE name = 'Consolas'), 'Sony', 'PlayStation 5', 'Consola con lectora de discos y control DualSense.', 1199999, 0, '/images/products/playstation-5.png'),
  ((SELECT id FROM categories WHERE name = 'Almacenamiento'), 'Samsung', '870 QVO 2TB', 'Unidad SSD SATA de 2 TB.', 219999, 14, '/images/products/samsung-870-qvo.jpg');

WITH new_order AS (
  INSERT INTO orders (user_id, total_amount, payment_method, created_at)
  SELECT (SELECT id FROM users WHERE email = 'cliente@bytestore.test'), SUM(price), 'TARJETA', NOW() - INTERVAL '12 days'
    FROM products
   WHERE model IN ('MX Master 3S', 'K8')
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT new_order.id, p.id, 1, p.price
  FROM new_order, products p
 WHERE p.model IN ('MX Master 3S', 'K8');

WITH new_order AS (
  INSERT INTO orders (user_id, total_amount, payment_method, created_at)
  SELECT (SELECT id FROM users WHERE email = 'cliente@bytestore.test'), SUM(price), 'MERCADO_PAGO', NOW() - INTERVAL '3 days'
    FROM products
   WHERE model = 'AirPods Pro 2'
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT new_order.id, p.id, 1, p.price
  FROM new_order, products p
 WHERE p.model = 'AirPods Pro 2';
