import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		this.addCommand({
			id: 'link-to-things',
			name: 'Link to Things',
			checkCallback: (checking: boolean) => {
				const leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {

						const vault = this.app.vault;
						const workspace = this.app.workspace;

						const fileTitleForURL = workspace.getActiveFile().name.split('.')[0].split(/\s/).join('%20');

						const vaultName = vault.getName();

						const obsidianDeepLink = `obsidian://open?vault=${vaultName}&file=${fileTitleForURL}`;

						const thingsURL = `things:///add-project?title=${fileTitleForURL}&notes=${obsidianDeepLink}`;

						const thingsDeepLink = `things:///show?query=${fileTitleForURL}`;

						async function getFileText(): Promise<string> {
							const text = await vault.read(workspace.getActiveFile())
							return text
						} 

						getFileText().then(text => {
							//parse text and insert thingsDeepLink after the H1
							const lines = text.split('\n');
							const h1Index = lines.findIndex(line => line.startsWith('#'));
							if (h1Index !== -1) {
								lines.splice(h1Index + 1, 0, `\n${thingsDeepLink}`);
								const newText = lines.join('\n');
								// vault.write(workspace.getActiveFile(), newText);
								console.log(newText);
							}

						});



						// this.app.vault.modify(this.app.workspace.getActiveFile(), 



						//`\n\n[Things](${thingsDeepLink})\n\n`
						
						// window.open(thingsURL);
						// window.open(thingsDeepLink);
					}
					return true;
				}
				return false;
			}
		});

	}

	onunload() {

	}

	
}
