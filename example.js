const { Telegraf } = require('telegraf')
const sender = require('./index')
require('dotenv').config()

const token = process.env.BOT_TOKEN
const bot = new Telegraf(token)
bot.use(sender.middleware())

sender.createLayout('menuBtn', false)
	.button('cb', 'Go to menu', 'menu').row()
	.saveLayout()

bot.command('start', async (ctx) => {
	try {
		await ctx.msg.send(
			'Hello, <b>world</b>!',
			ctx.msg.markup()
				.btn('cb', 'See alert', 'alert').btn('cb', 'See toast', 'toast').row()
				.btn('cb', 'hidden', 'hidden', true).row()
				.btn('cb', 'More buttons', 'more_buttons').row()
				.end('inline')
		)
	} catch (e) {
		console.error(e)
	}
})

bot.action('more_buttons', async (ctx) => {
	try {
		await ctx.msg.editMarkup(ctx.msg.markup().use('menuBtn').end('inline'))
	} catch (e) {
		console.error(e)
	}
})

bot.action('menu', async (ctx) => {
	try {
		await ctx.msg.editMarkup(
			ctx.msg.markup()
				.btn('cb', 'See alert', 'alert').btn('cb', 'See toast', 'toast').row()
				.btn('cb', 'hidden', 'hidden', true).row()
				.btn('cb', 'More buttons', 'more_buttons').row()
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
