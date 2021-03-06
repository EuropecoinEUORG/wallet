var UI = (function(UI, $, undefined) {
  UI.handleTransfers = function() {
    $("#transfer-btn").on("click", function(e) {    
      console.log("UI.handleTransfers: Click");

      var $stack = $("#transfer-stack");
      $stack.addClass("loading");

      try {
        var address = $("#transfer-address").val().toUpperCase();

        if (!address) {
          throw "Address is required";
        } else if (address.length == 81) {
          throw "Missing address checksum";
        } else if (address.length != 90) {
          throw "Incorrect address length";
        } else if (!Address.hasValidChecksum(address)) {
          throw "Incorrect address checksum";
        }
    
        address = Address.getAddressWithoutChecksum(address);

        var amount = UI.convertToBaseAmount($("#transfer-amount").val(), $("#transfer-units-value").html().toLowerCase());

        if (amount == "0") {
          throw "Amount cannot be zero";
        }
      } catch (err) {
        UI.formError("transfer", err);
        return;
      }

      Server.transfer(address, amount).progress(function(msg) {
        UI.formUpdate("transfer", msg, {"timeout": 500});
      }).done(function(msg) {
        console.log("UI.handleTransfers: " + msg);
        UI.formSuccess("transfer", msg);
        UI.createStateInterval(60000, true);
      }).fail(function(err) {
        console.log("UI.handleTransfers: Error");
        console.log(err);
        UI.formError("transfer", err);
      }).always(function() {
        $stack.removeClass("loading");
      });
    });

    $("#transfer-units-value").on("click", function(e) {
      var $overlay = $("#overlay");
      var $select = $('<div class="dropdown" id="transfer-units-select">' + 
                        '<ul>' + 
                          '<li class="iota-i">i</li>' + 
                          '<li class="iota-ki">Ki</li>' + 
                          '<li class="iota-mi">Mi</li>' + 
                          '<li class="iota-gi">Gi</li>' + 
                          '<li class="iota-ti">Ti</li>' + 
                        '</ul>' + 
                      '</div>');

      $overlay.show();

      $("#transfer-units-select").remove();

      $("body").append($select);

      var offset = $(this).offset();

      $select.css({"position": "absolute", "top": (offset.top + $(this).innerHeight() + 15) + "px", "left": (offset.left) + "px", "width": $(this).outerWidth() + "px"}).addClass("active");

      $select.on("click", "li", function(e) {
        $select.removeClass("active");
        $("#transfer-units-value").html($(this).html());
        $overlay.hide().off("click.transfer");
        $(window).off("resize.transfer");
      });

      $overlay.on("click.transfer", function(e) {
        $select.removeClass("active");
        $(this).hide().off("click.transfer");
        $(window).off("resize.transfer");
      });

      $(window).on("resize.transfer", function() {
        var $rel = $("#transfer-units-value")
        var offset = $rel.offset();
        $select.css({"position": "absolute", "top": (offset.top + $rel.innerHeight() + 15) + "px", "left": (offset.left) + "px", "width": $rel.outerWidth() + "px"});
      });
    });

    $("#transfer-units-select").on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();

      var $ul = $(this).find("ul");
      $ul.addClass("active");
      $ul.find("li").click(function(e) {
        e.preventDefault();
        e.stopPropagation();

        $ul.find("li").unbind();
        $ul.find("li").removeClass("selected");
        $(this).addClass("selected");
        $ul.removeClass("active");
        $("body").unbind("click.dropdown");
      });

      $("body").on("click.dropdown", function(e) {
        $ul.removeClass("active");
        $("body").unbind("click.dropdown");
      }); 
    });
  }

  UI.onOpenTransferStack = function() {
    if ($("#transfer-address").val() == "") {
      $("#transfer-address").focus();
    }
  }

  return UI;
}(UI || {}, jQuery));