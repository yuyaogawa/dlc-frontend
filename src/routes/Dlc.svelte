<LibLoader url="https://s3.tradingview.com/tv.js"
on:loaded="{onLoaded}" />
<script>
  import { Grid, Row, Column, Accordion,
           AccordionItem, Button, Tile,
           CopyButton, TextInput,
           ContentSwitcher, Switch, InlineNotification } from "carbon-components-svelte";

  let selectedIndex = 0;

  import copy from "clipboard-copy";
  import LibLoader from '../components/LibLoader.svelte'
  import Countdown from 'svelte-countdown'
  import QrCode from 'svelte-qrcode'
  import { saveAs } from 'file-saver';
  const BASE_URL_DLC = URL_DLC
  const BASE_URL_ORACLE = URL_ORACLE
  let result
  let event
  let loading = false
  let visible = false
  let position = false
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

    if(selectedIndex == 0){
      values.outcomes = "No"
    } else {
      values.outcomes = "Yes"
    }
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

    if(result !== null && result.status !== 'error'){
      subscribePayment(result.hashX);
      visible = true
    }

    return result
  }
  async function getEvent() {
    result = null
    visible = false
    position = false
    const res = await fetch(BASE_URL_ORACLE + `/events`)
    const events = await res.json()

    if(events.status == 'error'){
      throw new Error(events.message)
    }
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
  function subscribePayment(payment_hash) {
    const API = BASE_URL_DLC + "/stream?payment_hash=" + payment_hash;
    const source = new EventSource(API);
    source.addEventListener("open", (e) => {
      console.log("event source is open");
    });
    source.addEventListener("message", (e) => {
      const json = JSON.parse(e.data)
      console.log("'message' event received:", json);
      console.log("'message' :", json.message);
      if (json.status == "ok"){
        position = true;
        visible = false;
      } else if(json.status === "ok" && json.message === "Payment failed[1]"){
        console.log(json.message)
      }
    });
    source.addEventListener("error", (e) => {
      console.log("event source is close");
      source.close();
    });
  }
  async function download() {
    const fileName = 'dlc-contract-data.json';

    // Create a blob of the data
    const fileToSave = new Blob([JSON.stringify(result)], {
        type: 'application/json'
    });

    // Save the file
    saveAs(fileToSave, fileName);
  }
  function onLoaded() {
    new TradingView.widget(
      {
        //"autosize": true,
        "width": 980,
        "height": 610,
        "symbol": "BITSTAMP:BTCUSD",
        "interval": "1",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "2",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_5723e"
      }
    );
  }
</script>

<svelte:head>
  <title>OP_DLC</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <html lang="en" />
</svelte:head>
<main class="flex">
<div class="side-left">
  <div class="tradingview-widget-container">
    <div id="tradingview_5723e"></div>
    <div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/symbols/BTCUSD/?exchange=BITSTAMP" rel="noopener" target="_blank"><span class="blue-text">BTCUSD Chart</span></a> by TradingView</div>
  </div>
</div>
<div class="side-right">
  <h1>Binary Option</h1>
  <p>This is Binary Option style DLC serivce where you bet on BTC/USD price.</p>
  <button on:click={handleClick}> reload </button>
  <div class="trade-box">
    <Tile light>Trade
  {#await promise}
    <p>Loading...</p>
  {:then event}
    <form on:submit|preventDefault={onSubmit}>
      <!--select name="outcomes" id="outcomes" hidden>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select-->
      <input
        type="text"
        name="eventName"
        id="eventName"
        value={event.eventName}
        readonly
        hidden
      />
      <input
        type="text"
        name="nonces"
        id="nonces"
        value={event.nonces}
        readonly
        hidden
      />
      <input
        type="text"
        name="pubkey"
        id="pubkey"
        value={pubkey}
        readonly
        hidden
      />
      <input
        type="text"
        name="invoice"
        id="invoice"
        placeholder="Paste your invoice"
        required
      />
      <Grid condensed>
        <Row>
          <Column style="outline: 1px solid var(--cds-interactive-02)">Strike Price</Column>
          <Column style="outline: 1px solid var(--cds-interactive-02)">{event.eventName.match(/\[(.*?)\]/g)} USD</Column>
        </Row>
      </Grid>
      <Grid condensed>
        <Row>
          <Column style="outline: 1px solid var(--cds-interactive-02)">Expiry at</Column>
          <Column style="outline: 1px solid var(--cds-interactive-02)">{event.maturationTime.substring(11)}</Column>
        </Row>
      </Grid>
      <Grid condensed>
        <Row>
          <Column style="outline: 1px solid var(--cds-interactive-02)">Time left</Column>
          <Column style="outline: 1px solid var(--cds-interactive-02)">
            <Countdown
            from={event.maturationTime}
            format="YYYY-MM-DD H:m:s"
            let:remaining
            >
              <div class="whatever">
                {#if remaining.done === false}
                  <div>
                    <!--span>{remaining.hours} hours</span-->
                    <span>{remaining.minutes} min</span>
                    <span>{remaining.seconds} sec</span>
                  </div>
                {:else}
                  <div>Expired</div>
                {/if}
              </div>
            </Countdown>
          </Column>
        </Row>
      </Grid>

      <div class="box">
        <ContentSwitcher bind:selectedIndex>
          <Switch text="HIGH" />
          <Switch text="LOW" />
        </ContentSwitcher>
        <!--div>Selected index: {selectedIndex}</div-->
      </div>

      <div class="box">
      {#if loading}
        <input type="submit" name="submit" id="submit" value="Submitting..." />
      {:else}
        <input type="submit" name="submit" id="submit" value="Submit" />
      {/if}
      </div>
    </form>

    {#if position}
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="122.88px" height="122.88px" viewBox="0 0 122.88 122.88" enable-background="new 0 0 122.88 122.88" xml:space="preserve"><g><path fill="#6BBE66" d="M34.388,67.984c-0.286-0.308-0.542-0.638-0.762-0.981c-0.221-0.345-0.414-0.714-0.573-1.097 c-0.531-1.265-0.675-2.631-0.451-3.934c0.224-1.294,0.812-2.531,1.744-3.548l0.34-0.35c2.293-2.185,5.771-2.592,8.499-0.951 c0.39,0.233,0.762,0.51,1.109,0.827l0.034,0.031c1.931,1.852,5.198,4.881,7.343,6.79l1.841,1.651l22.532-23.635 c0.317-0.327,0.666-0.62,1.035-0.876c0.378-0.261,0.775-0.482,1.185-0.661c0.414-0.181,0.852-0.323,1.3-0.421 c0.447-0.099,0.903-0.155,1.356-0.165h0.026c0.451-0.005,0.893,0.027,1.341,0.103c0.437,0.074,0.876,0.193,1.333,0.369 c0.421,0.161,0.825,0.363,1.207,0.604c0.365,0.231,0.721,0.506,1.056,0.822l0.162,0.147c0.316,0.313,0.601,0.653,0.85,1.014 c0.256,0.369,0.475,0.766,0.652,1.178c0.183,0.414,0.325,0.852,0.424,1.299c0.1,0.439,0.154,0.895,0.165,1.36v0.23 c-0.004,0.399-0.042,0.804-0.114,1.204c-0.079,0.435-0.198,0.863-0.356,1.271c-0.16,0.418-0.365,0.825-0.607,1.21 c-0.238,0.377-0.518,0.739-0.832,1.07l-27.219,28.56c-0.32,0.342-0.663,0.642-1.022,0.898c-0.369,0.264-0.767,0.491-1.183,0.681 c-0.417,0.188-0.851,0.337-1.288,0.44c-0.435,0.104-0.889,0.166-1.35,0.187l-0.125,0.003c-0.423,0.009-0.84-0.016-1.241-0.078 l-0.102-0.02c-0.415-0.07-0.819-0.174-1.205-0.31c-0.421-0.15-0.833-0.343-1.226-0.575l-0.063-0.04 c-0.371-0.224-0.717-0.477-1.032-0.754l-0.063-0.06c-1.58-1.466-3.297-2.958-5.033-4.466c-3.007-2.613-7.178-6.382-9.678-9.02 L34.388,67.984L34.388,67.984z M61.44,0c16.96,0,32.328,6.883,43.453,17.987c11.104,11.125,17.986,26.493,17.986,43.453 c0,16.961-6.883,32.329-17.986,43.454C93.769,115.998,78.4,122.88,61.44,122.88c-16.961,0-32.329-6.882-43.454-17.986 C6.882,93.769,0,78.4,0,61.439C0,44.48,6.882,29.112,17.986,17.987C29.112,6.883,44.479,0,61.44,0L61.44,0z M96.899,25.981 C87.826,16.907,75.29,11.296,61.44,11.296c-13.851,0-26.387,5.611-35.46,14.685c-9.073,9.073-14.684,21.609-14.684,35.458 c0,13.851,5.611,26.387,14.684,35.46s21.609,14.685,35.46,14.685c13.85,0,26.386-5.611,35.459-14.685s14.684-21.609,14.684-35.46 C111.583,47.59,105.973,35.054,96.899,25.981L96.899,25.981z"/></g></svg>
      <p>Position is opened</p>
      <p><a href="/#/position?hashX={result.hashX}" target="_blank">Check the status</a></p>
    {/if}
    {#if result !== null && result.status !== 'error'}
      {#if visible}
        <p>Pay to this holdinvoice</p>
        <div style="display: flex;">
          <TextInput disabled name="holdinvoice" id="holdinvoice" value={result.invoice} />
          <CopyButton text="{result.invoice}" copy={(text) => copy(text)}/>
        </div>
        <QrCode value={result.invoice} />
      {/if}
      <Accordion>
        <AccordionItem title="Contract info">
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
        </AccordionItem>
      </Accordion>
      <p><button on:click={download}> Download </button></p>
    {:else if result !== null && result.status === 'error'}
      <p style="color: red">{result.message}</p>
    {/if}
    <Accordion>
      <AccordionItem title="Event info">
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
      </AccordionItem>
    </Accordion>
    <br/>
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
  <div class="info">
    <p>Premium: <span class='price'>1000 sats</span></p>
    <p>Option price: <span class='price'>2020 sats</span></p>
    <p>Trading (meaning making a payment to the holdinvoice) is only accepted 1 minute before the maturation time.</p>
  </div>
</Tile>
</main>

<style>
  .info > p {
  font-size: x-small;
  }
  .flex {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .side-right {
    width: 28%;
    min-width: 315px;
    max-width: calc(60% - 64px);
    margin: 0 12px;
  }
  .side-left {
    width: 70%;
  }

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

  .price {
    color: #ff3e00;
    font-size: 1.2em;
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
    background-color: #202020;
  }

  form {
    padding: 8px;
  }

  .trade-box {
    max-width: 310px;
    margin-left: auto;
    margin-right: auto;
  }

  .box {
    margin: 8px;
  }
</style>
