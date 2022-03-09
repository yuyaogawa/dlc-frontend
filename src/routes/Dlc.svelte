<script>
  import Countdown from 'svelte-countdown'
  import QrCode from 'svelte-qrcode'
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

    const response = await fetch(BASE_URL_DLC + '/dlc', {
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

    if (response.status !== 200) {
      console.log(response.message)
    }
    loading = false
    result = await response.json()
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
  <title>OP_DLC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <html lang="en" />
</svelte:head>
<main>
  <h1>Binary Option</h1>
  <p>
    This is Binary option style DLC serivce where you can bet on BTC/USD price.
  </p>
  <button on:click={handleClick}> reload </button>

  {#await promise}
    <p>Loading...</p>
  {:then event}
    <div>
      <Countdown
        from={event.maturationTime}
        format="YYYY-MM-DD H:m:s"
        let:remaining
      >
        <div class="whatever">
          {#if remaining.done === false}
            <h2>
              <span>{remaining.hours} hours</span>
              <span>{remaining.minutes} minutes</span>
              <span>{remaining.seconds} seconds</span>
            </h2>
          {:else}
            <h2>The maturationTime has come!</h2>
          {/if}
        </div>
      </Countdown>

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
          <td>strike price</td>
          <td>{event.eventName.match(/\[(.*?)\]/g)} USD</td>
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

  {#if result !== null && result.status !== 'error'}
    <table style="width:100%">
      <tr>
        <th>name</th>
        <th style="width:70%">value</th>
      </tr>
      <tr>
        <td>outcome</td>
        <td> {result.m}</td>
      </tr>
      <tr>
        <td>sG (SigPoint of outcome)</td>
        <td> {result.sG}</td>
      </tr>
      <tr>
        <td>x (preimage)</td>
        <td> {result.x}</td>
      </tr>
      <tr>
        <td>Ex (x encrypted by sG)</td>
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
  {:else if result !== null && result.status === 'error'}
    <p style="color: red">{result.message}</p>
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

  th,
  td {
    text-align: left;
    padding: 8px;
  }

  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
</style>
