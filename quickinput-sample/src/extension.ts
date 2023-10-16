/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, commands, ExtensionContext, QuickPickItem } from 'vscode';
//import { QuickPickItem } from 'vscode';
import { showQuickPick, showInputBox } from './basicInput';
import { multiStepInput } from './multiStepInput';
import { quickOpen } from './quickOpen';

interface MenuItem extends QuickPickItem {
    func: (arg:ExtensionContext) => Promise<void>;
}

export function activate(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand('samples.quickInput', async () => {
        const options: MenuItem[] = [
            { label: "Show quick pick", func: showQuickPick },
            { label: "Show input box", func: showInputBox },
            { label: "Multi-step input", func: multiStepInput },
            { label: "Quick open", func: quickOpen },
        ];
        const quickPick = window.createQuickPick();
        //quickPick.items = options.map(opt => ({ label: opt.optName, }));
        quickPick.items = options;
        quickPick.onDidChangeSelection(selection => {
            console.log(selection);
            if (selection[0]) {
                console.log(selection[0]);
                (selection[0] as MenuItem).func(context)
                    .catch(console.error);
            }
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    }));
}
