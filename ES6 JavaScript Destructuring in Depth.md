Деструктурирование в JavaScript (ES6) изнутри
Максим Усачев 19.11.2015 0 Comments
JavaScript, СтатьиES2015, es6, JavaScript
Перевод статьи ES6 JavaScript Destructuring in Depth  с сайта ponyfoo.com, опубликовано на css-live.ru с разрешения автора — Николаса Беваквы.

В моей серии статей про React я кратко упомянул несколько фич ES6 (и введение в Babel), а теперь хочу сосредоточиться на самих фичах языка. Я уже много всего читал про ES6 и ES7, и пора уже поговорить об их фичах здесь на Pony Foo.

Эта статья предупреждает об опасности переборщить с фичами языка ES6. Затем начнём серию с обсуждения деструктирования в ES6 и когда оно наиболее полезно, а также некоторые из его подводных камней и нюансов.


Предостережение
Если вы не уверены, то скорее всего вам стоит остановиться на ES5 и старом синтаксисе, а не переходить на ES6 ради самого ES6. И здесь я не утверждаю, что синтаксис ES6 — плохая идея, совсем наоборот, видите, я пишу статью про ES6! Я беспокоюсь о том, что пользоваться фичами ES6 нужно потому, что они безусловно улучшают качество кода, а не потому, что «это модно» — как бы оно ни было.

Подход, который я использую до сих пор — писать на простом ES5, добавляя по необходимости «сахарок» ES6 там, где он действительно улучшает мой код. Полагаю, что со временем я смогу намного быстрее выявлять сценарии, где вместо ES5 стоит использовать фичи ES6, но поначалу лучше не переусердствовать раньше времени. Вместо этого тщательно анализируйте, что в первую очередь подошло бы вашему коду, и применяйте ES6 с умом.

Таким образом, вы научитесь применять новые фичи с пользой, а не просто выучите синтаксис.

Деструктирование
Это одна из тех фич, что я использую чаще всего. И одна из простых фич. Она связывает свойства с любым количеством переменных и работает как с массивами Array, так и с объектами Object.

