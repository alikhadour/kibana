import { PluginInitializerContext, CoreSetup, CoreStart, Plugin, Logger } from '......coreserver';

import { ScheduledReportsPluginSetup, ScheduledReportsPluginStart } from './types';
import { defineRoutes } from './routes';

export class ScheduledReportsPlugin
  implements Plugin<ScheduledReportsPluginSetup, ScheduledReportsPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup) {
    this.logger.debug('scheduledReports: Setup');
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('scheduledReports: Started');
    return {};
  }

  public stop() {}
}
