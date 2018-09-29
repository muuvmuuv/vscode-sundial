'use strict';

import { window, ExtensionContext } from 'vscode';
import Sundial from './sundial';

const sundial = new Sundial();

export function activate(context: ExtensionContext) {
  sundial.check(); // first check

  context.subscriptions.push(window.onDidChangeWindowState(sundial.check));
  context.subscriptions.push(window.onDidChangeActiveTextEditor(sundial.check));
  context.subscriptions.push(window.onDidChangeTextEditorViewColumn(sundial.check));

  if (sundial.SundialConfig.interval !== 0) {
    sundial.automater();
  }

  console.info('Sundial is now active! ☀️');
}
