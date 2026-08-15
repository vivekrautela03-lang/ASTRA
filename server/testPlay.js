(async ()=>{
  try{
    const res = await fetch('http://localhost:8990/api/automation/play-song',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({provider:'youtube', id:'dQw4w9WgXcQ'})
    });
    const data = await res.json();
    console.log(JSON.stringify(data,null,2));
  }catch(e){
    console.error('ERR',e);
  }
})();
