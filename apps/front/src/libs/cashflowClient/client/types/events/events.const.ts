/**
 * List of all possible events that can be emitted by the Streamerbot WebSocket server
 *
 * Compiled from the raw output of the `GetEvents` request
 */
export const AppEvents = {
  General: ['Custom'],
  Command: ['Triggered', 'Cooldown'],
  FileWatcher: ['Changed', 'Created', 'Deleted', 'Renamed'],
  Misc: [
    'TimedAction',
    'Test',
    'ProcessStarted',
    'ProcessStopped',
    'ChatWindowAction',
    'StreamerbotStarted',
    'StreamerbotExiting',
    'ToastActivation',
    'GlobalVariableUpdated',
    'UserGlobalVariableUpdated',
    'ApplicationImport',
  ],
  Raw: ['Action', 'SubAction', 'ActionCompleted'],
  WebsocketClient: ['Open', 'Close', 'Message'],

  WebsocketCustomServer: ['Open', 'Close', 'Message'],

  Application: ['ActionAdded', 'ActionUpdated', 'ActionDeleted'],

  StreamerbotRemote: [
    'InstanceConnected',
    'InstanceDisconnected',
    'InstanceTrigger',
    'InstanceSignal',
  ],
  Group: ['Added', 'Removed', 'Cleared', 'UsersAdded', 'UsersRemoved'],
} as const
