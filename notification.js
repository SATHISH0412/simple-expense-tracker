function showNotification(content) {
    const bdy = document.body;

    const tab = document.createElement('div');
    tab.classList.add('toast-notification');


    tab.innerHTML = `<p>${content}</p>`;

    bdy.appendChild(tab);


    setTimeout(() => {
        tab.remove();
    }, 3000);
}


function showNotificationDanger(content) {
    const bdy = document.body;

    const tab = document.createElement('div');
    tab.classList.add('toast-notificationdanger');


    tab.innerHTML = `<p>${content}</p>`;

    bdy.appendChild(tab);


    setTimeout(() => {
        tab.remove();
    }, 3000);
}