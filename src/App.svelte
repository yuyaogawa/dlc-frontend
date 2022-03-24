<script>
  import "carbon-components-svelte/css/g80.css";
  // Import the router component
  // Normally, this would be: `import Router from 'svelte-spa-router'`
  import Router from 'svelte-spa-router'
  // Import the list of routes
  import routes from './routes'
  import Header from './components/Header.svelte'
  import Footer from './components/Footer.svelte'
</script>

<Header />

<!-- Show the router -->
<Router {routes} />

<Footer />