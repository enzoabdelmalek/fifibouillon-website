import Clarity from '@microsoft/clarity';

export function initClarity(projectId: string) {
  if (typeof window !== 'undefined' && projectId && process.env.NODE_ENV === 'production') {
    Clarity.init(projectId);
  }
}

export function trackClarityEvent(eventName: string) {
  if (typeof window !== 'undefined') {
    Clarity.event(eventName);
  }
}