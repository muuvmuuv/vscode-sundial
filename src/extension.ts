"use strict";

import { window, ExtensionContext } from "vscode";
import Sundial from "./sundial";

const sundial = new Sundial();

export function activate(context: ExtensionContext) {
  sundial.context = context;
  sundial.check(); // first check

  context.subscriptions.push(window.onDidChangeWindowState(check));
  context.subscriptions.push(window.onDidChangeActiveTextEditor(check));
  context.subscriptions.push(window.onDidChangeTextEditorViewColumn(check));

  if (sundial.SundialConfig.interval !== 0) {
    sundial.automater();
  }

  console.info("Sundial is now active! ☀️");
}

// Helper for change events
function check(state: any) {
  if (sundial.SundialConfig.debug) {
    console.log(state);
  }
  sundial.check();
}
