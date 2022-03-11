<script>
  const BASE_URL_DLC = URL_DLC
  let result
  let loading = false
  let payment_hash = null
  async function getPosition(payment_hash) {

    if(payment_hash == null){
      const path = window.location.href
      payment_hash = path.split('hashX=')[1];
      if(payment_hash == null){
        throw new Error('')
      }
    }

    const position = await fetch(BASE_URL_DLC + `/dlc?` + new URLSearchParams({
      hashX: payment_hash,
    }))
    result = await position.json()

    if (position.ok && result.status !== 'error') {
      return result
    } else {
      throw new Error(result.message)
    }
  }

  let promise = getPosition()

  function handleClick(e) {
    const formData = new FormData(e.target)
    const values = {}
    for (let field of formData) {
      const [key, value] = field
      values[key] = value
    }
    console.log(values)
    promise = getPosition(values.payment_hash)
  }
</script>

<svelte:head>
  <title>OP_DLC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <html lang="en" />
</svelte:head>
<main>
  <form on:submit|preventDefault={handleClick}>
    <input type="text" name="payment_hash" id="payment_hash" placeholder="hashX" bind:this={payment_hash} required />
    <input type="submit" name="submit" id="submit" value="Search" />
  </form>
  {#await promise}
    <p>Loading...</p>
  {:then result}
    <div>
      <table>
        <tr>
          <th>result</th>
          <th>position</th>
          <th>payout</th>
          <th>eventName</th>
        </tr>
          <tr>
            <td>{(result.status == 'CANCELED' && result.paid) ? 'You win' : '-'}  </td>
            <td>{result.status}</td>
            <td>{result.paid}</td>
            <td>{result.eventName}</td>
          </tr>
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
