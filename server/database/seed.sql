USE Nikhildealsense;

-- Demo user: demo@dealsense.ai / password123
INSERT INTO users (email, password_hash, name) VALUES
('demo@dealsense.ai', '$2a$10$hErLrkyH1eTqCyttlsAv9OSmEbJLmP1GBeyByMKwNWrP1P9aFhe3a', 'Demo User');

INSERT INTO stores (name, slug) VALUES
('Amazon', 'amazon'),
('Flipkart', 'flipkart'),
('Croma', 'croma');

INSERT INTO products (name, description, category, url, image_url) VALUES
('Apple iPhone 15 (128GB)', 'Latest iPhone with A16 Bionic and Dynamic Island.', 'Smartphones', 'https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html', 'https://placehold.co/400x400/1e293b/94a3b8?text=iPhone+15'),
('Samsung Galaxy S24 Ultra', 'Flagship Android with S Pen and AI features.', 'Smartphones', 'https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html', 'https://placehold.co/400x400/0f172a/94a3b8?text=Galaxy+S24'),
('Sony WH-1000XM5 Headphones', 'Industry-leading noise cancelling headphones.', 'Audio', 'https://books.toscrape.com/catalogue/soumission_998/index.html', 'https://placehold.co/400x400/312e81/e2e8f0?text=Sony+XM5'),
('Apple MacBook Air M3', '13-inch lightweight laptop with Apple Silicon.', 'Laptops', 'https://books.toscrape.com/catalogue/sharp-objects_997/index.html', 'https://placehold.co/400x400/14532d/bef264?text=MacBook+Air'),
('Noise ColorFit Pro 5', 'Fitness smartwatch with AMOLED display.', 'Wearables', 'https://books.toscrape.com/catalogue/sapiens-a-brief-history-of-humankind_996/index.html', 'https://placehold.co/400x400/7c2d12/fca5a5?text=ColorFit+Pro');

SET @p1 := 1, @p2 := 2, @p3 := 3, @p4 := 4, @p5 := 5;
SET @amz := 1, @fk := 2, @cr := 3;

-- iPhone 15 – downward trend (Wait)
INSERT INTO prices (product_id, store_id, price, recorded_at) VALUES
(@p1, @amz, 79900.00, DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(@p1, @fk, 78999.00, DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(@p1, @cr, 80999.00, DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(@p1, @amz, 79499.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(@p1, @fk, 78499.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(@p1, @cr, 80499.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(@p1, @amz, 77999.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(@p1, @fk, 77499.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(@p1, @cr, 79899.00, DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
(@p1, @amz, 76999.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(@p1, @fk, 76499.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(@p1, @cr, 78999.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(@p1, @amz, 75999.00, CURDATE()),
(@p1, @fk, 75499.00, CURDATE()),
(@p1, @cr, 77999.00, CURDATE());

-- Samsung – upward trend (Buy Now)
INSERT INTO prices (product_id, store_id, price, recorded_at) VALUES
(@p2, @amz, 118999.00, DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(@p2, @fk, 119499.00, DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(@p2, @cr, 120999.00, DATE_SUB(CURDATE(), INTERVAL 13 DAY)),
(@p2, @amz, 119499.00, DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(@p2, @fk, 120199.00, DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(@p2, @cr, 121499.00, DATE_SUB(CURDATE(), INTERVAL 9 DAY)),
(@p2, @amz, 120999.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(@p2, @fk, 121699.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(@p2, @cr, 122999.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(@p2, @amz, 122499.00, CURDATE()),
(@p2, @fk, 123199.00, CURDATE()),
(@p2, @cr, 124499.00, CURDATE());

-- Sony headphones
INSERT INTO prices (product_id, store_id, price, recorded_at) VALUES
(@p3, @amz, 29990.00, DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(@p3, @fk, 28999.00, DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(@p3, @cr, 30499.00, DATE_SUB(CURDATE(), INTERVAL 12 DAY)),
(@p3, @amz, 29990.00, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(@p3, @fk, 28499.00, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(@p3, @cr, 29999.00, DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
(@p3, @amz, 27999.00, CURDATE()),
(@p3, @fk, 27499.00, CURDATE()),
(@p3, @cr, 29499.00, CURDATE());

-- MacBook
INSERT INTO prices (product_id, store_id, price, recorded_at) VALUES
(@p4, @amz, 114900.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(@p4, @fk, 113999.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(@p4, @cr, 115999.00, DATE_SUB(CURDATE(), INTERVAL 10 DAY)),
(@p4, @amz, 112900.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(@p4, @fk, 111999.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(@p4, @cr, 114499.00, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(@p4, @amz, 109900.00, CURDATE()),
(@p4, @fk, 108999.00, CURDATE()),
(@p4, @cr, 112999.00, CURDATE());

-- Noise watch
INSERT INTO prices (product_id, store_id, price, recorded_at) VALUES
(@p5, @amz, 3999.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
(@p5, @fk, 3799.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
(@p5, @cr, 4299.00, DATE_SUB(CURDATE(), INTERVAL 8 DAY)),
(@p5, @amz, 3799.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(@p5, @fk, 3699.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(@p5, @cr, 4099.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
(@p5, @amz, 3599.00, CURDATE()),
(@p5, @fk, 3499.00, CURDATE()),
(@p5, @cr, 3999.00, CURDATE());

INSERT INTO wishlist (user_id, product_id) VALUES (1, 1), (1, 3);
