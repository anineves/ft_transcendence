export const render3DPong = () => {
    const app = document.getElementById('app');

    app.style.width = "90vw";
    app.style.height = "90vh";
    app.style.display = "flex";
    app.style.justifyContent = "center";
    app.style.alignItems = "center";


    app.innerHTML = `
    <div class="three" style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        width: 100%; 
        height: 100%; 

        ">
        <iframe src="3d-pong.html" style="
            border: none; 
            width: 90vw; 
            height: 80vh; 
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
            border-radius: 10px;
        "></iframe>
    </div>
    `;
};
