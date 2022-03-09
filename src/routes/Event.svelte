<script>
  const BASE_URL_ORACLE = URL_ORACLE
  const pubkey = ORACLE_PUBKEY
  const MAX_LOADING_EVENTS = 5
  let listevent = []
  async function getEvent() {
    const res = await fetch(BASE_URL_ORACLE + `/events`)
    const events = await res.json()
    let count = 0
    for (const event of events) {
      count++
      if (count > MAX_LOADING_EVENTS) {
        break
      }
      const res2 = await fetch(BASE_URL_ORACLE + `/events/` + event)
      listevent.push(await res2.json())
      console.log(listevent)
    }
    if (res.ok) {
      return listevent
    } else {
      throw new Error(res)
    }
  }
  let promise = getEvent()
</script>

<svelte:head>
  <title>OP_DLC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <html lang="en" />
</svelte:head>
<main>
  {#await promise}
    <p>Loading...</p>
  {:then listevent}
    <div>
      <table>
        <tr>
          <th>eventName</th>
          <th>maturation</th>
          <th>price</th>
          <th>signedOutcome</th>
          <th>nonces</th>
        </tr>
        {#each listevent as event}
          <tr>
            <td>{event.eventName}</td>
            <td>{event.maturationTime}</td>
            <td>{event.eventName.match(/\[(.*?)\]/g)} USD</td>
            <td>{event.signedOutcome}</td>
            <td>{event.nonces}</td>
          </tr>
        {/each}
      </table>
    </div>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</main>

<style>
  main {
    text-align: center;
    max-width: 340px;
    margin: 0 auto;
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
