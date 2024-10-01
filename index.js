'use strict';
const Vinyl = require('vinyl');
const PluginError = Vinyl.PluginError;
const through = require('through2');
const pluginName = 'gulp-picture-html';

module.exports = function (ops) {
  let source, noPicture, extensions, noPictureDel

  extensions = ops.extensions ?? ['.jpg', '.png', '.jpeg'];
  source = ops.source ?? ['.avif', '.webp'];
  noPicture = ops.noPicture ?? ['no-picture'];
  noPictureDel = ops.noPictureDel ?? false;

  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }
    if (file.isStream()) {
      cb(new PluginError(pluginName, 'Streaming not supported')); //Потоковая передача не поддерживается
      return;
    }
    try {
      let inPicture = false;
      let comments = [];
      const data = file.contents
        .toString()
        // Сохраняем комментарии, чтобы не их не обрабатывать
        .replace(/(<!--[\s\S]*?-->)/g, function (match) {
          comments.push(match); // Сохраняем комментарий в массив
          return `<!--comment_${comments.length - 1}-->`; // Заменяем комментарий на метку
        })
        // Добавляем перевод строки после одиночных и закрывающих тегов
        .replace(/(<(img|br|hr|input|link|meta)[^>]*>)/gi, '$1\n') // Для одиночных тегов
        .replace(/(<\/[^>]+>)/g, '$1\n') // Для закрывающих тегов
        .replace(/\n\s*\n/g, '\n') // Убираем лишние переводы строк
        .trim()
        .split('\n')
        .map(function (lines) {
          // Вне <picture/>?
          if (lines.includes('<picture')) inPicture = true;
          if (lines.includes('</picture')) inPicture = false;
          // Проверяем есть ли <img/>, нет ли заданного класса у 'img' и не закомментированна ли строка
          if (lines.includes('<img') && !inPicture && !noSour(noPicture, lines) && !(lines.includes('<!--'))) {
            const indent = ' '.repeat(lines.indexOf('<img'));
            const Re = /<img([^>]*)src=\"(.+?)\"([^>]*)>/gi
            let regexpItem,
              regexArr = [],
              imgTagArr = [],
              newUrlArr = [],
              newHTMLArr = [],
              newUrlA = []
            while (regexpItem = Re.exec(lines)) {
              regexArr.push(regexpItem)
            }
            // Проверяем соответствует ли  значение 'src' заданным расширениям
            if (extensionsIn(regexArr[0][2], extensions)) {
              // Проверяем соответствует ли  атребут 'srcset= '
              if (regexArr[0][0].includes('srcset=')) {
                newUrlArr = [regexArr[0][2] + ', ' + (/srcset=([^\"]*)(.+?)([^\"]*)/gi.exec(regexArr[0][0]))[3]]
              } else {
                newUrlArr.push(regexArr[0][2]);
              }
              imgTagArr.push(regexArr[0][0]);

              for (let i = 0; i < newUrlArr.length; i++) {
                let l = 0
                source.forEach(e => {
                  for (let k of extensions) {
                    k = new RegExp("\\" + k, 'gi')
                    newUrlArr[i] = newUrlArr[i].replace(k, e)
                  }
                  newUrlA[l] = newUrlArr[i]
                  l++
                  extensions.push(e)
                });
                newHTMLArr.push(pictureRender(source, newUrlA, imgTagArr[0], indent))
                lines = lines.replace(imgTagArr[0], newHTMLArr[i])
              }
              return lines;
            }
          }

          if (noSour(noPicture, lines) && !(lines.includes('<!--')) && noPictureDel) {
            let i = 0;
            while (noSour(noPicture, lines)) {
              // Удаляем элемент массива 'noPicture' в строке 'lines'
              lines = lines.replace((new RegExp(`${noPicture[i]}\\s*`, 'g')), '');
              i++;
            }
            // если нет стилей удаляем атрибут 'class=" "'
            if (/class=\"(\s*)\"/g.test(lines)) {
              lines = lines.replace((/class=\"(\s*)\"/g.exec(lines))[0], '')
            }
            return lines;
          } else {
            return lines;
          }

        })
        .join('\n')
        // Восстанавливаем комментарии обратно на их места
        .replace(/<!--comment_(\d+)-->/g, function (_, index) {
          return comments[parseInt(index, 10)];
        });
      file.contents = new Buffer.from(data)
      this.push(file)

      function extensionsIn(Arr, ex) {
        let exIn = [];
        ex.forEach(e => {
          exIn.push(Arr.toLowerCase().includes(e))
        });
        return exIn.includes(true);
      }

      function noSour(noPicture, lines) {
        // Строгое соответствие строковой переменной ${e} без знака «-» в начале и конце
        let noS = (e) => (new RegExp(`["\\s](?![-])${e}\\b(?![-])`, 'g')).test(lines) === true;
        // Возвращаем true если найденно соответствие одному из элементов массива 'noPicture' в строке 'lines'
        return noPicture.some(noS)
      }

      function pictureRender(sour, url, imgTag, indent) {
        let i = 0
        let li = ''
        if ((imgTag.includes('data-src'))) {
          imgTag = imgTag.replace('<img', `${indent}  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" `);
          url.forEach(e => {
            li += `${indent}  <source data-srcset="${e}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/${sour[i].replace(/[\s.%]/g, '')}"></source>\n`
            i++
          });
          return (`<picture>\n${li}${imgTag}\n${indent}</picture>`)
        } else {
          url.forEach(e => {
            li += `${indent}  <source srcset="${e}" type="image/${sour[i].replace(/[\s.%]/g, '')}"></source>\n`
            i++
          })
          return (`<picture>\n${li}${indent}  ${imgTag}\n${indent}</picture>`)
        }
      }

    } catch (err) {
      this.emit('error', new PluginError(pluginName, err))
    }
    cb()
  })
}