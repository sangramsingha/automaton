const vscode = require('vscode')
const path = require('path')

let disposables = []
let macroEvent = []
let macrosObj = {}

function activate(context) {

    loadMacros(context);

    let statusDisposable = vscode.window.setStatusBarMessage("Automaton loading is inprogress");
    let editor = vscode.window.activeTextEditor;
    macrosObj = getSettings().get('list')

    if(editor){

        macroEvent.push(editor.document.fileName);
        runOnFileLoad(editor.document.fileName)

    }

    context.subscriptions.push(
        vscode.commands.registerCommand('automaton.execute', async () => {
            vscode.window.showQuickPick(getQPList()).then((selection) => {
                if (selection) {
                    vscode.commands.executeCommand(`automaton.${selection.label}`)
                }
            })
        })
    )

    vscode.workspace.onDidCloseTextDocument((e) => {
        
        let filePath = e.fileName

        if(isNotGitFile(filePath)){
            removeFromEventArray(filePath)
        }

    });

    vscode.workspace.onDidOpenTextDocument((e) => {
        if (e) {

            let filePath = e.fileName;       
            
            if(!containsObj(filePath) && isNotGitFile(filePath)){
                
                macroEvent.push(filePath);
                runOnFileLoad(filePath)

            }
            
        }
    });

    vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('automaton.list')) {            
            disposeMacros()
            loadMacros(context)
            macrosObj = getSettings().get('list')
        }
    })
    
    setTimeout(() => {
        statusDisposable.dispose()
    }, 1000);
}

/**
 * [isNotGitFile description]
 *
 * @return  Boolean  [return description]
 */
function isNotGitFile(filePath){

    let match = true;
    let regex = new RegExp(".git", "i");

    if(filePath.match(regex)){
        match = false
    }

    return match;
}

/**
 * [isFileExtensionSame description]
 *
 * @return  Boolean [return description]
 */

function isFileExtensionSame(fileExtension, filePath){

    let match = false;
    let regex = new RegExp(fileExtension, "i");

    if(filePath.match(regex)){
        match = true
    }

    return match;
}

/**
 * [removeFromEventArray description]
 *
 * @return  void  [return description]
 */
function removeFromEventArray(filePath){
    
    let index = macroEvent.indexOf(filePath)
    macroEvent = macroEvent.splice(index+1)

}

/**
 * [containsObj description]
 *
 * @return  Boolean  [return description]
 */
function containsObj(obj) {

    return macroEvent.some(elem => elem === obj)
}

/**
 * [runOnFileLoad description]
 *
 * @return  void  [return description]
 */
function runOnFileLoad(filePath){

    getMacrosList().forEach((m)=>{
        
        let macro = macrosObj[m]
        
        if(typeof macro.onLoad != "undefined"){

            if(typeof macro.onFileExtension != "undefined"){

                if(macro.onLoad && isFileExtensionSame(macro.onFileExtension, filePath)){

                    vscode.commands.executeCommand(`automaton.${m}`)

                }else if(macro.onLoad && macro.onFileExtension === "*"){
                    
                    vscode.commands.executeCommand(`automaton.${m}`)

                }

            }else{

                if(macro.onLoad){

                    vscode.commands.executeCommand(`automaton.${m}`)

                }

            }

        }
    });

}

/**
 * [getSettings description]
 *
 * @return  {[type]}  [return description]
 */
function getSettings() {
    return vscode.workspace.getConfiguration('automaton')
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

function getMacroListDescription(){

    let ignore = ['has', 'get', 'update', 'inspect']

    let editor = vscode.window.activeTextEditor;
    let currentActiveFile = null;
    if(editor){
        currentActiveFile = editor.document.fileName
    }

    let list = Object
        .keys(getSettings().get('list'))
        .filter((prop) => ignore.indexOf(prop) < 0)
        .filter((prop) => {

            let obj = macrosObj[prop];
            if(obj.hasOwnProperty("onFileExtension")){
                if(currentActiveFile){

                    if(isFileExtensionSame(obj.onFileExtension, currentActiveFile)){
                        return true;
                    }else if(obj.onFileExtension+"" == "*"){
                        return true;
                    }else{
                        return false;
                    }

                }else{
                    return false;
                }

            }else{
                return true;
            }
        })
        .map((prop) => {

            return {
                        'detail': ((macrosObj[prop].description)? macrosObj[prop].description : "No description"),
                        'label': prop
                    };
        })

    return list;

}

/**
 * [getQPList description]
 *
 * @return  {[type]}  [return description]
 */
function getQPList() {
    let list = getMacroListDescription()
    let allow = getSettings().get('qp-allow')
    let ignore = getSettings().get('qp-ignore')

    if (allow.length) {
        list = list
                .filter((item) => allow.indexOf(item.label) > 0)
                
    }

    if (ignore.length) {
        list = list
                .filter((item) => ignore.indexOf(item.label) < 0)
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
        await vscode.commands.executeCommand(`automaton.${command}`)
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
        const disposable = vscode.commands.registerCommand(`automaton.${name}`, () => {
            return (settings[name].action)
                        .reduce((promise, action) => promise.then(
                            () => executeCommand(action)), Promise.resolve()
                        )
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
