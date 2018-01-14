https://air.ghost.io/js-things-i-never-knew-existed/
https://habrahabr.ru/company/ruvds/blog/346500/

Не берусь судить о том, пригодятся ли они кому-нибудь, но, полагаю, что раз уж всё это есть в языке, то об этом полезно, как минимум, знать.

Метки

Метки можно назначать циклам for или блокам кода в JS… А вы не знали? Я — так точно этого не знал. Затем на эти метки можно ссылаться и использовать команды break или continue в циклах for, а также применять команду break в блоках кода.

loop1: // назначение метки "loop1" 
for (let i = 0; i < 3; i++) { // "loop1"
   loop2: // назначение метки "loop2"
   for (let j = 0; j < 3; j++) { // "loop2"
      if (i === 1) {
         continue loop1; // продолжение "loop1"
         // break loop1; // прерывание "loop1"
      }
      console.log(`i = ${i}, j = ${j}`);
   }
}


/* 
 * # Вывод
 * i = 0, j = 0
 * i = 0, j = 1
 * i = 0, j = 2
 * i = 2, j = 0
 * i = 2, j = 1
 * i = 2, j = 2
 */

Вот пример именования блоков с помощью меток. С такими метками можно использовать лишь оператор break.

foo: {
  console.log('one');
  break foo;
  console.log('this log will not be executed');
}
console.log('two');

/*
 * # Вывод
 * one
 * two
 */

Оператор void

Я полагал, что мне знакомы все операторы JavaScript до тех пор пока не увидел оператор void, который, как оказалось, присутствует в JS с 1996-го года. Его поддерживают все браузеры, работает он довольно просто. Вот что пишут об этом на MDN:

Оператор void вычисляет переданное выражение и возвращает undefined.

Этот оператор позволяет, например, использовать альтернативную форму конструирования IIFE:

void function iife() {
	
console.log('hello');
}();

// это – то же самое, что и...

(function iife() {
    console.log('hello');
})()

По поводу void можно сделать лишь одно замечание, которое заключается в том, что вычисление выражения это… void (undefined)!

const word = void function iife() {
	
return 'hello';
}();

// word имеет значение "undefined"

const word = (function iife() {
	
return 'hello';
})();

// word имеет значение "hello"

Оператор void можно использовать с ключевым слово async, затем полученная конструкция способна сыграть роль асинхронной точки входа в код:

void async function() { 
    try {
        const response = await fetch('air.ghost.io'); 
        const text = await response.text();
        console.log(text);
    } catch(e) {
        console.error(e);
    }
}()

// или просто сделайте так :)

(async () => {
    try {
        const response = await fetch('air.ghost.io'); 
        const text = await response.text();
        console.log(text);
    } catch(e) {
        console.error(e);
    }
})();

Оператор «запятая»

После того, как я почитал про оператор «запятая», я понял, что я не в полной мере понимал то, как именно он работает. Вот цитата из MDN:

Оператор запятая выполняет каждый из его операндов (слева направо) и возвращает значение последнего операнда.

function myFunc() {
  let x = 0;
  return (x += 1, x); // то же самое, что и return ++x;
}

y = false, true; // возвращает true в консоли
console.log(y); // false (самый левый операнд)

z = (false, true); // возвращает true в консоли
console.log(z); // true (самый правый оператор)

Оператор «запятая» и условный оператор

В условном операторе последнее значение в операторе «запятая» становится возвращаемым значением. Поэтому можно поместить до этого оператора любое количество выражений. В следующем примере я разместил команду console.log перед возвращаемым логическим значением:

const type = 'man';

const isMale = type === 'man' ? (
    console.log('Hi Man!'),
    true
) : (
    console.log('Hi Lady!'),
    false
);

console.log(`isMale is "${isMale}"`);

API интернационализации

Интернационализация — это задача, которую, в большинстве случаев, решить непросто, но радует то, что в JS имеется API интернационализации, хорошо поддерживаемое большинством браузеров. Одна из моих любимых возможностей этого API — средство для форматирования дат:

const date = new Date();

const options = {
  year: 'numeric', 
  month: 'long', 
  day: 'numeric'
};

const formatter1 = new Intl.DateTimeFormat('es-es', options);
console.log(formatter1.format(date)); // 22 de diciembre de 2017

const formatter2 = new Intl.DateTimeFormat('en-us', options);
console.log(formatter2.format(date)); // December 22, 2017

Оператор конвейера

Оператор конвейера, на момент написания этого материала, поддерживается лишь в Firefox 58+, да и то, его нужно включать, используя специальный флаг. Однако, в Babel уже имеется предложение по этому поводу. Код с таким оператором выглядит как Bash-команды, и мне это нравится!

const square = (n) => n * n;
const increment = (n) => n + 1;

// без применения оператора конвейера
square(increment(square(2))); // 25

// с применением оператора конвейера
2 |> square |> increment |> square; // 25

Возможности, о которых стоит упомянуть

▍Атомарные операции

Атомарные операции дают возможность выполнения предсказуемых операций чтения и записи в ситуации, когда доступ к данным есть у нескольких потоков.

Благодаря таким операциям система ждёт завершения предыдущего действия перед выполнением следующего. Эти операции полезны в случаях, когда надо организовать надёжную работу с данными, скажем, доступными для главного потока и потока, представленного веб-воркером.

Мне очень нравятся атомарные операции в других языках вроде Java. Я полагаю, такие операции будут чаще использоваться в JS, когда всё больше и больше программистов будет использовать веб-воркеры для того, чтобы выносить в них тяжёлые вычисления из главного потока.

▍Метод Array.prototype.reduceRight

Мне никогда не доводилось видеть, чтобы на практике кто-то использовал метод Array.prototype.reduceRight(), так как он представляет собой комбинацию Array.prototype.reduce() и Array.prototype.reverse(). Дело в том, что подобное нужно очень редко. Однако, если вам это необходимо, reduceRight() отлично вам подойдёт.

const flattened = [[0, 1], [2, 3], [4, 5]].reduceRight(function(a, b) {
    return a.concat(b);
}, []);

//результирующий одномерный массив [4, 5, 2, 3, 0, 1]

▍Параметры setTimeout()

Вероятно, были в моей жизни несколько ситуаций, когда я мог бы избавиться от .bind(…), если бы знал о параметрах setTimeout(), которые, как оказалось, JS поддерживал всегда.

setTimeout(alert, 1000, 'Hello world!');

/*
 * # Вывод (alert)
 * Hello World!
 */

function log(text, textTwo) {
    console.log(text, textTwo);
}

setTimeout(log, 1000, 'Hello World!', 'And Mars!');

/*
 * # Вывод
 * Hello World! And Mars!
 */

▍Свойство HTMLElement.dataset

Я уже работал с пользовательскими атрибутами данных data-* в HTML-элементах, но я не знал о том, что имеется API, значительно упрощающее работу с ними. Помимо некоторых ограничений по именованию (подробности смотрите по вышеприведённой ссылке), такая работа, в целом, сводится к использованию имён с чёрточками для атрибутов и имён в верблюжьем стиле для обращения к ним из JS. В результате атрибут data-birth-planet виден в JS как birthPlanet.

<div id='person' data-name='john' data-birth-planet='earth'></div>

А вот как с этим работать из JS:

let personEl = document.querySelector('#person');

console.log(person.dataset) // DOMStringMap {name: "john", birthPlanet: "earth"}
console.log(personEl.dataset.name) // john
console.log(personEl.dataset.birthPlanet) // earth

// программно можно добавлять и другие атрибуты
personEl.dataset.foo = 'bar';
console.log(personEl.dataset.foo); // bar
