const { Telegraf } = require('telegraf')
const M = require('telegraf-markup4')
const sender = require('./index')
require('dotenv').config()

const token = process.env.BOT_TOKEN
const bot = new Telegraf(token)
const usersForMailing = [582824629]

// инициализация sender
bot.use(sender)

bot.command('start', async (ctx) => {
	// отправка сообщения текущему пользователю
	ctx.msg.send('Текст', M.keyboard.reply(['Рассылка']))

	// отправка сообщения пользователю с другим id
	ctx.msg.sendto(
		ctx.from.id,
		'Текст',
		M.keyboard.inline([
			M.button.callback('Редактировать', 'edit'),
			M.button.callback('Alert', 'alert'),
			M.button.callback('Тост', 'toast'),
		])
	)
})

bot.action('toast', async (ctx) => {
	// делаем всплывающее уведомление
	ctx.msg.toast('Это тост.')
})

bot.action('alert', async (ctx) => {
	// делаем модальное окно
	ctx.msg.alert('Это алёрт')
})

bot.hears('Рассылка', async (ctx) => {
	// рассылка сообщений
	ctx.msg.broadcast(
		usersForMailing,
		() => console.log('Готово!'),
		(userId) => console.log('Отправка пользователю ' + userId)
	)
})

bot.action('edit', async (ctx) => {
	// изменение сообщения
	ctx.msg.edit(
		'работает!',
		M.keyboard.inline([M.button.callback('Удалить', 'del')])
	)
})

bot.action('del', async (ctx) => {
	// удаление сообщения
	ctx.msg.del()
})

bot.launch()
