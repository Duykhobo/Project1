describe("Form visibility toggle tests", () => {
  let animateSpy;

  // Helper function to set up the DOM and spy on animate
  const setupDOM = (html) => {
    document.body.innerHTML = html;
    animateSpy = jest
      .spyOn($.fn, "animate")
      .mockImplementation(function (props, speed, callback) {
        if (props.opacity === "toggle") {
          this.css("opacity", this.css("opacity") === "1" ? "0" : "1");
        }
        if (props.height === "toggle") {
          this.css(
            "display",
            this.css("display") === "none" ? "block" : "none"
          );
        }
        if (callback) callback();
        return this;
      });
  };

  afterEach(() => {
    animateSpy.mockRestore(); // Restore original animate method after each test
  });

  test("Should toggle form visibility when clicking message link", () => {
    setupDOM(`
      <div class="message"><a href="#">Toggle</a></div>
      <form style="display: none;"></form>
    `);

    const messageLink = document.querySelector(".message a");
    messageLink.click();

    expect(animateSpy).toHaveBeenCalledWith(
      { height: "toggle", opacity: "toggle" },
      "slow"
    );
    expect($("form").css("display")).not.toBe("none");
    expect($("form").css("opacity")).not.toBe("0");
  });

  test("Should toggle form opacity and height when clicking message link", () => {
    setupDOM(`
      <div class="message"><a href="#">Toggle</a></div>
      <form style="display: none; opacity: 0;"></form>
    `);

    const messageLink = document.querySelector(".message a");
    const formEl = document.querySelector("form");

    messageLink.click();

    // Check opacity and height after clicking
    expect(formEl.style.opacity).toBe("1");
    expect(formEl.style.display).toBe("block");
  });

  test("Should handle multiple rapid clicks on message link", (done) => {
    setupDOM(`
      <div class="message"><a href="#">Link</a></div>
      <form style="display: none;"></form>
    `);

    const messageLink = $(".message a");
    const form = $("form");

    for (let i = 0; i < 5; i++) {
      messageLink.trigger("click");
    }

    setTimeout(() => {
      expect(animateSpy).toHaveBeenCalledTimes(5);
      expect(animateSpy).toHaveBeenCalledWith(
        { height: "toggle", opacity: "toggle" },
        "slow"
      );
      done();
    }, 100);
  });

  test("Should work correctly when multiple message links exist on the page", () => {
    setupDOM(`
      <div class="message"><a href="#">Link 1</a></div>
      <div class="message"><a href="#">Link 2</a></div>
      <form style="height: 100px; opacity: 1;"></form>
    `);

    const links = document.querySelectorAll(".message a");
    links.forEach((link) => {
      link.click();
      jest.runAllTimers();
      expect($("form").css("height")).toBe("0px");
      expect($("form").css("opacity")).toBe("0");

      link.click();
      jest.runAllTimers();
      expect($("form").css("height")).toBe("100px");
      expect($("form").css("opacity")).toBe("1");
    });
  });

  test("Should toggle form visibility when initially hidden", () => {
    setupDOM(`
      <div class="message"><a href="#">Toggle</a></div>
      <form style="display: none;"></form>
    `);

    const linkElement = document.querySelector(".message a");
    linkElement.dispatchEvent(new Event("click"));

    expect(animateSpy).toHaveBeenCalledWith(
      { height: "toggle", opacity: "toggle" },
      "slow"
    );
  });

  test("Should reset form state properly after animation completes", (done) => {
    setupDOM(`
      <div class="message"><a href="#"></a></div>
      <form style="display: none;"></form>
    `);

    const $form = $("form");
    const initialHeight = $form.height();
    const initialOpacity = $form.css("opacity");

    $(".message a").trigger("click");

    setTimeout(() => {
      expect($form.height()).not.toBe(initialHeight);
      expect($form.css("opacity")).not.toBe(initialOpacity);

      $form.promise().done(() => {
        expect($form.height()).toBe(initialHeight);
        expect($form.css("opacity")).toBe(initialOpacity);
        done();
      });
    }, 100);
  });

  test("Should not affect other elements when toggling form visibility", () => {
    setupDOM(`
      <div class="message"><a href="#">Toggle</a></div>
      <form style="display: none;"></form>
      <div id="other-element">Other content</div>
    `);

    $(".message a").click(function () {
      $("form").animate({ height: "toggle", opacity: "toggle" }, "slow");
    });

    $(".message a").trigger("click");

    jest.runAllTimers();

    expect($("form").is(":visible")).toBe(true);
    expect($("#other-element").css("display")).not.toBe("none");
    expect($("#other-element").css("opacity")).toBe("1");
  });
});
