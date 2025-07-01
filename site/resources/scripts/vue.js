/** @import * as $ from "../../lib/js/jquery-3.7.1.min.js" **/
/** @import * as Vue from "../../lib/js/vue-3.5.17.min.js" **/

const log_prefix = "[vue.js] ";

/* Helper script for resolving relative paths */
const src = document.currentScript.src;
function relativeToScript(path) {
    return new URL(path, new URL('.', src)).toString();
}

/* Helper script for loading an HTML file into an existing element */
function loadInto(element, path) {
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

/**
 * Loads the configuration from config.json.
 * @returns {Promise<Object>} A promise that resolves to the configuration object.
 */
function loadConfig() {
    return new Promise(function(resolve, reject) {
        $.getJSON(relativeToScript("../config.json")).done(function(json) {
            console.log(`${log_prefix}Configuration loaded successfully!`, json);
            resolve(json);
        }).fail(function(xhr, status, error) {
            reject(`Error loading config.json: ${xhr.status} - ${xhr.statusText}`);
        });
    });
}

/**
 * Loads HTML content into the specified element, replacing the element with the new contents.
 * @param {HTMLElement} element The HTML element to load content into.
 * @param {string} path The path to the HTML file to load.
 * @returns {Promise<void>} A promise that resolves when the content is loaded.
 */
function loadHtmlContent(element, path) {
    return new Promise(function(resolve, reject) {
        $.get(path).done(function(data) {
            const $orig = $(element);
            const $new = $(data);
            const id = $orig.attr('id');
            $orig.replaceWith($new);
            $new.attr('id', id); // restore the ID
            resolve();
        }).fail(function(xhr, status, error) {
            reject(`Error loading HTML content from ${path}: ${xhr.status} - ${xhr.statusText}`);
        });
    });
}

/**
 * Prepares the navigation bar by loading its content and setting up Vue.js.
 * @param {*} config
 */
async function loadNavbar(config) {
    // Find the preconfigured navbar element
    const $navbar = $('#vjs-navbar');
    if ($navbar.length == 0) return await Promise.reject("Navbar element not found in the document!");
    console.debug(`${log_prefix}Found navbar element:`, $navbar[0]);

    // Load the navbar HTML content
    const navbar_loc = relativeToScript(`../../${config.locations.components.navbar}`);
    console.debug(`${log_prefix}Loading navbar content from:`, navbar_loc);
    await loadInto($navbar, navbar_loc);

    // Create the Vue app for the navbar
    const vue_navbar = Vue.createApp({
        setup() {
            const items = [];
            $.each(config.locations.navbar, function(key, value) {
                console.debug(`${log_prefix}Adding navbar item:`, value);
                items.push({
                    name: value.name,
                    href: relativeToScript(`../../${value.url}`),
                    active: false
                });
            });
            const url = new URL(window.location.href);
            for (const item of items) {
                const itemUrl = new URL(item.href, document.baseURI);
                if (itemUrl.pathname.localeCompare(url.pathname, undefined, { sensitivity: 'base' }) === 0) {
                    item.active = true;
                }
            }
            return {
                "navItems": Vue.ref(items),
            };
        }
    });
    vue_navbar.mount('#vjs-navbar');
    console.log(`${log_prefix}Vue app for navbar mounted successfully!`, vue_navbar);
}

/* Main script for Vue functionality */
'use strict';
(async function () {
    globalThis.config = await loadConfig();
    await loadNavbar(config);
})();