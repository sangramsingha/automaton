# Automaton

>Thanks to [ctf0](https://github.com/ctf0/macros) from where i forked it.

# Features

* Run Macro when files are opened
* Run defined command in automaton with delay
* Bind key to automaton macro
* Run macro defined in automaton from quick pick list
* Pass arguments to commands
* Run command in loop.
* Executing snippets as part of a macro
  
# New

* Added `onLoad` so that the defined macro run whenever vs code open or a new file is loaded.
* If you need to run the extension only when opening certain file extension, it can be defined using `onFileExtension` .  
  >With `onLoad` defined to `true` and `onFileExtension` not defined or set to `*` will run macro on every new file that is opened in editor.

> ## Create Custom Macros

Create your own custom macros by adding them to your `settings.json` (Code|File > Preferences > User Settings)

For example:

```json
"automaton.list": {
    "commentDown": {
        "action" :[
                "editor.action.copyLinesDownAction",
                "cursorUp",
                "editor.action.addCommentLine",
                "cursorDown"
            ]
    },
    "markdownShowPreview": {
        "onLoad": true,
        "onFileExtension":".md",
        "action" :[
            {
                "command": "$delay",
                "args": {
                    "delay": 1000
                }
            },
            "markdown.showPreview"
        ]
    }
}
```

First macro creates a copy of the current line, comments out the original line, and moves the cursor down to the copy, by invoking command `automaton.commentDown` or pressing `ctrl+shift+p` and `Automaton: Execute` and select your defined macro from pick list.
Second macro is to view the markdown in preview mode everytime mardown file is open.
<br/><br/>
**Add on load macro to `automaton.qp-ignore` list so that on load macros don't bloat up pick list.**

Your macros can run any built-in VS Code action, and even actions from other extensions.
To see all the names of possible actions VS Code can run, see `Default Keyboard Shortcuts` (Code|File > Preferences > Keyboard Shortcuts)

Give your macros names that briefly describe what they do.

<hr style="background-color:black; border:none; height:5px; margin:0px;" />

# These were already there 

> ## Add Keybindings to Run your Macros

in `keybindings.json` (Code|File > Preferences > Keyboard Shortcuts) add bindings to your macros:

```json
{
  "key": "ctrl+cmd+/",
  "command": "automaton.commentDown"
}
```

Notice that `automaton.my_macro_name` has to match what you named your macro.

> ## Passing Arguments to Commands

Many commands accept arguments, like the "type" command which lets you insert text into the editor. For these cases use an object instead of a string when specifying the command to call in your `settings.json`:

```json
"automaton.list": {
  "addSemicolon": [
    "cursorEnd",
      {"command": "type", "args": {"text": ";" }}
  ]
}
```

> ## Executing Snippets As Part Of A Macro

Macros can also execute any of your snippets which is super neat. Just insert the same text that you would normally type for the snippet, followed by the `insertSnippet` command:

```json
"automaton.list": {
  "doMySnippet": [
    {"command": "type", "args": {"text": "mySnippetPrefixHere" }},
    "insertSnippet"
  ]
}
```

<br>

> ## Run macro From command pallete

simply use `Ctrl+P` or `Alt+P` depend on your os, and type `Automaton: Execute` then chose the macro you want to execute.

> ## Run Commands With A Delay

```json
"automaton.list": {
    "createNewTabAndPaste": [
        "workbench.action.files.newUntitledFile",
        {
            "command": "$delay",
            "args": {
                "delay": 50
            }
        },
        "editor.action.clipboardPasteAction"
    ]
}
```

> ## Run A Command Times Another Command [#48](https://github.com/geddski/macros/issues/48)

```json
"automaton.list": {
    "undoCommentDown": [
        {
            "command": "undo",
            "args": {
                "command": "commentDown"
            }
        }
    ]
}
```

> ## Repeat A Command [#36](https://github.com/geddski/macros/issues/36)

```json
"automaton.list": {
    "commentDown10": [
        {
            "command": "commentDown",
            "args": {
                "times": 10
            }
        }
    ]
}
```

> ## In/Ex-clude Commands From The Quick Picker "allow take precedence over ignore"

```json
"automaton.list": {
    "delay-100": [
        {
            "command": "$delay",
            "args": {
                "delay": 100
            }
        }
    ],
    "some-other-cmnd": [
        // ...
    ],
},
"automaton.qp-allow": [
    "some-other-cmnd",
],
"automaton.qp-ignore": [
    "delay-100",
],
```

> ## Known issues

* Markdown doesn't show up properly in preview with macros defined on opening markdown file. 
  >If your macro involves opening file for markdown preview then add delay

```json
"markdownShowPreview": {
    "onLoad": true,
    "onFileExtension":".md",
    "action" :[
        {
            "command": "$delay",
            "args": {
                "delay": 1000
            }
        },
        "markdown.showPreview",
    ]
}
```

> ## History

I was looking for some extension which will provides some way to open markdown file in preview mode only unless i want to view source cause I am lazy to click preview :-D