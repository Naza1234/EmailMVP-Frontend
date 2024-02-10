var winUrl="https://beamingbonsai.com"
var apiUrl="https://emailmvpserver.onrender.com"


var userID=localStorage.getItem("EmailMVPUserId")




fetch(`${apiUrl}/user/${userID}`)
.then((response) => {
  return response.json();
})
.then((data) => {
   
    start(data)
})
.catch((error) => {
  // Handle any errors
  console.error('Error:', error);
});

function start(data){
document.getElementsByClassName("name")[0].innerHTML=data.username
loadEmail(data)
}

function loadEmail(data){
   if (data.userRefeshtoken === "loading" ) {
     document.getElementById('run_gmail').addEventListener('click', redirectToOAuth);
   }
}




// Define your client ID and OAuth redirect URI
const clientId = '39981925808-vjpe9e1602ced5gftdnmdn181dbnroam.apps.googleusercontent.com';
const redirectUri = 'https://www.beamingbonsai.com/pages/home.html';

// Define the scope for accessing Gmail
const scope = 'https://www.googleapis.com/auth/gmail.readonly';

// Function to redirect users to the Gmail OAuth page
function redirectToOAuth() {
    // Construct the authorization URL
    const authUrl = 'https://accounts.google.com/o/oauth2/auth' +
        '?response_type=code' +
        '&client_id=' + encodeURIComponent(clientId) +
        '&redirect_uri=' + encodeURIComponent(redirectUri) +
        '&scope=' + encodeURIComponent(scope);

    // Redirect the user to the authorization URL
    window.location.href = authUrl;
}

function getParameterByName(name, url) {
    name = name.replace(/[[]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Get the value of the 'code' parameter from the current URL
var code = getParameterByName('code', window.location.href);

// Check if 'code' parameter is present
if (code) {
    // Do something with the extracted code
    const clientId = '39981925808-vjpe9e1602ced5gftdnmdn181dbnroam.apps.googleusercontent.com';
    const clientSecret = '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';
    const redirectUri = 'https://www.beamingbonsai.com/pages/home.html';
    const authorizationCode = code;
    
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const requestData = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'client_id': clientId,
            'client_secret': clientSecret,
            'code': authorizationCode,
            'redirect_uri': redirectUri,
            'grant_type': 'authorization_code'
        })
    };
    
    fetch(tokenEndpoint, requestData)
        .then(response => response.json())
        .then(data => {
                   // Assuming 'expires_in' is the number of seconds until expiration
                   const expiresInSeconds = data.expires_in; // Replace 'data.expires_in' with your actual variable

                   // Create a new Date object by adding 'expires_in' seconds to the current time
                   const expirationTime = new Date(Date.now() + expiresInSeconds * 1000);

            const params={
                userAutcode:data.access_token,
                userRefeshtoken:data.refresh_token,
                Usertokenduration:expirationTime,
            }
            updateUser(params)
        })
        .catch(error => console.error('Error:', error));
    
} else {
  
}







function updateUser(params){
    document.getElementsByClassName("loading_data")[0].classList.remove("hid")
    const accessToken = params.userAutcode;
    
    // Define the Gmail API endpoint for searching messages
    const gmailApiEndpoint = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
    
    // Define the Gmail search query to find messages marked as "unsubscribed"
    const gmailSearchQuery = 'unsubscribed';

    // Construct the request URL with the search query
    const requestUrl = `${gmailApiEndpoint}?q=${encodeURIComponent(gmailSearchQuery)}`;
    
    // Define the request headers, including the Authorization header with the access token
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };
    
    // Make a fetch request to the Gmail API
    fetch(requestUrl, {
        method: 'GET',
        headers: headers,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then((data) => {
        getEmailContent(data.messages,headers)

    })
    .catch(error => {
        console.error('Error:', error);
    });
    
}



function getHeaderValue(headers, headerName) {
    const header = headers.find(header => header.name === headerName);
    return header ? header.value : null;
  }

function getEmailContent(data,headers){
   
   
    for (let i = 0; i < data.length; i++) {
     const element = data[i];
     const messageId = element.id; // Replace 'MESSAGE_ID' with the actual message ID from the previous response
    
     // Construct the URL to fetch a specific message by ID
   
    
     // Make a fetch request to get the specific email content
     fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        method: 'GET',
        headers: headers, // Include headers here if necessary
        })
         .then((response) => {
           return response.json();
         })
         .then(data => {
         
             const dateHeaderValue = getHeaderValue(data.payload.headers, 'Date');
             var params={
                userid:userID,
                emailid:messageId,
                snippet:data.snippet,
                date:dateHeaderValue
             }
            
           
             writeEmailToServer(params)
            })
            .catch(error => {
                console.error('Error:', error);
            })    
    }


 
 }
 
 
 function writeEmailToServer(params){
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
         body: JSON.stringify(params),
      };
      var errorIs=false
  
      fetch(`${apiUrl}/userEmail/user-emails`, requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
   loadEmails(userID)
      })
      .catch((error) => {
        // Handle any errors
        console.error('Error:', error);

      });

 }

 loadEmails(userID)

 var date=[]
 var emailData=[]
