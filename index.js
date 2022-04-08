module.exports = function sender(ctx, next) {
	ctx.msg = {
		send(text, extra) {
			return ctx.replyWithHTML(text, extra)
		},

		sendTo(userId, text, extra) {
			return ctx.telegram.sendMessage(userId, text, { parse_mode: 'html', ...extra })
		},

		edit(text, extra) {
			return ctx.editMessageText(text, { parse_mode: 'html', ...extra })
		},

		del() {
			return ctx.deleteMessage()
		},

		async broadcast(params) {
			try {
				let { users, callback, action, extra, message, isCopy = true } = params

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
							let isSuccess = true

							if (isCopy) {
								try {
									await ctx.telegram.sendCopy(userId, message || ctx.message, extra)
								} catch (e) {}
							} else {
								try {
									await ctx.telegram.sendMessage(userId, message.text, { parse_mode: 'HTML', ...message.extra })
								} catch (e) {}
							}

							if (action) {
								try {
									await action(userId, isSuccess)
								} catch {
									action(userId, isSuccess)
								}
							}
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
			return ctx.answerCbQuery(text)
		},

		alert(text) {
			return ctx.answerCbQuery(text, true)
		},
	}

	return next()
}
