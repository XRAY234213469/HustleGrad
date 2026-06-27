-- HustleGrad Production Demo Schema
-- Re-runnable development seed for the campus marketplace.

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  admission_number VARCHAR(80) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
    CHECK (email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone_number VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  profile_picture_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  tfa_code VARCHAR(6),
  tfa_expires_at TIMESTAMPTZ,
  reset_code VARCHAR(6),
  reset_code_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  seller_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  photo_url TEXT,
  contact_phone VARCHAR(30),
  campus_zone VARCHAR(80) NOT NULL CHECK (
    campus_zone IN (
      'Student Centre (STC)',
      'Phase 2',
      'The Library Gates',
      'The Cafeteria/Gazebos'
    )
  ),
  view_count INT NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  booking_id INT UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_admission_number ON users (admission_number);
CREATE INDEX idx_listings_seller ON listings (seller_id);
CREATE INDEX idx_listings_category ON listings (category_id);
CREATE INDEX idx_listings_campus_zone ON listings (campus_zone);
CREATE INDEX idx_listings_created ON listings (created_at DESC);
CREATE INDEX idx_listings_search ON listings USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_bookings_buyer ON bookings (buyer_id);
CREATE INDEX idx_bookings_listing ON bookings (listing_id);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_receiver ON messages (receiver_id);
CREATE INDEX idx_messages_listing ON messages (listing_id);
CREATE INDEX idx_messages_thread ON messages (listing_id, sender_id, receiver_id);

INSERT INTO categories (name, description) VALUES
  ('Graphics & Design', 'Logo designs, posters, flyers, and branding elements'),
  ('Tech & Repairs', 'Laptop troubleshooting, OS installation, and minor electronic repairs'),
  ('Food & Baking', 'On-campus snacks, custom birthday cakes, and delivery'),
  ('Apparel & Tailoring', 'Clothing alterations, thrift drops, and custom fittings'),
  ('Photography', 'Event coverage, portraits, and product shoots'),
  ('Tutoring', 'Peer tutoring across all faculties and units'),
  ('Textbooks', 'Pre-owned course books, readers, and revision packs'),
  ('Electronics', 'Student-friendly gadgets, accessories, and devices');

-- Password for admin: Password123!
-- Password for demo users: DemoPass123!
INSERT INTO users (name, admission_number, email, phone_number, password_hash, is_admin, profile_picture_url) VALUES
  ('Emmanuel Kiprotich', 'ADM001', 'emmanuel.kiprotich@strathmore.edu', '0712345001', '$2b$10$XcWWZUMLnX2DrO0A5qy/Le788ZpeFh/g6tfoBR1bgrWS1THKvM4Cy', TRUE, NULL),
  ('Amina Wanjiku', 'ADM002', 'amina.wanjiku@gmail.com', '0712345002', '$2b$10$rSyfu9BlfSiITRtXtrnaGeKEuLlOXWJ8W9GEQJaUutH1tmZXwFh4G', FALSE, NULL),
  ('Brian Otieno', 'ADM003', 'brian.otieno@strathmore.edu', '0712345003', '$2b$10$rSyfu9BlfSiITRtXtrnaGeKEuLlOXWJ8W9GEQJaUutH1tmZXwFh4G', FALSE, NULL),
  ('Cynthia Mutua', 'ADM004', 'cynthia.mutua@yahoo.com', '0712345004', '$2b$10$rSyfu9BlfSiITRtXtrnaGeKEuLlOXWJ8W9GEQJaUutH1tmZXwFh4G', FALSE, NULL),
  ('David Mwangi', 'ADM005', 'david.mwangi@strathmore.edu', '0712345005', '$2b$10$rSyfu9BlfSiITRtXtrnaGeKEuLlOXWJ8W9GEQJaUutH1tmZXwFh4G', FALSE, NULL);

INSERT INTO listings (seller_id, category_id, title, description, price, photo_url, contact_phone, campus_zone, view_count, created_at) VALUES
  (2, 7, 'Financial Accounting IFRS Textbook', 'Clean copy with highlighted examples for ACC 101 and practice questions marked by topic.', 1800, NULL, '0712345002', 'The Library Gates', 42, NOW() - INTERVAL '5 days'),
  (2, 3, 'Friday Brownies Box of 6', 'Fresh fudge brownies packed for pickup between classes. Optional caramel drizzle included.', 450, NULL, '0712345002', 'The Cafeteria/Gazebos', 76, NOW() - INTERVAL '4 days'),
  (2, 1, 'Club Event Poster Design', 'Fast Canva and Photoshop posters for society events, sports fixtures, and class campaigns.', 900, NULL, '0712345002', 'Student Centre (STC)', 35, NOW() - INTERVAL '3 days'),
  (3, 2, 'Laptop Windows Cleanup and Antivirus Setup', 'Speed up your laptop, remove bloat, install updates, and configure basic security tools.', 1200, NULL, '0712345003', 'Phase 2', 64, NOW() - INTERVAL '2 days'),
  (3, 8, 'USB-C Charger 65W', 'Compact fast charger, works with most Type-C laptops and phones. Lightly used for one semester.', 2500, NULL, '0712345003', 'Phase 2', 31, NOW() - INTERVAL '1 day'),
  (3, 6, 'Java OOP Tutoring Session', 'One-hour peer tutoring for inheritance, interfaces, collections, and exam-style problem solving.', 700, NULL, '0712345003', 'The Library Gates', 58, NOW() - INTERVAL '20 hours'),
  (4, 4, 'Trouser Hemming Same Day', 'Quick alterations for formal trousers, graduation outfits, and thrift finds.', 350, NULL, '0712345004', 'Student Centre (STC)', 23, NOW() - INTERVAL '18 hours'),
  (4, 5, 'Graduation Portrait Mini Shoot', 'Twenty-minute outdoor session with five edited photos delivered digitally within 48 hours.', 1800, NULL, '0712345004', 'Student Centre (STC)', 89, NOW() - INTERVAL '16 hours'),
  (4, 7, 'Business Law Revision Pack', 'Summarized notes, past-paper themes, and case references for end-sem prep.', 600, NULL, '0712345004', 'The Library Gates', 47, NOW() - INTERVAL '13 hours'),
  (5, 3, 'Chapati Wrap Lunch Pack', 'Chicken or veggie wrap with kachumbari. Pickup near gazebos from noon.', 300, NULL, '0712345005', 'The Cafeteria/Gazebos', 112, NOW() - INTERVAL '10 hours'),
  (5, 8, 'Scientific Calculator FX-991ES', 'Original Casio calculator in good condition, battery working, ideal for stats and finance units.', 1500, NULL, '0712345005', 'Phase 2', 51, NOW() - INTERVAL '8 hours'),
  (5, 1, 'LinkedIn Headline and CV Polish', 'Clean up your LinkedIn profile headline, about section, and one-page CV for attachment applications.', 1000, NULL, '0712345005', 'Student Centre (STC)', 66, NOW() - INTERVAL '6 hours'),
  (2, 6, 'Statistics CAT Prep Group', 'Small-group revision for probability, hypothesis testing, and regression with worked examples.', 500, NULL, '0712345002', 'Phase 2', 39, NOW() - INTERVAL '4 hours'),
  (3, 2, 'Phone Screen Protector Install', 'Tempered glass protector with dust-free installation for common iPhone and Samsung models.', 250, NULL, '0712345003', 'The Cafeteria/Gazebos', 28, NOW() - INTERVAL '2 hours'),
  (4, 4, 'Thrift Denim Jacket', 'Oversized blue denim jacket, excellent condition, fits medium to large.', 1600, NULL, '0712345004', 'Student Centre (STC)', 44, NOW() - INTERVAL '1 hour');

INSERT INTO bookings (buyer_id, listing_id, scheduled_date, status, created_at) VALUES
  (3, 1, NOW() + INTERVAL '1 day', 'pending', NOW() - INTERVAL '3 hours'),
  (4, 4, NOW() - INTERVAL '1 day', 'completed', NOW() - INTERVAL '2 days'),
  (5, 7, NOW() + INTERVAL '2 days', 'pending', NOW() - INTERVAL '4 hours'),
  (2, 10, NOW() - INTERVAL '2 hours', 'completed', NOW() - INTERVAL '8 hours');

INSERT INTO messages (sender_id, receiver_id, listing_id, content, created_at) VALUES
  (3, 2, 1, 'Hi, is the accounting textbook still available for pickup today?', NOW() - INTERVAL '3 hours'),
  (5, 3, 4, 'Can you do the laptop cleanup after my afternoon class?', NOW() - INTERVAL '2 hours'),
  (2, 5, 10, 'Please reserve one chicken wrap for lunch.', NOW() - INTERVAL '1 hour'),
  (4, 2, 3, 'Can you make a poster by tomorrow morning?', NOW() - INTERVAL '45 minutes');

INSERT INTO reviews (booking_id, reviewer_id, rating, comment, created_at) VALUES
  (2, 4, 5, 'Fast laptop cleanup and clear updates throughout.', NOW() - INTERVAL '20 hours'),
  (4, 2, 4, 'Tasty lunch pack and easy pickup near the gazebos.', NOW() - INTERVAL '1 hour');

-- Fast seller Hustle Metrics query used by the dashboard.
-- Replace :seller_id with a parameter in application code.
-- SELECT
--   COUNT(DISTINCT l.id) AS listing_count,
--   COALESCE(SUM(l.view_count), 0) AS total_views,
--   COUNT(DISTINCT m.id) AS offers,
--   COUNT(DISTINCT b.id) AS requests,
--   COALESCE(SUM(CASE WHEN b.status = 'completed' THEN l.price END), 0) AS earnings
-- FROM listings l
-- LEFT JOIN messages m ON m.listing_id = l.id AND m.receiver_id = l.seller_id
-- LEFT JOIN bookings b ON b.listing_id = l.id
-- WHERE l.seller_id = :seller_id;
