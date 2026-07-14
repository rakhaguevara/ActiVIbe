import { app } from './app.js'
import { env } from './config/env.js'
import { startScheduledMessagePoller } from './modules/scheduledMessages/scheduledMessages.service.js'

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})

// Fire-and-forget — startup server tidak boleh menunggu/bergantung ke poller
// ini (lihat komentar startScheduledMessagePoller utk alasan setInterval).
startScheduledMessagePoller()
