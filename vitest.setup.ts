import "@testing-library/jest-dom/vitest";

// Polyfill for HTMLFormElement.prototype.requestSubmit (not implemented in jsdom)
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function(submitter?: HTMLElement | null) {
    const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
    if (this.dispatchEvent(submitEvent)) {
      this.submit();
    }
  };
}
