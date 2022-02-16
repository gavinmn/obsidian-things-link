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
						const fileTitle = this.app.workspace.getActiveFile().name.split('.')[0].replace(/\s/, '%20');

						const vaultName = this.app.vault.getName();

						const obsidianDeepLink = `obsidian://open?vault=${vaultName}&file=${fileTitle}`;

						const thingsURL = `things:///add-project?title=${fileTitle}&notes=${obsidianDeepLink}`;

						const thingsDeepLink = `things:///show?query=${fileTitle}`;

						const fileText = this.app.vault.read(this.app.workspace.getActiveFile()).then(text => {
							console.log(text)
						});



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
