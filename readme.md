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
ctx.msg.sendTo(userId, text, extra)
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

```javascript
await ctx.msg.broadcast({
  users: [1, 2, 3],
  isCopy: false,
  message: {
    text: 'Текст рассылки',
    extra: { parse_mode: 'HTML', ...markup },
  },
})
```

Если написать isCopy: true, тогда последнее отправленное пользователем сообщение будет скопировано

# Информация

Рассылка сообщений с форматом **30 сообщений в секунду**. Модуль разработан для библиотеки Telegraf версии 3.39.
