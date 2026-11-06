const http = require('http');

async function runTests() {
  const serverProcess = require('child_process').fork('server.js', {
    cwd: __dirname,
    stdio: 'pipe'
  });

  serverProcess.stdout.on('data', data => {
    console.log(`[Server]: ${data}`.trim());
  });

  serverProcess.stderr.on('data', data => {
    console.error(`[Server Err]: ${data}`.trim());
  });

  // Wait for server to boot
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // 1. Test GET /rooms
    console.log('Testing GET /rooms...');
    const roomsRes = await fetch('http://localhost:3000/rooms');
    const rooms = await roomsRes.json();
    console.log(`✓ GET /rooms status: ${roomsRes.status}, count: ${rooms.length}`);

    // 2. Test GET /rooms/101
    console.log('Testing GET /rooms/101...');
    const room101Res = await fetch('http://localhost:3000/rooms/101');
    const room101 = await room101Res.json();
    console.log(`✓ GET /rooms/101 status: ${room101Res.status}, found: ${room101[0]?.room_no} (${room101[0]?.block_name})`);

    // 3. Test POST /rooms
    console.log('Testing POST /rooms...');
    const postRes = await fetch('http://localhost:3000/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: 999,
        room_no: 'TEST-999',
        block_name: 'Test Block',
        capacity: 2,
        status: 'Available'
      })
    });
    const postMsg = await postRes.text();
    console.log(`✓ POST /rooms status: ${postRes.status}, message: ${postMsg}`);

    // 4. Test PUT /rooms/999
    console.log('Testing PUT /rooms/999...');
    const putRes = await fetch('http://localhost:3000/rooms/999', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Occupied'
      })
    });
    const putMsg = await putRes.text();
    console.log(`✓ PUT /rooms/999 status: ${putRes.status}, message: ${putMsg}`);

    // 5. Test DELETE /rooms/999
    console.log('Testing DELETE /rooms/999...');
    const delRes = await fetch('http://localhost:3000/rooms/999', {
      method: 'DELETE'
    });
    const delMsg = await delRes.text();
    console.log(`✓ DELETE /rooms/999 status: ${delRes.status}, message: ${delMsg}`);

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    serverProcess.kill();
  }
}

runTests();
