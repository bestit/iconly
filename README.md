# Iconly
Iconly is a tool to create custom html elements that handle your SVG icons/images. It allows you to load SVGs from different sources and inlines the SVG code in your HTML. After the SVG was inlined in your HTML you can to whatever you want with the code, you can style it, animate it or even use JavaScript to modify the SVG directly.

## Installion
npm:
```bash
npm install @best-it/iconly
```

yarn:
```bash
yarn add @best-it/iconly
```

## Usage
In the dist folder are multiple versions to choose from. There is a CommonJS version, a ES Modules version and a Universal Module Definition. In addition each module comes with a ES5 version to.

### Creating a new custom element
To create a new element you simply run the createElement method from the Iconly module and pass it an element name.

```javascript
Iconly.createElement('iconly');
```
Which will allow you to write a HTML element like this:
```html
<iconly></iconly>
```
This element won't do much for now. We'll have to configure our element a bit more for that.

### Configuring the element
You can either pass the configuration directly in the createElement method, like this:
```javascript
Iconly.createElement(
    'iconly',
    {
        fetchPattern: '/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
    }
);
```
or you can load an already created element and modify its configuration:
```javascript
Iconly.getElement('iconly').setConfig({
    fetchPattern: '/icons/%NAMESPACE%/%PACK%/%SYMBOL%.svg',
});
```

If you want to see the current config simply use the getConfig method:
```javascript
Iconly.getElement('iconly').getConfig();
```

The fetchPattern added to the config allows you now to load SVGs with such a path. For example a SVG stored in */icons/storefront/default/my-icon.svg* would load like this
```html
<iconly symbol="my-icon" pack="default" namespace="storefront">
    <!-- SVG will be inserted here -->
</iconly>
```

And it's actually possible to omit the pack and namespace attributes in this case, because pack and namespace automatically fallback to these values:
```html
<iconly symbol="my-icon"></iconly>
```

The default values for pack and namespace are of course part of the config too, so feel free to change them:
```javascript
Iconly.getElement('iconly').setConfig({
    defaultPack: 'YOUR_PACK',
    defaultNamespace: 'YOUR_NAMESPACE',
});
```

### Adding an icon library
You can either pass the library in the createElement method, like this:
```javascript
Iconly.createElement(
    'iconly',
    {},
    {
        'storefront': {
            'default': {
                'my-icon': '/icons/storefront/default/my-icon.svg'
            }
        }
    }
);
```
or you can load an already created element and modify its library:
```javascript
// Overwrite the complete library tree
Iconly.getElement('iconly').getLibrary().setTree({
    'storefront': {
        'default': {
            'my-icon': '/icons/storefront/default/my-icon.svg'
        }
    }
});

// Merge with the existing library tree
Iconly.getElement('iconly').getLibrary().mergeTree({
    'storefront': {
        'default': {
            'my-icon': '/icons/storefront/default/my-icon.svg'
        }
    }
});
```

This is pretty much the same like the *fetchPattern* example from the last section, the custom element wil look in the library and find the url to fetch from. But in the case you could actually rename your symbol, pack or namespace and keep the url like it is to create a mapping for your icons.

But you don't have to store another url in the library, you could also store the complete SVG code as a string:
```javascript
// Overwrite the complete library tree
Iconly.getElement('iconly').getLibrary().setTree({
    'storefront': {
        'default': {
            'my-icon': '<svg>...</svg>'
        }
    }
});
```
This way the custom element wouldn't fetch the svg resource, instead it would load it directly from the library.

And the HTML for all these examples is still the same:
```html
<iconly symbol="my-icon"></iconly>
```

### Element Attributes
Besides the symbol, pack and namespace attributes to identify the correct icon, there are some additional attributes to modify an icon.

* rotate
    ```html
    <iconly symbol="my-icon" rotate="90deg"></iconly>
    ```
* flip
    ```html
    <iconly symbol="my-icon" flip="horizontal"></iconly>
    <iconly symbol="my-icon" flip="vertical"></iconly>
    <iconly symbol="my-icon" flip="both"></iconly>
    ```

* loading
    ```html
    <!-- Default icon is loader directly -->
    <iconly symbol="my-icon" loading="eager"></iconly>

    <!-- Lazy loaded via intersection observer -->
    <iconly symbol="my-icon" loading="lazy"></iconly>
    ```

    An intersection observer config can be passed in the config:
    ```javascript
    {
        intersectionObserver: {
            root?: Element | Document | null;
            rootMargin?: string;
            threshold?: number | number[];
        }
    }
    ```

* mode
    ```html
    <!-- Default is replace -->
    <iconly symbol="my-icon" mode="replace"></iconly>

    <!-- Inline doesn't replace the icon, allows predifined svgs-->
    <iconly symbol="my-icon" mode="inline">
        <svg>...</svg>
    </iconly>

    <!-- Wraps multiple items and writes the icon into reusable css variable instead -->
    <iconly symbol="my-icon" mode="wrap" style="--icon: url(svg)">
        <button></button>
    </iconly>
    ```

## Handler
Iconly uses handler to identify the configuratuion and attributes for each element and determines which handler fits best.

Iconly uses the following handler:

* NullHandler
    Checks if the element doesn't have enough attributes to be processed by the following handlers. Throws an error if not enough attributes are set.

* LibraryInlineHandler
    Checks if the stored libary value doesn't look like an URL and returns it as an inline SVG.

* LibraryRemoteHandler
    Checks if the stored libary value does look like an URL, fetches the asset and returns it code.

* FetchHandler
    Uses the *fetchPattern*, if definied to load the svg from the URL and returns its code.

It is possible to modify these handler.

Get handler list:
```javascript
Iconly
    .getElement('test-icon')
    .getIconHandler()
    .getHandlerList();
```

You can reorder them by changing their priorities:

```javascript
Iconly
    .getElement('test-icon')
    .getIconHandlr()
    // Index starts with 0 for NullHandler
    .getHandler(0)
    .setPriority(99);

// Reorder handler list based on new priorities
Iconly
    .getElement('test-icon')
    .getIconHandler()
    .order();
```

You can add or remove handler:
```javascript
// Creating new handler with esm
import { AbstractHandler } from 'PATH_TO_ICONLY/dist/esm/handler/abstract-handler';

class CustomHandler extends AbstractHandler {
    supports(element) {
        // Your code
    }
    getIcon(element) {
        // Your code
    }
}

// Adding
Iconly
    .getElement('test-icon')
    .getIconHandler()
    .addHandler(new CustomHandler());

// Removing
Iconly
    .getElement('test-icon')
    .getIconHandler()
    .removeHandler(INDEX);

// replacing the complete handler list
Iconly.getElement('test-icon').getIconHandler().setHandlerList([
    new CustomHandler(),
])
```

## Development
Run dev server for either es5 or es6 mode:
```bash
yarn run serve:es5
```

```bash
yarn run serve:es6
```

Building:
```bash
yarn run build
```


## Iconly structure design
The structure of the Iconly source code is visualized as an UML chart at [GitMind.com](https://gitmind.com/app/flowchart/4b92539410).
