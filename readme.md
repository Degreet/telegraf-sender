# Инициализация

Чтобы начать работу с модулем, Вам необходимо импортировать и инициализировать его:

```javascript
const sender = require('telegraf-sender');
const bot = new Telegraf(token);
bot.use(sender);
```

# Отправка сообщений

### Текущему пользователю

```javascript
ctx.msg.send(text, extra);
```

### Пользователю с другим id

```javascript
ctx.msg.sendTo(userId, text, extra);
```

# Всплывающие уведомления

### Alert

```javascript
ctx.msg.alert('Пример модального окна');
```

### Toast

```javascript
ctx.msg.toast('Всплывающее уведомление');
```

# Изменение сообщений

Для этого воспользуйтесь методом edit:

```javascript
ctx.msg.edit(text, extra);
```

# Удаление сообщений

Для этого воспользуйтесь методом del:

```javascript
ctx.msg.del();
```

# Рассылка сообщений

Обычных текстовых сообщений:

```javascript
await ctx.msg.broadcast({
  users: [1, 2, 3],
  isCopy: false,
  message: {
    type: 'text',
    text: 'Текст рассылки',
    extra: { parse_mode: 'HTML', ...markup },
  },
});
```

Сообщений с фотографиями:

```javascript
await ctx.msg.broadcast({
  users: [1, 2, 3],
  isCopy: false,
  message: {
    type: 'photo',
    
    // либо file_id уже существующего фото на серверах Telegram
    file_id: file_id,
    
    // или прямую ссылку на фото
    source: path,
    
    extra: { parse_mode: 'HTML', ...markup, caption: 'Текст рассылки' },
  },
});
```

Сообщений с видео:

```javascript
await ctx.msg.broadcast({
  users: [1, 2, 3],
  isCopy: false,
  message: {
    type: 'video',
    
    // либо file_id уже существующего видео на серверах Telegram
    file_id: file_id,
    
    // или прямую ссылку на видео
    source: path,
    
    extra: { parse_mode: 'HTML', ...markup, caption: 'Текст рассылки' },
  },
});
```


Сообщений с документом (Например, гифка):

```javascript
await ctx.msg.broadcast({
  users: [1, 2, 3],
  isCopy: false,
  message: {
    type: 'document',
    
    // либо file_id уже существующего документа на серверах Telegram
    file_id: file_id,
    
    // или прямую ссылку на документ (Например, гифка)
    source: path,
    
    extra: { parse_mode: 'HTML', ...markup, caption: 'Текст рассылки' },
  },
});
```

Если написать isCopy: true, тогда последнее отправленное пользователем сообщение будет скопировано

# Информация

Рассылка сообщений с форматом **30 сообщений в секунду**. Модуль разработан для библиотеки Telegraf версии 3.39.
