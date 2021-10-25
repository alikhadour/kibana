import { IRouter } from '........coreserver';

export function defineRoutes(router: IRouter) {
  router.get(
    {
      path: '/api/scheduled_reports/example',
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: {
          time: new Date().toISOString(),
        },
      });
    }
  );
}
