module.exports = function sender(ctx, next) {
	ctx.msg = {
		send(text, extra) {
			try {
				return ctx.replyWithHTML(text, extra)
			} catch (e) {
				console.error(e)
			}
		},

		sendTo(userId, text, extra) {
			try {
				return ctx.telegram.sendMessage(userId, text, { parse_mode: 'html', ...extra })
			} catch (e) {
				console.error(e)
			}
		},

		edit(text, extra) {
			try {
				return ctx.editMessageText(text, { parse_mode: 'html', ...extra })
			} catch (e) {
				console.error(e)
			}
		},

		del() {
			try {
				return ctx.deleteMessage()
			} catch (e) {
				console.error(e)
			}
		},

		broadcast(params) {
			try {
				let { users, callback, action, extra, message } = params

				if (!callback || typeof callback !== 'function') callback = null
				if (!action || typeof action !== 'function') action = null
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
							await ctx.telegram
								.sendCopy(userId, message || ctx.message, extra)
								.catch(console.error)
							if (action) action(userId)
						})
					)

					return setTimeout(step, Math.max(0, startedAt + 1000 - Date.now()))
				}

				step()
				return true
			} catch (e) {
				console.error(e)
			}
		},

		toast(text) {
			try {
				return ctx.answerCbQuery(text)
			} catch (e) {
				console.error(e)
			}
		},

		alert(text) {
			try {
				return ctx.answerCbQuery(text, { alert: true })
			} catch (e) {
				console.error(e)
			}
		},
	}

	return next()
}
