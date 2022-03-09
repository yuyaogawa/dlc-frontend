// Components
import Dlc from './routes/Dlc.svelte'
import Event from './routes/Event.svelte'
import NotFound from './routes/NotFound.svelte'

// Export the route definition object
export default {
  // Exact path
  '/': Dlc,

  // Using named parameters, with last being optional
  '/event': Event,

  // Catch-all, must be last
  '*': NotFound,
}
