import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

function findGoFiles(dir: string): string[] {
    let results: string[] = [];
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(findGoFiles(filePath));
        } else if (filePath.endsWith('.go')) {
            results.push(filePath);
        }
    });
    return results;
}

export function activate(context: vscode.ExtensionContext) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        after: { margin: '0 0 0 1em', color: '#888', fontStyle: 'italic' }
    });
    const alertDecorationType = vscode.window.createTextEditorDecorationType({
        after: { margin: '0 0 0 1em', color: '#ff3c3c', fontWeight: 'bold', fontStyle: 'italic' }
    });

    // --- STATUS BAR ITEM ---
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 101);
    statusBar.tooltip = 'Hotspots de complejidad (GoCyclo)';
    statusBar.command = 'gocyclo-complexity.refreshHotspots';
    statusBar.text = '$(flame) GoCyclo';
    statusBar.show();

    function updateStatusBar(count: number) {
        if (count > 0) {
            statusBar.text = `$(flame) Hotspots: ${count}`;
            statusBar.color = count > 9 ? '#ff3c3c' : '#ffa500';
        } else {
            statusBar.text = `$(flame) GoCyclo`;
            statusBar.color = undefined;
        }
    }

    function updateDecorations(editor: vscode.TextEditor) {
        if (!editor || editor.document.languageId !== 'go') return;
        const filePath = editor.document.fileName;
        const maxComplexity = vscode.workspace.getConfiguration().get<number>('gocyclo-complexity.maxComplexity', 10);

        exec(`gocyclo "${filePath}"`, (err, stdout) => {
            if (err || !stdout) return;
            const normalDecorations: vscode.DecorationOptions[] = [];
            const alertDecorations: vscode.DecorationOptions[] = [];
            stdout.split('\n').forEach(line => {
                const match = line.match(/^(\d+)\s+\S+\s+.*:(\d+):\d+/);
                if (match) {
                    const [, scoreStr, lineStr] = match;
                    const score = parseInt(scoreStr, 10);
                    const lineNum = parseInt(lineStr, 10) - 1;
                    const lineLen = editor.document.lineAt(lineNum).text.length;
                    const deco = {
                        range: new vscode.Range(lineNum, lineLen, lineNum, lineLen),
                        renderOptions: { after: { contentText: `⟳ Complejidad: ${score}` } },
                        hoverMessage: score > maxComplexity
                            ? `🚨 Esta función supera la complejidad máxima (${maxComplexity}) permitida.`
                            : `Complejidad: ${score}`
                    };
                    if (score > maxComplexity) {
                        alertDecorations.push(deco);
                    } else {
                        normalDecorations.push(deco);
                    }
                }
            });
            editor.setDecorations(decorationType, normalDecorations);
            editor.setDecorations(alertDecorationType, alertDecorations);
        });
    }

    vscode.window.visibleTextEditors.forEach(editor => updateDecorations(editor));
    vscode.window.onDidChangeActiveTextEditor(editor => { if (editor) updateDecorations(editor); });
    vscode.workspace.onDidSaveTextDocument(doc => {
        vscode.window.visibleTextEditors.forEach(editor => {
            if (editor.document === doc) updateDecorations(editor);
        });
    });

    context.subscriptions.push(
        vscode.commands.registerCommand('gocyclo-complexity.showHotspots', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || editor.document.languageId !== 'go') {
                vscode.window.showInformationMessage('Abre un archivo Go para usar este comando.');
                return;
            }
            const filePath = editor.document.fileName;
            const maxComplexity = vscode.workspace.getConfiguration().get<number>('gocyclo-complexity.maxComplexity', 10);
            exec(`gocyclo "${filePath}"`, (err, stdout) => {
                if (err || !stdout) {
                    vscode.window.showErrorMessage('Error ejecutando gocyclo.');
                    return;
                }
                const hotspots: string[] = [];
                stdout.split('\n').forEach(line => {
                    const match = line.match(/^(\d+)\s+\S+\s+(.*):(\d+):\d+/);
                    if (match) {
                        const [, scoreStr, func, lineStr] = match;
                        const score = parseInt(scoreStr, 10);
                        const lineNum = parseInt(lineStr, 10);
                        if (score > maxComplexity) {
                            hotspots.push(`Línea ${lineNum}: ${func} → Complejidad ${score}`);
                        }
                    }
                });
                if (hotspots.length === 0) {
                    vscode.window.showInformationMessage('No hay funciones que superen el umbral en este archivo.');
                } else {
                    vscode.window.showQuickPick(hotspots, { title: 'Funciones sobre el umbral de complejidad' });
                }
            });
        })
    );

    // Paneles laterales
    const provider = new GocycloHotspotsProvider(updateStatusBar);
    vscode.window.registerTreeDataProvider('gocycloHotspots', provider);
    vscode.window.registerTreeDataProvider('gocycloHotspotsExp', provider);
    provider.refresh();

    context.subscriptions.push(
        statusBar,
        vscode.commands.registerCommand('gocyclo-complexity.refreshHotspots', () => provider.refresh()),
        vscode.commands.registerCommand('gocyclo-complexity.openHotspot', (hotspot: Hotspot) => {
            vscode.workspace.openTextDocument(hotspot.filePath).then(doc => {
                vscode.window.showTextDocument(doc).then(editor => {
                    const pos = new vscode.Position(hotspot.line - 1, 0);
                    editor.selection = new vscode.Selection(pos, pos);
                    editor.revealRange(new vscode.Range(pos, pos));
                });
            });
        })
    );
}

