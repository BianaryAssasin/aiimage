let buttons = document.querySelectorAll('.btn');
let gen = document.getElementById("gen")
let images = document.querySelectorAll('.img');



for (let image of images) {
  image.addEventListener('click', function() {
    const fileName = `${image.name}.png`;
fetch(image.src)
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
  .catch(console.error);

  });
}