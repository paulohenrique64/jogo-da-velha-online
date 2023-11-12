// Adiciona um ouvinte de evento para rolar até a seção "About" quando clicar no link "About" no cabeçalho
document.getElementById("aboutLink").addEventListener("click", function(event) {
    event.preventDefault(); // Impede o comportamento padrão do link (navegar para outra página)
    
    const aboutSection = document.getElementById("about");
    aboutSection.scrollIntoView({ behavior: "smooth" });
});







