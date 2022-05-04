const { Markup } = require('telegraf')
const layouts = {}

module.exports = (ctx) => (layoutName, useI18n) => {
  let data = {
    rows: [],
    unresolvedBtns: [],
    allowedBtnTypes: ['callback', 'reply', 'url', 'login', 'cb', 'r'],
    extra: {},
  }

  const methods = {
    button: (type, text, action, hide) => {
      if (!data.allowedBtnTypes.includes(type) || !text || hide) return data
      let btn

      switch (type) {
        case 'callback':
        case 'cb':
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
    saveLayout: () => {
      layouts[layoutName] = { rows: data.rows, extra: data.extra, useI18n }
      return data
    },
    useLayout: (name, hide) => {
      if (hide) return data
      const layout = layouts[name]
      if (!layout) return data

      if (layout.useI18n) {
        data.rows.push(
          ...layout.rows.map((row) =>
            row.map((btn) => ({ ...btn, text: ctx.i18n.t(btn.text) })))
        )
      } else {
        data.rows.push(...layout.rows)
      }

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

  const shortMethods = {
    btn: methods.button,
    save: methods.saveLayout,
    use: methods.useLayout,
    extra: methods.addExtra,
  }

  data = { ...data, ...methods, ...shortMethods }
  return data
}