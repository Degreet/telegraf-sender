module.exports = function sender(ctx, next) {
	ctx.msg = {
		async send(text, extra) {
			try {
				return await ctx.replyWithHTML(text, extra)
			} catch (e) {
				console.error(e)
			}
		},

		async sendTo(userId, text, extra) {
			try {
				return await ctx.telegram.sendMessage(userId, text, { parse_mode: 'html', ...extra })
			} catch (e) {
				console.error(e)
			}
		},

		async edit(text, extra) {
			try {
				return await ctx.editMessageText(text, { parse_mode: 'html', ...extra })
			} catch (e) {
				console.error(e)
			}
		},

		async del() {
			try {
				return await ctx.deleteMessage()
			} catch (e) {
				console.error(e)
			}
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
								} catch (e) {
									isSuccess = false
									console.error('TELEGRAF_SENDER failed send mail', e)
								}
							} else {
								try {
									await ctx.telegram.sendMessage(userId, message.text, { parse_mode: 'HTML', ...message.extra })
								} catch (e) {
									isSuccess = false
									console.error('TELEGRAF_SENDER failed send mail', e)
								}
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

		async toast(text) {
			try {
				return await ctx.answerCbQuery(text)
			} catch (e) {
				console.error(e)
			}
		},

		async alert(text) {
			try {
				return await ctx.answerCbQuery(text, true)
			} catch (e) {
				console.error(e)
			}
		},
	}

	return next()
}
