# gulp-picture-html

> Расширение для Gulp, замените элемент html `<img>` на `<picture>` с помощью [`gulp-picture-html`](https://github.com/WpWebr/gulp-picture-html)

## Установка

```
$ npm install gulp-picture-html --save-dev
```

## Применение

Use this into your `gulpfile.js`:

### Базовые настройки

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

### Пользовательские параметры плагина

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
## Пример

```html
// Вход
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
// Выход
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

### Элемент изображения `<picture>`
На данный момент вы можете использовать формат во всей его красе с собственным элементом `<picture>` в HTML. Почему, спросите вы? Элемент `<picture>` обеспечивает прогрессивную поддержку. Вы можете просто установить все файлы изображений в том порядке, в котором вы хотите их загрузить. Браузеры ваших пользователей загружают только одно изображение, что снижает нагрузку на сервер. Кроме того, вам не нужен скрипт для обработки нескольких изображений.
В настоящее время **97% браузеров поддерживают** [`picture element`](https://caniuse.com/?search=picture)

✔ *Не загружает более одного изображения за раз*

✔ *Встроенная поддержка выбора наиболее подходящего изображения*

✔ *Поддержка браузерами 97% и автоматический переход на резервный вариант*

✔ *Осуществить это легко и просто*