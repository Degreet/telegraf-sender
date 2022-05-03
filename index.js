const { Markup } = require('telegraf')

module.exports = function sender(ctx, next) {
	const layouts = {}

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
	
	ctx.msg.markup = () => {
		let data = {
			rows: [],
			unresolvedBtns: [],
			allowedBtnTypes: ['callback', 'reply', 'url', 'login'],
			extra: {},
		}

		const methods = {
			button: (type, text, action, hide) => {
				if (!data.allowedBtnTypes.includes(type) || !text || hide) return data
				let btn

				switch (type) {
					case 'callback':
						btn = Markup.callbackButton(text, action)
						break
					case 'url':
						btn = Markup.urlButton(text, action)
						break
					case 'login':
						btn = Markup.loginButton(text, action)
						break
					case 'switchToChat':
						btn = Markup.switchToChatButton(text, action)
						break
					case 'webApp':
						btn = { text, web_app: { url: action } }
						break
					default:
						btn = text
				}

				data.unresolvedBtns.push(btn)
				return data
			},
			row: (hide) => {
				if (!hide) data.rows.push(data.unresolvedBtns)
				data.unresolvedBtns = []
				return data
			},
			genRows: (btnsPerLine) => {
				const result = [[]]

				data.unresolvedBtns.map((btn) => {
					const last = result[result.length - 1]

					if (last.length >= btnsPerLine) {
						result.push([btn])
					} else {
						last.push(btn)
					}
				})

				data.rows.push(...result)
				return data
			},
			saveLayout: (name) => {
				layouts[name] = { rows: data.rows, extra: data.extra }
				return data
			},
			useLayout: (name, hide) => {
				if (hide) return data
				const layout = layouts[name]
				if (!layout) return data

				data.rows.push(...layout.rows)
				data.extra = { ...data.extra, ...layout.extra }
				return data
			},
			addExtra: (extra) => {
				if (extra.disableWebPreview) {
					extra.disable_web_page_preview = extra.disableWebPreview
				}

				if (extra.parseMode) {
					extra.parse_mode = extra.parseMode
				}

				data.extra = {
					...data.extra,
					...extra,
				}

				return data
			},
			end: (type) => {
				let markup

				switch (type) {
					case 'reply':
						markup = Markup.keyboard(data.rows).extra()
						break
					case 'inline':
						markup = Markup.inlineKeyboard(data.rows).extra()
						break
					default:
						markup = Markup.removeKeyboard().extra()
				}

				return {
					...markup,
					...data.extra,
				}
			},
		}

		data = { ...data, ...methods }
		return data
	}

	return next()
}
