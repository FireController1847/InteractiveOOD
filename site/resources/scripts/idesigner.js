/** @import * as $ from "../../lib/js/jquery-3.7.1.min.js" **/
/** @import * as Vue from "../../lib/js/vue-3.5.17.min.js" **/

// Storage for the working interface.
const interface = {
    metadata: {
        name: undefined
    },
    properties: []
};

function onInterfaceNameChanged(element) {
    interface.metadata.name = element.target.value;
}

async function onAddProperty(element) {
    const $properties = $("#form-interface-properties");

    // Create the property element and load the HTML content into it.
    const id = crypto.randomUUID();
    const $property = $("<div>").attr("id", `property-${id}`);
    $properties.before($property, $properties.children().last());
    await loadInto($property, relativeToScript(`../../${config.locations.components.idesigner.property}`));

    // Add the property to the interface storage
    interface.properties.push({
        id: id,
        type: undefined,
        name: undefined
    });

    // Construct the Vue app for the property
    const app = Vue.createApp({
        setup() {
            return {
                "uuid": Vue.ref(id)
            }
        },
        methods: {
            onPropertyNameChanged(event) {
                // Update the interface properties with the new name
                const property = interface.properties.find(prop => prop.id === id);
                if (property) {
                    property.name = event.target.value;
                }
                console.debug(`Property ${id} name changed: ${event.target.value}`);
            }
        }
    });
    app.mount(`#property-${id}`);
}

(async function() {
    // Inputs
    const $interfaceName = $("#forminput-interface-name");
    $interfaceName.on("input", onInterfaceNameChanged);

    // Controls
    const $addProperty = $("#formcontrol-add-property");
    $addProperty.on("click", onAddProperty);
})();