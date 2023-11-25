// rolar até a seção "Home" quando clicar no link "Home" no cabeçalho
document.getElementById("menuLink").addEventListener("click", function(event) {
  event.preventDefault();
  
  const menuSection = document.getElementById("menu");
  menuSection.scrollIntoView({ behavior: "smooth" });
});

// rolar até a seção "About" quando clicar no link "About" no cabeçalho
document.getElementById("aboutLink").addEventListener("click", function(event) {
    event.preventDefault(); 
    
    const aboutSection = document.getElementById("about");
    aboutSection.scrollIntoView({ behavior: "smooth" });
});








