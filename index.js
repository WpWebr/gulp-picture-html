const Vinyl = require('vinyl')
const PluginError = Vinyl.PluginError
const through = require('through2')
const pluginName = 'gulp-webp-html-nosvg'

module.exports = function (ops) {
  let source, noPicture, extensions, noPictureDel
  if (ops === undefined) {
    extensions = ['.jpg', '.png', '.jpeg']
    source = ['.avif', '.webp']
    noPicture = ['no-picture']
    noPictureDel = false
  } else {
    ops.extensions === undefined ? extensions = ['.jpg', '.png', '.jpeg'] : extensions = ops.extensions // форматы для которых включено добавление тега 'source' 
    ops.source === undefined ? source = ['.avif', '.webp'] : source = ops.source // добавление 'picture/source' c указанными форматами
    ops.noPicture === undefined ? noPicture = ['no-picture'] : noPicture = ops.noPicture // если находим этот класс для тега 'img', то не создаем 'picture' (можно ставить несколько классов)
    ops.noPictureDel === undefined ? noPictureDel = false : noPictureDel = ops.noPictureDel // удалить классы для тега 'img' заданные в 'noPicture:[]'
  }
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file)
      return
    }
    if (file.isStream()) {
      cb(new PluginError(pluginName, 'Streaming not supported')) //Потоковая передача не поддерживается
      return
    }
    try {
      let inPicture = false
      const data = file.contents
        .toString()
        .split('\n')
        .map(function (lines) {
          // Вне <picture/>?
          if (lines.indexOf('<picture') + 1) inPicture = true
          if (lines.indexOf('</picture') + 1) inPicture = false
          // Проверяем есть ли <img/>, нет ли заданного класса у 'img' и не закомментированна ли строка
          if (lines.indexOf('<img') + 1 && !inPicture && !noSour(noPicture, lines) && !(lines.indexOf('<!--') + 1)) {
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
                  for (k of extensions) {
                    k = new RegExp("\\" + k, 'gi')
                    newUrlArr[i] = newUrlArr[i].replace(k, e)
                  }
                  newUrlA[l] = newUrlArr[i]
                  l++
                  extensions.push(e)
                });
                newHTMLArr.push(pictureRender(source, newUrlA, imgTagArr[0]))
                lines = lines.replace(imgTagArr[0], newHTMLArr[i])
              }
              return lines;
            }
          }

          if (noSour(noPicture, lines) && !(lines.indexOf('<!--') + 1) && noPictureDel) {
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

      function pictureRender(sour, url, imgTag) {
        let i = 0
        let li = ''
        if ((imgTag.indexOf('data-src') + 1)) {
          imgTag = imgTag.replace('<img', '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ');
          url.forEach(e => {
            li += `<source data-srcset="${e}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/${sour[i].replace(/[\s.%]/g, '')}"></source>\n`
            i++
          });
          return (`<picture>\n${li}${imgTag}\n</picture>\n`)
        } else {
          url.forEach(e => {
            li += `<source srcset="${e}" type="image/${sour[i].replace(/[\s.%]/g, '')}"></source>\n`
            i++
          })
          return (`<picture>\n${li}${imgTag}\n</picture>\n`)
        }
      }

    } catch (err) {
      this.emit('error', new PluginError(pluginName, err))
    }
    cb()
  })
}