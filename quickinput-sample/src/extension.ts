/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, commands, ExtensionContext, QuickPickItem } from 'vscode';
//import { QuickPickItem } from 'vscode';
import { showQuickPick, showInputBox } from './basicInput';
import { multiStepInput } from './multiStepInput';
import { quickOpen } from './quickOpen';



export function activate(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('samples.quickInput', async () => {
        interface MenuItem extends QuickPickItem {
            f: (arg:ExtensionContext) => Promise<void>;
        }
        const quickPick = window.createQuickPick<MenuItem>();
        quickPick.items= [
            { label: "Show quick pick", f: showQuickPick },
            { label: "Show input box", f: showInputBox },
            { label: "Multi-step input", f: multiStepInput },
            { label: "Quick open", f: quickOpen },
        ];
        quickPick.onDidChangeSelection(selection => {
            if (selection[0]) {
                (selection[0] as MenuItem).f(context)
                    .catch(console.error);
            }
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    }));
}
