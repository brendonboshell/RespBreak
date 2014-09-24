# RespBreak

RespBreak allows you to easily handle breakpoints in Javascript, to match up
with your CSS media queries.

## Responsive Images Example

HTML:

    <p>
      <img src="test-450-mobile.jpg" style="width: 100%; max-width: 1024px;"
        data-version-tablet-src="test-700.jpg"
        data-version-desktop-src="test-1024.jpg"
      >
    </p>

Javascript:

    var replaceImgs = function (form) {
      $("img").each(function () {
        var $this = $(this),
            versionSrc = $this.data("version-" + form + "-src"),
            versionWidth = $this.data("version-" + form + "-width"),
            versionHeight = $this.data("version-" + form + "-height");

        if (!$this.data("version-mobile-src")) {
          // copy the mobile version state data
          $this.attr("data-version-mobile-src", $this.attr("src"));
          $this.attr("data-version-mobile-width", $this.attr("width"));
          $this.attr("data-version-mobile-height", $this.attr("height"));
        }

        if (versionSrc) {
          $this.attr("src", versionSrc);
        }

        if (versionWidth) {
          $this.width(versionWidth);
        }

        if (versionHeight) {
          $this.height(versionHeight);
        }
      });
    };

    RespBreak.addState("mobile", 0, 450);
    RespBreak.addState("tablet", 451, 700);
    RespBreak.addState("desktop", 701);
    RespBreak.enter("mobile", function () {
      replaceImgs("mobile");
    });
    RespBreak.enter("tablet", function () {
      replaceImgs("tablet");
    });
    RespBreak.enter("desktop", function () {
      replaceImgs("desktop");
    });
