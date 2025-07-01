/* Helper script for resolving relative paths */
function relativeToScript(path) {
    return new URL(path, new URL('.', document.currentScript.src)).toString();
}

/* Helper script for loading an HTML file into an existing element */
async function loadInto(element, path) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: path,
            method: 'GET',
            dataType: 'html',
            timeout: 5000,
            success: function (data) {
                const $orig = $(element);
                const $new = $(data);
                const id = $orig.attr('id');
                $orig.replaceWith($new);
                $new.attr('id', id); // restore the ID
                resolve();
            },
            error: function (xhr, status, exception) {
                reject(`Error when attempting to load HTML file: ${xhr.status} - ${xhr.statusText}`);
            }
        });
    });
}

/* Global app reference */
class InteractiveUML {
    constructor() {
        // Elements
        this.elements = {
            navbar: null,
            appcontent: null
        };

        // Vue apps
        this.vueapps = {
            navbar: null,
            appcontent: null
        };
    }
}
globalThis.app = new InteractiveUML();

/* Main script for Vue functionality */
'use strict';
(async function () {
    // Global variables
    const home_loc = relativeToScript('../../');
    const idesigner_loc = relativeToScript('../../idesigner/');
    const navbar_id = 'vjs-navbar';
    const navbar_loc = relativeToScript('../../components/navbar.html');
    const appcontent_id = 'vjs-appcontent';

    // Find and verify HTML elements
    const html_navbar = document.querySelector(`#${navbar_id}`);
    if (html_navbar == undefined) {
        console.error("Unable to load navbar, #vjs-navbar not found!");
        return;
    }
    if (html_navbar.tagName.localeCompare('nav', undefined, { sensitivity: 'base' }) != 0) {
        console.error("Navbar element is not a <nav> tag, please check your HTML!");
        return;
    }
    const jq_navbar = $(html_navbar);
    app.elements.navbar = jq_navbar;
    const html_appcontent = document.querySelector(`#${appcontent_id}`);
    if (html_appcontent == undefined) {
        console.error("Unable to load content, #vjs-appcontent not found!");
        return;
    }
    const jq_appcontent = $(html_appcontent);
    app.elements.appcontent = jq_appcontent;

    // Load navigation bar
    await loadInto(jq_navbar, navbar_loc, navbar_id);

    // Initialize Vue app for the navbar
    const vue_navbar = Vue.createApp({
        setup() {
            const navItems = Vue.ref([
                { name: 'Home', href: home_loc, active: false },
                { name: 'IInterface Designer', href: idesigner_loc, active: false }
            ]);
            const currentUrl = new URL(window.location.href);
            for (const item of navItems.value) {
                const itemUrl = new URL(item.href, document.baseURI);
                if (itemUrl.pathname.localeCompare(currentUrl.pathname, undefined, { sensitivity: 'base' }) === 0) {
                    item.active = true;
                }
            }
            return { navItems };
        }
    });
    vue_navbar.mount('#' + navbar_id);
    app.vueapps.navbar = vue_navbar;

    // Done! ^-^
    console.log("Vue.js script loaded successfully!", app);
})();