const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'rooms.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MySQL Connection Pool Configuration
let dbPool = null;
let useMySQL = false;

async function initDatabase() {
  try {
    dbPool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'hostel_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await dbPool.query('SELECT 1 + 1 AS test');
    useMySQL = true;
    console.log('✅ Connected to MySQL database "hostel_db" successfully (Workbench compatible).');
  } catch (err) {
    console.warn('⚠️ Could not connect to MySQL Server:', err.message);
    console.warn('👉 Operating in fallback JSON storage mode.');
    useMySQL = false;
  }
}

// Fallback JSON helpers
function getJSONRooms() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    return [];
  }
}

function saveJSONRooms(rooms) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rooms, null, 2), 'utf-8');
}

// 1. GET ALL ROOMS
app.get('/rooms', async (req, res) => {
  if (useMySQL) {
    try {
      const [rows] = await dbPool.query('SELECT * FROM rooms ORDER BY room_id ASC');
      return res.json(rows);
    } catch (err) {
      console.error('MySQL GET /rooms error:', err);
    }
  }
  return res.json(getJSONRooms());
});

// 2. GET SINGLE ROOM (By room_id or room_no)
app.get('/rooms/:id', async (req, res) => {
  const param = req.params.id.trim();

  if (useMySQL) {
    try {
      const [rows] = await dbPool.query(
        'SELECT * FROM rooms WHERE room_id = ? OR LOWER(room_no) = LOWER(?)',
        [param, param]
      );
      return res.json(rows);
    } catch (err) {
      console.error('MySQL GET /rooms/:id error:', err);
    }
  }

  const rooms = getJSONRooms();
  const found = rooms.filter(
    r => String(r.room_id).toLowerCase() === param.toLowerCase() || 
         String(r.room_no).toLowerCase() === param.toLowerCase()
  );
  return res.json(found);
});

// 3. INSERT ROOM
app.post('/rooms', async (req, res) => {
  const { room_id, room_no, block_name, capacity, status } = req.body;

  if (!room_id || !room_no || !block_name || !capacity || !status) {
    return res.status(400).send('Please provide all room details (Room ID, Room No, Block Name, Capacity, Status).');
  }

  if (useMySQL) {
    try {
      const [existing] = await dbPool.query('SELECT room_id FROM rooms WHERE room_id = ?', [room_id]);
      if (existing.length > 0) {
        return res.status(400).send(`Room with ID ${room_id} already exists.`);
      }

      await dbPool.query(
        'INSERT INTO rooms (room_id, room_no, block_name, capacity, status) VALUES (?, ?, ?, ?, ?)',
        [Number(room_id), String(room_no).trim(), String(block_name).trim(), Number(capacity), String(status).trim()]
      );

      // Keep JSON in sync
      const rooms = getJSONRooms();
      rooms.push({ room_id: Number(room_id), room_no, block_name, capacity: Number(capacity), status });
      saveJSONRooms(rooms);

      return res.send('Room Added Successfully');
    } catch (err) {
      console.error('MySQL POST error:', err);
      return res.status(500).send('Database error adding room: ' + err.message);
    }
  }

  const rooms = getJSONRooms();
  const exists = rooms.some(r => String(r.room_id) === String(room_id));
  if (exists) {
    return res.status(400).send(`Room with ID ${room_id} already exists.`);
  }

  rooms.push({
    room_id: Number(room_id),
    room_no: String(room_no).trim(),
    block_name: String(block_name).trim(),
    capacity: Number(capacity),
    status: String(status).trim()
  });
  saveJSONRooms(rooms);
  return res.send('Room Added Successfully');
});

// 4. UPDATE ROOM
app.put('/rooms/:id', async (req, res) => {
  const id = req.params.id;
  const { room_no, block_name, capacity, status } = req.body;

  if (useMySQL) {
    try {
      const [existing] = await dbPool.query('SELECT * FROM rooms WHERE room_id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).send('Room Not Found');
      }

      const current = existing[0];
      const newRoomNo = room_no ? String(room_no).trim() : current.room_no;
      const newBlock = block_name ? String(block_name).trim() : current.block_name;
      const newCap = capacity ? Number(capacity) : current.capacity;
      const newStatus = status ? String(status).trim() : current.status;

      await dbPool.query(
        'UPDATE rooms SET room_no = ?, block_name = ?, capacity = ?, status = ? WHERE room_id = ?',
        [newRoomNo, newBlock, newCap, newStatus, id]
      );

      // Keep JSON in sync
      const rooms = getJSONRooms();
      const idx = rooms.findIndex(r => String(r.room_id) === String(id));
      if (idx !== -1) {
        rooms[idx] = { ...rooms[idx], room_no: newRoomNo, block_name: newBlock, capacity: newCap, status: newStatus };
        saveJSONRooms(rooms);
      }

      return res.send('Room Updated Successfully');
    } catch (err) {
      console.error('MySQL PUT error:', err);
      return res.status(500).send('Database error updating room: ' + err.message);
    }
  }

  const rooms = getJSONRooms();
  const index = rooms.findIndex(r => String(r.room_id) === String(id));
  if (index === -1) {
    return res.status(404).send('Room Not Found');
  }

  rooms[index] = {
    ...rooms[index],
    ...(room_no && { room_no: String(room_no).trim() }),
    ...(block_name && { block_name: String(block_name).trim() }),
    ...(capacity && { capacity: Number(capacity) || capacity }),
    ...(status && { status: String(status).trim() })
  };
  saveJSONRooms(rooms);
  return res.send('Room Updated Successfully');
});

// 5. DELETE ROOM
app.delete('/rooms/:id', async (req, res) => {
  const id = req.params.id;

  if (useMySQL) {
    try {
      const [existing] = await dbPool.query('SELECT room_id FROM rooms WHERE room_id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).send('Room Not Found');
      }

      await dbPool.query('DELETE FROM rooms WHERE room_id = ?', [id]);

      // Keep JSON in sync
      const rooms = getJSONRooms();
      saveJSONRooms(rooms.filter(r => String(r.room_id) !== String(id)));

      return res.send('Room Deleted Successfully');
    } catch (err) {
      console.error('MySQL DELETE error:', err);
      return res.status(500).send('Database error deleting room: ' + err.message);
    }
  }

  const rooms = getJSONRooms();
  const initialLength = rooms.length;
  const filtered = rooms.filter(r => String(r.room_id) !== String(id));

  if (filtered.length === initialLength) {
    return res.status(404).send('Room Not Found');
  }

  saveJSONRooms(filtered);
  return res.send('Room Deleted Successfully');
});

// Boot server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Hostel Management Server running at http://localhost:${PORT}`);
  });
}

startServer();
