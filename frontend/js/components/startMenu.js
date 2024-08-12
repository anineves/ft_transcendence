import { navigateTo } from "../utils";

export const startMenu = () => {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="background-form" id="form-startmenu">
          <button id="loginBtn2" class="btn">Login</button>
          <button id="registerBtn2" class="btn">Sign in</button>
          <button id="guestBtn2" class="btn">Play as Guest</button>
        </div>

    `
};



const button = document.getElementById('loginBtn2');