function loadEmails(userID){
    fetch(`${apiUrl}/userEmail/user-emails/${userID}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data.reverse() 
        setPeriods(data,"Set_Starting_Date")
        document.getElementsByClassName("emailContainer")[0].innerHTML=""
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            populateUserEmail(element) 
            date.push(element.Date)
            emailData.push(element)
        }
        playTime()
      })
      .catch((error) => {
        // Handle any errors
        console.error('Error:', error);

      });
}



function populateUserEmail(data){
    document.getElementsByClassName("loading_data")[0].classList.add("hid")
    var container=document.getElementsByClassName("emailContainer")[0]
    var html=`
    <li>
    <p>
    ${data.Date}
  </p>
    <h1 class="hid">${data._id}</h1>
    <h1 class="hid">${data.message}</h1>
    <h1 class="name">${data.title}</h1>
   <div>
          <div class="svg-body Load_play">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7.87 21.28C7.08 21.28 6.33 21.09 5.67 20.71C4.11 19.81 3.25 17.98 3.25 15.57V8.43999C3.25 6.01999 4.11 4.19999 5.67 3.29999C7.23 2.39999 9.24 2.56999 11.34 3.77999L17.51 7.33999C19.6 8.54999 20.76 10.21 20.76 12.01C20.76 13.81 19.61 15.47 17.51 16.68L11.34 20.24C10.13 20.93 8.95 21.28 7.87 21.28ZM7.87 4.21999C7.33 4.21999 6.85 4.33999 6.42 4.58999C5.34 5.20999 4.75 6.57999 4.75 8.43999V15.56C4.75 17.42 5.34 18.78 6.42 19.41C7.5 20.04 8.98 19.86 10.59 18.93L16.76 15.37C18.37 14.44 19.26 13.25 19.26 12C19.26 10.75 18.37 9.55999 16.76 8.62999L10.59 5.06999C9.61 4.50999 8.69 4.21999 7.87 4.21999Z" fill="#292D32"/>
             </svg>

          </div>                                      
          <div class="svg-body see_foll_content">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" fill="#292D32"/>
              <path d="M5.99994 18.75C5.80994 18.75 5.61994 18.68 5.46994 18.53C5.17994 18.24 5.17994 17.76 5.46994 17.47L17.4699 5.47C17.7599 5.18 18.2399 5.18 18.5299 5.47C18.8199 5.76 18.8199 6.24 18.5299 6.53L6.52994 18.53C6.37994 18.68 6.18994 18.75 5.99994 18.75Z" fill="#292D32"/>
              <path d="M18 10.75C17.59 10.75 17.25 10.41 17.25 10V6.75H14C13.59 6.75 13.25 6.41 13.25 6C13.25 5.59 13.59 5.25 14 5.25H18C18.41 5.25 18.75 5.59 18.75 6V10C18.75 10.41 18.41 10.75 18 10.75Z" fill="#292D32"/>
              <path d="M10 18.75H6C5.59 18.75 5.25 18.41 5.25 18V14C5.25 13.59 5.59 13.25 6 13.25C6.41 13.25 6.75 13.59 6.75 14V17.25H10C10.41 17.25 10.75 17.59 10.75 18C10.75 18.41 10.41 18.75 10 18.75Z" fill="#292D32"/>
              <path d="M17.9999 18.75C17.8099 18.75 17.6199 18.68 17.4699 18.53L5.46994 6.53C5.17994 6.24 5.17994 5.76 5.46994 5.47C5.75994 5.18 6.23994 5.18 6.52994 5.47L18.5299 17.47C18.8199 17.76 18.8199 18.24 18.5299 18.53C18.3799 18.68 18.1899 18.75 17.9999 18.75Z" fill="#292D32"/>
              <path d="M6 10.75C5.59 10.75 5.25 10.41 5.25 10V6C5.25 5.59 5.59 5.25 6 5.25H10C10.41 5.25 10.75 5.59 10.75 6C10.75 6.41 10.41 6.75 10 6.75H6.75V10C6.75 10.41 6.41 10.75 6 10.75Z" fill="#292D32"/>
              <path d="M18 18.75H14C13.59 18.75 13.25 18.41 13.25 18C13.25 17.59 13.59 17.25 14 17.25H17.25V14C17.25 13.59 17.59 13.25 18 13.25C18.41 13.25 18.75 13.59 18.75 14V18C18.75 18.41 18.41 18.75 18 18.75Z" fill="#292D32"/>
            </svg>

          </div>                    
          
        
           
          

           
   </div>
</li>
`
    container.insertAdjacentHTML("beforeend",html)
    loadPlay()
}


function generateSummary(description) {
    // Your ChatGPT API endpoint
    const apiUrl = `${apiUrl}/summary/generate-summary`;

   const params = {
    description : description
   }
    // Define the request parameters
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify(params)
    };

    // Send the request to the ChatGPT API
    return fetch(apiUrl, requestOptions)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Failed to fetch data from ChatGPT API');
            }
            // Parse the JSON response and return the generated title
            return response.json();
        })
        .then((data) => {
           // Extract the summary from the response
           const summary = data;
           return summary;
        })
        .catch(error => {
            console.error('Error:', error);
            return null; // Return null in case of an error
        });
}

function convertTextToAudio(text) {
    const apiKey = '83d2d3e2c3b5475f1a35c8ea10e74626';
    const apiUrl = 'https://api.elevenlabs.io/v1/text-to-speech/2EiwWnXFnvU5JabPnv8n/stream';
    
    const requestBody ={
        "text": `${text}`,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
          "stability": 0.5,
          "similarity_boost": 0.5
        }
    };

    const requestOptions = {
        method: 'POST',
        headers: {
            "accept": "audio/mpeg",
            "xi-api-key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    };

    return fetch(apiUrl, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to convert text to audio');
            }
            return response.blob(); // Fetch audio data as a Blob object
        })
        .then(blob => {
            return URL.createObjectURL(blob); // Convert Blob to a URL
        })
        .catch(error => {
            console.error('Error:', error);
            return null;
        });
}


async function loadPlay() {
    var buttons = document.getElementsByClassName("Load_play");

    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.addEventListener("click", async (e) => {
            var element = e.target;
            document.getElementsByClassName("loading_data")[0].classList.remove("hid")
            
            var parent = element.parentElement.parentElement.parentElement;
            var name = parent.getElementsByClassName("name")[0].innerHTML;
            var summary = parent.getElementsByClassName("hid")[1].innerHTML;
            var id=parent.getElementsByClassName("hid")[0].innerHTML;
                const generatedSummary = await generateSummary(summary);
                const audioUrl = await convertTextToAudio(generatedSummary.choices[0].message.content.replace(/"/g, ''));
                populateCont(name,generatedSummary.choices[0].message.content.replace(/"/g, ''),id,audioUrl)
        });
    }
}


function populateCont(name,detail,id,audioUrl){
    var html=`
    <h1>
    ${name}
   </h1>
   <textarea name="" id="" cols="30" rows="10">
     ${detail}      
   </textarea>
   <div class="link">
      <h1>${id === "no id for this as it is selected by time"?id:winUrl+"/a_page_detail.html?r="+id}</h1>
      <div class="copy">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M16.5002 18.25H14.9902C14.5802 18.25 14.2402 17.91 14.2402 17.5C14.2402 17.09 14.5802 16.75 14.9902 16.75H16.5002C19.1202 16.75 21.2502 14.62 21.2502 12C21.2502 9.38 19.1202 7.25 16.5002 7.25H15.0002C14.5902 7.25 14.2502 6.91 14.2502 6.5C14.2502 6.09 14.5802 5.75 15.0002 5.75H16.5002C19.9502 5.75 22.7502 8.55 22.7502 12C22.7502 15.45 19.9502 18.25 16.5002 18.25Z" fill="white"/>
            <path d="M9 18.25H7.5C4.05 18.25 1.25 15.45 1.25 12C1.25 8.55 4.05 5.75 7.5 5.75H9C9.41 5.75 9.75 6.09 9.75 6.5C9.75 6.91 9.41 7.25 9 7.25H7.5C4.88 7.25 2.75 9.38 2.75 12C2.75 14.62 4.88 16.75 7.5 16.75H9C9.41 16.75 9.75 17.09 9.75 17.5C9.75 17.91 9.41 18.25 9 18.25Z" fill="white"/>
            <path d="M16 12.75H8C7.59 12.75 7.25 12.41 7.25 12C7.25 11.59 7.59 11.25 8 11.25H16C16.41 11.25 16.75 11.59 16.75 12C16.75 12.41 16.41 12.75 16 12.75Z" fill="white"/>
          </svg>
      </div>
   </div>
   <div class="play">
    <audio id="audio" src="${audioUrl}" controls autoplay class="adio"></audio>
   
   
    </div>
    `
    document.getElementsByClassName("content-details")[0].innerHTML=html
    document.getElementsByClassName("loading_data")[0].classList.add("hid")
    document.getElementsByTagName("body")[0].classList.add("body_show_all")
    toggleDetails()
}


function toggleDetails(){
    var buttons = document.getElementsByClassName("see_foll_content");

    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.addEventListener("click",(e) => {
            document.getElementsByTagName("body")[0].classList.toggle("body_show_all")
        });
    }
}






function setPeriods(data,identifier){
    // document.querySelector(`#${identifier}`).innerHTML=""
   
     for (let i = 0; i < data.length; i++) {
        const element = data[i];
        var container=document.querySelector(`#${identifier}`)
        var html=`
        <option value="${element.Date ? element.Date : element}">${element.Date ? element.Date : element}</option>
        `
        container.insertAdjacentHTML("beforeend",html)
     }
}

setEndTime()


function setEndTime(){
    const selectionInput = document.getElementById('Set_Starting_Date');

    // Add event listener for 'change' event
    selectionInput.addEventListener('change',(e)=>{
        // Log the selected value when it changes
        var value=e.target.value
        const referenceDate = new Date(value);
        const datesGreaterThanReference = date.filter(dateStr => {
            const currentDate = new Date(dateStr);
            return currentDate > referenceDate;
        });
        document.getElementById('Set_Date_To_Stop').innerHTML=""
        setPeriods(datesGreaterThanReference,"Set_Date_To_Stop")
    });
}


function isValidDateFormat(text) {
    // Define the regular expression pattern for the specified format
    const regexPattern = /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} \+\d{4}$/;

    // Test the text against the regular expression
    return regexPattern.test(text);
}

