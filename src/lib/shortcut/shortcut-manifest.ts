export type ShortcutActionKey =
  | 'create_followup'
  | 'search_record'
  | 'today_agenda'
  | 'add_note'
  | 'log_call_outcome'
  | 'log_interaction'

export type ShortcutActionManifest = {
  key: ShortcutActionKey
  title: string
  phrase: string
  method: 'POST'
  path: string
  description: string
  opensApp: boolean
  bodyExample: Record<string, unknown>
  responseFields: string[]
}

export const SHORTCUT_ACTIONS: ShortcutActionManifest[] = [
  {
    key: 'create_followup',
    title: 'Crea follow-up',
    phrase: 'Ehi Siri, crea follow-up in Quadra',
    method: 'POST',
    path: '/api/shortcut/process-voice-note',
    description: 'Trasforma una frase naturale in un follow-up collegato al record corretto.',
    opensApp: false,
    bodyExample: {
      note: 'Richiamare Mario Rossi domani per confermare demo e budget',
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'status', 'needsConfirmation', 'spokenResponse', 'openUrl', 'followupsUrl', 'links', 'parsed'],
  },
  {
    key: 'search_record',
    title: 'Cerca record',
    phrase: 'Ehi Siri, cerca Rossi in Quadra',
    method: 'POST',
    path: '/api/shortcut/search-record',
    description: 'Cerca aziende, contatti e opportunita con una sola query.',
    opensApp: true,
    bodyExample: {
      query: 'Rossi',
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'count', 'resolution', 'topResult', 'results', 'openUrl', 'spokenResponse'],
  },
  {
    key: 'today_agenda',
    title: 'Mostra oggi',
    phrase: 'Ehi Siri, mostrami oggi in Quadra',
    method: 'POST',
    path: '/api/shortcut/today-agenda',
    description: 'Recupera follow-up e priorita del giorno.',
    opensApp: true,
    bodyExample: {
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'date', 'count', 'highPriorityCount', 'items', 'openUrl', 'spokenSummary'],
  },
  {
    key: 'add_note',
    title: 'Aggiungi nota',
    phrase: 'Ehi Siri, aggiungi nota in Quadra',
    method: 'POST',
    path: '/api/shortcut/add-note',
    description: 'Salva una nota rapida sul record scelto o risolto da una query.',
    opensApp: false,
    bodyExample: {
      query: 'Mario Rossi',
      body: 'Interessato, richiamare con nuova proposta',
      title: 'Nota da Siri',
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'noteId', 'needsConfirmation', 'reviewItemId', 'results', 'openUrl', 'spokenResponse'],
  },
  {
    key: 'log_interaction',
    title: 'Registra interazione',
    phrase: 'Ehi Siri, registra meeting in Quadra',
    method: 'POST',
    path: '/api/shortcut/log-interaction',
    description: 'Registra email, meeting o altre interazioni e puo creare il follow-up successivo.',
    opensApp: false,
    bodyExample: {
      query: 'Mario Rossi',
      kind: 'meeting',
      content: 'Meeting positivo. Inviare proposta aggiornata domani.',
      createFollowup: true,
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'activityId', 'createdFollowupId', 'followUpCreated', 'reviewItemId', 'openUrl', 'spokenResponse', 'inference', 'suggestedFollowup'],
  },
  {
    key: 'log_call_outcome',
    title: 'Registra esito chiamata',
    phrase: 'Ehi Siri, registra esito chiamata in Quadra',
    method: 'POST',
    path: '/api/shortcut/log-call-outcome',
    description: 'Registra l’esito di una chiamata e puo creare subito il follow-up successivo.',
    opensApp: false,
    bodyExample: {
      query: 'Mario Rossi',
      outcome: 'Interessato. Vuole proposta aggiornata entro venerdi.',
      createFollowup: true,
      followupTitle: '',
      followupDate: '',
      priority: '',
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'activityId', 'createdFollowupId', 'followUpCreated', 'reviewItemId', 'openUrl', 'spokenResponse', 'inference', 'suggestedFollowup', 'stageSuggestion'],
  },
]

export function buildShortcutManifest(origin: string) {
  return SHORTCUT_ACTIONS.map((action) => ({
    ...action,
    url: `${origin}${action.path}`,
    openUrl: `${origin}/capture/siri`,
  }))
}
