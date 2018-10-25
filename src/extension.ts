"use strict";

import {
  window,
  ExtensionContext,
  WindowState,
  TextEditorViewColumnChangeEvent
} from "vscode";
import Sundial from "./sundial";

export function activate(context: ExtensionContext) {
  const sundial = new Sundial(context);

  sundial.check(); // first check

  onDidChangeWindowState(context, sundial);
  onDidChangeActiveTextEditor(context, sundial);
  onDidChangeTextEditorViewColumn(context, sundial);

  if (sundial.SundialConfig.interval !== 0) {
    sundial.automater();
  }

  console.info("Sundial is now active! ☀️");
}

function onDidChangeWindowState(context: ExtensionContext, sundial: Sundial) {
  // An event which fires when the focus state of the current window changes. The value of the event represents whether the window is focused.
  context.subscriptions.push(
    window.onDidChangeWindowState((state: WindowState) => {
      if (sundial.debug) {
        console.log("(Sundial) => onDidChangeWindowState:", state);
      }

      sundial.check();
    })
  );
}

function onDidChangeActiveTextEditor(
  context: ExtensionContext,
  sundial: Sundial
) {
  // An event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
  context.subscriptions.push(
    window.onDidChangeActiveTextEditor((state: any) => {
      if (sundial.debug) {
        console.log("(Sundial) => onDidChangeActiveTextEditor:", state);
      }

      sundial.check();
    })
  );
}

function onDidChangeTextEditorViewColumn(
  context: ExtensionContext,
  sundial: Sundial
) {
  // An event which fires when the view column of an editor has changed.
  context.subscriptions.push(
    window.onDidChangeTextEditorViewColumn(
      (state: TextEditorViewColumnChangeEvent) => {
        if (sundial.debug) {
          console.log("(Sundial) => onDidChangeTextEditorViewColumn:", state);
        }

        sundial.check();
      }
    )
  );
}
