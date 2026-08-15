(async ()=>{
  try{
    const res = await fetch('http://localhost:8990/api/automation/search-song',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({query:'never gonna give you up'})
    });
    const data = await res.json();
    console.log(JSON.stringify(data,null,2));
  }catch(e){
    console.error('ERR',e);
  }
})();
