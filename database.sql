-- ========================================================
-- Hostel Management System Database Script
-- Compatible with MySQL Server & MySQL Workbench
-- ========================================================

CREATE DATABASE IF NOT EXISTS hostel_db;
USE hostel_db;

-- Drop table if needs reset (Optional)
-- DROP TABLE IF EXISTS rooms;

CREATE TABLE IF NOT EXISTS rooms (
    room_id INT PRIMARY KEY,
    room_no VARCHAR(50) NOT NULL,
    block_name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    status VARCHAR(50) NOT NULL
);

-- Insert initial sample hostel room data
INSERT INTO rooms (room_id, room_no, block_name, capacity, status) VALUES
(101, 'A-101', 'Block A (Ganga)', 2, 'Available'),
(102, 'A-102', 'Block A (Ganga)', 3, 'Occupied'),
(103, 'A-103', 'Block A (Ganga)', 1, 'Under Maintenance'),
(201, 'B-201', 'Block B (Yamuna)', 4, 'Available'),
(202, 'B-202', 'Block B (Yamuna)', 2, 'Occupied'),
(301, 'C-301', 'Block C (Godavari)', 3, 'Available')
ON DUPLICATE KEY UPDATE 
    room_no = VALUES(room_no),
    block_name = VALUES(block_name),
    capacity = VALUES(capacity),
    status = VALUES(status);

-- Verify records
SELECT * FROM rooms;
