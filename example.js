const { Telegraf } = require('telegraf')
const sender = require('./index')
require('dotenv').config()

const token = process.env.BOT_TOKEN
const bot = new Telegraf(token)

// инициализация sender
bot.use(sender)

bot.command('start', async (ctx) => {
	try {
		await ctx.msg.send(
			'Hello, <b>world</b>!',
			ctx.msg.markup()
				.button('callback', 'See alert', 'alert').button('callback', 'See toast', 'toast').row()
				.button('callback', 'hidden', 'hidden', true).row()
				.end('inline')
		)
	} catch (e) {
		console.error(e)
	}
})

bot.action('alert', async (ctx) => {
	try {
		await ctx.msg.alert('Alert')
	} catch (e) {
		console.error(e)
	}
})

bot.action('toast', async (ctx) => {
	try {
		await ctx.msg.toast('Toast')
	} catch (e) {
		console.error(e)
	}
})

bot.launch().then(() => console.log('started'))
