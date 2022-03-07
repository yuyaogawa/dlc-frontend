import App from "./App.svelte";

const app = new App({
  target: document.body,
  props: {
    name: "OP_DLC",
  },
});

export default app;
