module.exports = function sender(ctx, next) {
	ctx.msg = {
		send(text, extra) {
			return ctx
				.replyWithHTML(text, extra)
				.catch(() => console.warn('msg.send error'))
		},

		sendto(userId, text, extra) {
			return ctx.telegram
				.sendMessage(userId, text, { parse_mode: 'html', ...extra })
				.catch(() => console.warn('msg.sendto error'))
		},

		edit(text, extra) {
			return ctx
				.editMessageText(text, { parse_mode: 'html', ...extra })
				.catch(() => console.warn('msg.edit error'))
		},

		del() {
			return ctx.deleteMessage().catch(() => console.warn('msg.del error'))
		},

		broadcast(users, callback, action) {
			if (!callback || typeof callback !== 'function') callback = null
			if (!action || typeof action !== 'function') callback = null
			const resultUsers = [[]]
			let activeUsersIndex = 0

			users.forEach((userId) => {
				const last = resultUsers[resultUsers.length - 1]
				if (last.length < 30) last.push(userId)
				else resultUsers.push([userId])
			})

			function end() {
				if (callback) callback()
				return true
			}

			async function step() {
				const startedAt = Date.now()
				const usrs = resultUsers[activeUsersIndex++]
				if (!usrs || usrs.length <= 0) return end()

				await Promise.all(
					usrs.map(async (userId) => {
						await ctx.telegram.sendCopy(userId, ctx.message).catch(() => {})
						if (action) action(userId)
					})
				)

				return setTimeout(step, Math.max(0, startedAt + 1000 - Date.now()))
			}

			step()
			return true
		},

		toast(text) {
			return ctx.answerCbQuery(text)
		},

		alert(text) {
			return ctx.answerCbQuery(text, { alert: true })
		},
	}

	return next()
}
