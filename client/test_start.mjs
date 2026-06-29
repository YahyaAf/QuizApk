async function test() {
  const loginRes = await fetch('http://localhost:8082/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'yassine.mansouri@etudiant.expert.ma', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;
  
  const startRes = await fetch('http://localhost:8082/api/submissions/start/3', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('STATUS:', startRes.status);
  const text = await startRes.text();
  console.log('RESPONSE:', text);
}
test();
