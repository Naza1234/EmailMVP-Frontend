var winUrl="https://beamingbonsai.com"
var apiUrl="https://emailmvpserver.onrender.com"





function singingWithGoogle(){
    var oauth2EndPoint="https://accounts.google.com/o/oauth2/v2/auth"
    let form = document.createElement("form")
    form.setAttribute("method","GET")
    form.classList.add("hid")
    form.setAttribute("action",oauth2EndPoint)

    let params={
        "client_id":"837160506487-9lera7p8rv5dgs48r55u191f8h79sj6s.apps.googleusercontent.com",
        "redirect_uri":"https://www.beamingbonsai.com/pages/login.html",
        "response_type":"token",
        "scope":"https://www.googleapis.com/auth/userinfo.profile",
        "include_granted_scopes":"true",
        "state":"pass_through-value"
    }
    for(var p in params){
        let input=document.createElement("input")
        input.setAttribute("type","hidden")
        input.setAttribute("name",p)
        input.setAttribute("value",params[p])
        form.appendChild(input)
    }
    document.body.appendChild(form)
    form.submit()
}


var params={}

var regex = /([^&=]+)=([^&]*)/g;

while(m=regex.exec(location.href)){
    params[decodeURIComponent(m[1])]=decodeURIComponent(m[2])
}


if(Object.keys(params).length>0){
   
    document.getElementsByClassName("google")[0].classList.add("active_parent_to_button")
    fetch("https://www.googleapis.com/oauth2/v3/userinfo",{
        headers:{
            "Authorization":`Bearer ${params["access_token"]}`
        }
    })
    .then((data)=>data.json())
    .then((info)=>{
        const params={
            useremail:info.sub
        }

        registerUser(params)
    })

    window.history.pushState({},document.title,"/" + "/pages/login.html")
}




document.getElementsByTagName("form")[0].addEventListener("submit",(e)=>{
 e.preventDefault()
 var inputs=document.getElementsByTagName("form")[0].getElementsByTagName("input")
 document.getElementsByTagName("form")[0].classList.add("active_parent_to_button")
 const params={
    useremail:inputs[0].value,
    userpassword:inputs[1].value,
 }
 registerUser(params)
})





function registerUser(params){

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
         body: JSON.stringify(params),
      };
      var errorIs=false
  
      fetch(`${apiUrl}/user/login`, requestOptions)
      .then((response) => {
        if (response.status != 201) {
            errorIs=!errorIs
          // Handle the 400 Bad Request error
          console.error('Bad Request Error:', response);
        }
        return response.json();
      })
      .then((data) => {


        // Handle the response data here
        if (errorIs) {
            document.getElementsByTagName("h6")[0].classList.add("error")
            document.getElementsByTagName("h6")[0].innerHTML=data.message
            setTimeout(() => {
             document.getElementsByTagName("h6")[0].classList.remove("error")
             document.getElementsByTagName("h6")[0].innerHTML = ""
             document.getElementsByClassName("google")[0].classList.remove("active_parent_to_button")
             document.getElementsByTagName("form")[0].classList.remove("active_parent_to_button")
            }, 5000);
         }else{
             localStorage.setItem("EmailMVPUserId",data)
             window.location=`${winUrl}/pages/home.html?`
         }

        // Handle the response data her
       
      })
      .catch((error) => {
        // Handle any errors
        console.error('Error:', error);
        document.getElementsByTagName("h6")[0].classList.add("error")
        document.getElementsByTagName("h6")[0].innerHTML = error
        form.classList.remove("active_parent_to_button")
        setTimeout(() => {
         document.getElementsByTagName("h6")[0].classList.remove("error")
         document.getElementsByTagName("h6")[0].innerHTML = ""
         document.getElementsByClassName("google")[0].classList.remove("active_parent_to_button")
         document.getElementsByTagName("form")[0].classList.remove("active_parent_to_button")
        }, 5000);
      });

}


