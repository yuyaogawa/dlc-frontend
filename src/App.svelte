<script>
  import QrCode from 'svelte-qrcode'
  export let name
  const BASE_URL_DLC = URL_DLC
  const BASE_URL_ORACLE = URL_ORACLE
  let result
  let event
  let loading = false
  const pubkey = ORACLE_PUBKEY
  async function onSubmit(e) {
    loading = true
    const formData = new FormData(e.target)

    const values = {}
    for (let field of formData) {
      const [key, value] = field
      values[key] = value
    }
    console.log(values)

    const contract = await fetch(BASE_URL_DLC + '/dlc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: values.eventName,
        m: values.outcomes,
        R: values.nonces,
        P: values.pubkey,
        invoice: values.invoice,
      }),
    })
    loading = false
    result = await contract.json()
    return result
  }
  async function getEvent() {
    result = null
    const res = await fetch(BASE_URL_ORACLE + `/events`)
    const events = await res.json()

    const res2 = await fetch(BASE_URL_ORACLE + `/events/` + events[0])
    event = await res2.json()

    if (res.ok) {
      console.log('ok')
      return event
    } else {
      throw new Error(res)
    }
  }
  let promise = getEvent()
  function handleClick() {
    promise = getEvent()
  }
</script>

<svelte:head>
  <title>DLC MEETS LIGHTNING</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <html lang="en" />
</svelte:head>
<main>
  <h1>Hello {name}!</h1>
  <p>
    This is Binary option style DLC serivce where you can bet on BTC/USD price.
  </p>
  <button on:click={handleClick}> reload </button>
  {#await promise}
    <p>Loading...</p>
  {:then event}
  <div>
    <table>
      <tr>
        <th>name</th>
        <th style="width:70%">value</th>
      </tr>
      <tr>
        <td>eventName</td>
        <td>{event.eventName}</td>
      </tr>
      <tr>
        <td>outcomes</td>
        <td>{event.outcomes}</td>
      </tr>
      <tr>
        <td>nonces</td>
        <td>{event.nonces}</td>
      </tr>
      <tr>
        <td>maturationTime</td>
        <td>{event.maturationTime}</td>
      </tr>
      <tr>
        <td>pubkey</td>
        <td>{pubkey}</td>
      </tr>
    </table>
  </div>
    <p>Select Yes/No and provide your invoice below and submit.</p>
    <form on:submit|preventDefault={onSubmit}>
      <select name="outcomes" id="outcomes">
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
      <input
        type="text"
        name="eventName"
        id="eventName"
        value={event.eventName}
        readonly
      />
      <input
        type="text"
        name="nonces"
        id="nonces"
        value={event.nonces}
        readonly
      />
      <input type="text" name="pubkey" id="pubkey" value={pubkey} readonly />
      <input
        type="text"
        name="invoice"
        id="invoice"
        placeholder="Payout invoice with 100 sats"
        required
      />
      {#if loading}
        <input type="submit" name="submit" id="submit" value="Submitting..." />
      {:else}
        <input type="submit" name="submit" id="submit" value="Submit" />
      {/if}
    </form>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}

  {#if result}
  <table style="width:100%">
    <tr>
      <th>name</th>
      <th style="width:70%">value</th>
    </tr>
    <tr>
      <td>x (preimage)</td>
      <td> {result.x}</td>
    </tr>
    <tr>
      <td>Ex(Encripted x)</td>
      <td>{result.Ex}</td>
    </tr>
    <tr>
      <td>sha256(x)</td>
      <td>{result.hashX}</td>
    </tr>
    <tr>
      <td>hodlinvoice</td>
      <td>{result.invoice}</td>
    </tr>
  </table>
    <QrCode value={result.invoice} />
  {/if}
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

  th, td {
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even){background-color: #f2f2f2}
</style>
