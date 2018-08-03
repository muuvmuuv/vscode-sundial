'use strict';

import * as vscode from 'vscode';
import { Sundial } from './sundial';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(new Sundial());
}

export function deactivate() {
  // deactivate extension here
}
