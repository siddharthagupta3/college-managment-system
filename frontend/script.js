function submitForm(){
  const name=document.getElementById("name").value;
  if(name===""){
    document.getElementById("msg").innerText="Please fill all fields";
    return;
  }
  document.getElementById("msg").innerText="Form submitted successfully!";
}