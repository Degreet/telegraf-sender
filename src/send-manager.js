module.exports = (ctx) => ({
  send(text, extra) {
    return ctx.replyWithHTML(text, extra)
  },

  sendTo(userId, text, extra) {
    return ctx.telegram.sendMessage(userId, text, { parse_mode: 'html', ...extra })
  },

  edit(text, extra) {
    return ctx.editMessageText(text, { parse_mode: 'html', ...extra })
  },

  editMarkup(markup) {
    return ctx.editMessageReplyMarkup(markup.reply_markup)
  },

  del() {
    return ctx.deleteMessage()
  },

  async broadcast(params) {
    try {
      let { users, callback, action, extra, message, isCopy = true, handler } = params

      if (!callback || typeof callback !== 'function') callback = null
      if (!action || typeof action !== 'function') action = null
      const resultUsers = [[]]
      let activeUsersIndex = 0

      users.forEach((userId) => {
        const last = resultUsers[resultUsers.length - 1]
        if (last.length < 30) last.push(userId)
        else resultUsers.push([userId])
      })

      async function end() {
        if (callback) {
          try {
            await callback()
          } catch (e) {
            callback()
          }
        }

        return true
      }

      async function step() {
        const startedAt = Date.now()
        const usrs = resultUsers[activeUsersIndex++]
        let arg

        if (!usrs || usrs.length <= 0) {
          await end()
          return true
        }

        await Promise.all(
          usrs.map(async (userId) => {
            let isSuccess = true
            const { type } = message

            if (isCopy) {
              try {
                await ctx.telegram.sendCopy(userId, message || ctx.message, extra)
              } catch (e) {
                isSuccess = false
              }
            } else {
              try {
                if (!handler) {
                  switch (type) {
                    case 'photo':
                      arg = await ctx.telegram.sendPhoto(userId, message.file_id || message.source, message.extra)
                      break
                    case 'video':
                      arg = await ctx.telegram.sendVideo(userId, message.file_id || message.source, message.extra)
                      break
                    case 'document':
                      arg = await ctx.telegram.sendDocument(userId, message.file_id || message.source, message.extra)
                      break
                    default:
                      arg = await ctx.telegram.sendMessage(userId, message.text, { parse_mode: 'HTML', ...(message.extra || {}) })
                  }
                } else {
                  arg = await handler(userId)
                }
              } catch (e) {
                isSuccess = false
              }
            }

            if (action) {
              try {
                await action(userId, isSuccess, arg)
              } catch {
                action(userId, isSuccess, arg)
              }
            }
          }),
        )

        return new Promise((resolve) => {
          setTimeout(async () => {
            resolve(await step())
          }, Math.max(0, startedAt + 1000 - Date.now()))
        })
      }

      await step()
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
})
