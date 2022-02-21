import { App, Editor, EditorPosition, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, Vault, Workspace } from 'obsidian';
import { encode } from 'punycode';

function getObsidianDeepLink(vault: Vault, workspace: Workspace) {
	const fileTitle = workspace.getActiveFile().name.split('.')[0].split(/\s/).join('%2520');
	const vaultName = vault.getName();
	const link = `obsidian://open?vault=${vaultName}%26file=${fileTitle}`;
	return link;
}

function getCurrentLine() {
	const view = this.app.workspace.getActiveViewOfType(MarkdownView);
	const lineNumber = view.editor.getCursor().line
	const lineText = view.editor.getLine(lineNumber)
	return lineText
}

function prepareTask(line: string) {
	line = line.trim()
	//remove all leading non-alphanumeric characters
	line = line.replace(/^\W+|\W+$/, '')
	line = encodeLine(line)
	return line
}

function encodeLine(line: string) {
	line = line.replace(/\s/g, '%20')
	line = line.replace(/\:/g, '%3A')
	line = line.replace(/\//g, '%2F')
	line = line.replace(/\?/g, '%3F')
	line = line.replace(/\=/g, '%3D')
	line = line.replace(/\#/g, '%23')
	line = line.replace(/\@/g, '%40')
	line = line.replace(/\$/g, '%24')
	line = line.replace(/\^/g, '%5E')
	line = line.replace(/\&/g, '%26')
	line = line.replace(/\+/g, '%2B')
	line = line.replace(/\:/g, '%3A')
	line = line.replace(/\;/g, '%3B')
	line = line.replace(/\</g, '%3C')
	line = line.replace(/\>/g, '%3E')
	return line
}

function createTask(line: string, deepLink: string) {
	const task = `things:///add?title=${line}&notes=${deepLink}&x-success=obsidian://things-id`
	window.open(task);
}


export default class MyPlugin extends Plugin {

	async onload() {

		this.addCommand({
			id: 'create-things-project',
			name: 'Create Things Project',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					if (!checking) {

						const vault = this.app.vault;
						const vaultName = vault.getName();
						const workspace = this.app.workspace;

						const projectTitle = workspace.getActiveFile().basename.split('.')[0].split(/\s/).join('%20');

						const noteForDeepLink = workspace.getActiveFile().basename.split('.')[0].split(/\s/).join('%2520');

						const obsidianDeepLink = `obsidian://open?vault=${vaultName}%26file=${noteForDeepLink}`;

						const thingsURL = `things:///add-project?title=${projectTitle}&notes=${obsidianDeepLink}`;

						const thingsDeepLink = `things:///show?query=${projectTitle}`;

						window.open(thingsURL);
						setTimeout(() => {
							window.open(thingsDeepLink);
						}, 500);
						
						let fileText = view.editor.getValue()
						const lines = fileText.split('\n');
						const h1Index = lines.findIndex(line => line.startsWith('#'));
						if (h1Index !== -1) {

							let startRange: EditorPosition = {
								line: h1Index,
								ch:lines[h1Index].length
							}

							let endRange: EditorPosition = {
								line: h1Index,
								ch:lines[h1Index].length
							}

							view.editor.replaceRange(`\n\n[Things](${thingsDeepLink})`, startRange, endRange);

						} else {
								let startRange: EditorPosition = {
								line: 0,
								ch:0
							}

							let endRange: EditorPosition = {
								line: 0,
								ch:0
							}

							view.editor.replaceRange(`[Things](${thingsDeepLink})\n\n`, startRange, endRange);
						}
					}
					return true;
				}
				return false;
			}
		});

		this.registerObsidianProtocolHandler("things-id", async (id) => {
			const thingsID = id['x-things-id'];

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			
			const currentLine = getCurrentLine()

			const firstLetterIndex = currentLine.search(/[a-zA-Z]|[0-9]/);

			const line = currentLine.substring(firstLetterIndex, currentLine.length)
			
			let editorPosition = view.editor.getCursor()
			const lineLength = view.editor.getLine(editorPosition.line).length
			
			let startRange: EditorPosition = {
				line: editorPosition.line,
				ch: firstLetterIndex
			}
			
			let endRange: EditorPosition = {
				line: editorPosition.line,
				ch: lineLength
			}
			
			view.editor.replaceRange(`[${line}](things:///show?id=${thingsID})`, startRange, endRange);
		});
	
		
		this.addCommand({
			id: 'create-things-task',
			name: 'Create Things Task',
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					if (!checking) {

						const vault = this.app.vault;
						const workspace = this.app.workspace;
						const obsidianDeepLink = getObsidianDeepLink(vault, workspace);
						
						const line = getCurrentLine()
						const task = prepareTask(line)
						createTask(task, obsidianDeepLink)
					}
					return true
				}
				return false;
			}
		});
	}

	onunload() {

	}

	
}
