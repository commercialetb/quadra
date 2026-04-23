export type ShortcutActionKey =
  | 'create_followup'
  | 'search_record'
  | 'today_agenda'
  | 'add_note'
  | 'log_call_outcome'
  | 'log_interaction'
  | 'ingest_email'
  | 'ingest_gmail_crm'
  | 'sync_gmail_crm'

export type ShortcutActionManifest = {
  key: ShortcutActionKey
  title: string
  phrase: string
  method: 'POST'
  path: string
  description: string
  opensApp: boolean
  filename: string
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
    filename: 'create-followup.json',
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
    filename: 'search-record.json',
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
    filename: 'today-agenda.json',
    description: 'Recupera follow-up e priorita del giorno.',
    opensApp: true,
    bodyExample: {
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'date', 'count', 'highPriorityCount', 'items', 'openUrl', 'spokenResponse'],
  },
  {
    key: 'add_note',
    title: 'Aggiungi nota',
    phrase: 'Ehi Siri, aggiungi nota in Quadra',
    method: 'POST',
    path: '/api/shortcut/add-note',
    filename: 'add-note.json',
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
    filename: 'log-interaction.json',
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
    filename: 'log-call-outcome.json',
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
  {
    key: 'sync_gmail_crm',
    title: 'Sync Gmail CRM',
    phrase: 'Ehi Siri, sincronizza Gmail CRM in Quadra',
    method: 'POST',
    path: '/api/shortcut/sync-gmail-crm',
    filename: 'sync-gmail-crm.json',
    description: 'Sincronizza in batch le email Gmail con etichetta CRM, crea record mancanti e genera follow-up quando servono.',
    opensApp: false,
    bodyExample: {
      requiredLabel: 'CRM',
      triageMode: 'smart',
      createCompanyIfMissing: true,
      createContactIfMissing: true,
      createFollowup: true,
      emails: [
        {
          fromEmail: 'mario.rossi@acme.it',
          fromName: 'Mario Rossi',
          subject: 'Richiesta informazioni',
          snippet: 'Vorrei ricevere una proposta aggiornata.',
          gmailLabels: ['CRM'],
          threadId: '188abc123',
          messageId: '188abc123-msg',
        },
      ],
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'triageMode', 'processedCount', 'ignoredCount', 'failedCount', 'createdCompanies', 'createdContacts', 'followupsCreated', 'triageCounts', 'results', 'openUrl', 'spokenResponse'],
  },


  {
    key: 'ingest_gmail_crm',
    title: 'Gmail CRM',
    phrase: 'Ehi Siri, processa Gmail CRM in Quadra',
    method: 'POST',
    path: '/api/shortcut/ingest-gmail-crm',
    filename: 'ingest-gmail-crm.json',
    description: 'Processa solo le email Gmail con etichetta CRM e puo creare automaticamente azienda, contatto e follow-up.',
    opensApp: false,
    bodyExample: {
      fromEmail: 'mario.rossi@acme.it',
      fromName: 'Mario Rossi',
      subject: 'Richiesta informazioni',
      snippet: 'Vorrei ricevere una proposta aggiornata.',
      gmailLabels: ['CRM'],
      threadId: '188abc123',
      messageId: '188abc123-msg',
      createCompanyIfMissing: true,
      createContactIfMissing: true,
      createFollowup: true,
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'ignored', 'gmailLabels', 'companyId', 'contactId', 'createdCompany', 'createdContact', 'activityId', 'createdFollowupId', 'openUrl', 'spokenResponse', 'inference'],
  },

  {
    key: 'ingest_email',
    title: 'Leggi email',
    phrase: 'Ehi Siri, leggi email in Quadra',
    method: 'POST',
    path: '/api/shortcut/ingest-email',
    filename: 'ingest-email.json',
    description: 'Registra una email in arrivo e, se il mittente non esiste, puo creare automaticamente azienda e contatto.',
    opensApp: false,
    bodyExample: {
      fromEmail: 'mario.rossi@acme.it',
      fromName: 'Mario Rossi',
      subject: 'Richiesta informazioni',
      snippet: 'Vorrei ricevere una proposta aggiornata.',
      createCompanyIfMissing: true,
      createContactIfMissing: true,
      createFollowup: true,
      shortcutToken: 'SHORTCUT_SHARED_TOKEN',
    },
    responseFields: ['ok', 'companyId', 'contactId', 'createdCompany', 'createdContact', 'activityId', 'createdFollowupId', 'openUrl', 'spokenResponse', 'inference'],
  }
]

export function buildShortcutManifest(origin: string) {
  return SHORTCUT_ACTIONS.map((action) => ({
    ...action,
    url: `${origin}${action.path}`,
    openUrl: `${origin}/capture/siri`,
  }))
}
