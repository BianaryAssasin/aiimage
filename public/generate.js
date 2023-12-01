let img = document.getElementById("image");
let button = document.getElementById("button");
let input = document.getElementById("gen")
let generateBtn = document.getElementById("but");
let load = document.getElementById("load");
let bal = document.getElementById("bal");


// variables
let inputs = undefined;

generateBtn.addEventListener("click", function(){
  let result = bal.textContent.match(/\d+/);
  let number = parseInt(result[0])

  number -= 1;
  bal.textContent = `Balence: ${number}`;

  fetch("/credit", {
    method: "POST",
  })
  .then(response => response.json())
  .then((data) => {
    console.log(data.result)
    if (data.result == "out") {
      
      // if they are out of credits

      alert("oh dear it seems you are out of credits please go to the live chat and ask for more credits the rate is $2.99 CAD per 10 credits you get")
    } else if (data.result == "allowed") {


      fetch("/configGrabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grab: "vjhjkhjkrgdfgb"
        })
      })
      .then(response => response.json())
      .then((data) => {
    
        console.log(data.key)

        button.style.display = "none";
        load.style.display = "block";
        img.style.display = "none"
        fetch('https://api.openai.com/v1/images/generations', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${data.key}`
                },
                body: JSON.stringify({
                    prompt: input.value,
                    model: "image-alpha-001"
                  })
                })
                .then(response => response.json())
                .then((data) => {
                    setTimeout(function() {
                        img.style.display = "block";
                        load.style.display = 'none';
                        button.style.display = "block"
                        img.src = data.data[0].url;
                        inputs = input.value;
                        input.value = "";
                      }, 5000);
                })




      })
   }
})
})

button.addEventListener("click", function(){
    const fileName = inputs + ".png"

    fetch(img.src)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
})