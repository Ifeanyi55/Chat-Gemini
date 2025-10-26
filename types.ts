
export type Sender = 'user' | 'bot';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
}

export enum Theme {
  NEBULA = 'NEBULA',
  MINTY = 'MINTY',
  SUNSET = 'SUNSET',
  MONO = 'MONO',
  OCEANIC = 'OCEANIC',
}

export interface ThemeConfig {
  name: string;
  background: string;
  chatBackground: string;
  userBubble: string;
  userText: string;
  botBubble: string;
  botText: string;
  inputBackground: string;
  inputText: string;
  button: string;
  buttonHover: string;
  borderColor: string;
}