// Example usage:




async function playTime() {
    document.getElementsByClassName("time_play")[0].addEventListener("click", async () => {
        var TimeDuration = document.getElementsByTagName("select");
        var StartingDate = TimeDuration[0].value;
        var EndingDate = TimeDuration[1].value;
        var name = "email Pod Cast";
        var summary = "";
        
        if (isValidDateFormat(EndingDate)) {
            document.getElementsByClassName("loading_data")[0].classList.remove("hid")
            var startDate = new Date(StartingDate);
            var endDate = new Date(EndingDate);
            
            const filteredData = emailData.filter(item => {
                const itemDate = new Date(item.Date);
                return itemDate >= startDate && itemDate <= endDate;
            });
            
            for (let i = 0; i < filteredData.length; i++) {
                const element = filteredData[i];
                summary += element.message;
            }
            
            const generatedSummary = await generateSummary(summary);
            const audioUrl = await convertTextToAudio(generatedSummary.choices[0].message.content.replace(/"/g, ''));
            populateCont(name,generatedSummary.choices[0].message.content.replace(/"/g, ''),"no id for this as it is selected by time",audioUrl)
        } else {
            // Handle invalid date format
        }
    });
}


if(!localStorage.getItem("EmailMVPUserId")){
    window.location=winUrl
}


function logOut(){
    localStorage.removeItem("EmailMVPUserId")
    window.location=winUrl
}














