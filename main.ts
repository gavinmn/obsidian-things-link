import { create } from 'domain';
import { Editor, EditorPosition, MarkdownView, Plugin, Vault, Workspace } from 'obsidian';

function getObsidianDeepLink(vault: Vault, workspace: Workspace) {
	if (workspace.getActiveFile() != null) {
		const fileTitle = workspace.getActiveFile().name.split('.')[0].split(/\s/).join('%2520');
		const vaultName = vault.getName();
		const link = `obsidian://open?vault=${vaultName}%26file=${fileTitle}`;
		return link;
	} else {
		const fileTitle = 'Untitled';
		const vaultName = vault.getName();
		const link = `obsidian://open?vault=${vaultName}%26file=${fileTitle}`;
		return link;
	}
}

function getCurrentLine(editor: Editor, view: MarkdownView) {
	const lineNumber = editor.getCursor().line
	const lineText = editor.getLine(lineNumber)
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


function createProject(title: string, deepLink: string) {
	const project = `things:///add-project?title=${title}&notes=${deepLink}&x-success=obsidian://project-id`
	window.open(project);
}

function createTask(line: string, deepLink: string) {
	const task = `things:///add?title=${line}&notes=${deepLink}&x-success=obsidian://task-id`
	window.open(task);
}


export default class MyPlugin extends Plugin {

	async onload() {

		this.registerObsidianProtocolHandler("project-id", async (id) => {

			const projectID = id['x-things-id'];

			const workspace = this.app.workspace;
			
			const view = workspace.getActiveViewOfType(MarkdownView);
			const editor = view.editor
			

			const thingsDeepLink = `things:///show?id=${projectID}`;
			
			let fileText = editor.getValue()
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

				editor.replaceRange(`\n\n[Things](${thingsDeepLink})`, startRange, endRange);

			} else {
					let startRange: EditorPosition = {
					line: 0,
					ch:0
				}

				let endRange: EditorPosition = {
					line: 0,
					ch:0
				}

				editor.replaceRange(`[Things](${thingsDeepLink})\n\n`, startRange, endRange);
			}

		});
		
		this.addCommand({
			id: 'create-things-project',
			name: 'Create Things Project',
			editorCallback: (editor: Editor, view: MarkdownView) => {
			
				const vault = this.app.vault;
				const workspace = this.app.workspace;

				const projectTitle = workspace.getActiveFile().basename.split('.')[0].split(/\s/).join('%20');

				const obsidianDeepLink = getObsidianDeepLink(vault, workspace);

				createProject(projectTitle, obsidianDeepLink);
			}
		});

		this.registerObsidianProtocolHandler("task-id", async (id) => {
			const taskID = id['x-things-id'];

			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			const editor = view.editor
			
			const currentLine = getCurrentLine(editor, view)

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
			
			view.editor.replaceRange(`[${line}](things:///show?id=${taskID})`, startRange, endRange);
		});
	
		
		this.addCommand({
			id: 'create-things-task',
			name: 'Create Things Task',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const vault = this.app.vault;
				const workspace = this.app.workspace;
				const obsidianDeepLink = getObsidianDeepLink(vault, workspace);
				
				const line = getCurrentLine(editor, view)
				const task = prepareTask(line)
				createTask(task, obsidianDeepLink)
			}
		});
	}

	onunload() {

	}

	
}
