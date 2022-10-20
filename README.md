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
  options: // ниже значения по умолчанию
  {
    extensions : ['.png','.jpg'], // расширерия файлов изображений для которых создаем 'picture'
    source : ['.avif', '.webp'], // создаем 'source' с этими форматами      
    noPicture : ['no-sourse'],  // если находим этот класс для тега 'img', то не создаем 'picture' (можно ставить несколько классов)
    noPictureDel : false // если 'true' удалить классы для тега 'img' заданные в 'noSource:[]'
  }
))
//...

```
## Example

```html
// Input
<!-- Не изменяет закомментированный тэг 'img'
  <img src="img/image.jpg" alt="image"> -->
<img src="img/image.jpg" alt="image">
<!-- Не изменяет тег 'img' поскольку есть класс 'no-picture' -->
<!-- Если задать 'noSourceDel = true', то удалит заданный/заданные классы в 'noSource:[]' -->
<img class="no-picture" src="img/image.jpg" alt="image">
<!-- Преобразует все форматы найденные в 'srcset' -->
<img src="img/image.jpeg" srcset="img/image-2.PNG 2x, img/image-200.png 200w" width="500" height="300">
<!-- Для ленивой загрузки с помощью JS, найдя 'data-src', создает 'src' и 'srcset' c 'data:image/png;...' -->
<img data-src="img/verstka.jpeg" data-srcset="img/medium.PNG 2x, img/demo-200px.png 200w" width="500" height="300">
```
```html
// Output
<!-- Не изменяет закомментированный тэг 'img'
  <img src="img/image.jpg" alt="image"> -->
<picture>
    <source srcset="img/image.avif" type="image/avif">
    <source srcset="img/image.webp" type="image/webp">
    <img src="img/image.jpg" alt="image">
</picture>
<!-- Не изменяет тег 'img' поскольку есть класс 'no-picture' -->
<img class="no-picture" src="img/image.jpg" alt="image">
<!-- Если задать 'noSourceDel = true', то удалит заданный/заданные классы в 'noSource:[]' -->
<img src="img/image.jpg" alt="image">
<!-- Преобразует все форматы найденные в 'srcset' -->
<picture>
  <source srcset="img/image.avif, img/image-2.avif 2x, img/image-200.avif 200w" type="image/avif">  
  <source srcset="img/image.webp, img/image-2.webp 2x, img/image-200.webp 200w" type="image/webp">  
  <img src="img/image.jpeg" srcset="img/image-2.PNG 2x, img/image-200.png 200w" width="500" height="300">
</picture>
<!-- Для ленивой загрузки с помощью JS: найдя 'data-src', создает 'src' и 'srcset' c 'data:image/png;...' -->
<picture>
  <source data-srcset="img/verstka.avif, img/medium.avif 2x, img/demo-200px.avif 200w" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/avif">  
  <source data-srcset="img/verstka.webp, img/medium.webp 2x, img/demo-200px.webp 200w" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/webp">  
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" data-src="img/verstka.jpeg" data-srcset="img/medium.PNG 2x, img/demo-200px.png 200w" width="500" height="300">
</picture>
```

### Browser Support
At the time of writing, **AVIF has 64% support on browsers.** Google Chrome and Opera support it. Firefox will support it from June 2021. Safari doesn't yet have AVIF support. However, AVIF is an invention of the non-profit industry consortium Alliance for Open Media AOM. Major browser giants Apple, Mozilla and Google are all part of the project, so support can be expected relatively quickly.

### The picture element
For now, you can still use the format in it's almost complete glory with the native `<picture>` element in HTML. Why, you may ask? Well, the `<picture>` element allows progressive support. You can simply drop all image files in the order in which you want to load them. Your visitors' browsers load only one image at a time, which reduces the load on the server. Besides, you don't need a script to process multiple images.
Currently **96.5% of browsers support the** [`picture element`](https://caniuse.com/?search=picture)

✔ *Does not download more than one image at a time*

✔ *Native support for selecting the most appropriate image*

✔ *96% browser support and automatic fallback*

✔ *Getting this implemented is easy and straightforward*






















# gulp-picture-html


## Example
```html
// Input
<img src="/images/catalogImage.jpg">

// Output
<picture>
    <source srcset="/images/catalogImage.webp" type="image/webp">
    <img src="/images/catalogImage.jpg">
</picture>


// Input
<img src="/images/catalogImage.jpg" srcset="/images/catalogImage2x.jpg 2x">

// Output
<picture>
    <source srcset="/images/catalogImage.webp, /images/catalogImage2x.webp 2x" type="image/webp">
    <img src="/images/catalogImage.jpg" srcset="/images/catalogImage2x.jpg 2x">
</picture>

// Input
<img src="/images/catalogImage.svg">

// Output
<img src="/images/catalogImage.svg">
```


## Install
```bash
npm i --save-dev gulp-webp-html-nosvg
```
## Usage
```javascript
let webphtml = require('gulp-webp-html-nosvg');

gulp.task('html',function(){
    gulp.src('./assets/**/*.html')
        .pipe(webphtml())
        .pipe(gulp.dest('./public/'))
});
```
