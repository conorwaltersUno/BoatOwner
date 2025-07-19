-- Dummy users for friends feature testing
INSERT INTO "user" (email, password, created, username) VALUES
('1@gmail.com', '$2b$10$Tnoj8NvG8cPqj6RZRxiTE.00j8aoaUaaw4tun6bsCAGtdSRtEsXTK', '2024-07-10 09:00:00', 'captainone'),
('2@gmail.com', '$2b$10$Tnoj8NvG8cPqj6RZRxiTE.00j8aoaUaaw4tun6bsCAGtdSRtEsXTK', '2024-07-10 09:05:00', 'captaintwo');

-- Dummy boats for each user
INSERT INTO boat (user_id, name, model) VALUES
(1, 'Friendship', 'Beneteau Oceanis 38'),
(2, 'Companion', 'Jeanneau Sun Odyssey 349');

-- Dummy logs for each user, referencing each other's boats
INSERT INTO logs (boat_id, description, crew_members, coordinates, log_started, log_ended, created_on) VALUES
(1, 'Sailing with friend', ARRAY['captainone', 'captaintwo'], '[{"lat":51.5,"lng":-0.1},{"lat":51.6,"lng":-0.2}]', '2024-07-11 08:00:00', '2024-07-11 18:00:00', '2024-07-11 19:00:00'),
(2, 'Return trip with friend', ARRAY['captaintwo', 'captainone'], '[{"lat":51.6,"lng":-0.2},{"lat":51.5,"lng":-0.1}]', '2024-07-12 09:00:00', '2024-07-12 17:00:00', '2024-07-12 18:00:00');

-- Dummy tasks for each boat
INSERT INTO tasks (boat_id, description, status, created_on) VALUES
(1, 'Check sails', 'pending', '2024-07-10 10:00:00'),
(2, 'Clean deck', 'completed', '2024-07-10 11:00:00');

-- Dummy expenses for each boat
INSERT INTO expenses (boat_id, expense_type, amount, expense_date, created_on) VALUES
(1, 'Docking', 50, '2024-07-11 18:30:00', '2024-07-11 19:00:00'),
(2, 'Fuel', 80, '2024-07-12 17:30:00', '2024-07-12 18:00:00');

-- Dummy friendship (bidirectional)
INSERT INTO friends (user_id, friend_id, created_at) VALUES
(1, 2, '2024-07-10 12:00:00'),
(2, 1, '2024-07-10 12:00:00');