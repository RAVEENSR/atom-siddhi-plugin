'use babel';

import AtomSiddhiPluginView from './atom-siddhi-plugin-view';
import { CompositeDisposable } from 'atom';

export default {

  atomSiddhiPluginView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomSiddhiPluginView = new AtomSiddhiPluginView(state.atomSiddhiPluginViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomSiddhiPluginView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-siddhi-plugin:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomSiddhiPluginView.destroy();
  },

  serialize() {
    return {
      atomSiddhiPluginViewState: this.atomSiddhiPluginView.serialize()
    };
  },

  toggle() {
    console.log('AtomSiddhiPlugin was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