// --- Provider ---
class Hotspot extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string,
        public readonly line: number,
        public readonly complexity: number
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = `Complejidad: ${complexity}`;
        this.tooltip = `${path.basename(filePath)}:${line}\nComplejidad: ${complexity}`;
        this.command = {
            command: 'gocyclo-complexity.openHotspot',
            title: '',
            arguments: [this]
        };
        this.iconPath = complexity >= 20
            ? new vscode.ThemeIcon('flame', new vscode.ThemeColor('charts.red'))
            : new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.yellow'));
    }
}

class GocycloHotspotsProvider implements vscode.TreeDataProvider<Hotspot> {
    private _onDidChangeTreeData: vscode.EventEmitter<Hotspot | undefined | void> = new vscode.EventEmitter<Hotspot | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Hotspot | undefined | void> = this._onDidChangeTreeData.event;

    private hotspots: Hotspot[] = [];
    private updateStatusBar: (count: number) => void;

    constructor(updateStatusBarFn: (count: number) => void) {
        this.updateStatusBar = updateStatusBarFn;
        this.loadHotspots();
    }

    refresh(): void { this.loadHotspots(); this._onDidChangeTreeData.fire(); }
    getTreeItem(element: Hotspot): vscode.TreeItem { return element; }
    getChildren(): Thenable<Hotspot[]> { return Promise.resolve(this.hotspots); }

    private loadHotspots() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            this.hotspots = [];
            this.updateStatusBar(0);
            return;
        }
        const folder = folders[0].uri.fsPath;
        const maxComplexity = vscode.workspace.getConfiguration().get<number>('gocyclo-complexity.maxComplexity', 10);

        const goFiles = findGoFiles(folder);
        if (goFiles.length === 0) {
            this.hotspots = [];
            this.updateStatusBar(0);
            return;
        }
        const goFilesArg = goFiles.map(f => `"${f}"`).join(' ');
        exec(`gocyclo ${goFilesArg}`, (err, stdout) => {
            const hs: Hotspot[] = [];
            stdout.split('\n').forEach(line => {
                const match = line.match(/^(\d+)\s+\S+\s+(.*?)\s+(.+?):(\d+):\d+/);
                if (match) {
                    const [, scoreStr, func, file, lineStr] = match;
                    const score = parseInt(scoreStr, 10);
                    const lineNum = parseInt(lineStr, 10);
                    if (score > maxComplexity) {
                        hs.push(new Hotspot(
                            `${file}:${lineNum} → ${func}`,
                            file, lineNum, score
                        ));
                    }
                }
            });
            this.hotspots = hs;
            this.updateStatusBar(hs.length);
            this._onDidChangeTreeData.fire();
        });
    }
}

export function deactivate() {}