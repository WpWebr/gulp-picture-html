# gulp-picture-html

> Gulp extension, replace html element `<img>` to `<picture>` with [`gulp-picture-html`](https://github.com/WpWebr/gulp-picture-html)

## Install

```
$ npm install gulp-picture-html --save-dev
```

## Usage

Use this into your `gulpfile.js`:

### Basic

```js
const gulp = require('gulp')
const pictureHTML = require("gulp-picture-html")

function html() {
  return src('source/*.html')
    .pipe(pictureHTML())
    .pipe(gulp.dest('dist/'))
}

exports.html = html;
```

### Custom plugin options

```js
// …
.pipe(pictureHTML(      
  options: // below default
  {
    extensions : ['.png','.jpg'], // image file extensions for which we create 'picture'
    source : ['.avif', '.webp'], // create 'source' with these formats   
    noPicture : ['no-picture'],  // if we find this class for the 'img' tag, then we don't create a 'picture' (multiple classes can be set)
    noPictureDel : false // if 'true' remove classes for 'img' tag given in 'noSource:[]'
  }
))
//...

```
## Example

```html
// Input
<!-- Does not change the commented out 'img' tag
  <img src="img/image.jpg" alt="image"> -->
<img src="img/image.jpg" alt="image">
<!-- Doesn't change the 'img' tag because there is a 'no-picture' class -->
<!-- Setting 'noSourceDel = true' will remove the given class(s) in 'noSource:[]' -->
<img class="no-picture" src="img/image.jpg" alt="image">
<!-- Converts all formats found in 'srcset' -->
<img src="img/image.jpeg" srcset="img/image-2.PNG 2x, img/image-200.png 200w" width="500" height="300">
<!-- For lazy loading with JS, finding 'data-src' creates 'src' and 'srcset' c 'data:image/png;...' -->
<img data-src="img/verstka.jpeg" data-srcset="img/medium.PNG 2x, img/demo-200px.png 200w" width="500" height="300">
```
```html
// Output
<!-- Does not change the commented out 'img' tag
  <img src="img/image.jpg" alt="image"> -->
<picture>
    <source srcset="img/image.avif" type="image/avif">
    <source srcset="img/image.webp" type="image/webp">
    <img src="img/image.jpg" alt="image">
</picture>
<!-- Doesn't change the 'img' tag because there is a 'no-picture' class -->
<img class="no-picture" src="img/image.jpg" alt="image">
<!-- Setting 'noSourceDel = true' will remove the given class(s) in 'noSource:[]' -->
<img src="img/image.jpg" alt="image">
<!-- Converts all formats found in 'srcset' -->
<picture>
  <source srcset="img/image.avif, img/image-2.avif 2x, img/image-200.avif 200w" type="image/avif">  
  <source srcset="img/image.webp, img/image-2.webp 2x, img/image-200.webp 200w" type="image/webp">  
  <img src="img/image.jpeg" srcset="img/image-2.PNG 2x, img/image-200.png 200w" width="500" height="300">
</picture>
<!-- For lazy loading with JS: finding 'data-src' creates 'src' and 'srcset' c 'data:image/png;...' -->
<picture>
  <source data-srcset="img/verstka.avif, img/medium.avif 2x, img/demo-200px.avif 200w" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/avif">  
  <source data-srcset="img/verstka.webp, img/medium.webp 2x, img/demo-200px.webp 200w" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/webp">  
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="img/verstka.jpeg" data-srcset="img/medium.PNG 2x, img/demo-200px.png 200w" width="500" height="300">
</picture>
```
### The picture element
For now, you can still use the format in it's almost complete glory with the native `<picture>` element in HTML. Why, you may ask? Well, the `<picture>` element allows progressive support. You can simply drop all image files in the order in which you want to load them. Your visitors' browsers load only one image at a time, which reduces the load on the server. Besides, you don't need a script to process multiple images.
Currently **97% of browsers support the** [`picture element`](https://caniuse.com/?search=picture)

✔ *Does not download more than one image at a time*

✔ *Native support for selecting the most appropriate image*

✔ *97% browser support and automatic fallback*

✔ *Getting this implemented is easy and straightforward*