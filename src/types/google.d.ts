interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
  }) => void;
  prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
  renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
}

interface Google {
  accounts: {
    id: GoogleAccountsId;
  };
}

interface Window {
  google: Google;
}
