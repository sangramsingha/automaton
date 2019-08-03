const vscode = require('vscode')
let disposables = []

function activate(context) {
    loadMacros(context)

    context.subscriptions.push(
        vscode.commands.registerCommand('macros.execute', async () => {
            vscode.window.showQuickPick(getQPList()).then((selection) => {
                if (selection) {
                    vscode.commands.executeCommand(`macros.${selection}`)
                }
            })
        })
    )

    vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('macros.list')) {
            disposeMacros()
            loadMacros(context)
        }
    })
}

/**
 * [getSettings description]
 *
 * @return  {[type]}  [return description]
 */
function getSettings() {
    return vscode.workspace.getConfiguration('macros')
}

/**
 * [getMacrosList description]
 *
 * @return  array  macro names list
 */
function getMacrosList() {
    let ignore = ['has', 'get', 'update', 'inspect']

    return Object
        .keys(getSettings().get('list'))
        .filter((prop) => ignore.indexOf(prop) < 0)
}

/**
 * [getQPList description]
 *
 * @return  {[type]}  [return description]
 */
function getQPList() {
    let list = getMacrosList()
    let allow = getSettings().get('qp-allow')
    let ignore = getSettings().get('qp-ignore')

    if (allow.length) {
        list = list.filter((item) => allow.indexOf(item) > 0)
    }

    if (ignore.length) {
        list = list.filter((item) => ignore.indexOf(item) < 0)
    }

    return list
}

/**
 * [executeDelayCommand description]
 *
 * @param   {[type]}  action  [action description]
 *
 * @return  {[type]}          [return description]
 */
function executeDelayCommand(time) {
    return new Promise((resolve) => setTimeout(() => resolve(), time))
}

/**
 * [executeCommandTimesOther description]
 *
 * @param   {[type]}  command  [command description]
 * @param   {[type]}  args     [args description]
 *
 * @return  {[type]}           [return description]
 */
async function executeCommandTimesOther(command, otherCmnd) {
    const settings = getSettings().get('list')
    let range = settings[otherCmnd].length

    for (const index of Array(range)) {
        await vscode.commands.executeCommand(command)
    }
}

/**
 * [executeCommandRepeat description]
 *
 * @param   {[type]}  command  [command description]
 * @param   {[type]}  repeat   [repeat description]
 *
 * @return  {[type]}           [return description]
 */
async function executeCommandRepeat(command, times) {
    for (const index of Array(times)) {
        await vscode.commands.executeCommand(`macros.${command}`)
    }
}

/**
 * [executeCommand description]
 *
 * @param   {[type]}  action  [action description]
 *
 * @return  {[type]}          [return description]
 */
function executeCommand(action) {
    if (typeof action === 'object') {
        let command = action.command
        let args = action.args

        if (command === '$delay') {
            return executeDelayCommand(args.delay)
        }

        if (args.hasOwnProperty('command')) {
            return executeCommandTimesOther(command, args.command)
        } else if (args.hasOwnProperty('times')) {
            return executeCommandRepeat(command, args.times)
        }

        return vscode.commands.executeCommand(command, args)
    }

    return vscode.commands.executeCommand(action)
}

/**
 * [loadMacros description]
 *
 * @param   {[type]}  context  [context description]
 *
 * @return  {[type]}           [return description]
 */
function loadMacros(context) {
    const settings = getSettings().get('list')

    getMacrosList().forEach((name) => {
        const disposable = vscode.commands.registerCommand(`macros.${name}`, () => {
            return settings[name].reduce((promise, action) => promise.then(() => executeCommand(action)), Promise.resolve())
        })

        context.subscriptions.push(disposable)
        disposables.push(disposable)
    })
}

/**
 * [disposeMacros description]
 *
 * @return  {[type]}  [return description]
 */
function disposeMacros() {
    for (let disposable of disposables) {
        disposable.dispose()
    }
}

function deactivate() { }

exports.deactivate = deactivate
exports.activate = activate
