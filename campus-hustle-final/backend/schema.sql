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
  admission_number VARCHAR(8) UNIQUE NOT NULL
    CHECK (admission_number ~ '^[0-9]{6,8}$'),
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

-- 1. Safely remove all existing data and reset ID counters (1, 2, 3...)
TRUNCATE TABLE reviews, messages, bookings, listings, categories, users RESTART IDENTITY CASCADE;

-- 2. Now perform your INSERTS (The order is important due to Foreign Keys)

INSERT INTO categories (name, description) VALUES
  ('Graphics & Design', 'Logo designs, posters, flyers, and branding elements'),
  ('Tech & Repairs', 'Laptop troubleshooting, OS installation, and minor electronic repairs'),
  ('Food & Baking', 'On-campus snacks, custom birthday cakes, and delivery'),
  ('Apparel & Tailoring', 'Clothing alterations, thrift drops, and custom fittings'),
  ('Photography', 'Event coverage, portraits, and product shoots'),
  ('Tutoring', 'Peer tutoring across all faculties and units'),
  ('Textbooks', 'Pre-owned course books, readers, and revision packs'),
  ('Electronics', 'Student-friendly gadgets, accessories, and devices');

INSERT INTO users (name, admission_number, email, phone_number, password_hash, is_admin, profile_picture_url) VALUES
  ('Emmanuel Kiprotich', '123456', 'emmanuel.kiprotich@strathmore.edu', '0712345001', '$2b$10$XcWWZUMLnX2DrO0A5qy/Le788ZpeFh/g6tfoBR1bgrWS1THKvM4Cy', TRUE, NULL),
  ('Amina Wanjiku', '234567', 'amina.wanjiku@gmail.com', '0712345002', '$2b$10$rSyfu9BlfSiITRtXtrnaGeKEuLlOXWJ8W9GEQJaUutH1tmZXwFh4G', FALSE, NULL),
  ('Brian Otieno', '345678', 'brian.otieno@strathmore.edu', '0712345003', '$2b$10$rSyfu9BlfSiITRtXtrnaGeKEuLlOXWJ8W9GEQJaUutH1tmZXwFh4G', FALSE, NULL),
  ('Cynthia Mutua', '456789', 'cynthia.mutua@yahoo.com', '0712345004', '$2b$10$rSyfu9BlfSiITRtXtrnaGeKEuLlOXWJ8W9GEQJaUutH1tmZXwFh4G', FALSE, NULL),
  ('David Mwangi', '567890', 'david.mwangi@strathmore.edu', '0712345005', '$2b$10$rSyfu9BlfSiITRtXtrnaGeKEuLlOXWJ8W9GEQJaUutH1tmZXwFh4G', FALSE, NULL);

INSERT INTO listings (seller_id, category_id, title, description, price, photo_url, contact_phone, campus_zone, view_count, created_at) VALUES
  (2, 7, 'Financial Accounting IFRS Textbook', 'Clean copy with highlighted examples for ACC 101 and practice questions marked by topic.', 1800, NULL, '0712345002', 'The Library Gates', 42, NOW() - INTERVAL '5 days'),
  (2, 3, 'Friday Brownies Box of 6', 'Fresh fudge brownies packed for pickup between classes. Optional caramel drizzle included.', 450, NULL, '0712345002', 'The Cafeteria/Gazebos', 76, NOW() - INTERVAL '4 days'),
  -- ... (Keep the rest of your INSERT statements as they are)
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