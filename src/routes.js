// Components
import Dlc from './routes/Dlc.svelte'
import Event from './routes/Event.svelte'
import Position from './routes/Position.svelte'
import Faq from './routes/Faq.svelte'
import NotFound from './routes/NotFound.svelte'

// Export the route definition object
export default {
  // Exact path
  '/': Dlc,
  '/event': Event,
  '/position': Position,
  '/faq': Faq,

  // Catch-all, must be last
  '*': NotFound,
}
