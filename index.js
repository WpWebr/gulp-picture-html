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
		let i = 0;
		if (file.isNull()) {
			cb(null, file);
			return;
		}
		if (file.isStream()) {
			cb(new PluginError(pluginName, 'Streaming not supported')); //Потоковая передача не поддерживается
			return;
		}
		try {
			let comments = [];
			let arrPicture = [];
			let arrImages = [];
			const data = file.contents
				.toString()
				// Сохраняем комментарии, чтобы их не обрабатывать
				.replace(/(<!--[\s\S]*?-->)/g, function (match) {
					comments.push(match); // Сохраняем комментарий в массив
					return `<!--comment_${comments.length - 1}-->`; // Заменяем комментарий на метку
				})
				// Сохраняем <picture>, чтобы их не обрабатывать
				.replace(/(<picture>[\s\S]*?<\/picture>)/g, function (match) {
					arrPicture.push(match); // Сохраняем <picture> в массив
					return `<!--markPicture_${arrPicture.length - 1}-->`; // Заменяем <picture> на метку
				})
				// Обрабатываем и сохраняем <img >
				.replace(/(\s*)(<img[\s\S]*?>)/g, function (match, spaces, imgTag) {
					const indent = ' '.repeat(match.replace(/^\s*\n/gm, '').indexOf('<img')); // Пробелы до до <img >        
					arrImages.push(muLine(imgTag, spaces, indent)); // Обрабатываем и сохраняем в массив
					return `<!--markImages_${arrImages.length - 1}-->`; // Заменяем <img> на метку
				})
				// Восстанавливаем комментарии обратно на их места
				.replace(/<!--comment_(\d+)-->/g, function (_, index) {
					return comments[parseInt(index, 10)];
				})
				// Восстанавливаем <picture> обратно на их места
				.replace(/<!--markPicture_(\d+)-->/g, function (_, index) {
					return arrPicture[parseInt(index, 10)];
				})
				// Восстанавливаем обработанное <img > обратно на место
				.replace(/<!--markImages_(\d+)-->/g, function (_, index) {
					return arrImages[parseInt(index, 10)];
				});

			file.contents = new Buffer.from(data);
			this.push(file);

			function muLine(lines, spaces, indent) {

				// Проверяем нет ли заданного класса у 'img'
				if (!noSour(noPicture, lines)) {
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
							newHTMLArr.push(pictureRender(source, newUrlA, imgTagArr[0], spaces, indent))
							lines = lines.replace(imgTagArr[0], newHTMLArr[i])
						}
						return lines;
					} else {
						return `${spaces}${lines}`; //! <=== если нет указанного расширения
					}
				} else if (noPictureDel) {
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
					return `${spaces}${lines}`;
				} else {
					return `${spaces}${lines}`;
				}
			}

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

			function pictureRender(sour, url, imgTag, spaces, indent) {
				let i = 0
				let li = ''
				if ((imgTag.includes('data-src'))) {
					imgTag = imgTag.replace('<img', `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" `);
					url.forEach(e => {
						li += `${indent}  <source data-srcset="${e}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/${sour[i].replace(/[\s.%]/g, '')}"></source>\n`
						i++
					});
					return (`${spaces}<picture>\n${li}${indent}  ${imgTag}\n${indent}</picture>`)
				} else {
					url.forEach(e => {
						li += `${indent}  <source srcset="${e}" type="image/${sour[i].replace(/[\s.%]/g, '')}"></source>\n`
						i++
					})
					return (`${spaces}<picture>\n${li}${indent}  ${imgTag}\n${indent}</picture>`)
				}
			}

		} catch (err) {
			this.emit('error', new PluginError(pluginName, err))
		}
		cb()
	})
}
