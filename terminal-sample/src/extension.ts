'use strict';

import * as vscode from 'vscode';

function getChildWorkspaceFolder() : string|undefined {
	const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : null;
	console.log(`workspaceFolder=${workspaceFolder}`);
	return workspaceFolder ? `${workspaceFolder}` : undefined;
}

export function activate(context: vscode.ExtensionContext) {
	let NEXT_TERM_ID = 1;

	console.log("Terminals: " + (<any>vscode.window).terminals.length);

	// vscode.window.onDidOpenTerminal
	vscode.window.onDidOpenTerminal(terminal => {
		console.log("Terminal opened. Total count: " + (<any>vscode.window).terminals.length);
	});
	vscode.window.onDidOpenTerminal((terminal: vscode.Terminal) => {
		vscode.window.showInformationMessage(`onDidOpenTerminal, name: ${terminal.name}`);
	});

	// vscode.window.onDidChangeActiveTerminal
	vscode.window.onDidChangeActiveTerminal(e => {
		console.log(`Active terminal changed, name=${e ? e.name : 'undefined'}`);
	});

	/// --------------------- MY STUFF
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createZoo', () => {
		/* Creating a terminal with custom environment */
		const options:vscode.TerminalOptions = {
			name:`Zoobar #${NEXT_TERM_ID++}`,
			cwd: getChildWorkspaceFolder(),
			shellPath: '/bin/bash',
			shellArgs: [
				'--init-file',
				`${getChildWorkspaceFolder()}/zoobar.bashrc`
			]
		};
		console.log("Pre-createTerminal");
		const terminal = vscode.window.createTerminal(options);
		terminal.show();
	}));
	// vscode.window.createTerminal
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createTerminal', () => {
		const msg=`Ext Terminal #${NEXT_TERM_ID++}`;
		const term:vscode.Terminal = vscode.window.createTerminal(msg);
		vscode.window.showInformationMessage(`Created ${msg}`);
		//term.show(false);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createTerminalHideFromUser', () => {
		vscode.window.createTerminal({
			name: `Ext Terminal #${NEXT_TERM_ID++}`,
			hideFromUser: true
		} as any);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createAndSend', () => {
		const terminal = vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`);
		terminal.sendText("echo 'Sent text immediately after creating'");
		terminal.show();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createZshLoginShell', () => {
		vscode.window.createTerminal(`Ext Terminal #${NEXT_TERM_ID++}`, '/bin/zsh', ['-l']);
	}));

	// Terminal.hide
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.hide', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.hide();
				}
			});
		}
	}));

	// Terminal.show
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.show', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.show();
				}
			});
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.showPreserveFocus', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.show(true);
				}
			});
		}
	}));

	// Terminal.sendText
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.sendText', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.sendText("echo 'Hello world!'");
				}
			});
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.sendTextNoNewLine', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.sendText("history", false);
				}
			});
		}
	}));

	// Terminal.dispose
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.dispose', () => {
		if (ensureTerminalExists()) {
			selectTerminal().then(terminal => {
				if (terminal) {
					terminal.dispose();
				}
			});
		}
	}));

	// Terminal.processId
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.processId', () => {
		selectTerminal().then(terminal => {
			if (!terminal) {
				return;
			}
			terminal.processId.then((processId) => {
				if (processId) {
					vscode.window.showInformationMessage(`Terminal.processId: ${processId}`);
				} else {
					vscode.window.showInformationMessage('Terminal does not have a process ID');
				}
			});
		});
	}));

	// vscode.window.onDidCloseTerminal
	vscode.window.onDidCloseTerminal((terminal) => {
		vscode.window.showInformationMessage(`onDidCloseTerminal, name: ${terminal.name}`);
	});

	// vscode.window.terminals
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.terminals', () => {
		selectTerminal();
	}));

	// ExtensionContext.environmentVariableCollection
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.updateEnvironment', () => {
		const collection = context.environmentVariableCollection;
		collection.replace('FOO', 'BAR');
		collection.append('PATH', '/test/path');
	}));

	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.clearEnvironment', () => {
		context.environmentVariableCollection.clear();
	}));

	// vvv Proposed APIs below vvv

	// vscode.window.onDidWriteTerminalData
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.onDidWriteTerminalData', () => {
		(<any>vscode.window).onDidWriteTerminalData((e: any) => {
			vscode.window.showInformationMessage(`onDidWriteTerminalData listener attached, check the devtools console to see events`);
			console.log('onDidWriteData', e);
		});
	}));

	// vscode.window.onDidChangeTerminalDimensions
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.onDidChangeTerminalDimensions', () => {
		vscode.window.showInformationMessage(`Listening to onDidChangeTerminalDimensions, check the devtools console to see events`);
		(<any>vscode.window).onDidChangeTerminalDimensions((event: any) => {
			console.log(`onDidChangeTerminalDimensions: terminal:${event.terminal.name}, columns=${event.dimensions.columns}, rows=${event.dimensions.rows}`);
		});
	}));

	// vscode.window.registerTerminalLinkProvider
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.registerTerminalLinkProvider', () => {
		(<any>vscode.window).registerTerminalLinkProvider({
			provideTerminalLinks: (context: any, token: vscode.CancellationToken) => {
				// Detect the first instance of the word "link" if it exists and linkify it
				const startIndex = (context.line as string).indexOf('link');
				if (startIndex === -1) {
					return [];
				}
				return [
					{
						startIndex,
						length: 'link'.length,
						tooltip: 'Show a notification',
						// You can return data in this object to access inside handleTerminalLink
						data: 'Example data'
					}
				];
			},
			handleTerminalLink: (link: any) => {
				vscode.window.showInformationMessage(`Link activated (data = ${link.data})`);
			}
		});
	}));

	context.subscriptions.push(vscode.window.registerTerminalProfileProvider('terminalTest.terminal-profile', {
		provideTerminalProfile(token: vscode.CancellationToken): vscode.ProviderResult<vscode.TerminalProfile> {
			return {
				options: {
					name: 'Terminal API',
					shellPath: process.title || 'C:/Windows/System32/cmd.exe'
				}
			};
		}
	}));
}

function colorText(text: string): string {
	let output = '';
	let colorIndex = 1;
	for (let i = 0; i < text.length; i++) {
		const char = text.charAt(i);
		if (char === ' ' || char === '\r' || char === '\n') {
			output += char;
		} else {
			output += `\x1b[3${colorIndex++}m${text.charAt(i)}\x1b[0m`;
			if (colorIndex > 6) {
				colorIndex = 1;
			}
		}
	}
	return output;
}

function selectTerminal(): Thenable<vscode.Terminal | undefined> {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: `name: ${t.name}`,
			terminal: t
		};
	});
	return vscode.window.showQuickPick(items).then(item => {
		return item ? item.terminal : undefined;
	});
}

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}
