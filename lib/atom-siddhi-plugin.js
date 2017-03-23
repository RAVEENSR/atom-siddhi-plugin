'use babel';
import {CompositeDisposable} from 'atom';
import antlr4 from "antlr4";
import {ConsoleErrorListener} from "antlr4/error/ErrorListener";
import SiddhiLexer from "./generated-parser/SiddhiQLLexer";
import SiddhiParsar from "./generated-parser/SiddhiQLParser";
import $ from "jquery";

markers = [];
decorations = [];
tooltips = [];

export default {
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'atom-siddhi-plugin:toggle': () => this.toggle()
        }));

        this.subscriptions.add(
            atom.workspace.getActiveTextEditor().onDidChange(() => {
                this.toggle();
            })
        );

        ConsoleErrorListener.prototype.syntaxError = (function (_super) {
            return function (ecognizer, offendingSymbol, line, column, msg, e) {
                //line--;
                if (editor = atom.workspace.getActiveTextEditor()) {
                    //TODO correct to capture the entire error block
                    let range = [[line - 1, column - 1], [line - 1, column + 10]];

                    let marker = editor.markBufferRange(range, {invalidate: 'never'});
                    markers.push(marker);

                    //Initialize the tooltip object with a custom error message
                    let tooltip = {
                        id: "error-message-tooltip-" + tooltips.length,
                        message: "<p><strong>[" + line + ":" + column + "]</strong> " + msg + "</p>"
                    };
                    tooltips.push(tooltip);

                    let lineNumberDecoration = editor.decorateMarker(marker, {
                        type: 'line-number',
                        class: "red-square " + tooltip.id,
                        id: "custom-decoration-" + decorations.length
                    });
                    decorations.push(lineNumberDecoration);

                    let lineDecoration = editor.decorateMarker(marker, {
                        type: 'line',
                        class: "red-line-through",
                        id: "custom-decoration-" + decorations.length
                    });
                    decorations.push(lineDecoration);

                    //Append event listeners to trigger tooltips
                    $(document).on('mouseover', "." + tooltip.id, () => {
                        let tooltipElement = atom.tooltips.add(
                            document.getElementsByClassName(tooltip.id)[0],
                            {
                                title: tooltip.message,
                                trigger: 'manual',
                                html: true,
                                class: "error",
                                placement: "right"
                            }
                        );
                        $(this).data("tooltipElement", tooltipElement);
                    });
                    $(document).on('mouseout', "." + tooltip.id, () => {
                        let tooltipElement = $(this).data("tooltipElement");
                        tooltipElement && tooltipElement.dispose();
                    });
                }
            };
        })(ConsoleErrorListener.prototype.syntaxError);
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();

        //TODO
    },

    serialize() {
    },

    reset() {
        decorations.filter((decoration) => {
            decoration.destroy()
        });

        markers.filter((marker) => {
            marker.destroy()
        });

        //TODO optimize more
    },

    toggle() {
        this.reset();

        editor = atom.workspace.getActiveTextEditor();
        var input = editor.getText();
        var chars = new antlr4.InputStream(input);
        var lexer = new SiddhiLexer.SiddhiQLLexer(chars, {
            //TODO validate
            getText: function () {
                //TODO
                return input;
            },
            setText: function () {
                //TODO
            }
        });
        var tokens = new antlr4.CommonTokenStream(lexer);
        var parser = new SiddhiParsar.SiddhiQLParser(tokens);
        parser.buildParseTrees = true;
        var tree = parser.parse();
    }

};
