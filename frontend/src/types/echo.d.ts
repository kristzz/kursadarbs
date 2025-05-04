interface Window {
  Echo: {
    join: (channel: string) => {
      listen: (event: string, callback: (e: any) => void) => void;
      here: (callback: (users: any[]) => void) => void;
      joining: (callback: (user: any) => void) => void;
      leaving: (callback: (user: any) => void) => void;
    };
    leave: (channel: string) => void;
    channel: (channel: string) => {
      listen: (event: string, callback: (e: any) => void) => void;
    };
    private: (channel: string) => {
      listen: (event: string, callback: (e: any) => void) => void;
    };
  };
} 