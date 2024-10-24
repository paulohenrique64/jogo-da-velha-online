// rolar até a seção "About" quando clicar no link "About" no cabeçalho
document.getElementById("aboutLink").addEventListener("click", function(event) {
    event.preventDefault(); 
    
    const aboutSection = document.getElementById("about");
    aboutSection.scrollIntoView({ behavior: "smooth" });
});








