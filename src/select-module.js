const { Composer } = require('telegraf')
const randomstring = require('randomstring')

const composer = new Composer()
const data = {}

const buildSelect = (userId, row, { id: selectId, selectFlag, multiple }) => {
  try {
    let userData = data[userId]
    if (!userData) userData = data[userId] = {}

    userData[selectId] = {
      selectFlag,
      multiple,
      btns: row.map((btn) => (
        {
          id: randomstring.generate(10),
          selectionId: btn.id,
          selected: false,
          text: btn.text,
        }
      )),
    }

    return { btns: userData[selectId].btns, selectId }
  } catch (e) {
    console.error(e)
  }
}

const getResults = (userId, id) => {
  try {
    const dataInfo = data[userId][id]
    if (!dataInfo) return
    let result

    if (dataInfo.multiple) {
      result = dataInfo.btns.filter((btn) => btn.selected).map((btn) => btn.selectionId)
    } else {
      result = dataInfo.btns.find((btn) => btn.selected).selectionId
    }

    data[userId][id] = null
    return result
  } catch (e) {
    console.error(e)
  }
}

composer.action(/select_(.*?)_(.*)/, async (ctx) => {
  try {
    const userId = ctx.from && ctx.from.id
    const selectId = ctx.match[1]
    const btnId = ctx.match[2]
    if (!userId || !selectId || !btnId) return

    const selectInfo = data[userId.toString()] && data[userId.toString()][selectId]
    if (!selectInfo) return

    const btn = selectInfo.btns.find((btn) => btn.id === btnId)
    if (!btn) return

    const keyboard = ctx.update.callback_query.message.reply_markup.inline_keyboard
    if (!keyboard) return

    if (!selectInfo.multiple) {
      selectInfo.btns.forEach((b) => {
        if (b.id !== btn.id) b.selected = false
      })
    }

    const btnActions = selectInfo.btns.map((b) => `select_${selectId}_${b.id}`)
    btn.selected = !btn.selected

    keyboard.forEach((row) => {
      const rowBtns = row.filter((b) => btnActions.includes(b.callback_data))

      rowBtns.forEach((rowBtn) => {
        const btnInfo = selectInfo.btns.find((b) => `select_${selectId}_${b.id}` === rowBtn.callback_data)
        rowBtn.text = `${btnInfo.selected ? selectInfo.selectFlag : ''} ${btnInfo.text}`
      })
    })

    await ctx.msg.editMarkup(ctx.update.callback_query.message)
  } catch (e) {
    console.error(e)
  }
})

module.exports = {
  middleware: () => composer,
  buildSelect,
  getResults,
}