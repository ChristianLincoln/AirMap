// Setup UI Buttons and Menus
function fromId(id) {
    return document.getElementById(id)
}
function setDisplayNone(element,value,display) {
    if (value) {
        element.style.display = "none";
    } else {
        element.style.display = display;
    }
}
function toggleView(elementId,buttonId,minimized) {
    let element = fromId(elementId);
    let button = fromId(buttonId);
    let display = window.getComputedStyle(element).display;
    setDisplayNone(element,minimized,display);
    let old = button.onclick
    button.onclick = function(a) {
        if (old) {old(a);}
        minimized = !minimized;
        setDisplayNone(element,minimized,display);
    }
}
toggleView("passkey-input-box","user-login-minimize",false);
toggleView("detail-menu","edit-button",true);
toggleView("search-menu","search-button",true);