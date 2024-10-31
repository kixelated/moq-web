import {greet} from '../moq-worker/dist';
greet("it works world");

export class MoqKarp extends HTMLElement {
	static observedAttributes = ["url", "path"];

  constructor() {
	super();
	console.log("MoqElement constructor");
  }
  connectedCallback() {
    console.log("Custom element added to page.");
  }

  disconnectedCallback() {
    console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log(`Attribute ${name} has changed.`);
  }
}

customElements.define("moq-karp", MoqKarp);
