// Base URL for API - automatically connects to localhost:3000 even when opened directly from File Explorer
function getApiBaseUrl() {
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    return '';
  }
  return 'http://localhost:3000';
}

// Show toast notification
function showToast(message, type = 'info', callback = null) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span style="font-size: 1.1rem; font-weight: bold;">${icon}</span> <span>${message}</span>`;
  toast.className = `show ${type}`;

  setTimeout(() => {
    toast.className = toast.className.replace('show', '').trim();
    if (callback) callback();
  }, 2200);
}

// Returns styled HTML badge for room status
function renderStatusBadge(status) {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'available') {
    return `<span class="badge badge-available"><span class="badge-dot"></span>Available</span>`;
  } else if (s === 'occupied') {
    return `<span class="badge badge-occupied"><span class="badge-dot"></span>Occupied</span>`;
  } else if (s.includes('maintenance')) {
    return `<span class="badge badge-maintenance"><span class="badge-dot"></span>Under Maintenance</span>`;
  }
  return `<span class="badge" style="background:#e2e8f0; color:#475569;">${status}</span>`;
}

// Live MySQL API Connector
const HostelAPI = {
  async getAllRooms() {
    const url = getApiBaseUrl() + '/rooms';
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to connect to MySQL backend server at', url, e);
      showToast('⚠️ Make sure node server.js / start.bat is running to sync with MySQL Workbench!', 'error');
    }
    return [];
  },

  async getRoomById(id) {
    const url = getApiBaseUrl() + '/rooms/' + encodeURIComponent(id);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [data];
      }
    } catch (e) {
      console.error('Failed to fetch room from MySQL backend:', e);
      showToast('⚠️ Make sure node server.js is running to read from MySQL Workbench!', 'error');
    }
    return [];
  },

  async insertRoom(roomData) {
    const url = getApiBaseUrl() + '/rooms';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      const msg = await res.text();
      if (res.ok) {
        return { success: true, message: msg };
      } else {
        return { success: false, message: msg };
      }
    } catch (e) {
      console.error('Error inserting room to MySQL:', e);
      return { 
        success: false, 
        message: 'Could not connect to backend server. Run "start.bat" so modifications reflect in MySQL Workbench!' 
      };
    }
  },

  async updateRoom(id, roomData) {
    const url = getApiBaseUrl() + '/rooms/' + encodeURIComponent(id);
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      const msg = await res.text();
      if (res.ok) {
        return { success: true, message: msg };
      } else {
        return { success: false, message: msg };
      }
    } catch (e) {
      console.error('Error updating room in MySQL:', e);
      return { 
        success: false, 
        message: 'Could not connect to backend server. Run "start.bat" so modifications reflect in MySQL Workbench!' 
      };
    }
  },

  async deleteRoom(id) {
    const url = getApiBaseUrl() + '/rooms/' + encodeURIComponent(id);
    try {
      const res = await fetch(url, {
        method: 'DELETE'
      });
      const msg = await res.text();
      if (res.ok) {
        return { success: true, message: msg };
      } else {
        return { success: false, message: msg };
      }
    } catch (e) {
      console.error('Error deleting room from MySQL:', e);
      return { 
        success: false, 
        message: 'Could not connect to backend server. Run "start.bat" so modifications reflect in MySQL Workbench!' 
      };
    }
  }
};
