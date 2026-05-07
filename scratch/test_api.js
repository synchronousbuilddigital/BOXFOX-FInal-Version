async function testApi() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/lab/hierarchy');
        const data = await res.json();
        console.log('Hierarchy API Response:', JSON.stringify(data).substring(0, 500) + '...');
    } catch (e) {
        console.error('Error:', e);
    }
}

testApi();
