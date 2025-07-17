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

Or you can simply use the src attribute to define the url to the icon to load:
```html
<iconly src="https://YOUR_URL/ICON.svg"></iconly>
```

The default values for pack and namespace are of course part of the config too, so feel free to change them:
```javascript
Iconly.getElement('iconly').setConfig({
    defaultPack: 'YOUR_PACK',
    defaultNamespace: 'YOUR_NAMESPACE',
});
```

### Element Attributes
Besides the symbol, pack, namespace or src attributes to identify the correct icon, there are some additional attributes to modify an icon.

* loading
    ```html
    <!-- Icon is loaded directly -->
    <iconly symbol="my-icon" loading="eager"></iconly>

    <!-- Icon is loaded lazy (default behavior) -->
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

## Handler
Iconly uses handler to identify the configuration and attributes for each element and determines which handler fits best.

Iconly uses the following handler:

* NullHandler
    Checks if the element doesn't have enough attributes to be processed by the following handlers. Doesn't replace the custom element content, useful to directly inline some SVGs without external loading.

* SrcHandler
  Uses the src attribute to load the icon via url

* SymbolHandler
    Uses the *fetchPattern* if definied to load the svg from the URL and returns its code.

It is possible to modify these handlers.

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
    .getIconHandler()
    // Index starts with 0 for NullHandler
    .getHandler(0)
    .setPriority(99);

// Reorder handler list based on new priorities
Iconly
    .getElement('test-icon')
    .getIconHandler()
    .order();
```

You can add or remove custom handler classes:
```typescript
// Creating new handler with esm
import type { HandlerInterface } from '@best-it/iconly/classes/icon-handler.js';

class CustomHandler implements HandlerInterface  {
    supports(element) {
        // Your code
    }
    getIcon(element) {
        // Your code
    }
    getPriority() {
        // Your code
    }
    setPriority(priority: number) {
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
Run yarn link in this package folder 
```bash
yarn link
```

And then run yarn link with the package name in you project
```bash
yarn link @best-it/iconly
```

## Building
```bash
yarn run build
```
