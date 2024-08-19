
INSERT INTO "user" (email, password, created) VALUES
('user1@example.com', 'password1', '2024-07-01 10:00:00'),
('user2@example.com', 'password2', '2024-07-02 11:00:00'),
('user3@example.com', 'password3', '2024-07-03 12:00:00');

-- Insert data into the boat table
INSERT INTO boat (user_id, name, model) VALUES
(1, 'Boaty McBoatface', 'Model A'),
(1, 'Sea Explorer', 'Model B'),
(1, 'Wave Rider', 'Model C');

-- Insert data into the logs table
INSERT INTO logs (boat_id, description, crew_members, coordinates, photo_urls, log_started, log_ended, created_on, isRecordingLocation) VALUES
(1, 'First trip', ARRAY['Alice', 'Bob'], ARRAY['(10,-20)'::point, '(15,-25)'::point], ARRAY['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'], '2024-07-01 08:00:00', '2024-07-01 18:00:00', '2024-07-01 19:00:00', TRUE),
(2, 'Fishing expedition', ARRAY['Charlie', 'Dave'], ARRAY['(20,-30)'::point, '(25,-35)'::point], ARRAY['http://example.com/photo3.jpg', 'http://example.com/photo4.jpg'], '2024-07-02 06:00:00', '2024-07-02 14:00:00', '2024-07-02 15:00:00', TRUE),
(3, 'Weekend cruise', ARRAY['Eve', 'Frank'], ARRAY['(50,50)'::point, '(60,60)'::point], ARRAY['http://example.com/photo5.jpg', 'http://example.com/photo6.jpg'], '2024-07-03 09:00:00', '2024-07-03 17:00:00', '2024-07-03 18:00:00', FALSE);

-- Insert data into the tasks table
INSERT INTO tasks (boat_id, description, status, created_on) VALUES
(1, 'Clean the deck', 'pending', '2024-07-01 20:00:00'),
(2, 'Repair the engine', 'in_progress', '2024-07-02 16:00:00'),
(3, 'Restock supplies', 'completed', '2024-07-03 19:00:00');

-- Insert data into the expenses table
INSERT INTO expenses (boat_id, expense_type, amount, expense_date, created_on) VALUES
(1, 'Fuel', 100, '2024-07-01 18:30:00', '2024-07-01 19:00:00'),
(2, 'Fishing gear', 200, '2024-07-02 14:30:00', '2024-07-02 15:00:00'),
(3, 'Food supplies', 150, '2024-07-03 17:30:00', '2024-07-03 18:00:00');