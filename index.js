const markup = require ('./src/markup')
const sendManager = require ('./src/send-manager')

const middleware = () => (ctx, next) => {
	ctx.msg = sendManager(ctx)
	ctx.msg.markup = markup(ctx)
	return next()
}

const createLayout = (layoutName, useI18n) => {
	return markup(null)(layoutName, useI18n)
}

module.exports = { middleware, createLayout }
