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

						window.open(thingsURL);
						window.open(thingsDeepLink);

						async function getFileText(): Promise<string> {
							const text = await vault.read(workspace.getActiveFile())
							return text
						} 

						getFileText().then(text => {
							const lines = text.split('\n');
							const h1Index = lines.findIndex(line => line.startsWith('#'));
							if (h1Index !== -1) {
								lines.splice(h1Index + 1, 0, `\n[Things](${thingsDeepLink})`);
								const newText = lines.join('\n');

								vault.modify(workspace.getActiveFile(), newText);
							}
						});

						
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
