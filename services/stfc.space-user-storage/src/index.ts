/// <reference types="@cloudflare/workers-types" />

import { IHTTPMethods, Request } from "itty-router";
import { ThrowableRouter, status } from 'itty-router-extras';
import { withDurables, DurableObjectProxy } from 'itty-durable';
import { UserStorage } from "./UserStorage";

// export the durable class, per spec
export { UserStorage } from './UserStorage';

interface IRequest extends Request {
  USER_STORAGE: DurableObjectProxy<UserStorage>
}

function addGameProfiles(router: ThrowableRouter<IRequest, IHTTPMethods>): ThrowableRouter<IRequest, IHTTPMethods> {
  router.post('/:id/game_profile', async (request: IRequest) => {
    const { USER_STORAGE, params } = request;
    const content = await request.json?.();
    return USER_STORAGE.get(params!.id).createGameProfile(content);
  });
  router.get('/:id/game_profile', async ({ USER_STORAGE, params }: IRequest) => {
    return USER_STORAGE.get(params!.id).getGameProfiles;
  });
  router.get('/:id/game_profile/:gid', async ({ USER_STORAGE, params }: IRequest) => {
    return USER_STORAGE.get(params!.id).getGameProfile(params!.gid);
  })
  router.put('/:id/game_profile/:gid', async (request: IRequest) => {
    const { USER_STORAGE, params } = request;
    const content = await request.json?.();
    USER_STORAGE.get(params!.id).updateGameProfile(params!.gid, content);
    return status(200, "game profile updated");
  });
  router.delete('/:id/game_profile/:gid', async (request: IRequest) => {
    const { USER_STORAGE, params } = request;
    USER_STORAGE.get(params!.id).deleteGameProfile(params!.gid);
    return status(200, "game profile deleted");
  });

  return router;
}

let router = ThrowableRouter<IRequest, IHTTPMethods>();
router.all('*', withDurables())

// Setup settings stuff
router.get('/:id/settings', async ({ USER_STORAGE, params }: IRequest) => {
  return USER_STORAGE.get(params!.id).getSettings;
});
router.post('/:id/settings', async (request: IRequest) => {
  const { USER_STORAGE, params } = request;
  const content = await request.json?.();
  USER_STORAGE.get(params!.id).setSettings(content);
  return status(200, "settings updated");
});

// Add the game profiles stuff
addGameProfiles(router);

// Testing stuff
router.get('/reset', ({ USER_STORAGE }: IRequest) => USER_STORAGE.get('test').reset());

// Catch all for missing things
router.all("*", () => new Response("Not found", { status: 404 }));

export default {
  fetch: router.handle // yep, it's this easy.
}