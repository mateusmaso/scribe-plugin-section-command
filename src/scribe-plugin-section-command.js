define("scribe-plugin-section-command", ["jquery"], function($) {
  return function() {
    var getSelectionStart = function() {
      var node = document.getSelection().anchorNode;
      return (node.nodeType == 3 ? node.parentNode : node);
    };

    var isStartOfElement = function() {
      return getCaretCharacterOffsetWithin(getSelectionStart()) == 0;
    };

    var isEndOfElement = function() {
      return getCaretCharacterOffsetWithin(getSelectionStart()) == $(getSelectionStart()).text().length;
    };

    var replaceToTag = function(node, tag) {
      $(node).replaceWith(function() {
        var replacement = $('<' + tag + ' />').append($(this).contents());

        for (var i = 0; i < this.attributes.length; i++) {
          replacement.attr(this.attributes[i].name, this.attributes[i].value);
        }

        return replacement;
      });
    };

    var getCaretCharacterOffsetWithin = function(element) {
      var $selection;
      var $document = element.ownerDocument || element.document;
      var $window = $document.defaultView || $document.parentWindow;
      var caretOffset = 0;

      if (typeof $window.getSelection != "undefined") {
        $selection = $window.getSelection();
        if ($selection.rangeCount > 0) {
          var range = $window.getSelection().getRangeAt(0);
          var preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
        }
      } else if (($selection = $document.selection) && $selection.type != "Control") {
        var textRange = $selection.createRange();
        var preCaretTextRange = $document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
      }

      return caretOffset;
    };

    return function(scribe) {
      $(scribe.el).on('keydown', function(event) {
        if (getSelectionStart().tagName == "H1") {
          if (event.keyCode === 13 && !isEndOfElement()) {
            event.preventDefault();
          }

          if (event.keyCode === 8 && isStartOfElement() && $(getSelectionStart()).text().length > 0) {
            event.preventDefault();
          }

          if (event.keyCode === 46 && isEndOfElement()) {
            event.preventDefault();
          }
        } else {
          if (event.keyCode === 46 && isEndOfElement() && $(getSelectionStart()).next()[0].tagName == "H1") {
            event.preventDefault();
          }

          if (document.getSelection().toString().length > 0 && document.getSelection().focusNode.tagName == "H1") {
            replaceToTag(document.getSelection().focusNode, "h1");
          }
        }
      });

      scribe.commands.section = new scribe.api.Command('insertHTML');
      scribe.commands.section.nodeName = 'H1';
      scribe.commands.section.execute = function(text) {
        scribe.insertHTML("<h1>"+ text +"</h1>");
        var range = document.createRange();
        range.selectNodeContents(getSelectionStart());
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      };
    };
  };
});
