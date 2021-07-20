# Инициализация

Чтобы начать работу с модулем, Вам необходимо импортировать и инициализировать его:

```javascript
const sender = require('telegraf-sender')
const bot = new Telegraf(token)
bot.use(sender)
```

# Отправка сообщений

### Текущему пользователю

```javascript
ctx.msg.send(text, extra)
```

### Пользователю с другим id

```javascript
ctx.msg.sendto(userId, text, extra)
```

# Всплывающие уведомления

### Alert

```javascript
ctx.msg.alert('Пример модального окна')
```

### Toast

```javascript
ctx.msg.toast('Всплывающее уведомление')
```

# Изменение сообщений

Для этого воспользуйтесь методом edit:

```javascript
ctx.msg.edit(text, extra)
```

# Удаление сообщений

Для этого воспользуйтесь методом del:

```javascript
ctx.msg.del()
```

# Рассылка сообщений

Для рассылки сообщений Вам нужно подготовить массив с айди пользователей, которым нужно сделать рассылку:

```javascript
const users = [id1, id2, id3]
```

Далее сделать саму рассылку:

```javascript
ctx.msg.broadcast(users)
```

Вам не нужно передавать текст или extra в метод, т.к. эти данные соберёт сам метод из **ctx.message**. Также Вы можете передать в этот метод callback и узнать когда рассылка будет завершена:

```javascript
const callback = () => console.log('Рассылка завершена!')
ctx.msg.broadcast(users, callback)
```

И ещё Вы можете выполнять какие-то действия для каждого пользователя, которому будет отправлена рассылка:

```javascript
const callback = () => console.log('Рассылка завершена!')
const action = (userId) => console.log(`Отправка пользователю ${userId}`)
ctx.msg.broadcast(users, callback, action)
```

# Информация

Рассылка сообщений с форматом **30 сообщений в секунду**. Модуль разработан для библиотеки Telegraf версии 3.38. Больше примеров Вы можете найти в файле **example.js**
