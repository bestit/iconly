# svg-icon-system
SVG icon system utilising a custom element

## Installion
Not yet a available as a package

## Usage
 ```js
import { SvgIconSystem } from  'svg-icon-system';

new SvgIconSystem({
  name: 'custom-element', // name of th custom element
  library: {
    iconNameOne: {
      source: '<svg>', // svg saved direct as a string
      type: 'internal' // type of source
    },
    iconNameTwo: {
      source: 'shape-icon-1', // name of the id in the svg definition
      type: 'id'
    },
    share: {
      source: require('./assets/387-share2.svg'), // url to svg
      type: 'url'
    }
  }
});
 ```

 ```html
<custom-element shape="iconNameOne">
    <!-- Should inline the svg from the library -->
</custom-element>
 ```