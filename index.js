const markup = require ('./src/markup')
const sendManager = require ('./src/send-manager')
const selectModule = require('./src/select-module')

const middleware = () => (ctx, next) => {
	const userId = ctx.from && ctx.from.id
	if (!userId) return

	ctx.msg = sendManager(ctx)
	ctx.msg.markup = markup(ctx)

	ctx.msg.select = {
		getResults: (id) => selectModule.getResults(userId, id)
	}

	return next()
}

const createLayout = (layoutName, useI18n) => {
	return markup(null)(layoutName, useI18n)
}

module.exports = { middleware, createLayout, selectModule }
