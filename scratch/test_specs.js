async function testSpecs() {
    try {
        const res = await fetch('http://localhost:3000/api/admin/lab/specifications');
        const data = await res.json();
        console.log('Specs API Response Length:', data.length);
        if (data.length > 0) {
            console.log('First Spec:', JSON.stringify(data[0]).substring(0, 200) + '...');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

testSpecs();
