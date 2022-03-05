<script>
  import QrCode from 'svelte-qrcode'
  export let name
  let result
  let event
  let loading = false
  const pubkey =
    'e7887373eb29184aa104e20ff5342d0019791ad656896ec573f5e9da96b001c6'
  async function onSubmit(e) {
    loading = true
    const formData = new FormData(e.target)

    const values = {}
    for (let field of formData) {
      const [key, value] = field
      values[key] = value
    }
    console.log(values)

    const contract = await fetch('http://localhost:3000/dlc', {
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
    const res = await fetch(`http://localhost:4000/events`)
    const events = await res.json()

    const res2 = await fetch(`http://localhost:4000/events/` + events[0])
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

<main>
  <h1>Hello {name}!</h1>
  <p>
    This is Binary option style DLC serivce where you can bet on BTC/USD price.
  </p>
  <button on:click={handleClick}> reload </button>
  {#await promise}
    <p>Loading...</p>
  {:then event}
    <p>eventName: {event.eventName}</p>
    <p>outcomes: {event.outcomes}</p>
    <p>nonces: {event.nonces}</p>
    <p>maturationTime: {event.maturationTime}</p>
    <p>pubkey: {pubkey}</p>

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
    <p>x (preimage): {result.x}</p>
    <p>Ex(Encripted x): {result.Ex}</p>
    <p>hash of x: {result.hashX}</p>
    <p>hodlinvoice: {result.invoice}</p>
    <QrCode value={result.invoice} />
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
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
</style>
