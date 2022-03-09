<main>
  <h2>Home component</h2>
  <p />
  <p>This is the Home component, which contains markup only.</p>
  <p>
    <em>Hint:</em> Try navigating with the links below, then use your browser's back
    and forward buttons.
  </p>
</main>

<style>
  main {
    text-align: center;
    max-width: 340px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    border: 1px solid #ddd;
  }

  th,
  td {
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
</style>
