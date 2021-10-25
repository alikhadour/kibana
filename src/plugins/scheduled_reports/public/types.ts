import { NavigationPublicPluginStart } from '....\navigationpublic';

export interface ScheduledReportsPluginSetup {
  getGreeting: () => string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ScheduledReportsPluginStart {}

export interface AppPluginStartDependencies {
  navigation: NavigationPublicPluginStart;
}