```javascript
var foo = { bar: 'pony', baz: 3 }
var {bar, baz} = foo
console.log(bar)
// <- 'pony'
console.log(baz)
// <- 3
```
Это позволяет очень быстро вытащить нужное свойство из объекта. Также можно связывать свойства с псевдонимами
```javascript
var foo = { bar: 'pony', baz: 3 }
var {bar: a, baz: b} = foo
console.log(a)
// <- 'pony'
console.log(b)
// <- 3
```
Можно вытаскивать свойства с любой глубины вложенности, и для этих глубоких связей тоже можно задавать псевдонимы.
```javascript
var foo = { bar: { deep: 'pony', dangerouslySetInnerHTML: 'lol' } }
var {bar: { deep, dangerouslySetInnerHTML: sure }} = foo
console.log(deep)
// <- 'pony'
console.log(sure)
// <- 'lol'
```
По умолчанию ненайденные свойства будут undefined, как и при доступе к свойствам объекта при помощи нотаций точки или скобок.
```javascript
var {foo} = {bar: 'baz'}
console.log(foo)
// <- undefined
```
Однако, если попытаться получить глубоко вложенное свойство несуществующего родителя, то вы получите исключение.
```javascript
var {foo:{bar}} = {baz: 'ouch'}
// <- Исключение
```
Это вполне разумно, если думать о деструктировании, как о «сахарке» для  ES5, как в коде ниже.
```javascript
var _temp = { baz: 'ouch' }
var bar = _temp.foo.bar
// <- Исключение
```
Классная особенность деструктирования — оно позволяет обменивать значения переменных без пресловутой вспомогательной переменной.
```javascript
function es5 () {
  var left = 10
  var right = 20
  var aux
  if (right > left) {
    aux = right
    right = left
    left = aux
  }
}
function es6 () {
  var left = 10
  var right = 20
  if (right > left) {
    [left, right] = [right, left]
  }
}
```
Ещё один удобный аспект деструктирования — возможность вытаскивать ключи с помощью динамических имен свойства.
```javascript
var key = 'such_dynamic'
var { [key]: foo } = { such_dynamic: 'bar' }
console.log(foo)
// <- 'bar'
```
В ES5 вам бы для этого понадобилось добавить целый оператор и объявить лишнюю переменную
```javascript
var key = 'such_dynamic'
var baz = { such_dynamic: 'bar' }
var foo = baz[key]
console.log(foo)
```
Также можно задать значение по умолчанию, на случай, если полученное свойство окажется  со значением undefined.
```javascript
var {foo=3} = { foo: 2 }
console.log(foo)
// <- 2
var {foo=3} = { foo: undefined }
console.log(foo)
// <- 3
var {foo=3} = { bar: 2 }
console.log(foo)
// <- 3
```
Как уже упоминалось, деструктирование также позволяет работать с массивами. Заметьте, что сейчас я использую квадратные скобки в левой части объявления.
```javascript
var [a] = [10]
console.log(a)
// <- 10
```
Здесь, опять же, можно использовать значение по умолчанию, следуя тем же правилам.
```javascript
var [a] = []
console.log(a)
// <- undefined
var [b=10] = [undefined]
console.log(b)
// <- 10
var [c=10] = []
console.log(c)
// <- 10
```
Когда дело доходит до массивов, то можно смело пропускать ненужные элементы.
```javascript
var [,,a,b] = [1,2,3,4,5]
console.log(a)
// <- 3
console.log(b)
// <- 4
```
Также деструктирование можно использовать в списке параметров function.
```javascript
function greet ({ age, name:greeting='she' }) {
  console.log(`${greeting} is ${age} years old.`)
}
greet({ name: 'nico', age: 27 })
// <- 'nico is 27 years old'
greet({ age: 24 })
// <- 'she is 24 years old'
Это было в общих чертах о том, как использовать деструктурирование. Но для чего оно нужно?
```
Применение деструктирования
Бывает много случаев, где деструктирование очень пригодилось бы. Вот некоторые из наиболее распространённых. Всякий раз, когда у вас есть метод, возвращающий объект, благодаря деструктурированию работа с ним становится гораздо лаконичнее
```javascript
function getCoords () {
  return {
    x: 10,
    y: 22
  }
}
var {x, y} = getCoords()
console.log(x)
// <- 10
console.log(y)
// <- 22
```
Аналогичный случай, но в обратную сторону — возможность определить параметр по умолчанию, когда есть метод с кучей параметров, требующих значения по умолчанию. Это особенно интересно в качестве замены для именованных параметров, как в других языках, напр. Python и C#.
```
function random ({ min=1, max=300 }) {
  return Math.floor(Math.random() * (max - min)) + min
}
console.log(random({}))
// <- 174
console.log(random({max: 24}))
// <- 18
```
Если нужно сделать объект параметров совершенно необязательным, вы можете изменить синтаксис на следующий.
```javascript
function random ({ min=1, max=300 } = {}) {
  return Math.floor(Math.random() * (max - min)) + min
}
console.log(random())
// <- 133
```
Деструктурирование как нельзя кстати в таких вещах, как регулярные выражения, где было бы здорово именовать параметры, а не довольствоваться их нумерацией по порядку. Вот пример парсинга URL с первым попавшимся RegExp, который я взял на StackOverflow.
```javascript
function getUrlParts (url) {
  var magic = /^(https?):\/\/(ponyfoo\.com)(\/articles\/([a-z0-9-]+))$/
  return magic.exec(url)
}
var parts = getUrlParts('http://ponyfoo.com/articles/es6-destructuring-in-depth')
var [,protocol,host,pathname,slug] = parts
console.log(protocol)
// <- 'http'
console.log(host)
// <- 'ponyfoo.com'
console.log(pathname)
// <- '/articles/es6-destructuring-in-depth'
console.log(slug)
// <- 'es6-destructuring-in-depth'
```
Особый случай: операторы import
Хотя операторы import не следуют правилам деструктирования, они ведут себя в чем-то похоже. Вот, пожалуй, похожий на деструктурирование пример, который мне доводится использовать чаще всего, хоть это и не деструктурирование как таковое. Всякий раз, когда вы пишите операторы import для модуля, можно вытащить нужное из публичного API модуля. Пример с использованием contra:
```javascript
import {series, concurrent, map } from 'contra'
series(tasks, done)
concurrent(tasks, done)
map(items, mapper, done)
```
Однако, заметьте, что у операторов import другой синтаксис. По сравнению с деструктированием, ни один из следующих операторов import не работает.

Применение значений по умолчанию, как в import {series = noop} from 'contra'
Аналог «глубокого» деструктирования, например import {map: { series }} from 'contra'
Синтаксис с псевдонимом import {map: mapAsync} from 'contra'
Основная причина этих ограничений — оператор import вносит привязку, а не ссылку или значение. Это важное различие, которое мы изучим подробнее в будущей статьи про модули ES6.

Я ежедневно буду знакомить вас с фичами ес6 и ес7, так что убедитесь, поэтому не забудьте подписаться, чтобы узнать больше!

P.S. Это тоже может быть интересно:
Битва архитектур
Пространство в системах дизайна
CSS Grid на практике: добавляем гриды к существующему дизайну
